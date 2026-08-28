import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AIModel =
  | "gemini-3.5-flash"
  | "gemini-3.5-flash-lite"
  | "gemini-3-flash-preview"
  | "gemini-3.1-flash-lite"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "qwen/qwen3.6-27b"
  | "qwen/qwen3.8-27b"
  // Mistral direct API models (require a Mistral API key from platform.mistral.ai)
  | "mistral-large-2512"
  | "mistral-medium-2508"
  | "mistral-small-2506"
  | "ministral-14b-2512"
  | "ministral-8b-2512"
  | "ministral-3b-2512"
  // Legacy names kept so stored preferences still parse correctly
  | "gemini-3.5-flash-high"
  | "gemini-3.5-flash-medium"
  | "gemini-3.5-flash-low"
  | "gemini-3.1-flash-lite-preview"
  | "gemini-3.1-deep-think"
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano"
  | "o3"
  | "o4-mini"
  | "gpt-5.4"
  | "gpt-5.4-pro"
  | "gpt-5.4-mini"
  | "gpt-5.4-nano";

export type AIProvider = "gemini" | "openai" | "groq" | "mistral";

export interface APIKey {
  id: string;
  provider: AIProvider;
  key: string;
  addedAt: number;
}

export type KeywordStrategy = "single" | "multi" | "mixed";

export interface SimpleEventContext {
  enabled: boolean;
  name: string;
}

export interface MetadataSettings {
  keywordStrategy: KeywordStrategy;
  keywordCount: number;
  maxKeywordWords: number;           // max words per keyword (e.g. 2 = "blue sky" OK, "deep blue sky" trimmed)
  titleLengthMin: number;
  titleLengthMax: number;
  descriptionLengthMin: number;
  descriptionLengthMax: number;
  autoEmbed: boolean;
  batchMode: boolean;  // When ON: max parallel workers + round-robin key distribution
  negativeKeywords: string[];
  transparentBackground: boolean;
  autoRetry: boolean;
  autoCheckUpdates: boolean;
  customPromptEnabled: boolean;
  customPrompt: string;
  greenScreenVideos: boolean;
}

const defaultSettings: MetadataSettings = {
  keywordStrategy: "mixed",
  keywordCount: 50,
  maxKeywordWords: 2,
  titleLengthMin: 185,
  titleLengthMax: 195,
  descriptionLengthMin: 200,
  descriptionLengthMax: 250,
  autoEmbed: false,
  batchMode: false,
  negativeKeywords: [],
  transparentBackground: false,
  autoRetry: false,
  autoCheckUpdates: true,
  customPromptEnabled: false,
  customPrompt: "",
  greenScreenVideos: false,
};

interface SettingsContextType {
  apiKeys: APIKey[];
  activeApiKeys: APIKey[];          // apiKeys with disabled ones filtered out
  disabledKeyIds: string[];         // IDs of keys the user has un-checked
  toggleKeyEnabled: (id: string) => void;
  addApiKey: (provider: AIProvider, key: string) => void;
  removeApiKey: (id: string) => void;
  clearAllKeys: () => void;

  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;

  metadataSettings: MetadataSettings;
  updateMetadataSettings: (settings: Partial<MetadataSettings>) => void;

  // Negative keywords
  addNegativeKeyword: (keyword: string) => void;
  removeNegativeKeyword: (keyword: string) => void;
  clearNegativeKeywords: () => void;

  // Event Context (for event-specific metadata generation)
  eventEnabled: boolean;
  setEventEnabled: (enabled: boolean) => void;
  eventName: string;
  setEventName: (name: string) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


// ── API key storage helpers ───────────────────────────────────────────────
// In Electron: Use safeStorage for encryption (secure)
// In Web: Use base64 obfuscation (defense-in-depth only)
async function encryptKeys(keys: APIKey[]): Promise<string> {
  try {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.encryptApiKeys) {
      // Electron - use safeStorage encryption
      return await electronAPI.encryptApiKeys(JSON.stringify(keys));
    }
  } catch (error) {
    console.warn("Failed to encrypt keys with Electron:", error);
  }
  
  // Fallback: Web - use base64 obfuscation
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(keys))));
  } catch {
    return JSON.stringify(keys);
  }
}

async function decryptKeys(raw: string): Promise<APIKey[]> {
  try {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.decryptApiKeys) {
      // Electron - try safeStorage decryption first (new format)
      try {
        return await electronAPI.decryptApiKeys(raw);
      } catch (legacyError) {
        console.warn("Failed to decrypt with safeStorage, trying legacy format:", legacyError);
      }
    }
  } catch (error) {
    console.warn("Electron API not available:", error);
  }
  
  // Fallback: Try base64 decode (legacy format)
  try {
    const decoded = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(decoded);
  } catch {
    // Last fallback: plain JSON
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    const saved = localStorage.getItem("tagyfy_api_keys");
    // Note: Async decryption is handled in useEffect below
    return saved && typeof saved === "string"
      ? (() => {
        try {
          const decoded = decodeURIComponent(escape(atob(saved)));
          return JSON.parse(decoded);
        } catch {
          try {
            return JSON.parse(saved);
          } catch {
            return [];
          }
        }
        })()
      : [];
  });

  // Async load encrypted keys on mount
  useEffect(() => {
    async function loadEncryptedKeys() {
      const saved = localStorage.getItem("tagyfy_api_keys");
      if (saved) {
        try {
          const decrypted = await decryptKeys(saved);
          setApiKeys(decrypted);
        } catch (error) {
          console.error("Failed to decrypt API keys:", error);
        }
      }
    }
    loadEncryptedKeys();
  }, []);

  // ── Per-key enable/disable ─────────────────────────────────────────────────
  // Stores IDs of keys the user has UN-checked. Checked (enabled) is the default.
  // Only disabled IDs are stored so new keys are automatically enabled without
  // any migration needed.
  const [disabledKeyIds, setDisabledKeyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tagyfy_disabled_key_ids");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Derived: keys that are currently active (not disabled by the user)
  const activeApiKeys = apiKeys.filter((k) => !disabledKeyIds.includes(k.id));

  const toggleKeyEnabled = (id: string) => {
    setDisabledKeyIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)   // was disabled → enable it
        : [...prev, id];                  // was enabled   → disable it
      localStorage.setItem("tagyfy_disabled_key_ids", JSON.stringify(next));
      return next;
    });
  };

  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    const saved = localStorage.getItem("tagyfy_selected_model");
    if (!saved || saved === "auto") return "qwen/qwen3.6-27b";
    // Migrate stale model names (e.g. "llama3-70b-8192" -> "meta-llama/llama-4-scout-17b-16e-instruct")
    // so the UI shows the correct button selected after an app update.
    const migrations: Record<string, AIModel> = {
      // ── Legacy Gemini names
      "gemini-1.5-flash":               "gemini-3-flash-preview",
      "gemini-1.5-pro":                 "gemini-3-pro-preview",
      "gemini-2.0-flash":               "gemini-3-flash-preview",
      // ── Legacy internal names
      "gemini-3.5-flash-high":          "gemini-3.5-flash",
      "gemini-3.5-flash-medium":        "gemini-3.5-flash",
      "gemini-3.5-flash-low":           "gemini-3.5-flash",
      "gemini-3.1-flash-lite-preview":  "gemini-2.5-flash-lite",
      "gemini-3.1-deep-think":          "gemini-3-pro-preview",
      // ── Invented GPT-5.4 / GPT-4.1 / o3 / o4-mini → real gpt-4o names ───
      "gpt-5.4":       "gpt-4o",
      "gpt-5.4-pro":   "gpt-4o",
      "gpt-5.4-mini":  "gpt-4o-mini",
      "gpt-5.4-nano":  "gpt-4o-mini",
      "gpt-4.1":       "gpt-4o",
      "gpt-4.1-mini":  "gpt-4o-mini",
      "gpt-4.1-nano":  "gpt-4o-mini",
      "o3":            "gpt-4o",
      "o4-mini":       "gpt-4o-mini",
      // ── Legacy Llama ─────────────────────────────────────────────────────
      "llama3-70b-8192":  "qwen/qwen3.6-27b",
      "llama3-8b-8192":   "qwen/qwen3.6-27b",
      "llama-4-scout":    "qwen/qwen3.6-27b",
      "meta-llama/llama-4-maverick": "qwen/qwen3.6-27b",
      "meta-llama/llama-4-scout-17b-16e-instruct": "qwen/qwen3.6-27b",
      "meta-llama/llama-prompt-guard-2-86m": "qwen/qwen3.6-27b",
      "meta-llama/llama-prompt-guard-2-22m": "qwen/qwen3.6-27b",
      "openai/gpt-oss-20b": "qwen/qwen3.6-27b",
      "auto": "qwen/qwen3.6-27b",
    };
    return (migrations[saved] || saved) as AIModel;
  });

  const [metadataSettings, setMetadataSettings] = useState<MetadataSettings>(() => {
    const saved = localStorage.getItem("tagyfy_metadata_settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Event Context — simple enabled flag and event name
  const [eventEnabled, setEventEnabledState] = useState(() => {
    return localStorage.getItem("tagyfy_event_enabled") === "true";
  });
  const setEventEnabled = (enabled: boolean) => {
    setEventEnabledState(enabled);
    localStorage.setItem("tagyfy_event_enabled", String(enabled));
  };

  const [eventName, setEventNameState] = useState(() => {
    return localStorage.getItem("tagyfy_event_name") || "";
  });
  const setEventName = (name: string) => {
    setEventNameState(name);
    localStorage.setItem("tagyfy_event_name", name);
  };

  // Persist to localStorage
  useEffect(() => {
    async function persistKeys() {
      const encrypted = await encryptKeys(apiKeys);
      localStorage.setItem("tagyfy_api_keys", encrypted);
    }
    persistKeys();
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem("tagyfy_metadata_settings", JSON.stringify(metadataSettings));
  }, [metadataSettings]);

  useEffect(() => {
    localStorage.setItem("tagyfy_selected_model", selectedModel);
  }, [selectedModel]);

  const addApiKey = (provider: AIProvider, key: string) => {
    const newKey: APIKey = {
      id: crypto.randomUUID(),
      provider,
      key,
      addedAt: Date.now(),
    };
    setApiKeys((prev) => [...prev, newKey]);
  };

  const removeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    // Also remove from disabled list so no stale IDs linger
    setDisabledKeyIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem("tagyfy_disabled_key_ids", JSON.stringify(next));
      return next;
    });
  };

  const clearAllKeys = () => {
    setApiKeys([]);
    setDisabledKeyIds([]);
    localStorage.removeItem("tagyfy_disabled_key_ids");
  };

  const updateMetadataSettings = (settings: Partial<MetadataSettings>) => {
    setMetadataSettings((prev) => ({ ...prev, ...settings }));
  };



  const addNegativeKeyword = (keyword: string) => {
    if (keyword.trim() && !metadataSettings.negativeKeywords.includes(keyword.trim())) {
      updateMetadataSettings({
        negativeKeywords: [...metadataSettings.negativeKeywords, keyword.trim()],
      });
    }
  };

  const removeNegativeKeyword = (keyword: string) => {
    updateMetadataSettings({
      negativeKeywords: metadataSettings.negativeKeywords.filter((k) => k !== keyword),
    });
  };

  const clearNegativeKeywords = () => {
    updateMetadataSettings({ negativeKeywords: [] });
  };

  return (
    <SettingsContext.Provider
      value={{
        apiKeys,
        activeApiKeys,
        disabledKeyIds,
        toggleKeyEnabled,
        addApiKey,
        removeApiKey,
        clearAllKeys,
        metadataSettings,
        updateMetadataSettings,
        selectedModel,
        setSelectedModel,
        addNegativeKeyword,
        removeNegativeKeyword,
        clearNegativeKeywords,
        eventEnabled,
        setEventEnabled,
        eventName,
        setEventName,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
