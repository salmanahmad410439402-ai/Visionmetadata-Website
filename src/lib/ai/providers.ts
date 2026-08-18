import { AI_RESPONSE_SCHEMA, PROVIDER_ENDPOINTS } from "./config";
import { isRateLimitError } from "./keyRotation";

export interface AIResponse {
    title: string;
    description: string;
    keywords: string[];
    confidence: {
        overall: number;
        breakdown: {
            subjectClarity: number;
            differentiatorStrength: number;
            keywordPrecision: number;
            complianceSafety: number;
        };
        level: string;
    };
    riskAnalysis: {
        flags: string[];
        severity: string;
        reviewerReasoning: string[];
    };
    compliance: {
        noPeopleDetected: boolean;
        trademarkSafe: boolean;
        forbiddenTermsRemoved: string[];
        editorialFlag: boolean;
        editorialReason: string | null;
    };
    platformReadiness: {
        adobeStock: string;
        freepik: string;
        shutterstock: string;
    };
    recreationPrompt: string;
    searchIntent: string;
    isAIGenerated: boolean;
    modelUsed: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function validateAPIResponse(response: any): void {
    if (!response) {
        throw new Error("Validation Failed: Empty response object");
    }

    // Check Title
    if (typeof response.title !== 'string' || response.title.trim().length < 5) {
        throw new Error("Validation Failed: Title is truncated or missing");
    }

    // Check Description
    if (typeof response.description !== 'string' || response.description.trim().length < 10) {
        throw new Error("Validation Failed: Description is truncated or missing");
    }

    // Check Keywords (Crucial for Adobe Stock batch processing)
    if (!Array.isArray(response.keywords) || response.keywords.length < 3) {
        throw new Error("Validation Failed: Keywords array is missing or critically truncated");
    }

    // Validate keywords are actually strings
    const validKeywords = response.keywords.filter((k: any) => typeof k === 'string' && k.trim());
    if (validKeywords.length < 3) {
        throw new Error("Validation Failed: Keywords array contains empty or invalid strings");
    }
}

// ─── Helpers for repairJSON ──────────────────────────────────────────────────

/** Strip single-line (//) and block (slash-star) comments that appear OUTSIDE JSON string values. */
function stripJSComments(src: string): string {
    let out = '';
    let i = 0;
    let inString = false;
    let escaped = false;
    while (i < src.length) {
        const ch = src[i];
        if (escaped) { out += ch; escaped = false; i++; continue; }
        if (ch === '\\' && inString) { out += ch; escaped = true; i++; continue; }
        if (ch === '"') { out += ch; inString = !inString; i++; continue; }
        if (!inString) {
            // Single-line comment
            if (ch === '/' && src[i + 1] === '/') {
                while (i < src.length && src[i] !== '\n') i++;
                continue;
            }
            // Block comment
            if (ch === '/' && src[i + 1] === '*') {
                i += 2;
                while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
                i += 2;
                continue;
            }
        }
        out += ch;
        i++;
    }
    return out;
}

/** Replace raw (unescaped) control characters inside JSON string values with proper escape sequences. */
function fixControlCharsInStrings(src: string): string {
    let out = '';
    let inString = false;
    let escaped = false;
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        const code = src.charCodeAt(i);
        if (escaped) { out += ch; escaped = false; continue; }
        if (ch === '\\' && inString) { out += ch; escaped = true; continue; }
        if (ch === '"') { out += ch; inString = !inString; continue; }
        if (inString && code < 0x20) {
            // Replace bare control characters with JSON escape sequences
            if (ch === '\n') { out += '\\n'; continue; }
            if (ch === '\r') { out += '\\r'; continue; }
            if (ch === '\t') { out += '\\t'; continue; }
            out += `\\u${code.toString(16).padStart(4, '0')}`;
            continue;
        }
        out += ch;
    }
    return out;
}

export function repairJSON(text: string): string {
    let json = text.trim();

    // ── Step 1: Strip markdown code fences ──────────────────────────
    const jsonMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        json = jsonMatch[1].trim();
    }

    // ── Step 2: Extract the outermost { } block ──────────────────────
    const braceBlockMatch = json.match(/\{[\s\S]*\}/);
    if (braceBlockMatch) {
        json = braceBlockMatch[0];
    }

    const startIdx = json.indexOf('{');
    if (startIdx === -1) {
        throw new Error("No JSON object found in response");
    }
    json = json.slice(startIdx);

    // ── Step 3: Strip JS-style comments (outside strings) ───────────
    // Single-line // comments and block /* */ comments
    json = stripJSComments(json);

    // ── Step 4: Fix unquoted property names  e.g.  {title: "x"} ────
    // Matches an identifier directly after { or , (with optional whitespace)
    json = json.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, (_m, pre, key, colon) => {
        // Only quote if not already quoted (the regex doesn't capture the leading quote)
        return `${pre}"${key}"${colon}`;
    });

    // ── Step 5: Fix trailing commas before } or ] ───────────────────
    // e.g. ["a","b",]  or  {"k":"v",}
    json = json.replace(/,(\s*[}\]])/g, '$1');

    // ── Step 6: Escape unescaped literal control characters inside strings
    // (raw \n \r \t inside a JSON string value → \\n \\r \\t)
    json = fixControlCharsInStrings(json);

    // ── Step 7: Close unclosed structures ───────────────────────────
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    let endIdx = -1;

    for (let i = 0; i < json.length; i++) {
        const char = json[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIdx = i;
                    break;
                }
            }
        }
    }

    if (endIdx !== -1) {
        return json.slice(0, endIdx + 1);
    }

    braceCount = 0;
    let bracketCount = 0;
    inString = false;
    escaped = false;

    for (let i = 0; i < json.length; i++) {
        const char = json[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
        }
    }

    if (inString) {
        json += '"';
    }

    while (bracketCount > 0) {
        json += ']';
        bracketCount--;
    }

    while (braceCount > 0) {
        json += '}';
        braceCount--;
    }

    return json;
}

async function uploadToGemini(file: File, apiKey: string): Promise<string> {
    const startRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Header-Content-Length': file.size.toString(),
            'X-Goog-Upload-Header-Content-Type': file.type,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: { display_name: file.name } })
    });
    
    if (!startRes.ok) throw new Error("Failed to start Gemini File API upload");
    const uploadUrl = startRes.headers.get('X-Goog-Upload-URL');
    if (!uploadUrl) throw new Error("No upload URL returned by Gemini");

    const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Command': 'upload, finalize',
            'X-Goog-Upload-Offset': '0',
            'Content-Length': file.size.toString()
        },
        body: file
    });
    
    if (!uploadRes.ok) throw new Error("Failed to upload file to Gemini");
    const fileInfo = await uploadRes.json();
    let state = fileInfo.file.state;
    const name = fileInfo.file.name;
    const uri = fileInfo.file.uri;

    let retries = 0;
    while (state === 'PROCESSING' && retries < 45) {
        await sleep(2000);
        const getRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${name}?key=${apiKey}`);
        if (!getRes.ok) throw new Error("Failed to check file status");
        const getInfo = await getRes.json();
        state = getInfo.state;
        if (state === 'FAILED') throw new Error("Gemini server failed to process the video");
        retries++;
    }

    if (state === 'PROCESSING') throw new Error("Video processing timed out on Gemini server");
    
    return uri;
}

export async function callGemini(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string,
    mimeType: string = "image/jpeg",
    assetFile?: File,
    useGreenScreenMode?: boolean
): Promise<AIResponse> {
    await sleep(300); // Rate limit padding

    let fileUri: string | null = null;
    if (useGreenScreenMode && assetFile && assetFile.type.startsWith("video/")) {
        fileUri = await uploadToGemini(assetFile, apiKey);
    }

    let endpointModel = model;

    const endpoint = `${PROVIDER_ENDPOINTS.gemini}/${endpointModel}:generateContent`;

    const payload: any = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{
            parts: [
                { text: userPrompt },
                fileUri 
                  ? { file_data: { mime_type: assetFile!.type, file_uri: fileUri } }
                  : { inline_data: { mime_type: mimeType, data: imageBase64.replace(/^data:image\/\w+;base64,/, "") } },
            ],
        }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { 
            temperature: 0.7, 
            topK: 40, 
            topP: 0.95, 
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        },
    };

    if (model.startsWith("gemini-3")) {
        payload.generationConfig.thinkingConfig = { thinkingLevel: "MINIMAL" };
    } else {
        payload.generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini");

    return JSON.parse(repairJSON(text));
}

export async function callOpenAI(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string
): Promise<AIResponse> {
    const payload = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "metadata_response",
                strict: true,
                schema: AI_RESPONSE_SCHEMA
            }
        }
    };

    const response = await fetch(PROVIDER_ENDPOINTS.openai, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");

    return JSON.parse(repairJSON(text));
}

export async function callGroq(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string
): Promise<AIResponse> {
    const payload = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
    };

    const response = await fetch(PROVIDER_ENDPOINTS.groq, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");

    return JSON.parse(repairJSON(text));
}



function extractContentText(content: unknown): string {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map((part: any) => {
                if (typeof part === "string") return part;
                if (typeof part?.text === "string") return part.text;
                return "";
            })
            .join("\n")
            .trim();
    }
    return "";
}



// ─────────────────────────────────────────────────────────────────────────────
// Mistral direct API (platform.mistral.ai)
// Uses the same OpenAI-compatible chat completions endpoint.
// Vision is supported via image_url content blocks.
// ─────────────────────────────────────────────────────────────────────────────
export async function callMistral(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string
): Promise<AIResponse> {
    const payload = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
    };

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = extractContentText(data?.choices?.[0]?.message?.content);
    if (!text) throw new Error("Empty response from Mistral");

    return JSON.parse(repairJSON(text));
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw variants — identical to their counterparts above but skip
// validateAPIResponse so they can be used for quality-check calls
// whose response schema differs from the metadata schema.
// ─────────────────────────────────────────────────────────────────────────────

export async function callGeminiRaw(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string,
    mimeType: string = "image/jpeg",
    assetFile?: File,
    useGreenScreenMode?: boolean
): Promise<any> {
    await sleep(300); // Rate limit padding

    let fileUri: string | null = null;
    if (useGreenScreenMode && assetFile && assetFile.type.startsWith("video/")) {
        fileUri = await uploadToGemini(assetFile, apiKey);
    }

    let endpointModel = model;

    const endpoint = `${PROVIDER_ENDPOINTS.gemini}/${endpointModel}:generateContent`;
    const payload: any = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{
            parts: [
                { text: userPrompt },
                fileUri 
                  ? { file_data: { mime_type: assetFile!.type, file_uri: fileUri } }
                  : { inline_data: { mime_type: mimeType, data: imageBase64.replace(/^data:image\/\w+;base64,/, "") } },
            ],
        }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { 
            temperature: 0.7, 
            topK: 40, 
            topP: 0.95, 
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        },
    };

    if (model.startsWith("gemini-3")) {
        payload.generationConfig.thinkingConfig = { thinkingLevel: "MINIMAL" };
    } else {
        payload.generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini");

    return JSON.parse(repairJSON(text));
}

export async function callOpenAIRaw(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string
): Promise<any> {
    const payload = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 1500,
        temperature: 0.7,
    };

    const response = await fetch(PROVIDER_ENDPOINTS.openai, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");

    return JSON.parse(repairJSON(text));
}

export async function callGroqRaw(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string
): Promise<any> {
    const payload = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
    };

    const response = await fetch(PROVIDER_ENDPOINTS.groq, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");

    return JSON.parse(repairJSON(text));
}



export async function callMistralRaw(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string
): Promise<any> {
    const payload = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: userPrompt },
                    {
                        type: "image_url",
                        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
    };

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new Error(`Rate limit exceeded (429)`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = extractContentText(data?.choices?.[0]?.message?.content);
    if (!text) throw new Error("Empty response from Mistral");

    return JSON.parse(repairJSON(text));
}


