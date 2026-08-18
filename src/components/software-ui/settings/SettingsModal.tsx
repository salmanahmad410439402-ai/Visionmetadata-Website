import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  Key,
  X,
  Image,
  CloudUpload,
  Settings,
  CheckCircle2,
  Loader2,
  Upload,
  ChevronDown,
  ChevronRight,
  Info
} from "lucide-react";
import {
  useSettings,
  AIProvider,
  AIModel,
  KeywordStrategy
} from "@/contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsValidator } from "@/lib/settingsValidator";
import { EventContextToggle } from "./EventContextToggle";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firstRunSetupProps?: {
    onSkip: () => void;
  };
}

const AI_MODELS: { value: AIModel; label: string; provider: AIProvider }[] = [
  // ── Gemini ────────────────────────────────────────────────────────────────
  { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash", provider: "gemini" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash", provider: "gemini" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", provider: "gemini" },
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", provider: "gemini" },
  { value: "gemini-3-pro-preview",   label: "Gemini 3 Pro",   provider: "gemini" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "gemini" },
  // ── OpenAI ────────────────────────────────────────────────────────────────
  { value: "gpt-4o",      label: "GPT-4o",      provider: "openai" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  // ── Groq ──────────────────────────────────────────────────────────────────
  { value: "meta-llama/llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout", provider: "groq" },
  // ── Mistral direct API models (require a key from platform.mistral.ai) ──
  { value: "mistral-large-2512",  label: "Mistral Large 3",    provider: "mistral" },
  { value: "mistral-medium-2508", label: "Mistral Medium 3.1", provider: "mistral" },
  { value: "mistral-small-2506",  label: "Mistral Small 3.2",  provider: "mistral" },
  { value: "ministral-14b-2512",  label: "Ministral 14B",      provider: "mistral" },
  { value: "ministral-8b-2512",   label: "Ministral 8B",       provider: "mistral" },
  { value: "ministral-3b-2512",   label: "Ministral 3B",       provider: "mistral" },
];

const PROVIDER_COLORS: Record<AIProvider, string> = {
  gemini:      "bg-blue-500/20 text-blue-400 border-blue-500/30",
  openai:      "bg-green-500/20 text-green-400 border-green-500/30",
  groq:        "bg-purple-500/20 text-purple-400 border-purple-500/30",
  mistral:     "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

// Best default model for each provider — used by Auto mode when a key is added.
// Matches getOptimalModel() in ai/config.ts for non-video assets.
const AUTO_MODEL_FOR_PROVIDER: Record<string, AIModel> = {
  gemini:      "gemini-3-flash-preview",
  openai:      "gpt-4o-mini",
  groq:        "meta-llama/llama-4-scout-17b-16e-instruct",
  mistral:     "mistral-large-2512",
};

// Human-readable labels for the auto-selected model toast message
const AUTO_MODEL_LABELS: Record<string, string> = {
  "gemini-3.5-flash":                              "Gemini 3.5 Flash",
  "gemini-3-flash-preview":                        "Gemini 3 Flash",
  "gemini-2.5-flash":                              "Gemini 2.5 Flash",
  "gemini-2.5-flash-lite":                         "Gemini 2.5 Flash-Lite",
  "gemini-3.1-pro-preview":                        "Gemini 3.1 Pro",
  "gemini-3-pro-preview":                          "Gemini 3 Pro",
  "gemini-2.5-pro":                                "Gemini 2.5 Pro",
  "gpt-4o":                                        "GPT-4o",
  "gpt-4o-mini":                                   "GPT-4o Mini",
  "meta-llama/llama-4-scout-17b-16e-instruct":     "Llama 4 Scout",
  "mistral-large-2512":                            "Mistral Large 3",
};

export const SettingsModal = ({ open, onOpenChange, firstRunSetupProps }: SettingsModalProps) => {
  const {
    apiKeys,
    disabledKeyIds,
    toggleKeyEnabled,
    addApiKey,
    removeApiKey,
    clearAllKeys,
    metadataSettings,
    updateMetadataSettings,
    addNegativeKeyword,
    removeNegativeKeyword,
    clearNegativeKeywords,
    eventEnabled,
    setEventEnabled,
    eventName,
    setEventName,
    selectedModel,
    setSelectedModel,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<"ai_providers" | "advanced_options">("ai_providers");
  const [isKeyListExpanded, setIsKeyListExpanded] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [showKey, setShowKey] = useState<string | null>(null);

  const [newNegativeKeyword, setNewNegativeKeyword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const negativeInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // ── Mistral submenu data ──────────────────────────────────────────────────
  const MISTRAL_MODELS: { value: AIModel; label: string; quality: string; badge: string }[] = [
    { value: "mistral-large-2512",  label: "Mistral Large 3",    quality: "Best quality",   badge: "text-emerald-400" },
    { value: "mistral-medium-2508", label: "Mistral Medium 3.1", quality: "Better quality", badge: "text-blue-400"    },
    { value: "mistral-small-2506",  label: "Mistral Small 3.2",  quality: "Good quality",   badge: "text-amber-400"   },
    { value: "ministral-14b-2512",  label: "Ministral 14B",      quality: "Good quality",   badge: "text-amber-400"   },
    { value: "ministral-8b-2512",   label: "Ministral 8B",       quality: "Fair quality",   badge: "text-orange-400"  },
    { value: "ministral-3b-2512",   label: "Ministral 3B",       quality: "Basic quality",  badge: "text-red-400"     },
  ];

  // ── Custom model dropdown state ───────────────────────────────────────────
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    if (isModelMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelMenuOpen]);



  function getModelDisplayLabel(): string {
    // Gemini
    if (selectedModel === "gemini-3.5-flash") return "Gemini · 3.5 Flash";
    if (selectedModel === "gemini-3-flash-preview") return "Gemini · 3 Flash";
    if (selectedModel === "gemini-2.5-flash") return "Gemini · 2.5 Flash";
    if (selectedModel === "gemini-2.5-flash-lite") return "Gemini · 2.5 Flash-Lite";
    if (selectedModel === "gemini-3.1-pro-preview") return "Gemini · 3.1 Pro";
    if (selectedModel === "gemini-3-pro-preview")   return "Gemini · 3 Pro";
    if (selectedModel === "gemini-2.5-pro") return "Gemini · 2.5 Pro";
    // ChatGPT / OpenAI
    if (selectedModel === "gpt-4o")      return "ChatGPT · GPT-4o";
    if (selectedModel === "gpt-4o-mini") return "ChatGPT · GPT-4o Mini";
    // Llama 4 Scout
    if (selectedModel === "meta-llama/llama-4-scout-17b-16e-instruct") return "Llama 4 Scout";
    // Mistral
    const mistralMatch = MISTRAL_MODELS.find(m => m.value === selectedModel);
    if (mistralMatch) return `Mistral · ${mistralMatch.label}`;
    return selectedModel;
  }

  const handleAddKey = () => {
    if (!newApiKey.trim()) return;
    const key = newApiKey.trim();
    // Auto-detect provider from key format — same logic as bulk import.
    // No dropdown needed: AIzaSy/AIza = Gemini, sk- = OpenAI, gsk_ = Groq.
    const provider = detectProvider(key);
    const isDuplicate = apiKeys.some(k => k.key === key);
    if (isDuplicate) {
      toast.error("This API key is already added.");
      return;
    }
    addApiKey(provider, key);
    setNewApiKey("");

    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} key added`);
  };

  /** Detect provider from API key format — no manual selection needed */
  function detectProvider(key: string): "gemini" | "openai" | "groq" | "mistral" | null {
    const k = key.trim();
    if (!k) return null;
    if (k.startsWith("AIzaSy") || k.startsWith("AIza") || k.startsWith("AQ.")) return "gemini";
    if (k.startsWith("sk-"))     return "openai";
    if (k.startsWith("gsk_"))    return "groq";
    return "mistral";
  }

  const handleImportKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/);

      let imported = 0;
      let skipped = 0;
      const providerCounts: Record<string, number> = {};

      for (const raw of lines) {
        const key = raw.trim();
        // Skip empty lines and comment lines starting with #
        if (!key || key.startsWith("#")) continue;

        const provider = detectProvider(key);
        if (!provider) {
          skipped++;
          continue;
        }

        // Skip duplicates already in the list
        const isDuplicate = apiKeys.some(k => k.key === key);
        if (isDuplicate) {
          skipped++;
          continue;
        }

        addApiKey(provider, key);
        imported++;
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      }

      // Reset file input so same file can be re-imported after clearing
      e.target.value = "";

      if (imported === 0) {
        toast.error(
          skipped > 0
            ? `No valid keys found. ${skipped} line(s) were unrecognised or duplicates.`
            : "File is empty or contains no valid API keys."
        );
        return;
      }

      const summary = Object.entries(providerCounts)
        .map(([p, n]) => `${n} ${p}`)
        .join(", ");

      toast.success(`Imported ${imported} key${imported > 1 ? "s" : ""}`, {
        description: `${summary}${skipped > 0 ? ` · ${skipped} skipped` : ""}`,
        duration: 4000,
      });
    };

    reader.readAsText(file);
  };

  const handleAddNegativeKeyword = () => {
    if (newNegativeKeyword.trim()) {
      addNegativeKeyword(newNegativeKeyword.trim());
      setNewNegativeKeyword("");
      negativeInputRef.current?.focus();
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  // Validation handlers
  const handleKeywordCountChange = (count: number) => {
    const error = SettingsValidator.validateKeywordCount(count);
    if (error) {
      setValidationErrors(prev => ({ ...prev, keywordCount: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.keywordCount;
        return newErrors;
      });
      updateMetadataSettings({ keywordCount: count });
    }
  };

  const handleNegativeKeywordAdd = () => {
    const error = SettingsValidator.validateNegativeKeyword(newNegativeKeyword);
    if (error) {
      setValidationErrors(prev => ({ ...prev, negativeKeyword: error }));
      toast.error(error);
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.negativeKeyword;
        return newErrors;
      });
      addNegativeKeyword(newNegativeKeyword.trim());
      setNewNegativeKeyword("");
      negativeInputRef.current?.focus();
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] overflow-hidden flex bg-popover border-border p-0 gap-0">
        
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-muted/20 border-r border-border flex flex-col h-full shrink-0">
          <div className="p-6 pb-4 border-b border-border/50">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Settings
            </DialogTitle>
            <DialogDescription className="sr-only">
              Configure API keys and metadata generation settings
            </DialogDescription>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <button
              onClick={() => setActiveTab("ai_providers")}
              className={`w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-3 ${activeTab === "ai_providers" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              <span className="text-lg">🤖</span>
              AI & Providers
            </button>
            
            <button
              onClick={() => setActiveTab("advanced_options")}
              className={`w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-3 ${activeTab === "advanced_options" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              <span className="text-lg">⚙️</span>
              Additional Options
            </button>
          </div>
          
          {firstRunSetupProps && (
            <div className="p-4 border-t border-border/50">
              <Button 
                variant="outline" 
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
                onClick={firstRunSetupProps.onSkip}
              >
                <X className="w-4 h-4" />
                Maybe Later
              </Button>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "ai_providers" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-1">AI & Providers</h2>
                  <p className="text-sm text-muted-foreground">Manage your API keys and select the active AI model.</p>
                </div>

              {/* API Keys Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  API Keys
                </h3>

                {/* Key Input — provider auto-detected from key format */}
                {/* Model dropdown sits here (position B) — same row as the key input */}
                <div className="flex gap-2">
                  {/* ── Custom model selector ── */}
                  <div ref={modelMenuRef} className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsModelMenuOpen(v => !v)}
                      className="h-10 min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm text-left flex items-center justify-between gap-2 hover:bg-accent/40 transition-colors cursor-pointer"
                    >
                      <span className="truncate max-w-[160px]">{getModelDisplayLabel()}</span>
                      <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                    </button>

                    {isModelMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 z-50 min-w-[230px] bg-popover border border-border rounded-md shadow-lg py-1">
                        {/* Direct API Models */}
                        <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border mt-1">
                          Direct API Models
                        </div>

                        {/* Gemini — hover submenu */}
                        <div className="relative group/gemini">
                          <button
                            className={`w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center justify-between ${["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-pro-preview", "gemini-3-pro-preview", "gemini-2.5-pro"].includes(selectedModel) ? "bg-accent/60" : ""}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                              <span>
                                Gemini
                                {selectedModel === "gemini-3.5-flash" && (
                                  <span className="ml-1.5 text-[10px] text-purple-300">· 3.5 Flash</span>
                                )}
                                {selectedModel === "gemini-3-flash-preview" && (
                                  <span className="ml-1.5 text-[10px] text-emerald-300">· 3 Flash</span>
                                )}
                                {selectedModel === "gemini-2.5-flash" && (
                                  <span className="ml-1.5 text-[10px] text-blue-300">· 2.5 Flash</span>
                                )}
                                {selectedModel === "gemini-2.5-flash-lite" && (
                                  <span className="ml-1.5 text-[10px] text-emerald-300">· 2.5 Flash-Lite</span>
                                )}
                                {selectedModel === "gemini-3.1-pro-preview" && (
                                  <span className="ml-1.5 text-[10px] text-purple-300">· 3.1 Pro</span>
                                )}
                                {selectedModel === "gemini-3-pro-preview" && (
                                  <span className="ml-1.5 text-[10px] text-blue-300">· 3 Pro</span>
                                )}
                                {selectedModel === "gemini-2.5-pro" && (
                                  <span className="ml-1.5 text-[10px] text-blue-300">· 2.5 Pro</span>
                                )}
                              </span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                          </button>
                          <div className="hidden group-hover/gemini:block absolute left-full top-0 ml-1 min-w-[250px] bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                              Select model · gemini key
                            </div>
                            {([
                              { value: "gemini-3.5-flash" as AIModel, label: "Gemini 3.5 Flash", quality: "Latest & fastest", badge: "text-purple-400" },
                              { value: "gemini-3-flash-preview" as AIModel, label: "Gemini 3 Flash", quality: "Fast & frontier", badge: "text-emerald-400" },
                              { value: "gemini-2.5-flash" as AIModel, label: "Gemini 2.5 Flash", quality: "Stable & reliable", badge: "text-blue-400" },
                              { value: "gemini-2.5-flash-lite" as AIModel, label: "Gemini 2.5 Flash-Lite", quality: "Budget-friendly",  badge: "text-emerald-400" },
                              { value: "gemini-3.1-pro-preview" as AIModel, label: "Gemini 3.1 Pro (PAID)", quality: "Best quality", badge: "text-purple-400" },
                              { value: "gemini-3-pro-preview"   as AIModel, label: "Gemini 3 Pro (PAID)",   quality: "Advanced reasoning",      badge: "text-blue-400"    },
                              { value: "gemini-2.5-pro"   as AIModel, label: "Gemini 2.5 Pro (PAID)",   quality: "Complex reasoning",      badge: "text-blue-400"    },
                            ]).map(m => (
                              <button
                                key={m.value}
                                onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center justify-between ${selectedModel === m.value ? "bg-accent" : ""}`}
                              >
                                <span className="font-medium">{m.label}</span>
                                <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ChatGPT / OpenAI — hover submenu */}
                        <div className="relative group/chatgpt">
                          <button
                            className={`w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center justify-between ${["gpt-4o", "gpt-4o-mini"].includes(selectedModel) ? "bg-accent/60" : ""}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                              <span>
                                ChatGPT
                                {selectedModel === "gpt-4o" && (
                                  <span className="ml-1.5 text-[10px] text-emerald-300">· GPT-4o</span>
                                )}
                                {selectedModel === "gpt-4o-mini" && (
                                  <span className="ml-1.5 text-[10px] text-green-300">· GPT-4o Mini</span>
                                )}
                              </span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                          </button>
                          <div className="hidden group-hover/chatgpt:block absolute left-full top-0 ml-1 min-w-[260px] bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                              Select model · openai key
                            </div>
                            {([
                              { value: "gpt-4o"      as AIModel, label: "GPT-4o",      quality: "Best quality",  badge: "text-emerald-400" },
                              { value: "gpt-4o-mini" as AIModel, label: "GPT-4o Mini", quality: "Fast · cheaper", badge: "text-green-400"   },
                            ]).map(m => (
                              <button
                                key={m.value}
                                onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center justify-between ${selectedModel === m.value ? "bg-accent" : ""}`}
                              >
                                <span className="font-medium">{m.label}</span>
                                <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mistral — hover submenu */}
                        <div className="relative group/mistral">
                          <button
                            className={`w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center justify-between ${MISTRAL_MODELS.some(m => m.value === selectedModel) ? "bg-accent/60" : ""}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                              <span>
                                Mistral
                                {MISTRAL_MODELS.some(m => m.value === selectedModel) && (
                                  <span className="ml-1.5 text-[10px] text-rose-300">· {MISTRAL_MODELS.find(m => m.value === selectedModel)?.label}</span>
                                )}
                              </span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                          </button>
                          <div className="hidden group-hover/mistral:block absolute left-full top-0 ml-1 min-w-[260px] bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                              Select model · mistral key
                            </div>
                            {MISTRAL_MODELS.map(m => (
                              <button
                                key={m.value}
                                onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center justify-between ${selectedModel === m.value ? "bg-accent" : ""}`}
                              >
                                <span className="font-medium">{m.label}</span>
                                <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Llama 4 Scout — flat single entry */}
                        <button
                          onClick={() => { setSelectedModel("meta-llama/llama-4-scout-17b-16e-instruct"); setIsModelMenuOpen(false); }}
                          className={`w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center justify-between ${selectedModel === "meta-llama/llama-4-scout-17b-16e-instruct" ? "bg-accent" : ""}`}
                        >
                          <span>Llama 4 Scout</span>
                          <span className="text-[10px] text-muted-foreground font-mono">[groq key]</span>
                        </button>

                      </div>
                    )
                  }
                  </div>
                  {/* Key input */}
                  <Input
                    type="password"
                    placeholder="Paste API Key (provider auto-detected)..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddKey()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddKey} className="gap-1 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={() => importFileRef.current?.click()}
                    title="Bulk import Gemini, OpenAI, Groq keys from a .txt file (one key per line)"
                  >
                    <Upload className="w-4 h-4" />
                    Import .txt
                  </Button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={handleImportKeys}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground -mt-2">
                  Provider is auto-detected from key format —
                  <span className="font-mono"> AIzaSy…</span> = Gemini,
                  <span className="font-mono"> sk-…</span> = OpenAI,
                  <span className="font-mono"> gsk_…</span> = Groq.
                  Other keys will be detected as Mistral/OpenRouter automatically.
                </p>

                {/* Collapsible key list: show 2, fade + expand */}
                <AnimatePresence>
                  {apiKeys.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {/* Show first 2 (or all if expanded / ≤3 keys) */}
                      {(isKeyListExpanded || apiKeys.length <= 3 ? apiKeys : apiKeys.slice(0, 2)).map((apiKey) => {
                        const isEnabled = !disabledKeyIds.includes(apiKey.id);
                        return (
                          <motion.div
                            key={apiKey.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-opacity ${
                              isEnabled
                                ? "bg-muted/50 border-border"
                                : "bg-muted/20 border-border/40 opacity-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={PROVIDER_COLORS[apiKey.provider]}
                              >
                                {apiKey.provider}
                              </Badge>
                              <span className="text-sm font-mono text-muted-foreground">
                                {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center gap-1.5 cursor-pointer select-none"
                                onClick={() => toggleKeyEnabled(apiKey.id)}
                                title={isEnabled ? "Key is active — click to disable" : "Key is disabled — click to enable"}
                              >
                                <Checkbox
                                  checked={isEnabled}
                                  onCheckedChange={() => toggleKeyEnabled(apiKey.id)}
                                  className={`h-4 w-4 transition-colors ${
                                    isEnabled
                                      ? "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                      : ""
                                  }`}
                                />
                                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                  {isEnabled ? "Active" : "Skipped"}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                              >
                                {showKey === apiKey.id ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeApiKey(apiKey.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Gradient fade + expand button when collapsed and >3 keys */}
                      {!isKeyListExpanded && apiKeys.length > 3 && (
                        <div className="relative">
                          <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-popover to-transparent pointer-events-none" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => setIsKeyListExpanded(true)}
                          >
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show all {apiKeys.length} keys
                          </Button>
                        </div>
                      )}

                      {/* Collapse button when expanded and >3 keys */}
                      {isKeyListExpanded && apiKeys.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={() => setIsKeyListExpanded(false)}
                        >
                          Collapse
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={clearAllKeys}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Clear All Keys
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
              <section className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Metadata Rules
                </h3>
                {/* Keyword Strategy */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-muted-foreground">Keyword Strategy</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="maxKeywordWords"
                        checked={metadataSettings.maxKeywordWords <= 2}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ maxKeywordWords: checked ? 2 : 99 })
                        }
                      />
                      <label htmlFor="maxKeywordWords" className="text-[11px] text-muted-foreground cursor-pointer">
                        Max 2 words per keyword
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["single", "multi", "mixed"] as KeywordStrategy[]).map((strategy) => (
                      <Button
                        key={strategy}
                        variant={metadataSettings.keywordStrategy === strategy ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateMetadataSettings({ keywordStrategy: strategy })}
                        className="capitalize"
                      >
                        {strategy === "single" ? "Single-Word" : strategy === "multi" ? "Multi-Word" : "Mixed"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Keyword Count */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">Keyword Count</Label>
                    <span className="text-sm font-medium">{metadataSettings.keywordCount} tags</span>
                  </div>
                  <Slider
                    value={[metadataSettings.keywordCount]}
                    onValueChange={([v]) => handleKeywordCountChange(v)}
                    min={5}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  {validationErrors.keywordCount && (
                    <div className="flex items-center gap-2 text-destructive text-xs mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.keywordCount}
                    </div>
                  )}
                </div>

                {/* Title Length */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">Title Length (characters)</Label>
                    <span className="text-sm font-medium">
                      {metadataSettings.titleLengthMin} - {metadataSettings.titleLengthMax}
                    </span>
                  </div>
                  <Slider
                    value={[metadataSettings.titleLengthMin, metadataSettings.titleLengthMax]}
                    onValueChange={([min, max]) =>
                      updateMetadataSettings({ titleLengthMin: min, titleLengthMax: max })
                    }
                    min={10}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Description Length */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-muted-foreground">Description Length (characters)</Label>
                    <span className="text-sm font-medium">
                      {metadataSettings.descriptionLengthMin} - {metadataSettings.descriptionLengthMax}
                    </span>
                  </div>
                  <Slider
                    value={[metadataSettings.descriptionLengthMin, metadataSettings.descriptionLengthMax]}
                    onValueChange={([min, max]) =>
                      updateMetadataSettings({ descriptionLengthMin: min, descriptionLengthMax: max })
                    }
                    min={50}
                    max={450}
                    step={10}
                    className="w-full"
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === "advanced_options" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-1">Advanced Options</h2>
                <p className="text-sm text-muted-foreground">Configure events, negative keywords, and other advanced settings.</p>
              </div>

              {/* Event/Series Context Toggle */}
              <EventContextToggle
                eventEnabled={eventEnabled}
                setEventEnabled={setEventEnabled}
                eventName={eventName}
                setEventName={setEventName}
              />

              {/* Negative Keywords Section */}
              <section className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Negative Keywords (AI will avoid these)
                </h3>

                <div className="flex gap-2">
                  <Input
                    ref={negativeInputRef}
                    value={newNegativeKeyword}
                    onChange={(e) => setNewNegativeKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNegativeKeywordAdd()}
                    placeholder="Add prohibited word..."
                    className="flex-1"
                  />
                  <Button onClick={handleNegativeKeywordAdd} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {metadataSettings.negativeKeywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-md">
                      {metadataSettings.negativeKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="text-xs bg-destructive/20 text-destructive border-destructive/30"
                        >
                          {keyword}
                          <X
                            className="w-3 h-3 ml-1 cursor-pointer"
                            onClick={() => removeNegativeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive"
                      onClick={clearNegativeKeywords}
                    >
                      Clear All Negative Keywords
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  AI will not include these words in title, description, or keywords
                </p>
              </section>

              {/* Additional Options */}
              <section className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Additional Options
                </h3>

                <TooltipProvider delayDuration={300}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          Auto-Retry Failed Assets
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              Automatically retry rate-limited or timed-out AI generations up to 3 times to ensure stability.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                    </div>
                    <Switch
                      checked={metadataSettings.autoRetry}
                      onCheckedChange={(checked) =>
                        updateMetadataSettings({ autoRetry: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          Batch Mode
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              Maximum parallel processing. Uses all your active API keys simultaneously via smart round-robin distribution for fastest possible bulk generation.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                    </div>
                    <Switch
                      checked={metadataSettings.batchMode}
                      onCheckedChange={(checked) =>
                        updateMetadataSettings({ batchMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudUpload className="w-4 h-4 text-primary" />
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          Auto-Check for Updates
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              Allows Tagyfy Pro to automatically detect and download new versions seamlessly in the background when you start the app.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                    </div>
                    <Switch
                      checked={metadataSettings.autoCheckUpdates}
                      onCheckedChange={(checked) =>
                        updateMetadataSettings({ autoCheckUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-primary" />
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          Transparent Background Mode
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              Instructs the AI to explicitly add keywords like "png, transparent, cutout, isolated" which is ideal for vector illustrations and graphics.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                    </div>
                    <Switch
                      checked={metadataSettings.transparentBackground}
                      onCheckedChange={(checked) =>
                        updateMetadataSettings({ transparentBackground: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">🎬</span>
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          Green Screen Videos (Full Video Analysis)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              Uploads the entire video file to the AI instead of extracting frames. Essential for accurate metadata of animations or green screen footage. (Requires Gemini API key)
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                    </div>
                    <Switch
                      checked={metadataSettings.greenScreenVideos}
                      onCheckedChange={(checked) =>
                        updateMetadataSettings({ greenScreenVideos: checked })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          Custom Prompt
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs text-xs">
                              Override the built-in AI instructions with your own custom prompt. Useful if you have a specific niche or highly specialized metadata needs.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                      <Switch
                        checked={metadataSettings.customPromptEnabled}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ customPromptEnabled: checked })
                        }
                      />
                    </div>
                  
                  {metadataSettings.customPromptEnabled && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <textarea
                        className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Enter your custom prompt instructions here... e.g. 'Analyze this image and provide 10 highly specific keywords related to medical equipment...'"
                        value={metadataSettings.customPrompt}
                        onChange={(e) => updateMetadataSettings({ customPrompt: e.target.value })}
                      />
                    </div>
                    )}
                  </div>
                </TooltipProvider>
              </section>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
