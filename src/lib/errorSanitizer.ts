/**
 * Error Sanitization Utility
 * Sanitizes error messages to remove sensitive information before displaying to users
 * or logging to console.
 */

/**
 * Patterns for sensitive data that should be redacted
 */
const SENSITIVE_PATTERNS = {
  // API Keys
  openaiKey: /sk-[\w-]{20,}/g,
  geminiKey: /AIza[\w-]{30,}/g,
  groqKey: /gsk_[\w]{30,}/g,
  mistralKey: /sk-[\w-]{30,}/g,
  // Generic patterns
  bearerToken: /Bearer\s+[\w-]+/gi,
  token: /token\s*=\s*[\w-]+/gi,
  // URLs (might contain credentials) — preserve localhost for local-service errors
  url: /https?:\/\/(?!localhost|127\.0\.0\.1)[^\s/$.?#][^\s]*/g,
  // IP addresses
  ip: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // File paths (Windows)
  winPath: /C:\\Users\\[^\\]+\\/gi,
  // File paths (Unix)
  unixPath: /\/home\/[^/]+\//gi,
};

/**
 * Check if a string contains sensitive data
 */
export function isSensitive(message: string): boolean {
  return Object.values(SENSITIVE_PATTERNS).some(pattern => pattern.test(message));
}

/**
 * Sanitize an error message by redacting sensitive patterns
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return "";
  
  let sanitized = message;
  
  // Redact API keys
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.openaiKey, "[REDACTED_OPENAI_KEY]");
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.geminiKey, "[REDACTED_GEMINI_KEY]");
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.groqKey, "[REDACTED_GROQ_KEY]");
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.mistralKey, "[REDACTED_MISTRAL_KEY]");
  
  // Redact bearer tokens and generic tokens
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.bearerToken, "[REDACTED_TOKEN]");
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.token, "token=[REDACTED]");
  
  // Redact URLs
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.url, "[REDACTED_URL]");
  
  // Redact IP addresses
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.ip, "[REDACTED_IP]");
  
  // Redact file paths
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.winPath, "[REDACTED_PATH]");
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.unixPath, "[REDACTED_PATH]");
  
  return sanitized;
}

/**
 * Format error for user display - sanitized and user-friendly
 */
export function formatErrorForUser(error: Error | unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network / DNS / connection errors
    if (
      message.includes("getaddrinfo") ||
      message.includes("enotfound") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("timeout")
    ) {
      return "Failed to connect to API service. Please check your internet connection and firewall settings.";
    }

    // Auth / key errors
    if (message.includes("auth") || message.includes("unauthorized") || message.includes("403") || message.includes("401")) {
      return "Authentication failed. Please verify your API credentials in Settings.";
    }

    // Explicit API fetch errors (narrow — must mention both api AND a failure keyword)
    if ((message.includes("api error") || message.includes("api request")) && (message.includes("failed") || message.includes("error"))) {
      return "API request failed. Please check your API key configuration in Settings.";
    }
    if (message.includes("rate limit") || message.includes("quota")) {
      return "API rate limit reached. Please wait a few moments and try again.";
    }
    if (message.includes("file") || message.includes("read")) {
      return "Failed to process file. The file may be corrupted or inaccessible.";
    }
    if (message.includes("timeout")) {
      return "Operation timed out. Please try again with a smaller batch.";
    }
    if (message.includes("memory")) {
      return "Out of memory. Please close other applications and try again.";
    }
    // Return sanitized message if available
    const sanitized = sanitizeErrorMessage(error.message);
    if (sanitized && sanitized.length > 5 && sanitized.length < 250) {
      return sanitized;
    }
    return "An unexpected error occurred. Please try again.";
  }
  
  return "An unexpected error occurred. Please try again.";
}

/**
 * Format error for logging - sanitized to avoid logging sensitive data
 */
export function formatErrorForLog(error: Error | unknown): string {
  let message: string;
  
  if (error instanceof Error) {
    message = error.message || error.toString();
  } else {
    message = String(error);
  }
  
  // If it contains sensitive data, don't log the message at all
  if (isSensitive(message)) {
    return "[Sensitive error data - not logged]";
  }
  
  // Otherwise, sanitize common patterns just to be safe
  return sanitizeErrorMessage(message);
}

/**
 * Safe console.error wrapper that sanitizes before logging
 */
export function safeConsoleError(...args: any[]): void {
  const sanitized = args.map(arg => {
    if (typeof arg === "string") {
      return sanitizeErrorMessage(arg);
    }
    if (arg instanceof Error) {
      return {
        name: arg.name,
        message: sanitizeErrorMessage(arg.message),
        stack: sanitizeErrorMessage(arg.stack || ""),
      };
    }
    return arg;
  });
  
  console.error(...sanitized);
}

/**
 * Safe console.warn wrapper that sanitizes before logging
 */
export function safeConsoleWarn(...args: any[]): void {
  const sanitized = args.map(arg => {
    if (typeof arg === "string") {
      return sanitizeErrorMessage(arg);
    }
    if (arg instanceof Error) {
      return {
        name: arg.name,
        message: sanitizeErrorMessage(arg.message),
      };
    }
    return arg;
  });
  
  console.warn(...sanitized);
}
