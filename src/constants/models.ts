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
  /** Most cost-effective 3.5 tier — maximum metadata per token */
  FLASH_3_5_LITE: "gemini-3.5-flash-lite",
  /** Frontier-class intelligence built for speed */
  FLASH_3_PREVIEW: "gemini-3-flash-preview",
  /** Most cost-effective 3.1 tier — maximum metadata per token */
  FLASH_3_1_LITE: "gemini-3.1-flash-lite",
  /** Advanced reasoning — free with strict rate limits */
  PRO_3_PREVIEW: "gemini-3-pro-preview",
  /** Default recommended model — cheapest with great metadata quality */
  DEFAULT: "gemini-3.5-flash-lite",
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
