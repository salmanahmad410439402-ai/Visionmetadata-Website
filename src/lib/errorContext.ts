/**
 * Error Context & Structured Error Reporting
 * Captures comprehensive context when errors occur for better debugging
 */

import { sanitizeErrorMessage, isSensitive } from "./errorSanitizer";

export interface ErrorContext {
  timestamp: string;
  userAgent: string;
  url: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    assetCount?: number;
    batchActive?: boolean;

    selectedModel?: string;
    userAction?: string;
    [key: string]: any;
  };
  environment: {
    isElectron: boolean;
    isDevelopment: boolean;
    isOnline: boolean;
  };
}

/**
 * Get current environment info
 */
function getEnvironmentInfo() {
  const isElectron =
    typeof window !== "undefined" &&
    typeof (window as any).electronAPI !== "undefined";
  const isDevelopment = import.meta.env.DEV;
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  return {
    isElectron,
    isDevelopment,
    isOnline,
  };
}

/**
 * Capture error with full context
 */
export function captureError(
  error: Error | unknown,
  context: Record<string, any> = {}
): ErrorContext {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const errorContext: ErrorContext = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    error: {
      name: error instanceof Error ? error.name : "Unknown",
      message: sanitizeErrorMessage(message),
      stack: stack ? sanitizeErrorMessage(stack) : undefined,
    },
    context: {
      ...context,
      // Sanitize all context values
      ...Object.fromEntries(
        Object.entries(context).map(([key, value]) => {
          if (typeof value === "string") {
            return [key, sanitizeErrorMessage(value)];
          }
          return [key, value];
        })
      ),
    },
    environment: getEnvironmentInfo(),
  };

  return errorContext;
}

/**
 * Log error with context to console
 */
export function logErrorWithContext(
  error: Error | unknown,
  context: Record<string, any> = {}
): ErrorContext {
  const errorContext = captureError(error, context);

  // Check if message contains sensitive data
  if (isSensitive(errorContext.error.message)) {
    console.error(
      `[ERROR] ${errorContext.error.name} at ${errorContext.timestamp}`,
      "(sensitive data filtered from log)"
    );
  } else {
    console.error(
      `[ERROR] ${errorContext.error.name}:`,
      errorContext.error.message
    );
    if (errorContext.error.stack) {
      console.error("Stack trace:", errorContext.error.stack);
    }
  }

  // Log context (remove sensitive nested objects)
  if (Object.keys(errorContext.context).length > 0) {
    console.error("[CONTEXT]", JSON.stringify(errorContext.context, null, 2));
  }

  return errorContext;
}

/**
 * Format error context for structured logging/sending to analytics
 */
export function formatErrorContextForReporting(
  errorContext: ErrorContext
): Record<string, any> {
  return {
    timestamp: errorContext.timestamp,
    errorName: errorContext.error.name,
    errorMessage: errorContext.error.message,
    hasStack: !!errorContext.error.stack,
    environment: errorContext.environment,
    context: errorContext.context,
  };
}

/**
 * Global error handler registry for capturing unhandled errors
 */
class GlobalErrorHandler {
  private listeners = new Set<(context: ErrorContext) => void>();
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    this.initialized = true;

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason;
      const context = captureError(error, {
        type: "unhandledRejection",
        userAction: "background_operation",
      });
      this.notifyListeners(context);
      console.error("[GlobalErrorHandler] Unhandled Promise rejection:", context);
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      const context = captureError(event.error, {
        type: "globalError",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      this.notifyListeners(context);
      console.error("[GlobalErrorHandler] Global error:", context);
    });
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (context: ErrorContext) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(context: ErrorContext): void {
    for (const listener of this.listeners) {
      try {
        listener(context);
      } catch (error) {
        console.error("[GlobalErrorHandler] Error in listener:", error);
      }
    }
  }
}

export const globalErrorHandler = new GlobalErrorHandler();

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandling(): void {
  globalErrorHandler.initialize();

  // Subscribe to errors for local logging
  globalErrorHandler.onError((context) => {
    // Could send to remote logging service here
    // For now, just log locally
    console.debug("[ErrorContext] Captured error", context);
  });
}

/**
 * Create a context-aware error logger for a specific component or module
 */
export function createErrorLogger(moduleName: string) {
  return (
    error: Error | unknown,
    additionalContext: Record<string, any> = {}
  ) => {
    return logErrorWithContext(error, {
      module: moduleName,
      ...additionalContext,
    });
  };
}
