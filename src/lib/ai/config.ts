import { AIProvider, AIModel } from "@/contexts/SettingsContext";
import { GEMINI_MODELS, OPENAI_MODELS } from "@/constants/models";

export const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
    gemini: "https://generativelanguage.googleapis.com/v1beta/models",
    openai: "https://api.openai.com/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    mistral: "https://api.mistral.ai/v1/chat/completions",
};

export const AI_RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        title: { type: "string" },
        description: { type: "string" },
        keywords: { type: "array", items: { type: "string" } },
        confidence: {
            type: "object",
            properties: {
                overall: { type: "number" },
                breakdown: {
                    type: "object",
                    properties: {
                        subjectClarity: { type: "number" },
                        differentiatorStrength: { type: "number" },
                        keywordPrecision: { type: "number" },
                        complianceSafety: { type: "number" }
                    },
                    required: ["subjectClarity", "differentiatorStrength", "keywordPrecision", "complianceSafety"],
                    additionalProperties: false
                },
                level: { type: "string", enum: ["VERY_HIGH", "HIGH", "MEDIUM", "LOW"] }
            },
            required: ["overall", "breakdown", "level"],
            additionalProperties: false
        },
        riskAnalysis: {
            type: "object",
            properties: {
                flags: { type: "array", items: { type: "string" } },
                severity: { type: "string", enum: ["NONE", "LOW", "MEDIUM", "HIGH"] },
                reviewerReasoning: { type: "array", items: { type: "string" } }
            },
            required: ["flags", "severity", "reviewerReasoning"],
            additionalProperties: false
        },
        compliance: {
            type: "object",
            properties: {
                noPeopleDetected: { type: "boolean" },
                trademarkSafe: { type: "boolean" },
                forbiddenTermsRemoved: { type: "array", items: { type: "string" } },
                editorialFlag: { type: "boolean" },
                editorialReason: { type: ["string", "null"] }
            },
            required: ["noPeopleDetected", "trademarkSafe", "forbiddenTermsRemoved", "editorialFlag", "editorialReason"],
            additionalProperties: false
        },
        platformReadiness: {
            type: "object",
            properties: {
                adobeStock: { type: "string", enum: ["READY", "REVIEW", "NOT_READY"] },
                freepik: { type: "string", enum: ["READY", "REVIEW", "NOT_READY"] },
                shutterstock: { type: "string", enum: ["READY", "REVIEW", "NOT_READY"] }
            },
            required: ["adobeStock", "freepik", "shutterstock"],
            additionalProperties: false
        },
        recreationPrompt: { type: "string" },
        searchIntent: { type: "string", enum: ["commercial", "editorial", "conceptual", "technical", "background"] },
        isAIGenerated: { type: "boolean" },
        modelUsed: { type: "string" }
    },
    required: [
        "title", "description", "keywords", "confidence", "riskAnalysis",
        "compliance", "platformReadiness", "recreationPrompt",
        "searchIntent", "isAIGenerated", "modelUsed"
    ],
    additionalProperties: false
};

export function getProviderFromModel(model: AIModel): AIProvider {
    // Direct Mistral API models
    if (model.startsWith("mistral-") || model.startsWith("ministral-")) return "mistral";
    if (model.startsWith("qwen/")) return "groq";
    if (model.startsWith("gemini")) return "gemini";
    if (model.startsWith("gpt")) return "openai";
    if (model.startsWith("meta-llama/") || model.startsWith("llama")) return "groq";
    return "gemini";
}

export function migrateModelName(model: AIModel): AIModel {
    const migrations: Record<string, AIModel> = {
        // ── Legacy Gemini names
        "gemini-1.5-flash":               GEMINI_MODELS.FLASH_3_PREVIEW,
        "gemini-1.5-pro":                 GEMINI_MODELS.PRO_3_PREVIEW,
        "gemini-2.0-flash":               GEMINI_MODELS.FLASH_3_PREVIEW,
        // ── Legacy internal names
        "gemini-3.5-flash-high":          GEMINI_MODELS.FLASH_3_5,
        "gemini-3.5-flash-medium":        GEMINI_MODELS.FLASH_3_5,
        "gemini-3.5-flash-low":           GEMINI_MODELS.FLASH_3_5,
        "gemini-3.1-flash-lite-preview":  GEMINI_MODELS.FLASH_2_5_LITE,
        "gemini-3.1-deep-think":          GEMINI_MODELS.PRO_3_PREVIEW,
        // ── Invented GPT-5.4 / GPT-4.1 names from buggy build → real names ──
        "gpt-5.4":        "gpt-4o",
        "gpt-5.4-pro":    "gpt-4o",
        "gpt-5.4-mini":   "gpt-4o-mini",
        "gpt-5.4-nano":   "gpt-4o-mini",
        "gpt-4.1":        "gpt-4o",
        "gpt-4.1-mini":   "gpt-4o-mini",
        "gpt-4.1-nano":   "gpt-4o-mini",
        "o3":             "gpt-4o",
        "o4-mini":        "gpt-4o-mini",
        // ── Legacy Llama ─────────────────────────────────────────────────────
        "llama3-70b-8192":  "qwen/qwen3.6-27b",
        "llama3-8b-8192":   "qwen/qwen3.6-27b",
        "llama-4-scout":    "qwen/qwen3.6-27b",
        "llama-4-maverick": "qwen/qwen3.6-27b",
        "meta-llama/llama-4-scout-17b-16e-instruct": "qwen/qwen3.6-27b",
        "meta-llama/llama-prompt-guard-2-86m": "qwen/qwen3.6-27b",
        "meta-llama/llama-prompt-guard-2-22m": "qwen/qwen3.6-27b",
        "openai/gpt-oss-20b": "qwen/qwen3.6-27b",
    };
    return (migrations[model] || model) as AIModel;
}

export const getOptimalModel = (isVideo: boolean, preferredModel?: AIModel, availableProvider?: AIProvider): AIModel => {
    if (preferredModel) return preferredModel;
    if (availableProvider) {
        switch (availableProvider) {
            case "gemini":
                return isVideo ? "gemini-3.5-flash" : "gemini-3.5-flash-lite";
            case "openai":
                return isVideo ? "gpt-4o" : "gpt-4o-mini";
            case "groq":
                return "qwen/qwen3.6-27b";
            case "mistral":
                return "mistral-large-2512";
        }
    }
    return isVideo ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
};

/**
 * Returns the free-tier RPM (Requests Per Minute) limit for a given model.
 * Used when freeKeyMode is ON to throttle batch processing.
 */
export function getFreeTierRPM(model: AIModel): number {
    // ── Gemini Flash-Lite models: higher free-tier RPM ──
    if (model === "gemini-3.5-flash-lite" || model === "gemini-3.1-flash-lite") return 15;
    // ── Gemini Flash models: moderate free-tier RPM ──
    if (model === "gemini-3.5-flash" || model === "gemini-3-flash-preview") return 10;
    // ── Groq (Qwen models): 30 RPM free tier ──
    if (model === "qwen/qwen3.6-27b" || model === "qwen/qwen3.8-27b") return 30;
    // ── OpenAI: no free tier, but conservative default ──
    if (model === "gpt-4o" || model === "gpt-4o-mini") return 10;
    // ── Mistral: ~30 RPM free tier ──
    if (model.startsWith("mistral-") || model.startsWith("ministral-")) return 30;
    // ── Fallback ──
    return 10;
}
