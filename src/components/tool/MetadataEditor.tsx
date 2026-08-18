import React, { useState } from 'react';
import { Copy, Check, Plus, X, Sparkles, Hash, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface GeneratedMetadata {
  title: string;
  description: string;
  keywords: string[];
  category?: string;
}

interface MetadataEditorProps {
  metadata: GeneratedMetadata;
  onChange: (meta: GeneratedMetadata) => void;
  disabled?: boolean;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  onChange,
  disabled = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();

    const trimmed = newKeyword.trim().replace(/,/g, '');
    if (!trimmed) return;

    if (metadata.keywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Keyword already exists');
      return;
    }

    onChange({
      ...metadata,
      keywords: [...metadata.keywords, trimmed],
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    const next = [...metadata.keywords];
    next.splice(index, 1);
    onChange({ ...metadata, keywords: next });
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Generated SEO Metadata</h3>
            <p className="text-xs text-muted-foreground">Ready for Adobe Stock, Shutterstock, and Freepik</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(
            `Title: ${metadata.title}\n\nDescription: ${metadata.description}\n\nKeywords: ${metadata.keywords.join(', ')}`,
            'All Metadata'
          )}
          className="text-xs font-medium gap-1.5"
        >
          {copiedField === 'All Metadata' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          Copy All
        </Button>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" /> Title
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground font-mono">
              {metadata.title.length} characters
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(metadata.title, 'Title')}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {copiedField === 'Title' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
          </div>
        </div>
        <Input
          value={metadata.title}
          onChange={(e) => onChange({ ...metadata, title: e.target.value })}
          disabled={disabled}
          className="font-medium text-sm bg-background/50 border-border focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" /> Description
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground font-mono">
              {metadata.description.length} characters
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(metadata.description, 'Description')}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {copiedField === 'Description' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
          </div>
        </div>
        <Textarea
          value={metadata.description}
          onChange={(e) => onChange({ ...metadata, description: e.target.value })}
          rows={3}
          disabled={disabled}
          className="text-xs bg-background/50 border-border resize-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
        />
      </div>

      {/* Keywords Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-primary" /> Keywords ({metadata.keywords.length})
            </Label>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Tier 1: High Weight
            </Badge>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(metadata.keywords.join(', '), 'Keywords')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            {copiedField === 'Keywords' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            Copy Comma-Separated
          </button>
        </div>

        {/* Keyword list pills */}
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border/60 bg-background/40 max-h-48 overflow-y-auto">
          {metadata.keywords.map((kw, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                i < 5
                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                  : 'bg-card border-border/70 text-foreground'
              }`}
            >
              <span className="text-[10px] text-muted-foreground mr-0.5">{i + 1}.</span>
              {kw}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                  title="Remove keyword"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Add keyword input */}
        {!disabled && (
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword (press Enter)..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleAddKeyword}
              className="text-xs bg-background/50 border-border h-9"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddKeyword}
              className="h-9 px-3 text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
