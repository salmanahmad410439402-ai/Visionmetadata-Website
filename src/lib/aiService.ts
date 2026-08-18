/**
 * AI Service Orchestrator  (v2)
 * ─────────────────────────────────────────────────────────────────────────
 * Changes from v1:
 *  - Fixed fallback key bug (fallback was added to attemptedKeys but never
 *    actually used in an API call).
 *  - Replaced 5-image-per-key quota with reactive rotation (markKeyExhausted
 *    on error only — no pre-emptive counter).
 *  - Added LAST-CREDIT SQUEEZE phase: after all keys are rate-limited, wait
 *    for the soonest-recovering key and retry rather than giving up.
 *  - Added eventContext parameter so callers can inject event/series targeting
 *    into the SEO prompt without appending "Part 01/02" series suffixes.
 */

import { APIKey, MetadataSettings, AIModel } from "@/contexts/SettingsContext";
import { AssetMetadata, ConfidenceBreakdown, RiskAnalysis, PlatformReadiness, QualityReport } from "@/contexts/AssetsContext";
import { getSystemPrompt, getUserPrompt, getQualityCheckPrompt } from "./seoPrompts";
import {
    getProviderFromModel,
    migrateModelName,
    getOptimalModel,
} from "./ai/config";
import {
    getValidApiKey,
    getNextKeyAfterFailure,
    markKeyExhausted,
    markKeySuccess,
    resetKeyStatus,
    resetAllKeyStatuses,
    resetRoundRobinCounter,
    resetAllQuotas,
    isRateLimitError,
    isAuthError,
    cooldownRemaining,
} from "./ai/keyRotation";
import {
    callGemini,
    callOpenAI,
    callGroq,
    callMistral,
    callGeminiRaw,
    callOpenAIRaw,
    callGroqRaw,
    callMistralRaw,
    AIResponse,
} from "./ai/providers";

import { cleanKeywords } from "./trademarkSniffer";
import { toast } from "sonner";

// Re-export key management helpers so Dashboard only needs to import from aiService
export {
    resetAllKeyStatuses,
    resetRoundRobinCounter,
    resetAllQuotas,
} from "./ai/keyRotation";

// ── Maximum time (ms) to wait for a rate-limited key to recover (last-credit squeeze)
const MAX_SQUEEZE_WAIT_MS = 16_000; // 16 s — slightly above the 15 s hard cap in keyRotation

/**
 * Validate and normalize AI response to ensure all required fields exist.
 * Fills missing fields with safe defaults to prevent UI crashes.
 *
 * NOTE: The main metadata generation prompt does NOT return confidence/riskAnalysis/
 * platformReadiness — those were moved to the on-demand Quality Check feature.
 * We MUST use safe defaults here rather than throwing, so metadata generation
 * always succeeds even when those optional fields are absent from the response.
 */
function validateAndNormalizeResponse(raw: any): AIResponse {
    // ── Basic presence checks — only the truly required fields ────────────
    if (!raw) {
        throw new Error("Validation Failed: Empty response object");
    }
    if (typeof raw.title !== "string" || raw.title.trim().length < 5) {
        throw new Error("Validation Failed: Title is truncated or missing");
    }
    if (typeof raw.description !== "string" || raw.description.trim().length < 10) {
        throw new Error("Validation Failed: Description is truncated or missing");
    }
    if (!Array.isArray(raw.keywords) || raw.keywords.length < 3) {
        throw new Error("Validation Failed: Keywords array is missing or critically truncated");
    }
    const validKeywords = raw.keywords.filter((k: any) => typeof k === "string" && k.trim());
    if (validKeywords.length < 3) {
        throw new Error("Validation Failed: Keywords array contains empty or invalid strings");
    }

    // ── Normalize — fill missing optional fields with safe defaults ───────
    return {
        // Strip any hallucinated "- Part 01" suffixes (prohibited on Adobe Stock / Shutterstock)
        title: (() => {
            const t = raw.title.trim();
            return t ? t.replace(/\s*[-–]?\s*Part\s+\d{1,3}\s*$/i, "").trim() || "Untitled Asset" : "Untitled Asset";
        })(),
        description: raw.description.trim(),
        keywords: raw.keywords
            .filter((k: any) => typeof k === "string" && k.trim())
            .map((k: string) => k.trim()),
        // confidence / riskAnalysis / platformReadiness are NOT returned by the metadata
        // generation prompt — they were moved to the on-demand Quality Check feature.
        // Always populate with empty/neutral defaults so the DB doesn't contain misleading
        // fake scores before a quality check is run.
        confidence: {
            overall: 0,
            breakdown: { subjectClarity: 0, differentiatorStrength: 0, keywordPrecision: 0, complianceSafety: 0 },
            level: "UNCHECKED",
        },
        riskAnalysis: {
            flags: [],
            severity: "NONE",
            reviewerReasoning: [],
        },
        compliance: {
            noPeopleDetected: Boolean(raw.compliance?.noPeopleDetected ?? true),
            trademarkSafe: Boolean(raw.compliance?.trademarkSafe ?? true),
            forbiddenTermsRemoved: Array.isArray(raw.compliance?.forbiddenTermsRemoved)
                ? raw.compliance.forbiddenTermsRemoved.filter((t: any) => typeof t === "string")
                : [],
            editorialFlag: Boolean(raw.compliance?.editorialFlag ?? false),
            editorialReason: typeof raw.compliance?.editorialReason === "string"
                ? raw.compliance.editorialReason
                : null,
        },
        platformReadiness: {
            adobeStock:   ["READY", "REVIEW", "NOT_READY"].includes(raw.platformReadiness?.adobeStock)
                ? raw.platformReadiness.adobeStock : "REVIEW",
            freepik:      ["READY", "REVIEW", "NOT_READY"].includes(raw.platformReadiness?.freepik)
                ? raw.platformReadiness.freepik : "REVIEW",
            shutterstock: ["READY", "REVIEW", "NOT_READY"].includes(raw.platformReadiness?.shutterstock)
                ? raw.platformReadiness.shutterstock : "REVIEW",
        },
        recreationPrompt: typeof raw.recreationPrompt === "string" ? raw.recreationPrompt : "",
        searchIntent: ["commercial", "editorial", "conceptual", "technical", "background"].includes(raw.searchIntent)
            ? raw.searchIntent
            : "commercial",
        isAIGenerated: Boolean(raw.isAIGenerated ?? false),
        modelUsed: typeof raw.modelUsed === "string" ? raw.modelUsed : "",
    };
}

// ─────────────────────────────────────────────────────────────────────────
//  Image source resolution
// ─────────────────────────────────────────────────────────────────────────

async function resolveImageToBase64(imageSource: string): Promise<string> {
    if (imageSource.startsWith("data:")) return imageSource;

    if (imageSource.startsWith("blob:")) {
        const response = await fetch(imageSource);
        const blob     = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader    = new FileReader();
            reader.onload  = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to convert blob URL to base64"));
            reader.readAsDataURL(blob);
        });
    }

    return imageSource;
}

// ─────────────────────────────────────────────────────────────────────────
//  Per-request API call helper
// ─────────────────────────────────────────────────────────────────────────

async function callProvider(
    apiKey: APIKey,
    model:  string,
    systemPrompt: string,
    userPrompt:   string,
    resolvedImage: string,
    isVideo: boolean,
    assetFile?: File,
    settings?: MetadataSettings,
): Promise<any> {
    switch (apiKey.provider) {
        case "gemini":
            return callGemini(apiKey.key, model, systemPrompt, userPrompt, resolvedImage, "image/jpeg", assetFile, settings?.greenScreenVideos);
        case "openai":
            return callOpenAI(apiKey.key, model, systemPrompt, userPrompt, resolvedImage);
        case "groq":
            return callGroq(apiKey.key, model, systemPrompt, userPrompt, resolvedImage);
        case "mistral":
            return callMistral(apiKey.key, model, systemPrompt, userPrompt, resolvedImage);
        default:
            throw new Error(`Unknown provider: ${apiKey.provider}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────
//  Main metadata generation
// ─────────────────────────────────────────────────────────────────────────

export async function generateMetadata(
    imageBase64:     string,
    apiKeys:         APIKey[],
    settings:        MetadataSettings,
    isVideo:         boolean,
    isVertical:      boolean,
    isAIGenerated:   boolean,
    motionType?:     string,
    preferredModel?: AIModel,
    eventEnabled?:   boolean,
    eventName?:      string,
    assetFile?:      File
): Promise<AssetMetadata> {

    // --- ANTI-TAMPERING HIDDEN HEARTBEAT ---
    // This runs silently before every generation. If LicenseGate is bypassed, this will still block.
    try {
        const isActivated = localStorage.getItem('vm_pro_activated') === 'true';
        const isTrialActive = localStorage.getItem('vm_trial_active') === 'true';
        if (!isActivated && !isTrialActive) {
            throw new Error("Application integrity check failed (E-101).");
        }
        
        // Randomly check with the main process (10% chance) to avoid performance hits on bulk processing
        if (Math.random() < 0.1) {
            const nonce = Math.random().toString(36).substring(2, 15);
            // @ts-ignore
            if (window.electronAPI && window.electronAPI.verifyLaunchState) {
                // @ts-ignore
                const state = await window.electronAPI.verifyLaunchState(nonce);
                if (state.status !== 'allowed' || state.nonce !== nonce) {
                    throw new Error("Application integrity check failed (E-102).");
                }
            }
        }
    } catch (e) {
        throw new Error("Security exception: Please restart the application. " + (e as any).message);
    }
    // ----------------------------------------

    const resolvedImage  = await resolveImageToBase64(imageBase64);
    const systemPrompt   = settings.customPromptEnabled && settings.customPrompt.trim() !== ""
        ? settings.customPrompt
        : getSystemPrompt(settings, isVideo, isVertical, isAIGenerated, eventEnabled, eventName);
    const userPrompt     = getUserPrompt(isVideo, motionType, eventEnabled, eventName);

    const isAutoMode       = preferredModel === "auto" || !preferredModel;
    const effectiveModel   = isAutoMode ? undefined : preferredModel;
    const preferredProvider = effectiveModel ? getProviderFromModel(effectiveModel) : undefined;

    let lastError: Error | null = null;

    if (apiKeys.length === 0) {
        throw new Error(
            `No API keys configured.\n\n` +
            `Fix: Add an API key in Settings.`
        );
    }

        // Track which keys we've actually sent a request to this call.
        const attemptedKeys = new Set<string>();

        // We iterate up to apiKeys.length times; on each iteration we pick
        // the best currently-available key and try it.  If it fails with a
        // rate-limit error we mark it exhausted and continue to the next one.
        while (attemptedKeys.size < apiKeys.length) {

            // Pick the next best key (Phase 1: preferred provider, Phase 2: any provider)
            const apiKey = getValidApiKey(apiKeys, preferredProvider);

            if (!apiKey) break; // no keys configured at all

            // If getValidApiKey returned a rate-limited key (Phase 3 path),
            // skip it here — Phase 3 (last-credit squeeze) handles that below.
            if (attemptedKeys.has(apiKey.key)) break;

            attemptedKeys.add(apiKey.key);

            const provider = apiKey.provider;
            let model = !isAutoMode && effectiveModel && getProviderFromModel(effectiveModel) === provider
                ? migrateModelName(effectiveModel)
                : getOptimalModel(isVideo, undefined, provider);
            model = migrateModelName(model);

            // Warn if we had to substitute the model (only in manual mode)
            if (!isAutoMode && effectiveModel && getProviderFromModel(effectiveModel) !== provider) {
                toast.warning("Model substituted", {
                    description: `No ${getProviderFromModel(effectiveModel)} key available. Using ${model} via ${provider} instead.`,
                    duration: 5_000,
                });
            }

            try {
                const rawResponse = await callProvider(apiKey, model, systemPrompt, userPrompt, resolvedImage, isVideo, assetFile, settings);
                const response    = validateAndNormalizeResponse(rawResponse);

                if (response.keywords.length > settings.keywordCount) {
                    response.keywords = response.keywords.slice(0, settings.keywordCount);
                }

                markKeySuccess(apiKey);
                return buildAssetMetadata(response, model, settings);

            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (isRateLimitError(lastError)) {
                    markKeyExhausted(apiKey);
                    // Continue the loop — pick the next available key
                    continue;
                }

                if (isAuthError(lastError)) {
                    // Hard auth failure: this key is bad — rotate away but don't mark cooldown
                    // (no point in waiting for a key that will never authenticate)
                    console.warn(`[AI] Auth error on ${provider} key — rotating.`, lastError.message);
                    continue;
                }

                // Non-rate-limit, non-auth error (e.g., bad image, model refusal).
                // Don't rotate keys for this — it's not the key's fault.
                console.error(`[AI] Non-key error with ${provider}:`, lastError.message);
                // Still rotate so other keys get a chance
                continue;
            }
        }

        // ── Phase 3: LAST-CREDIT SQUEEZE ─────────────────────────────────
        //
        // We've tried every key and they're all currently rate-limited.
        // Find the key whose cooldown expires soonest.  If it recovers within
        // MAX_SQUEEZE_WAIT_MS, wait for it and fire one final request.
        // This ensures we drain every last credit rather than dropping images.
        //
        const allRateLimited = apiKeys.every(k => {
            const s = getValidApiKey([k], preferredProvider); // will return even rate-limited key in phase 3
            return s === k; // phase 3 returns rate-limited keys when nothing else is available
        });

        // Compute the soonest-recovering key across the full pool
        let soonestKey: APIKey | null = null;
        let soonestWait = Infinity;
        for (const k of apiKeys) {
            const wait = cooldownRemaining(k);
            if (wait < soonestWait) {
                soonestWait = wait;
                soonestKey  = k;
            }
        }

        if (soonestKey && soonestWait <= MAX_SQUEEZE_WAIT_MS) {
            const waitSec = Math.ceil(soonestWait / 1000);
            toast.info(`All keys cooling down — retrying in ${waitSec}s (last-credit squeeze)`, {
                duration: soonestWait + 1_000,
            });

            await new Promise(r => setTimeout(r, soonestWait + 200)); // +200 ms buffer

            // Key should be available now — try it one final time
            try {
                const provider = soonestKey.provider;
                const model    = migrateModelName(getOptimalModel(isVideo, undefined, provider));
                const rawResponse = await callProvider(soonestKey, model, systemPrompt, userPrompt, resolvedImage, isVideo, assetFile, settings);
                const response    = validateAndNormalizeResponse(rawResponse);

                if (response.keywords.length > settings.keywordCount) {
                    response.keywords = response.keywords.slice(0, settings.keywordCount);
                }

                markKeySuccess(soonestKey);
                return buildAssetMetadata(response, model, settings);

            } catch (squeezeError) {
                lastError = squeezeError instanceof Error ? squeezeError : new Error(String(squeezeError));
                if (isRateLimitError(lastError)) markKeyExhausted(soonestKey);
                console.warn("[AI] Last-credit squeeze failed:", lastError.message);
            }
        }

        // All keys tried + squeeze failed
        throw new Error(
            `All API keys exhausted.\n` +
            `Last error: ${lastError?.message || "Unknown error"}\n\n` +
            `Fix: Add more keys in Settings.`
        );
}

// ─────────────────────────────────────────────────────────────────────────
//  Quality check (unchanged logic, just consistent with new key helpers)
// ─────────────────────────────────────────────────────────────────────────

export async function checkMetadataQuality(
    imageBase64: string,
    metadata:    AssetMetadata,
    apiKeys:     APIKey[]
): Promise<QualityReport> {

    const resolvedImage  = await resolveImageToBase64(imageBase64);
    const systemPrompt   = getQualityCheckPrompt(
        metadata.title,
        metadata.description,
        metadata.keywords,
        metadata.isAIGenerated,
    );
    const userPrompt = `Evaluate the quality of this metadata against the image shown.

GENERATED METADATA:
${JSON.stringify({
    title:         metadata.title,
    description:   metadata.description,
    keywords:      metadata.keywords,
    isAIGenerated: metadata.isAIGenerated,
    searchIntent:  metadata.searchIntent,
}, null, 2)}

Return ONLY the JSON quality report as specified in your instructions. No other text.`;

    let lastError: Error | null = null;

    if (apiKeys.length === 0) {
        throw new Error(
            `No API keys configured.\n\n` +
            `Fix: Add an API key in Settings.`
        );
    }

    const attempted = new Set<string>();

    while (attempted.size < apiKeys.length) {
        const apiKey = getValidApiKey(apiKeys);
        if (!apiKey || attempted.has(apiKey.key)) break;
        attempted.add(apiKey.key);

        const provider = apiKey.provider;
        const model    = migrateModelName(getOptimalModel(false, undefined, provider));

        try {
            let raw: any;
            switch (provider) {
                case "gemini":  raw = await callGeminiRaw (apiKey.key, model, systemPrompt, userPrompt, resolvedImage); break;
                case "openai":  raw = await callOpenAIRaw (apiKey.key, model, systemPrompt, userPrompt, resolvedImage); break;
                case "groq":    raw = await callGroqRaw   (apiKey.key, model, systemPrompt, userPrompt, resolvedImage); break;
                case "mistral": raw = await callMistralRaw(apiKey.key, model, systemPrompt, userPrompt, resolvedImage); break;
                default: throw new Error(`Unknown provider: ${provider}`);
            }
            markKeySuccess(apiKey);
            return buildQualityReport(raw, model);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (isRateLimitError(lastError)) markKeyExhausted(apiKey);
        }
    }

    throw new Error(
        `All API keys exhausted.\n` +
        `Last error: ${lastError?.message || "Unknown error"}\n\n` +
        `Fix: Add more keys in Settings.`
    );
}

// ─────────────────────────────────────────────────────────────────────────
//  Build helpers
// ─────────────────────────────────────────────────────────────────────────

function buildQualityReport(raw: any, modelUsed: string): QualityReport {
    return {
        confidence:         typeof raw.confidence?.overall === "number" ? raw.confidence.overall : 50,
        confidenceBreakdown: {
            subjectClarity:          raw.confidence?.breakdown?.subjectClarity           ?? 12.5,
            differentiatorStrength:  raw.confidence?.breakdown?.differentiatorStrength   ?? 12.5,
            keywordPrecision:        raw.confidence?.breakdown?.keywordPrecision         ?? 12.5,
            complianceSafety:        raw.confidence?.breakdown?.complianceSafety         ?? 12.5,
        },
        riskAnalysis: {
            flags:             Array.isArray(raw.riskAnalysis?.flags) ? raw.riskAnalysis.flags : [],
            severity:          (raw.riskAnalysis?.severity ?? "NONE") as RiskAnalysis["severity"],
            reviewerReasoning: Array.isArray(raw.riskAnalysis?.reviewerReasoning) ? raw.riskAnalysis.reviewerReasoning : [],
        },
        platformReadiness: {
            adobeStock:   (raw.platformReadiness?.adobeStock   ?? "REVIEW") as PlatformReadiness["adobeStock"],
            freepik:      (raw.platformReadiness?.freepik      ?? "REVIEW") as PlatformReadiness["freepik"],
            shutterstock: (raw.platformReadiness?.shutterstock ?? "REVIEW") as PlatformReadiness["shutterstock"],
        },
        editorialFlag:       raw.editorialFlag     ?? false,
        editorialReason:     raw.editorialReason   ?? null,
        qualityCheckedAt:    raw.qualityCheckedAt  ?? new Date().toISOString(),
        modelUsed,
    };
}

function buildAssetMetadata(
    response:  AIResponse,
    modelUsed: string,
    settings:  MetadataSettings,
): AssetMetadata {
    let filteredKeywords = response.keywords;

    if (settings.negativeKeywords.length > 0) {
        const negSet = new Set(settings.negativeKeywords.map(k => k.toLowerCase()));
        filteredKeywords = filteredKeywords.filter(k => !negSet.has(k.toLowerCase()));
    }

    const { cleaned: trademarkCleaned } = cleanKeywords(filteredKeywords);
    filteredKeywords = trademarkCleaned;

    const targetCount = settings.keywordCount;
    if (filteredKeywords.length < targetCount) {
        const intent = (response.searchIntent ?? "commercial") as string;
        const intentFallbacks: Record<string, string[]> = {
            commercial:  ["business", "professional", "corporate", "modern", "concept", "office",
                          "strategy", "teamwork", "leadership", "growth", "success", "management",
                          "finance", "marketing", "presentation", "meeting", "workplace", "economy"],
            editorial:   ["editorial", "news", "event", "documentary", "reportage", "journalism",
                          "media", "press", "current events", "photojournalism", "society", "culture"],
            conceptual:  ["concept", "abstract", "creative", "idea", "design", "inspiration",
                          "imagination", "innovation", "vision", "future", "solution", "thinking"],
            technical:   ["technology", "digital", "technical", "software", "icon", "interface",
                          "app", "web", "code", "data", "network", "system", "engineering", "IT"],
            background:  ["background", "texture", "pattern", "wallpaper", "abstract", "surface",
                          "gradient", "decorative", "backdrop", "minimal", "clean", "flat"],
        };
        const universalFallbacks = [
            "stock", "photography", "image", "creative", "art",
            "design", "collection", "set", "colorful", "beautiful",
            "detailed", "modern", "simple", "isolated", "white background",
        ];
        const isVectorIntent = intent === "technical" || intent === "background" || intent === "conceptual";
        const vectorFallbacks = isVectorIntent
            ? ["illustration", "vector", "graphic", "template", "element",
               "symbol", "icon", "sign", "pictogram", "clip art", "infographic"]
            : [];
        const pool    = [...(intentFallbacks[intent] ?? intentFallbacks["commercial"]), ...universalFallbacks, ...vectorFallbacks];
        const existing = new Set(filteredKeywords.map(k => k.toLowerCase()));
        for (const fb of pool) {
            if (filteredKeywords.length >= targetCount) break;
            if (!existing.has(fb.toLowerCase())) {
                filteredKeywords.push(fb);
                existing.add(fb.toLowerCase());
            }
        }
    }

    if (filteredKeywords.length > targetCount) {
        filteredKeywords = filteredKeywords.slice(0, targetCount);
    }

    const confidenceBreakdown: ConfidenceBreakdown = {
        subjectClarity:         response.confidence.breakdown.subjectClarity,
        differentiatorStrength: response.confidence.breakdown.differentiatorStrength,
        keywordPrecision:       response.confidence.breakdown.keywordPrecision,
        complianceSafety:       response.confidence.breakdown.complianceSafety,
    };

    return {
        title:             response.title,
        description:       response.description,
        keywords:          filteredKeywords,
        confidence:        response.confidence.overall,
        confidenceBreakdown,
        riskAnalysis: {
            flags:             response.riskAnalysis.flags,
            severity:          response.riskAnalysis.severity as RiskAnalysis["severity"],
            reviewerReasoning: response.riskAnalysis.reviewerReasoning,
        },
        platformReadiness: {
            adobeStock:   response.platformReadiness.adobeStock   as PlatformReadiness["adobeStock"],
            freepik:      response.platformReadiness.freepik      as PlatformReadiness["freepik"],
            shutterstock: response.platformReadiness.shutterstock as PlatformReadiness["shutterstock"],
        },
        recreationPrompt:  response.recreationPrompt,
        modelUsed:         response.modelUsed || modelUsed,
        isAIGenerated:     response.isAIGenerated,
        noPeopleDetected:  response.compliance.noPeopleDetected,
        searchIntent:      response.searchIntent as AssetMetadata["searchIntent"],
    };
}
