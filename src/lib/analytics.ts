/**
 * Analytics Tracking Utility
 *
 * Simple event tracking system for key user interactions.
 * Tracks: page views, CTAs, form submissions, button clicks, feature usage
 *
 * Usage:
 * ```tsx
 * import { analytics } from '@/lib/analytics';
 *
 * // Track page view
 * analytics.trackPageView('/pricing');
 *
 * // Track click
 * analytics.trackClick('download-button', 'hero-section');
 *
 * // Track form submission
 * analytics.trackFormSubmit('contact-form', { email: 'user@example.com' });
 * ```
 *
 * Integration points:
 * - Google Analytics: Uncomment ga() calls
 * - Mixpanel: Uncomment mixpanel.track()
 * - Custom backend: Update sendEvent() function
 */

export type EventTypeType = 
  | 'pageview'
  | 'click'
  | 'form_submit'
  | 'cta_click'
  | 'feature_usage'
  | 'error'
  | 'custom';

export interface AnalyticsEvent {
  type: EventTypeType;
  name: string;
  section?: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Send event to tracking service
 * Extend this function to integrate with your analytics provider
 */
async function sendEvent(event: AnalyticsEvent): Promise<void> {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.type, event.name, event.properties);
  }

  // Uncomment to integrate with Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', event.name, {
  //     event_category: event.type,
  //     event_label: event.section,
  //     ...event.properties,
  //   });
  // }

  // Uncomment to integrate with Mixpanel
  // if (window.mixpanel) {
  //   window.mixpanel.track(event.name, {
  //     type: event.type,
  //     section: event.section,
  //     ...event.properties,
  //   });
  // }

  // Example: send to custom backend
  // try {
  //   await fetch('/api/analytics', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(event),
  //   });
  // } catch (error) {
  //   console.error('[Analytics] Failed to send event:', error);
  // }
}

/**
 * Create analytics event object
 */
function createEvent(
  type: EventTypeType,
  name: string,
  section?: string,
  properties?: Record<string, unknown>
): AnalyticsEvent {
  return {
    type,
    name,
    section,
    properties,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.pathname : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
}

/**
 * Analytics object with tracking methods
 */
export const analytics = {
  /**
   * Track page view
   * @param path - Page path (e.g., '/pricing', '/features')
   */
  trackPageView(path: string): void {
    const event = createEvent('pageview', `view_${path.replace(/\//g, '_')}`);
    sendEvent(event);
  },

  /**
   * Track button/link click
   * @param buttonName - Button identifier (e.g., 'download-btn', 'signup-cta')
   * @param section - Section name where button is located (optional)
   */
  trackClick(buttonName: string, section?: string): void {
    const event = createEvent('click', buttonName, section);
    sendEvent(event);
  },

  /**
   * Track CTA click (high-priority conversion action)
   * @param ctaName - CTA identifier (e.g., 'download', 'get-started')
   * @param section - Section where CTA is located (optional)
   * @param metadata - Additional metadata (optional)
   */
  trackCTAClick(
    ctaName: string,
    section?: string,
    metadata?: Record<string, unknown>
  ): void {
    const event = createEvent('cta_click', ctaName, section, metadata);
    sendEvent(event);
  },

  /**
   * Track form submission
   * @param formName - Form identifier (e.g., 'contact', 'email-signup')
   * @param metadata - Form data to track (optional, avoid PII)
   */
  trackFormSubmit(
    formName: string,
    metadata?: Record<string, unknown>
  ): void {
    const event = createEvent('form_submit', formName, undefined, metadata);
    sendEvent(event);
  },

  /**
   * Track feature usage
   * @param featureName - Feature identifier (e.g., 'dark-mode-toggle', 'faq-search')
   * @param metadata - Additional context (optional)
   */
  trackFeatureUsage(
    featureName: string,
    metadata?: Record<string, unknown>
  ): void {
    const event = createEvent('feature_usage', featureName, undefined, metadata);
    sendEvent(event);
  },

  /**
   * Track errors
   * @param errorName - Error identifier
   * @param errorMessage - Error message or description
   */
  trackError(errorName: string, errorMessage?: string): void {
    const event = createEvent('error', errorName, undefined, { message: errorMessage });
    sendEvent(event);
  },

  /**
   * Track custom events
   * @param eventName - Custom event name
   * @param section - Section name (optional)
   * @param properties - Custom properties
   */
  trackCustom(
    eventName: string,
    section?: string,
    properties?: Record<string, unknown>
  ): void {
    const event = createEvent('custom', eventName, section, properties);
    sendEvent(event);
  },

  /**
   * Track scroll depth (utility for tracking user engagement)
   * @returns Cleanup function to remove listener
   */
  trackScrollDepth(): () => void {
    let hasTracked = false;

    const handleScroll = () => {
      if (!hasTracked) {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        if (scrollPercentage > 50) {
          analytics.trackFeatureUsage('scroll-engagement', { depth: scrollPercentage });
          hasTracked = true;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  },

  /**
   * Track time on page
   * @returns Cleanup function
   */
  trackTimeOnPage(): () => void {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      analytics.trackFeatureUsage('time-on-page', {
        seconds: timeSpent,
        path: window.location.pathname,
      });
    };
  },
};

/**
 * Initialize analytics (call once on app startup)
 */
export function initializeAnalytics(): void {
  // Track initial page view
  analytics.trackPageView(window.location.pathname);

  // Optional: Track page changes
  if (typeof window !== 'undefined') {
    let previousPath = window.location.pathname;

    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== previousPath) {
        analytics.trackPageView(currentPath);
        previousPath = currentPath;
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
    });
  }
}

