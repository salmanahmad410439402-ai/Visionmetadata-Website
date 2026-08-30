/**
 * ═══════════════════════════════════════════════════════════════
 *  TagyfyData Pro — API Key Rotation Engine  (v2)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Design Goals
 *  ────────────
 *  1. Use EVERY last credit of every API key before giving up.
 *  2. One unified tracking system — no more two disconnected maps.
 *  3. Reactive rotation — rotate only when an error actually occurs,
 *     not on an arbitrary 5-image pre-emptive schedule.
 *  4. Concurrent-safe round-robin so batch workers spread load evenly.
 *  5. Fixed cooldown stored at mark-time (not regenerated on each check).
 *
 *  Last-Credit Squeeze Algorithm
 *  ──────────────────────────────
 *  Phase 1 → Try preferred provider's keys (round-robin).
 *  Phase 2 → Try all other keys in priority order (round-robin).
 *  Phase 3 → All keys rate-limited? Return the key whose cooldown
 *             expires SOONEST — caller retries after a short wait.
 *             This is the "last credit" squeeze: we never hard-fail
 *             while any key might still have headroom.
 *
 *  Provider Priority Waterfall
 *  ───────────────────────────
 *  Gemini (best free tier) → Mistral → OpenAI → Groq
 */

import { AIProvider, APIKey } from "@/contexts/SettingsContext";
import { toast } from "sonner";

// ── Provider Priority ─────────────────────────────────────────────────────
export const PROVIDER_PRIORITY: AIProvider[] = [
    "gemini",
    "mistral",
    "openai",
    "groq",
];

// ── Cooldown constants ────────────────────────────────────────────────────
// 5 s minimum so we don't hammer the API; 15 s hard cap so the user
// doesn't feel like the app is frozen during a large batch.
const MIN_COOLDOWN_MS  = 5_000;   //  5 s
const MAX_COOLDOWN_MS  = 15_000;  // 15 s
const ROUND_ROBIN_CAP  = 100_000; // prevent unbounded integer growth

// ── Key Status Record ─────────────────────────────────────────────────────
export interface KeyStatus {
    key: string;
    provider: AIProvider;
    /** True while the key is in its cooldown window after a rate-limit error. */
    rateLimited: boolean;
    /** Timestamp (ms) when the key was rate-limited. */
    rateLimitedAt: number | null;
    /** Fixed cooldown stored at mark-time (exponential backoff, capped at MAX). */
    cooldownMs: number;
    /** How many consecutive rate-limit errors this key has hit. */
    errorCount: number;
    /** Total successful requests served by this key in this session. */
    successCount: number;
}

// ── Single unified status map ─────────────────────────────────────────────
const keyStatusMap = new Map<string, KeyStatus>();

// ─────────────────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────────────────

function getOrCreate(apiKey: APIKey): KeyStatus {
    if (!keyStatusMap.has(apiKey.key)) {
        keyStatusMap.set(apiKey.key, {
            key:           apiKey.key,
            provider:      apiKey.provider,
            rateLimited:   false,
            rateLimitedAt: null,
            cooldownMs:    MIN_COOLDOWN_MS,
            errorCount:    0,
            successCount:  0,
        });
    }
    return keyStatusMap.get(apiKey.key)!;
}

// ─────────────────────────────────────────────────────────────────────────
//  Public — status inspection
// ─────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the key is currently usable (not in its cooldown window).
 * Auto-recovers expired cooldowns in-place.
 */
export const isKeyAvailable = (apiKey: APIKey): boolean => {
    const s = getOrCreate(apiKey);
    if (!s.rateLimited) return true;

    // Cooldown stored at mark-time — use SAME value every check (no re-roll).
    if (s.rateLimitedAt && Date.now() - s.rateLimitedAt > s.cooldownMs) {
        s.rateLimited    = false;
        s.rateLimitedAt  = null;
        keyStatusMap.set(apiKey.key, s);
        return true;
    }
    return false;
};

/** How many milliseconds remain on this key's cooldown (0 if available). */
export const cooldownRemaining = (apiKey: APIKey): number => {
    const s = getOrCreate(apiKey);
    if (!s.rateLimited || !s.rateLimitedAt) return 0;
    return Math.max(0, s.rateLimitedAt + s.cooldownMs - Date.now());
};

export const getKeyStatus = (apiKey: APIKey): KeyStatus => getOrCreate(apiKey);

// ─────────────────────────────────────────────────────────────────────────
//  Public — status mutation
// ─────────────────────────────────────────────────────────────────────────

/**
 * Call this when a key returns a rate-limit / quota error.
 * Applies exponential backoff (capped at MAX_COOLDOWN_MS).
 */
export const markKeyExhausted = (apiKey: APIKey): void => {
    const s    = getOrCreate(apiKey);
    s.rateLimited    = true;
    s.rateLimitedAt  = Date.now();
    s.errorCount    += 1;

    // Cooldown doubles with each error, floored/capped.
    const base      = MIN_COOLDOWN_MS * Math.pow(1.8, Math.min(s.errorCount - 1, 5));
    s.cooldownMs    = Math.min(Math.round(base), MAX_COOLDOWN_MS);

    keyStatusMap.set(apiKey.key, s);

    toast.warning("API key rate-limited", {
        description: `${apiKey.provider} key hit limit. Cooling down ${Math.round(s.cooldownMs / 1000)}s — switching to next key.`,
        duration: 4_000,
    });
};

/**
 * Call this after a successful API response.
 * Clears error history and increments success counter.
 */
export const markKeySuccess = (apiKey: APIKey): void => {
    const s      = getOrCreate(apiKey);
    s.rateLimited    = false;
    s.rateLimitedAt  = null;
    s.errorCount     = 0;
    s.cooldownMs     = MIN_COOLDOWN_MS;
    s.successCount  += 1;
    keyStatusMap.set(apiKey.key, s);
};

/** Reset a single key's status entirely. */
export const resetKeyStatus = (apiKey: APIKey): void => {
    keyStatusMap.delete(apiKey.key);
};

/** Reset ALL key statuses — call on "Retry All Failed" so every key starts fresh. */
export const resetAllKeyStatuses = (): void => {
    keyStatusMap.clear();
};

/** Alias kept for backward-compat with Dashboard imports. */
export const resetRoundRobinCounter = (): void => {};

/** Alias kept for backward-compat with Dashboard imports. */
export const resetAllQuotas = resetAllKeyStatuses;

// ─────────────────────────────────────────────────────────────────────────
//  Public — key selection
// ─────────────────────────────────────────────────────────────────────────

let _stickyKeyId: string | null = null;

/**
 * getValidApiKey — The core key-selection function.
 *
 * Algorithm (Sticky Exhaustion):
 * Uses a single API key repeatedly until it hits a rate-limit (429).
 * Only when it is exhausted does it switch to the next available key.
 * This prevents distributing requests across 50 keys simultaneously,
 * reducing IP-based blocking and honoring the provider's native RPM limits.
 *
 * @param apiKeys          Full list of user-configured keys.
 * @param preferredProvider Optional provider to try first.
 * @returns The best available key, or the soonest-recovering key, or null
 */
export const getValidApiKey = (
    apiKeys: APIKey[],
    preferredProvider?: AIProvider,
): APIKey | null => {
    if (apiKeys.length === 0) return null;

    // ── STICKY PHASE: Check if the currently active key is still healthy ──
    if (_stickyKeyId) {
        const sticky = apiKeys.find(k => k.key === _stickyKeyId);
        if (sticky && isKeyAvailable(sticky)) {
            // Must also match preferred provider if strictly requested
            if (!preferredProvider || sticky.provider === preferredProvider) {
                return sticky;
            }
        }
    }

    // ── Phase 1: preferred provider ──────────────────────────────────────
    if (preferredProvider) {
        const pool = apiKeys.filter(
            k => k.provider === preferredProvider && isKeyAvailable(k),
        );
        if (pool.length > 0) {
            _stickyKeyId = pool[0].key;
            return pool[0];
        }
    }

    // ── Phase 2: all other providers in priority order ───────────────────
    const available: APIKey[] = [];
    for (const provider of PROVIDER_PRIORITY) {
        if (provider === preferredProvider) continue; // already tried
        const providerPool = apiKeys.filter(
            k => k.provider === provider && isKeyAvailable(k),
        );
        available.push(...providerPool);
    }
    if (available.length > 0) {
        _stickyKeyId = available[0].key;
        return available[0];
    }

    // ── Phase 3: LAST-CREDIT SQUEEZE ─────────────────────────────────────
    // All keys are rate-limited. Find the one that recovers soonest.
    // Return it so the caller can wait and retry rather than giving up.
    let soonestKey: APIKey | null = null;
    let soonestExpiry = Infinity;

    for (const k of apiKeys) {
        const s = getOrCreate(k);
        if (s.rateLimitedAt !== null) {
            const expiresAt = s.rateLimitedAt + s.cooldownMs;
            if (expiresAt < soonestExpiry) {
                soonestExpiry = expiresAt;
                soonestKey    = k;
            }
        }
    }

    return soonestKey; // null only if the user literally has no keys configured
};

/**
 * getNextKeyAfterFailure — Rotate to a *different* key than the one that failed.
 *
 * Used by aiService after catching a rate-limit error on a specific key.
 * Excludes `failedKey` from the candidate pool so we don't immediately
 * retry the same exhausted key.
 */
export const getNextKeyAfterFailure = (
    apiKeys: APIKey[],
    failedKey: APIKey,
    preferredProvider?: AIProvider,
): APIKey | null => {
    const others = apiKeys.filter(k => k.key !== failedKey.key);
    return getValidApiKey(others, preferredProvider);
};

// ─────────────────────────────────────────────────────────────────────────
//  Public — error classification
// ─────────────────────────────────────────────────────────────────────────

/**
 * Returns true for any error that indicates the key needs a cooldown
 * (rate limit, quota exhaustion, insufficient credits, service overload).
 */
export const isRateLimitError = (error: Error | string): boolean => {
    const msg = (typeof error === "string" ? error : error.message).toLowerCase();
    return (
        msg.includes("429")                    ||
        msg.includes("402")                    || // OpenRouter credits exhausted
        msg.includes("503")                    || // OpenRouter model temporarily unavailable
        msg.includes("rate limit")             ||
        msg.includes("rate_limit")             ||
        msg.includes("too many requests")      ||
        msg.includes("quota exceeded")         ||
        msg.includes("resource_exhausted")     ||
        msg.includes("insufficient credits")   ||
        msg.includes("service unavailable")    ||
        msg.includes("overloaded")
    );
};

/**
 * Returns true for hard auth errors (wrong key, revoked key).
 * These keys should NOT be retried — only rotated away from permanently.
 *
 * FIX (Bug #3): 403 ("permission denied") was previously included here.
 * Gemini returns HTTP 403 when you pass an invalid/non-existent model name,
 * which caused the rotation engine to treat bad-model errors as auth errors:
 *   bad model → 403 → all keys rotated out → silent failure.
 * 403 is now excluded. Only genuine auth indicators are matched.
 * Note: If you need to handle model-not-found specifically, check for
 * "model not found", "invalid model", or "not supported" in the error message
 * and surface that directly to the user instead of rotating keys.
 */
export const isAuthError = (error: Error | string): boolean => {
    const msg = (typeof error === "string" ? error : error.message).toLowerCase();
    return (
        msg.includes("401")                   ||
        msg.includes("invalid_api_key")       ||
        msg.includes("invalid api key")       ||
        msg.includes("authentication")        ||
        msg.includes("unauthenticated")       ||
        msg.includes("unauthorized")
    );
};

// ─────────────────────────────────────────────────────────────────────────
//  Debug helpers
// ─────────────────────────────────────────────────────────────────────────

/** Returns a snapshot of all key statuses for debug panels / tooltips. */
export const getKeyStatusSummary = (apiKeys: APIKey[]) =>
    apiKeys.map(k => {
        const s = getOrCreate(k);
        return {
            provider:      s.provider,
            maskedKey:     `${k.key.slice(0, 6)}…`,
            available:     isKeyAvailable(k),
            errorCount:    s.errorCount,
            successCount:  s.successCount,
            cooldownLeft:  Math.round(cooldownRemaining(k) / 1000),
        };
    });
