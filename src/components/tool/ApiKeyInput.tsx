import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Sparkles, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ApiKeyInputProps {
  apiKey: string;
  onChange: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onChange }) => {
  const [showKey, setShowKey] = useState(false);
  const [rememberKey, setRememberKey] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('visionmeta_byok_key');
    if (saved && !apiKey) {
      onChange(saved);
      setRememberKey(true);
    }
  }, []);

  const handleKeyChange = (val: string) => {
    onChange(val);
    if (rememberKey) {
      localStorage.setItem('visionmeta_byok_key', val);
    }
  };

  const handleRememberToggle = (checked: boolean) => {
    setRememberKey(checked);
    if (checked && apiKey) {
      localStorage.setItem('visionmeta_byok_key', apiKey);
    } else {
      localStorage.removeItem('visionmeta_byok_key');
    }
  };

  // Provider auto-detection
  const getProviderInfo = (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('AIza') || trimmed.startsWith('AI')) {
      return { name: 'Google Gemini (Free Tier)', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' };
    }
    if (trimmed.startsWith('gsk_')) {
      return { name: 'Groq (Fast / Free)', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' };
    }
    if (trimmed.startsWith('sk-proj-') || trimmed.startsWith('sk-')) {
      return { name: 'OpenAI (GPT-4o)', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' };
    }
    return { name: 'Custom AI Provider', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' };
  };

  const provider = getProviderInfo(apiKey);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <Label htmlFor="api-key" className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
              AI Provider API Key (BYOK)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs space-y-1">
                  <p className="font-semibold">Zero-Cost Free Tool Model</p>
                  <p>Bring Your Own Key (BYOK) means you use your own free Gemini, OpenAI, or Groq API key. Your key is never saved on servers.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <p className="text-xs text-muted-foreground">
              Supports Google Gemini (Free), OpenAI GPT-4o, Groq, Mistral
            </p>
          </div>
        </div>

        {provider && (
          <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-medium ${provider.color}`}>
            <Sparkles className="w-3 h-3 mr-1" />
            {provider.name}
          </Badge>
        )}
      </div>

      <div className="relative">
        <Input
          id="api-key"
          type={showKey ? 'text' : 'password'}
          placeholder="Paste your Gemini (AIza...) or OpenAI (sk-...) key here"
          value={apiKey}
          onChange={(e) => handleKeyChange(e.target.value)}
          className="pr-10 bg-background/50 font-mono text-sm border-border focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          aria-label={showKey ? 'Hide key' : 'Show key'}
        >
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberKey}
            onChange={(e) => handleRememberToggle(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
          />
          <span>Remember in browser local storage</span>
        </label>

        <div className="flex items-center gap-3">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Get Free Gemini Key &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
