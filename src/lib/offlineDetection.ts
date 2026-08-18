/**
 * Offline Detection System
 * Monitors browser connectivity and provides hooks for online/offline transitions
 */

import React, { useState, useEffect } from "react";

type OfflineListener = () => void;
type OnlineListener = () => void;

interface OfflineDetectionState {
  isOnline: boolean;
  wasOnline: boolean;
  lastOnlineTime: number;
  lastOfflineTime: number;
}

class OfflineDetectionManager {
  private state: OfflineDetectionState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    wasOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastOnlineTime: Date.now(),
    lastOfflineTime: 0,
  };

  private offlineListeners: Set<OfflineListener> = new Set();
  private onlineListeners: Set<OnlineListener> = new Set();
  private initialized = false;

  /**
   * Initialize offline detection - attach event listeners
   * Must be called once on app startup
   */
  initialize(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    this.initialized = true;

    const handleOnline = () => {
      this.state.wasOnline = this.state.isOnline;
      this.state.isOnline = true;
      this.state.lastOnlineTime = Date.now();
      console.log("[OfflineDetection] Connection restored");
      this.notifyOnline();
    };

    const handleOffline = () => {
      this.state.wasOnline = this.state.isOnline;
      this.state.isOnline = false;
      this.state.lastOfflineTime = Date.now();
      console.log("[OfflineDetection] Connection lost");
      this.notifyOffline();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  /**
   * Get current online status
   */
  isOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    return this.state.isOnline && navigator.onLine;
  }

  /**
   * Get time spent offline (ms)
   */
  getOfflineDuration(): number {
    if (this.state.isOnline) return 0;
    return Date.now() - this.state.lastOfflineTime;
  }

  /**
   * Get time spent online (ms)
   */
  getOnlineDuration(): number {
    if (!this.state.isOnline) return 0;
    return Date.now() - this.state.lastOnlineTime;
  }

  /**
   * Register callback for when connection is lost
   */
  onOffline(callback: OfflineListener): () => void {
    this.offlineListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.offlineListeners.delete(callback);
    };
  }

  /**
   * Register callback for when connection is restored
   */
  onOnline(callback: OnlineListener): () => void {
    this.onlineListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.onlineListeners.delete(callback);
    };
  }

  /**
   * Internal: notify all offline listeners
   */
  private notifyOffline(): void {
    console.log(
      `[OfflineDetection] Notifying ${this.offlineListeners.size} offline listener(s)`
    );
    for (const listener of this.offlineListeners) {
      try {
        listener();
      } catch (error) {
        console.error("[OfflineDetection] Error in offline listener:", error);
      }
    }
  }

  /**
   * Internal: notify all online listeners
   */
  private notifyOnline(): void {
    console.log(
      `[OfflineDetection] Notifying ${this.onlineListeners.size} online listener(s)`
    );
    for (const listener of this.onlineListeners) {
      try {
        listener();
      } catch (error) {
        console.error("[OfflineDetection] Error in online listener:", error);
      }
    }
  }

  /**
   * Get full state object
   */
  getState(): OfflineDetectionState {
    return { ...this.state };
  }
}

// Singleton instance
const offlineDetection = new OfflineDetectionManager();

/**
 * For use in React components - hook to monitor online/offline status
 */
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(() => offlineDetection.isOnline());

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribeOffline = offlineDetection.onOffline(() => {
      setIsOnline(false);
    });

    const unsubscribeOnline = offlineDetection.onOnline(() => {
      setIsOnline(true);
    });

    // Cleanup
    return () => {
      unsubscribeOffline();
      unsubscribeOnline();
    };
  }, []);

  return {
    isOnline,
    offlineDuration: offlineDetection.getOfflineDuration(),
    onlineDuration: offlineDetection.getOnlineDuration(),
  };
}

/**
 * For use outside React - direct subscription
 */
export const OfflineDetection = {
  /**
   * Initialize the offline detection system (call once on app startup)
   */
  initialize: () => offlineDetection.initialize(),

  /**
   * Check if currently online
   */
  isOnline: () => offlineDetection.isOnline(),

  /**
   * Register offline callback
   */
  onOffline: (callback: OfflineListener) => offlineDetection.onOffline(callback),

  /**
   * Register online callback
   */
  onOnline: (callback: OnlineListener) => offlineDetection.onOnline(callback),

  /**
   * Get current state
   */
  getState: () => offlineDetection.getState(),

  /**
   * Get offline duration in ms
   */
  getOfflineDuration: () => offlineDetection.getOfflineDuration(),

  /**
   * Get online duration in ms
   */
  getOnlineDuration: () => offlineDetection.getOnlineDuration(),
};

// Export for testing
export { OfflineDetectionManager };
