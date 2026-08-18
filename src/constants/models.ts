/**
 * Centralized AI model string constants.
 * ALL model strings must be imported from here — never hardcoded elsewhere.
 *
 * Gemini models (confirmed working in v1.1.1):
 *   - gemini-3-flash-preview: Fast bulk/batch processing — low cost.
 *   - gemini-3-pro-preview:   Full multimodal reasoning. Used for image AND video.
 *
 * NOTE: This app sends VIDEO as a frame-grid image (extracted frames stitched into a grid),
 * so BOTH image and video metadata generation use the image input path.
 */

export const GEMINI_MODELS = {
  /** Latest & fastest — next-gen intelligence */
  FLASH_3_5: "gemini-3.5-flash",
  /** Frontier-class intelligence built for speed */
  FLASH_3_PREVIEW: "gemini-3-flash-preview",
  /** Stable and reliable */
  FLASH_2_5: "gemini-2.5-flash",
  /** Fastest and most budget-friendly option */
  FLASH_2_5_LITE: "gemini-2.5-flash-lite",
  /** Best quality — free with strict rate limits */
  PRO_3_1_PREVIEW: "gemini-3.1-pro-preview",
  /** Advanced reasoning — free with strict rate limits */
  PRO_3_PREVIEW: "gemini-3-pro-preview",
  /** Complex reasoning — free with strict rate limits */
  PRO_2_5: "gemini-2.5-pro",
  /** Default recommended model */
  DEFAULT: "gemini-3-flash-preview",
} as const;

export const OPENAI_MODELS = {
  // ── GPT-4o family — confirmed working, support image input natively ────────
  /** Best quality metadata from images. */
  GPT_4O:         "gpt-4o",
  /** Fast · cheaper — bulk processing. */
  GPT_4O_MINI:    "gpt-4o-mini",
  // Aliases kept for migration compatibility
  GPT_5_4:        "gpt-4o",
  GPT_5_4_PRO:    "gpt-4o",
  GPT_5_4_MINI:   "gpt-4o-mini",
  GPT_5_4_NANO:   "gpt-4o-mini",
  GPT_4_1:        "gpt-4o",
  GPT_4_1_MINI:   "gpt-4o-mini",
  GPT_4_1_NANO:   "gpt-4o-mini",
  O3:             "gpt-4o",
  O4_MINI:        "gpt-4o-mini",
  /** Default model for new OpenAI keys. */
  DEFAULT:        "gpt-4o-mini",
} as const;

export type GeminiModelId  = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];
export type OpenAIModelId  = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS];
