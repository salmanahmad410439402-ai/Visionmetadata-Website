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
  Sliders,
  Sparkles,
  CheckCircle2,
  Upload,
  ChevronDown,
  ChevronRight,
  Info,
  Layers,
  FileText,
  Video,
  ShieldCheck,
  Cpu,
  Download
} from "lucide-react";
import {
  useSettings,
  AIProvider,
  AIModel,
  KeywordStrategy
} from "@/contexts/SettingsContext";
import { getFreeTierRPM } from "@/lib/ai/config";
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

const PROVIDER_COLORS: Record<AIProvider, string> = {
  gemini:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  openai:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  groq:    "bg-purple-500/15 text-purple-400 border-purple-500/30",
  mistral: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const MISTRAL_MODELS: { value: AIModel; label: string; quality: string; badge: string }[] = [
  { value: "mistral-large-2512",  label: "Mistral Large 3",    quality: "Best quality",   badge: "text-emerald-400" },
  { value: "mistral-medium-2508", label: "Mistral Medium 3.1", quality: "Better quality", badge: "text-blue-400"    },
  { value: "mistral-small-2506",  label: "Mistral Small 3.2",  quality: "Good quality",   badge: "text-amber-400"   },
  { value: "ministral-14b-2512",  label: "Ministral 14B",      quality: "Good quality",   badge: "text-amber-400"   },
  { value: "ministral-8b-2512",   label: "Ministral 8B",       quality: "Fair quality",   badge: "text-orange-400"  },
  { value: "ministral-3b-2512",   label: "Ministral 3B",       quality: "Basic quality",  badge: "text-red-400"     },
];

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

  // Custom model dropdown state
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<"gemini" | "chatgpt" | "groq" | "mistral" | null>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelMenuOpen(false);
        setMobileSubmenu(null);
      }
    };
    if (isModelMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelMenuOpen]);

  function getModelDisplayLabel(): string {
    if (selectedModel === "gemini-3.5-flash") return "Gemini 3.5 Flash";
    if (selectedModel === "gemini-3-flash-preview") return "Gemini 3 Flash";
    if (selectedModel === "gemini-2.5-flash") return "Gemini 2.5 Flash";
    if (selectedModel === "gemini-2.5-flash-lite") return "Gemini 2.5 Flash-Lite";
    if (selectedModel === "gemini-3.1-pro-preview") return "Gemini 3.1 Pro";
    if (selectedModel === "gemini-3-pro-preview")   return "Gemini 3 Pro";
    if (selectedModel === "gemini-2.5-pro") return "Gemini 2.5 Pro";
    if (selectedModel === "gpt-4o")      return "ChatGPT · GPT-4o";
    if (selectedModel === "gpt-4o-mini") return "ChatGPT · GPT-4o Mini";
    if (selectedModel === "qwen/qwen3.6-27b") return "Groq · groq1";
    if (selectedModel === "qwen/qwen3.8-27b") return "Groq · groq2";
    const mistralMatch = MISTRAL_MODELS.find(m => m.value === selectedModel);
    if (mistralMatch) return `Mistral · ${mistralMatch.label}`;
    return selectedModel;
  }

  const handleAddKey = () => {
    if (!newApiKey.trim()) return;
    const key = newApiKey.trim();
    const provider = detectProvider(key);
    if (!provider) {
      toast.error("Please enter a valid API key.");
      return;
    }
    const isDuplicate = apiKeys.some(k => k.key === key);
    if (isDuplicate) {
      toast.error("This API key is already added.");
      return;
    }
    addApiKey(provider, key);
    setNewApiKey("");
    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} key added successfully`);
  };

  /** Auto-detect provider from API key format */
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
        if (!key || key.startsWith("#")) continue;

        const provider = detectProvider(key);
        if (!provider) {
          skipped++;
          continue;
        }

        const isDuplicate = apiKeys.some(k => k.key === key);
        if (isDuplicate) {
          skipped++;
          continue;
        }

        addApiKey(provider, key);
        imported++;
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      }

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

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

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
      <DialogContent className="w-[96vw] max-w-4xl h-[92vh] md:h-[84vh] overflow-hidden flex flex-col md:flex-row bg-background/95 backdrop-blur-xl border border-border/80 p-0 gap-0 rounded-2xl md:rounded-3xl shadow-2xl">
        
        {/* Sidebar Navigation (Desktop vertical, Mobile top bar) */}
        <div className="w-full md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border/70 flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border/50 flex items-center justify-between">
            <DialogTitle className="text-lg md:text-xl font-black flex items-center gap-2.5 text-foreground">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sliders className="w-4 h-4" />
              </div>
              <span>Settings</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Configure AI keys, metadata rules, and generator settings
            </DialogDescription>
          </div>
          
          {/* Nav Tabs */}
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-3 gap-1.5 md:space-y-1">
            <button
              onClick={() => setActiveTab("ai_providers")}
              className={`flex-1 md:flex-initial px-3.5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center md:justify-start gap-2.5 whitespace-nowrap ${
                activeTab === "ai_providers"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI & Providers</span>
            </button>
            
            <button
              onClick={() => setActiveTab("advanced_options")}
              className={`flex-1 md:flex-initial px-3.5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center md:justify-start gap-2.5 whitespace-nowrap ${
                activeTab === "advanced_options"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Advanced Rules</span>
            </button>
          </div>
          
          {firstRunSetupProps && (
            <div className="hidden md:block p-4 border-t border-border/50 mt-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full gap-2 text-muted-foreground hover:text-foreground rounded-xl"
                onClick={firstRunSetupProps.onSkip}
              >
                <X className="w-4 h-4" />
                Maybe Later
              </Button>
            </div>
          )}
        </div>

        {/* Right Scrollable Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-card/40">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* TAB 1: AI & Providers */}
            {activeTab === "ai_providers" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">AI Models & API Keys</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Connect your free AI keys (Gemini, OpenAI, Groq, Mistral) for instant metadata generation.
                  </p>
                </div>

                {/* API Keys Configuration Card */}
                <div className="rounded-2xl border border-border/80 bg-background/50 p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" />
                      Add API Key
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {apiKeys.length} configured
                    </span>
                  </div>

                  {/* Input row + model selector */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    {/* Custom model selector */}
                    <div ref={modelMenuRef} className="relative flex-shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsModelMenuOpen(v => !v)}
                        className="h-10 w-full sm:min-w-[190px] rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs sm:text-sm text-left flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors cursor-pointer shadow-sm"
                      >
                        <span className="truncate max-w-[150px] font-medium">{getModelDisplayLabel()}</span>
                        <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
                      </button>

                      {isModelMenuOpen && (
                        <div className="absolute top-full left-0 mt-1.5 z-50 w-full sm:w-[260px] bg-popover/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                            Select Default Model
                          </div>

                          {/* Gemini Menu Item */}
                          <div className="relative group/gemini">
                            <button
                              type="button"
                              onClick={() => setMobileSubmenu(mobileSubmenu === "gemini" ? null : "gemini")}
                              className="w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-muted/60 flex items-center justify-between transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                                <span className="font-semibold text-foreground">Google Gemini</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            </button>
                            
                            {/* Submenu for Desktop hover / Mobile tap */}
                            <div className={`${mobileSubmenu === "gemini" ? "block" : "hidden"} md:group-hover/gemini:block md:absolute md:left-full md:top-0 md:ml-1 w-full md:min-w-[240px] bg-popover/95 md:border border-border/80 rounded-xl md:shadow-xl py-1 z-50`}>
                              {[
                                { value: "gemini-3.5-flash-lite" as AIModel, label: "Gemini 3.5 Flash-Lite", quality: "Most Cheap · Default", badge: "text-green-400" },
                                { value: "gemini-3.5-flash" as AIModel, label: "Gemini 3.5 Flash", quality: "Latest & Ultra-fast", badge: "text-purple-400" },
                                { value: "gemini-3.1-flash-lite" as AIModel, label: "Gemini 3.1 Flash-Lite", quality: "Most Cheap", badge: "text-green-400" },
                                { value: "gemini-3-flash-preview" as AIModel, label: "Gemini 3 Flash", quality: "Fast & frontier", badge: "text-emerald-400" },
                              ].map(m => (
                                <button
                                  key={m.value}
                                  type="button"
                                  onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); setMobileSubmenu(null); }}
                                  className={`w-full px-3 py-1.5 text-xs text-left hover:bg-muted/60 flex items-center justify-between ${selectedModel === m.value ? "bg-primary/10 text-primary font-bold" : ""}`}
                                >
                                  <span>{m.label}</span>
                                  <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* OpenAI Menu Item */}
                          <div className="relative group/chatgpt">
                            <button
                              type="button"
                              onClick={() => setMobileSubmenu(mobileSubmenu === "chatgpt" ? null : "chatgpt")}
                              className="w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-muted/60 flex items-center justify-between transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                <span className="font-semibold text-foreground">OpenAI ChatGPT</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            </button>
                            <div className={`${mobileSubmenu === "chatgpt" ? "block" : "hidden"} md:group-hover/chatgpt:block md:absolute md:left-full md:top-0 md:ml-1 w-full md:min-w-[220px] bg-popover/95 md:border border-border/80 rounded-xl md:shadow-xl py-1 z-50`}>
                              {[
                                { value: "gpt-4o" as AIModel, label: "GPT-4o", quality: "Best quality", badge: "text-emerald-400" },
                                { value: "gpt-4o-mini" as AIModel, label: "GPT-4o Mini", quality: "Fast & light", badge: "text-green-400" },
                              ].map(m => (
                                <button
                                  key={m.value}
                                  type="button"
                                  onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); setMobileSubmenu(null); }}
                                  className={`w-full px-3 py-1.5 text-xs text-left hover:bg-muted/60 flex items-center justify-between ${selectedModel === m.value ? "bg-primary/10 text-primary font-bold" : ""}`}
                                >
                                  <span>{m.label}</span>
                                  <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Groq Menu Item */}
                          <div className="relative group/groq">
                            <button
                              type="button"
                              onClick={() => setMobileSubmenu(mobileSubmenu === "groq" ? null : "groq")}
                              className="w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-muted/60 flex items-center justify-between transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                <span className="font-semibold text-foreground">Groq Models</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            </button>
                            <div className={`${mobileSubmenu === "groq" ? "block" : "hidden"} md:group-hover/groq:block md:absolute md:left-full md:top-0 md:ml-1 w-full md:min-w-[240px] bg-popover/95 md:border border-border/80 rounded-xl md:shadow-xl py-1 z-50`}>
                              {[
                                { value: "qwen/qwen3.6-27b" as AIModel, label: "groq1", quality: "Cheapest · Vision", badge: "text-green-400" },
                                { value: "qwen/qwen3.8-27b" as AIModel, label: "groq2", quality: "Powerful · Vision", badge: "text-purple-400" },
                              ].map(m => (
                                <button
                                  key={m.value}
                                  type="button"
                                  onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); setMobileSubmenu(null); }}
                                  className={`w-full px-3 py-1.5 text-xs text-left hover:bg-muted/60 flex items-center justify-between ${selectedModel === m.value ? "bg-primary/10 text-primary font-bold" : ""}`}
                                >
                                  <span>{m.label}</span>
                                  <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Mistral Menu Item */}
                          <div className="relative group/mistral">
                            <button
                              type="button"
                              onClick={() => setMobileSubmenu(mobileSubmenu === "mistral" ? null : "mistral")}
                              className="w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-muted/60 flex items-center justify-between transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                <span className="font-semibold text-foreground">Mistral AI</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            </button>
                            <div className={`${mobileSubmenu === "mistral" ? "block" : "hidden"} md:group-hover/mistral:block md:absolute md:left-full md:top-0 md:ml-1 w-full md:min-w-[220px] bg-popover/95 md:border border-border/80 rounded-xl md:shadow-xl py-1 z-50`}>
                              {MISTRAL_MODELS.map(m => (
                                <button
                                  key={m.value}
                                  type="button"
                                  onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); setMobileSubmenu(null); }}
                                  className={`w-full px-3 py-1.5 text-xs text-left hover:bg-muted/60 flex items-center justify-between ${selectedModel === m.value ? "bg-primary/10 text-primary font-bold" : ""}`}
                                >
                                  <span>{m.label}</span>
                                  <span className={`text-[10px] font-semibold ${m.badge}`}>{m.quality}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Key input box */}
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="password"
                        placeholder="Paste API Key (AIzaSy..., sk-..., gsk_...)"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddKey()}
                        className="flex-1 rounded-xl bg-background/80 border-border/80 text-xs sm:text-sm"
                      />
                      <Button onClick={handleAddKey} className="gap-1 rounded-xl bg-primary hover:bg-primary/90 shrink-0 px-4">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </div>

                    {/* Bulk Import */}
                    <Button
                      variant="outline"
                      className="gap-1.5 shrink-0 rounded-xl border-border/80 hover:bg-muted/50"
                      onClick={() => importFileRef.current?.click()}
                      title="Bulk import keys from .txt file"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Import</span>
                    </Button>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".txt,text/plain"
                      className="hidden"
                      onChange={handleImportKeys}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    💡 Provider is automatically detected from key format:
                    <span className="font-mono text-foreground font-semibold"> AIzaSy…</span> (Gemini),
                    <span className="font-mono text-foreground font-semibold"> sk-…</span> (OpenAI),
                    <span className="font-mono text-foreground font-semibold"> gsk_…</span> (Groq).
                  </p>

                  {/* Active Keys List */}
                  <AnimatePresence>
                    {apiKeys.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2 border-t border-border/40"
                      >
                        {(isKeyListExpanded || apiKeys.length <= 3 ? apiKeys : apiKeys.slice(0, 2)).map((apiKey) => {
                          const isEnabled = !disabledKeyIds.includes(apiKey.id);
                          return (
                            <div
                              key={apiKey.id}
                              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                                isEnabled
                                  ? "bg-card/70 border-border/80"
                                  : "bg-muted/20 border-border/40 opacity-50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <Badge
                                  variant="outline"
                                  className={`capitalize text-[10px] px-2 py-0.5 font-bold ${PROVIDER_COLORS[apiKey.provider]}`}
                                >
                                  {apiKey.provider}
                                </Badge>
                                <span className="text-xs font-mono text-foreground/80 truncate max-w-[140px] sm:max-w-xs">
                                  {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <div
                                  className="flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-muted/40"
                                  onClick={() => toggleKeyEnabled(apiKey.id)}
                                >
                                  <Checkbox
                                    checked={isEnabled}
                                    onCheckedChange={() => toggleKeyEnabled(apiKey.id)}
                                    className={`h-4 w-4 ${isEnabled ? "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" : ""}`}
                                  />
                                  <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
                                    {isEnabled ? "Active" : "Disabled"}
                                  </span>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg"
                                  onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                                >
                                  {showKey === apiKey.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeApiKey(apiKey.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Expand / Collapse buttons */}
                        {!isKeyListExpanded && apiKeys.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setIsKeyListExpanded(true)}
                          >
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show all {apiKeys.length} keys
                          </Button>
                        )}

                        {isKeyListExpanded && apiKeys.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setIsKeyListExpanded(false)}
                          >
                            Collapse
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl"
                          onClick={clearAllKeys}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                          Clear All Keys
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Metadata Optimization Rules Card */}
                <div className="rounded-2xl border border-border/80 bg-background/50 p-4 sm:p-5 space-y-5 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Metadata Rules & Limits
                  </h3>

                  {/* Free / Paid API Key Toggle */}
                  <div className="space-y-2 pb-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-medium text-foreground">API Key Type</Label>
                      <Badge variant="secondary" className={`font-mono font-bold px-2 py-0.5 text-[10px] ${metadataSettings.freeKeyMode ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-purple-500 bg-purple-500/10 border-purple-500/20"}`}>
                        {metadataSettings.freeKeyMode ? `${getFreeTierRPM(selectedModel)} req/min` : "Unlimited"}
                      </Badge>
                    </div>
                    <div className="flex rounded-lg border border-border/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateMetadataSettings({ freeKeyMode: true })}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${metadataSettings.freeKeyMode ? "bg-green-500/15 text-green-600 dark:text-green-400 border-r border-border/60" : "bg-transparent text-muted-foreground hover:bg-muted/40 border-r border-border/60"}`}
                      >
                        🆓 Free Key
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMetadataSettings({ freeKeyMode: false })}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${!metadataSettings.freeKeyMode ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" : "bg-transparent text-muted-foreground hover:bg-muted/40"}`}
                      >
                        💎 Paid Key
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {metadataSettings.freeKeyMode
                        ? "Requests are throttled to stay within the selected model's free-tier rate limit."
                        : "No rate limiting — full speed batch processing with paid API keys."}
                    </p>
                  </div>

                  {/* Keyword Strategy */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <Label className="text-xs sm:text-sm font-medium text-foreground">Keyword Strategy</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="maxKeywordWords"
                          checked={metadataSettings.maxKeywordWords <= 2}
                          onCheckedChange={(checked) =>
                            updateMetadataSettings({ maxKeywordWords: checked ? 2 : 99 })
                          }
                        />
                        <label htmlFor="maxKeywordWords" className="text-[11px] text-muted-foreground cursor-pointer">
                          Enforce max 2 words per tag
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(["single", "multi", "mixed"] as KeywordStrategy[]).map((strategy) => (
                        <Button
                          key={strategy}
                          type="button"
                          variant={metadataSettings.keywordStrategy === strategy ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateMetadataSettings({ keywordStrategy: strategy })}
                          className={`rounded-xl text-xs font-semibold transition-all ${
                            metadataSettings.keywordStrategy === strategy ? "bg-primary shadow-sm" : "border-border/80"
                          }`}
                        >
                          {strategy === "single" ? "Single-Word" : strategy === "multi" ? "Multi-Word" : "Mixed Strategy"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Keyword Count Slider */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <Label className="font-medium text-foreground">Keyword Count</Label>
                      <Badge variant="secondary" className="font-mono font-bold px-2 py-0.5 text-primary bg-primary/10 border-primary/20">
                        {metadataSettings.keywordCount} tags
                      </Badge>
                    </div>
                    <Slider
                      value={[metadataSettings.keywordCount]}
                      onValueChange={([v]) => handleKeywordCountChange(v)}
                      min={5}
                      max={50}
                      step={1}
                      className="w-full py-1"
                    />
                    {validationErrors.keywordCount && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        {validationErrors.keywordCount}
                      </div>
                    )}
                  </div>

                  {/* Title Length Slider */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <Label className="font-medium text-foreground">Title Length (Characters)</Label>
                      <Badge variant="secondary" className="font-mono font-bold px-2 py-0.5">
                        {metadataSettings.titleLengthMin} - {metadataSettings.titleLengthMax} chars
                      </Badge>
                    </div>
                    <Slider
                      value={[metadataSettings.titleLengthMin, metadataSettings.titleLengthMax]}
                      onValueChange={([min, max]) =>
                        updateMetadataSettings({ titleLengthMin: min, titleLengthMax: max })
                      }
                      min={10}
                      max={200}
                      step={5}
                      className="w-full py-1"
                    />
                  </div>

                  {/* Description Length Slider */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <Label className="font-medium text-foreground">Description Length (Characters)</Label>
                      <Badge variant="secondary" className="font-mono font-bold px-2 py-0.5">
                        {metadataSettings.descriptionLengthMin} - {metadataSettings.descriptionLengthMax} chars
                      </Badge>
                    </div>
                    <Slider
                      value={[metadataSettings.descriptionLengthMin, metadataSettings.descriptionLengthMax]}
                      onValueChange={([min, max]) =>
                        updateMetadataSettings({ descriptionLengthMin: min, descriptionLengthMax: max })
                      }
                      min={50}
                      max={450}
                      step={10}
                      className="w-full py-1"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Advanced Rules & Options */}
            {activeTab === "advanced_options" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Advanced Rules & Context</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Fine-tune event contexts, negative keyword filters, and AI behavior.
                  </p>
                </div>

                {/* Event/Series Context */}
                <EventContextToggle
                  eventEnabled={eventEnabled}
                  setEventEnabled={setEventEnabled}
                  eventName={eventName}
                  setEventName={setEventName}
                />

                {/* Negative Keywords */}
                <div className="rounded-2xl border border-border/80 bg-background/50 p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                        Negative Keywords (Prohibited Terms)
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        AI will automatically strip these words from titles, descriptions, and keyword lists.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {metadataSettings.negativeKeywords.length} prohibited
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      ref={negativeInputRef}
                      value={newNegativeKeyword}
                      onChange={(e) => setNewNegativeKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNegativeKeywordAdd()}
                      placeholder="e.g. watermark, logo, blurry..."
                      className="flex-1 rounded-xl bg-background/80 border-border/80 text-xs sm:text-sm"
                    />
                    <Button onClick={handleNegativeKeywordAdd} size="sm" className="rounded-xl px-4 gap-1">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>

                  {metadataSettings.negativeKeywords.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 bg-muted/20 rounded-xl border border-border/40">
                        {metadataSettings.negativeKeywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="text-xs py-1 px-2.5 bg-destructive/10 text-destructive border-destructive/25 rounded-lg flex items-center gap-1.5"
                          >
                            <span>{keyword}</span>
                            <X
                              className="w-3 h-3 cursor-pointer hover:opacity-75"
                              onClick={() => removeNegativeKeyword(keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:bg-destructive/10 w-full rounded-xl"
                        onClick={clearNegativeKeywords}
                      >
                        Clear All Negative Keywords
                      </Button>
                    </div>
                  )}
                </div>

                {/* Automation Toggles */}
                <div className="rounded-2xl border border-border/80 bg-background/50 p-4 sm:p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                    Generation Engine Features
                  </h3>

                  <TooltipProvider delayDuration={200}>
                    {/* Auto Retry */}
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <div className="space-y-0.5 max-w-[80%]">
                        <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          Auto-Retry Rate Limited Calls
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Automatically retries generation up to 3 times if an API key hits temporary rate limits.
                        </p>
                      </div>
                      <Switch
                        checked={metadataSettings.autoRetry}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ autoRetry: checked })
                        }
                      />
                    </div>

                    {/* Batch Parallel Mode */}
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <div className="space-y-0.5 max-w-[80%]">
                        <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Sparkles className="w-4 h-4 text-primary shrink-0" />
                          Batch High-Throughput Mode
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Distributes parallel requests across all your active API keys simultaneously for maximum processing speed.
                        </p>
                      </div>
                      <Switch
                        checked={metadataSettings.batchMode}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ batchMode: checked })
                        }
                      />
                    </div>

                    {/* Auto Download CSV */}
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <div className="space-y-0.5 max-w-[80%]">
                        <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                          Auto-Download CSV
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Automatically downloads a Master CSV of all generated metadata immediately when a batch completes.
                        </p>
                      </div>
                      <Switch
                        checked={metadataSettings.autoDownloadCsv}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ autoDownloadCsv: checked })
                        }
                      />
                    </div>

                    {/* Transparent Background Mode */}
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <div className="space-y-0.5 max-w-[80%]">
                        <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Image className="w-4 h-4 text-blue-500 shrink-0" />
                          Transparent Background Tags
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Instructs the AI to append keywords like "png, transparent, cutout, isolated" (ideal for vectors & icons).
                        </p>
                      </div>
                      <Switch
                        checked={metadataSettings.transparentBackground}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ transparentBackground: checked })
                        }
                      />
                    </div>

                    {/* Green Screen Videos */}
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <div className="space-y-0.5 max-w-[80%]">
                        <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Video className="w-4 h-4 text-rose-500 shrink-0" />
                          Full Video Analysis
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Sends continuous visual context for animation footage and video clips.
                        </p>
                      </div>
                      <Switch
                        checked={metadataSettings.greenScreenVideos}
                        onCheckedChange={(checked) =>
                          updateMetadataSettings({ greenScreenVideos: checked })
                        }
                      />
                    </div>

                    {/* Custom Prompt Toggle & Textarea */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 max-w-[80%]">
                          <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                            <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                            Custom System Prompt Override
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Add custom domain instructions for specialized niches (e.g. medical, architectural, food stock).
                          </p>
                        </div>
                        <Switch
                          checked={metadataSettings.customPromptEnabled}
                          onCheckedChange={(checked) =>
                            updateMetadataSettings({ customPromptEnabled: checked })
                          }
                        />
                      </div>

                      {metadataSettings.customPromptEnabled && (
                        <div className="pt-1 animate-in fade-in slide-in-from-top-1">
                          <textarea
                            className="w-full min-h-[110px] rounded-xl border border-border/80 bg-background/80 p-3 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
                            placeholder="Enter custom instructions... e.g. 'Focus keywords on high-commercial medical technology concepts...'"
                            value={metadataSettings.customPrompt}
                            onChange={(e) => updateMetadataSettings({ customPrompt: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                  </TooltipProvider>
                </div>

              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
