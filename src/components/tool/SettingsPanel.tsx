import React from 'react';
import { Sliders, Target, FileText, Hash, Globe, MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ToolSettings {
  titleLength: 'short' | 'medium' | 'long';
  keywordCount: number;
  language: string;
  platform: 'adobe_stock' | 'shutterstock' | 'freepik' | 'generic';
  customRules?: string;
}

interface SettingsPanelProps {
  settings: ToolSettings;
  onChange: (settings: ToolSettings) => void;
  disabled?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const updateSetting = <K extends keyof ToolSettings>(key: K, value: ToolSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">SEO & Metadata Rules</h3>
          <p className="text-xs text-muted-foreground">Tailored for stock platform compliance & search algorithms</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Target Platform */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" /> Target Marketplace
          </Label>
          <Select
            value={settings.platform}
            onValueChange={(val: any) => updateSetting('platform', val)}
            disabled={disabled}
          >
            <SelectTrigger className="bg-background/50 border-border">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adobe_stock">Adobe Stock (Search-First & XMP DC)</SelectItem>
              <SelectItem value="shutterstock">Shutterstock (Detailed Descriptions)</SelectItem>
              <SelectItem value="freepik">Freepik (Vector / AI Re-creation)</SelectItem>
              <SelectItem value="generic">Universal / Multi-Platform Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title Length Strategy */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" /> Title Strategy
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'short', label: 'Short', desc: '30-80 chars' },
              { id: 'medium', label: 'Medium', desc: '50-150 chars' },
              { id: 'long', label: 'Detailed', desc: '100-200 chars' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => updateSetting('titleLength', opt.id as any)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  settings.titleLength === opt.id
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                    : 'border-border/60 bg-background/30 text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
              >
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] opacity-70 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Count Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-primary" /> Keyword Target Count
            </Label>
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {settings.keywordCount} Keywords
            </span>
          </div>
          <Slider
            value={[settings.keywordCount]}
            onValueChange={(val) => updateSetting('keywordCount', val[0])}
            min={15}
            max={49}
            step={1}
            disabled={disabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>15 (Minimal)</span>
            <span>30 (Recommended)</span>
            <span>49 (Max Capacity)</span>
          </div>
        </div>

        {/* Custom Rules / Instructions */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" /> Custom AI Instructions (Optional)
          </Label>
          <Textarea
            value={settings.customRules || ''}
            onChange={(e) => updateSetting('customRules', e.target.value)}
            placeholder="e.g. Focus on cybersecurity themes, avoid mentioning laptops, emphasize isometric style..."
            rows={3}
            disabled={disabled}
            className="bg-background/50 border-border text-xs resize-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>
    </div>
  );
};
