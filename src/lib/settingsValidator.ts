/**
 * Settings Validator
 * Validates user settings before storing to ensure data integrity and consistency
 */

/**
 * Validate keyword count setting
 * Must be integer between 1 and 1000
 */
export function validateKeywordCount(count: number): string | null {
  if (!Number.isInteger(count)) {
    return "Keyword count must be a whole number";
  }
  if (count < 1) {
    return "Keyword count must be at least 1";
  }
  if (count > 1000) {
    return "Keyword count cannot exceed 1000";
  }
  return null;
}



/**
 * Validate title length constraints
 */
export function validateTitleLength(
  min: number,
  max: number
): string | null {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return "Title length must be whole numbers";
  }
  if (min < 1) {
    return "Minimum title length must be at least 1";
  }
  if (max < min) {
    return "Maximum title length must be greater than minimum";
  }
  if (max > 200) {
    return "Maximum title length cannot exceed 200";
  }
  return null;
}

/**
 * Validate description length constraints
 */
export function validateDescriptionLength(
  min: number,
  max: number
): string | null {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    return "Description length must be whole numbers";
  }
  if (min < 1) {
    return "Minimum description length must be at least 1";
  }
  if (max < min) {
    return "Maximum description length must be greater than minimum";
  }
  if (max > 450) {
    return "Maximum description length cannot exceed 450";
  }
  return null;
}

/**
 * Validate API key format by provider
 */
export function validateAPIKeyFormat(
  key: string,
  provider: string
): string | null {
  if (!key || typeof key !== "string") {
    return `${provider} API key cannot be empty`;
  }

  const trimmed = key.trim();
  if (trimmed.length === 0) {
    return `${provider} API key cannot be empty`;
  }

  // Check minimum length
  if (trimmed.length < 10) {
    return `${provider} API key seems too short`;
  }

  // Provider-specific patterns (not strict, just sanity checks)
  const patterns: Record<string, RegExp> = {
    openai: /^sk[\w-]{20,}$/,
    gemini: /^AIza[\w-]{30,}$/,
    groq: /^gsk_[\w]+$/,
    mistral: /^(nY|sk_|j_[\w-]{8}|user-[\w-]+)[\w-]*$/,
  };

  const pattern = patterns[provider.toLowerCase()];
  if (pattern && !pattern.test(trimmed)) {
    return `${provider} API key format doesn't match expected pattern`;
  }

  return null;
}

/**
 * Validate max keyword words constraint
 * Must be integer between 1 and 10
 */
export function validateMaxKeywordWords(count: number): string | null {
  if (!Number.isInteger(count)) {
    return "Max keyword words must be a whole number";
  }
  if (count < 1) {
    return "Max keyword words must be at least 1";
  }
  if (count > 10) {
    return "Max keyword words cannot exceed 10";
  }
  return null;
}

/**
 * Validate negative keyword
 */
export function validateNegativeKeyword(keyword: string): string | null {
  if (!keyword || typeof keyword !== "string") {
    return "Keyword cannot be empty";
  }

  const trimmed = keyword.trim();
  if (trimmed.length === 0) {
    return "Keyword cannot be empty";
  }
  if (trimmed.length > 50) {
    return "Keyword cannot exceed 50 characters";
  }
  if (!/^[\w\s-]+$/i.test(trimmed)) {
    return "Keyword can only contain letters, numbers, spaces, and hyphens";
  }

  return null;
}

/**
 * Consolidated settings validator
 */
export class SettingsValidator {
  static validateKeywordCount = validateKeywordCount;
  static validateTitleLength = validateTitleLength;
  static validateDescriptionLength = validateDescriptionLength;
  static validateAPIKeyFormat = validateAPIKeyFormat;
  static validateMaxKeywordWords = validateMaxKeywordWords;
  static validateNegativeKeyword = validateNegativeKeyword;

  /**
   * Validate all metadata settings at once
   */
  static validateAllSettings(settings: {
    keywordCount?: number;
    titleLengthMin?: number;
    titleLengthMax?: number;
    descriptionLengthMin?: number;
    descriptionLengthMax?: number;
    maxKeywordWords?: number;
  }): Record<string, string> {
    const errors: Record<string, string> = {};

    if (
      settings.keywordCount !== undefined &&
      settings.keywordCount !== null
    ) {
      const err = validateKeywordCount(settings.keywordCount);
      if (err) errors.keywordCount = err;
    }

    if (
      settings.titleLengthMin !== undefined &&
      settings.titleLengthMax !== undefined
    ) {
      const err = validateTitleLength(settings.titleLengthMin, settings.titleLengthMax);
      if (err) errors.titleLength = err;
    }

    if (
      settings.descriptionLengthMin !== undefined &&
      settings.descriptionLengthMax !== undefined
    ) {
      const err = validateDescriptionLength(
        settings.descriptionLengthMin,
        settings.descriptionLengthMax
      );
      if (err) errors.descriptionLength = err;
    }

    if (settings.maxKeywordWords !== undefined && settings.maxKeywordWords !== null) {
      const err = validateMaxKeywordWords(settings.maxKeywordWords);
      if (err) errors.maxKeywordWords = err;
    }



    return errors;
  }
}
