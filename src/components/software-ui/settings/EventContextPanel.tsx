/**
 * EventContextPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Drop this component into SettingsModal.tsx as a new tab or accordion section.
 *
 * INTEGRATION:
 *  1. Add EventContext to MetadataSettings in SettingsContext.tsx (see bottom of file).
 *  2. Import and render <EventContextPanel /> inside SettingsModal.
 *  3. Pass metadataSettings and updateMetadataSettings from useSettings().
 *
 * The component manages the full EventContext object:
 *   - Toggle enable/disable
 *   - Event name input
 *   - Optional date, theme, required keywords, and slot count
 *   - Preset quick-fill buttons for common recurring events
 */

import React, { useState } from "react";
import { Switch }     from "@/components/ui/switch";
import { Input }      from "@/components/ui/input";
import { Textarea }   from "@/components/ui/textarea";
import { Label }      from "@/components/ui/label";
import { Button }     from "@/components/ui/button";
import { Badge }      from "@/components/ui/badge";
import { Slider }     from "@/components/ui/slider";
import { toast }      from "sonner";
import type { EventContext } from "@/lib/eventContext";
import type { MetadataSettings } from "@/contexts/SettingsContext";

// ─────────────────────────────────────────────────────────────────────────
//  Quick-fill presets for common recurring events
// ─────────────────────────────────────────────────────────────────────────

const EVENT_PRESETS: Array<{ label: string; data: Partial<EventContext> }> = [
  {
    label: "🌍 World Environment Day",
    data: {
      name:             "World Environment Day 2026",
      date:             "June 5, 2026",
      theme:            "Global awareness day for environmental protection, nature conservation, and sustainability",
      requiredKeywords: ["World Environment Day", "environment day 2026", "June 5", "environmental awareness"],
      eventKeywordSlots: 12,
    },
  },
  {
    label: "🎄 Christmas",
    data: {
      name:             "Christmas 2026",
      date:             "December 25, 2026",
      theme:            "Christmas holiday season with festive decorations, gifts, and winter celebrations",
      requiredKeywords: ["Christmas 2026", "Christmas", "holiday season", "xmas"],
      eventKeywordSlots: 10,
    },
  },
  {
    label: "🎃 Halloween",
    data: {
      name:             "Halloween 2026",
      date:             "October 31, 2026",
      theme:            "Halloween spooky season with costumes, pumpkins, and trick-or-treat themes",
      requiredKeywords: ["Halloween 2026", "Halloween", "spooky", "October 31"],
      eventKeywordSlots: 10,
    },
  },
  {
    label: "❤️ Valentine's Day",
    data: {
      name:             "Valentine's Day 2027",
      date:             "February 14, 2027",
      theme:            "Valentine's Day romance, love, and relationship celebration",
      requiredKeywords: ["Valentine's Day", "valentines day 2027", "love", "February 14"],
      eventKeywordSlots: 10,
    },
  },
  {
    label: "🐣 Easter",
    data: {
      name:             "Easter 2027",
      date:             "April 2027",
      theme:            "Easter spring holiday with eggs, bunnies, flowers, and renewal themes",
      requiredKeywords: ["Easter 2027", "Easter", "Easter egg", "spring holiday"],
      eventKeywordSlots: 10,
    },
  },
  {
    label: "💼 Black Friday",
    data: {
      name:             "Black Friday 2026",
      date:             "November 27, 2026",
      theme:            "Black Friday shopping event with discounts, sales, and retail promotions",
      requiredKeywords: ["Black Friday", "Black Friday 2026", "sale", "discount"],
      eventKeywordSlots: 10,
    },
  },
  {
    label: "🌸 Mother's Day",
    data: {
      name:             "Mother's Day 2026",
      date:             "May 10, 2026",
      theme:            "Mother's Day celebration of motherhood, family love, and appreciation",
      requiredKeywords: ["Mother's Day", "mothers day 2026", "mom", "family"],
      eventKeywordSlots: 10,
    },
  },
  {
    label: "🌏 Earth Day",
    data: {
      name:             "Earth Day 2026",
      date:             "April 22, 2026",
      theme:            "Earth Day environmental awareness, climate action, and planet conservation",
      requiredKeywords: ["Earth Day", "Earth Day 2026", "April 22", "climate action"],
      eventKeywordSlots: 12,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────

interface Props {
  metadataSettings:       MetadataSettings;
  updateMetadataSettings: (settings: Partial<MetadataSettings>) => void;
}

export const EventContextPanel: React.FC<Props> = ({
  metadataSettings,
  updateMetadataSettings,
}) => {
  const ctx: EventContext = (metadataSettings as any).eventContext ?? {
    enabled:           false,
    name:              "",
    date:              "",
    theme:             "",
    requiredKeywords:  [],
    eventKeywordSlots: 12,
  };

  const [newKw, setNewKw] = useState("");

  const setCtx = (patch: Partial<EventContext>) => {
    updateMetadataSettings({
      eventContext: { ...ctx, ...patch },
    } as any);
  };

  const applyPreset = (preset: Partial<EventContext>) => {
    updateMetadataSettings({
      eventContext: { ...ctx, ...preset, enabled: true },
    } as any);
    toast.success(`Preset applied: ${preset.name}`);
  };

  const addRequiredKw = () => {
    const kw = newKw.trim();
    if (!kw) return;
    if ((ctx.requiredKeywords ?? []).includes(kw)) {
      toast.error("Keyword already in list");
      return;
    }
    setCtx({ requiredKeywords: [...(ctx.requiredKeywords ?? []), kw] });
    setNewKw("");
  };

  const removeRequiredKw = (kw: string) => {
    setCtx({ requiredKeywords: (ctx.requiredKeywords ?? []).filter(k => k !== kw) });
  };

  const clearAll = () => {
    updateMetadataSettings({
      eventContext: {
        enabled:           false,
        name:              "",
        date:              "",
        theme:             "",
        requiredKeywords:  [],
        eventKeywordSlots: 12,
      },
    } as any);
    toast.info("Event context cleared");
  };

  return (
    <div className="space-y-5">

      {/* ── Header with toggle ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Event / Series Context</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tell the AI which event your content is for. Uses Dual-Strategy:
            event-targeted title + mixed event &amp; general keywords.
          </p>
        </div>
        <Switch
          checked={ctx.enabled}
          onCheckedChange={v => setCtx({ enabled: v })}
        />
      </div>

      {/* ── Status indicator ─────────────────────────────────────────── */}
      {ctx.enabled && ctx.name && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-2 flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            🎯 Active: {ctx.name}
          </span>
          <Badge variant="secondary" className="text-xs">
            {ctx.eventKeywordSlots ?? 12} event keyword slots
          </Badge>
        </div>
      )}

      {ctx.enabled && !ctx.name && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Enter an event name below or choose a preset to activate event targeting.
        </div>
      )}

      {/* ── Quick presets ─────────────────────────────────────────────── */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
          Quick Presets
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_PRESETS.map(p => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => applyPreset(p.data)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Event name ───────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="evt-name" className="text-sm font-medium">
          Event Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="evt-name"
          placeholder="e.g. World Environment Day 2026"
          value={ctx.name}
          onChange={e => setCtx({ name: e.target.value })}
          disabled={!ctx.enabled}
        />
        <p className="text-xs text-muted-foreground">
          This exact phrase will be used in the title and first keyword slot.
        </p>
      </div>

      {/* ── Optional: date ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="evt-date" className="text-sm font-medium">
          Event Date <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="evt-date"
          placeholder="e.g. June 5, 2026"
          value={ctx.date ?? ""}
          onChange={e => setCtx({ date: e.target.value })}
          disabled={!ctx.enabled}
        />
        <p className="text-xs text-muted-foreground">
          Enables year/month keywords: "June 2026", "2026 event", etc.
        </p>
      </div>

      {/* ── Optional: theme ──────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="evt-theme" className="text-sm font-medium">
          Theme / Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="evt-theme"
          placeholder="e.g. Global awareness day for environmental protection, nature conservation, and sustainability"
          value={ctx.theme ?? ""}
          onChange={e => setCtx({ theme: e.target.value })}
          rows={2}
          disabled={!ctx.enabled}
          className="text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Helps the AI understand the event's focus to generate more relevant keywords.
        </p>
      </div>

      {/* ── Event keyword slots slider ────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Event Keyword Slots</Label>
          <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
            {ctx.eventKeywordSlots ?? 12}
          </span>
        </div>
        <Slider
          min={5}
          max={20}
          step={1}
          value={[ctx.eventKeywordSlots ?? 12]}
          onValueChange={([v]) => setCtx({ eventKeywordSlots: v })}
          disabled={!ctx.enabled}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          First <strong>{ctx.eventKeywordSlots ?? 12}</strong> keyword slots = event-targeted.
          Remaining = general discoverability terms.
          Recommended: 10–15 for major events, 5–8 for subtle themes.
        </p>
      </div>

      {/* ── Required keywords ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Pinned Keywords <span className="text-muted-foreground">(optional)</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          These exact phrases are guaranteed to appear in the first {ctx.eventKeywordSlots ?? 12} keyword slots.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. World Environment Day"
            value={newKw}
            onChange={e => setNewKw(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRequiredKw(); } }}
            disabled={!ctx.enabled}
            className="text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addRequiredKw}
            disabled={!ctx.enabled || !newKw.trim()}
          >
            Add
          </Button>
        </div>
        {(ctx.requiredKeywords ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(ctx.requiredKeywords ?? []).map(kw => (
              <Badge
                key={kw}
                variant="secondary"
                className="text-xs gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => removeRequiredKw(kw)}
              >
                {kw} ✕
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── How it works explainer ────────────────────────────────────── */}
      <div className="rounded-md border bg-muted/50 p-3 space-y-1.5">
        <p className="text-xs font-semibold text-foreground">💡 How Dual-Strategy works</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Title:</strong> Tied to the event — buyers searching for this specific event find your content instantly.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Keywords 1–{ctx.eventKeywordSlots ?? 12}:</strong> Event-specific terms — high relevance during the event window.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Keywords {(ctx.eventKeywordSlots ?? 12) + 1}–end:</strong> Broad timeless terms — content keeps selling
          long after the event via general searches like "nature", "sustainability", "green earth".
        </p>
      </div>

      {/* ── Clear button ─────────────────────────────────────────────── */}
      {(ctx.name || (ctx.requiredKeywords ?? []).length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
          onClick={clearAll}
        >
          Clear Event Context
        </Button>
      )}
    </div>
  );
};

export default EventContextPanel;

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SETTINGSCONTEXT.TSX — Add these lines to MetadataSettings interface:
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  import { EventContext } from "@/lib/seoPrompts";  // add this import
 *
 *  export interface MetadataSettings {
 *    ...existing fields...
 *    eventContext?: EventContext;   // ← ADD THIS
 *  }
 *
 *  const defaultSettings: MetadataSettings = {
 *    ...existing defaults...
 *    eventContext: {               // ← ADD THIS
 *      enabled: false,
 *      name: "",
 *      date: "",
 *      theme: "",
 *      requiredKeywords: [],
 *      eventKeywordSlots: 12,
 *    },
 *  };
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  DASHBOARD.TSX — Update generateMetadata call:
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  metadata = await generateMetadata(
 *    assetImage,
 *    activeApiKeys,
 *    metadataSettings,
 *    asset.type === "video",
 *    asset.isVertical || false,
 *    false,
 *    asset.motionType,
 *    selectedModel,
 *    metadataSettings.eventContext,  // ← REPLACE the undefined here

 *  );
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  SETTINGSMODAL.TSX — Add panel to settings tabs:
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  import { EventContextPanel } from "@/components/settings/EventContextPanel";
 *
 *  // Inside the settings tabs/sections:
 *  <TabsTrigger value="event">🎯 Event</TabsTrigger>
 *
 *  <TabsContent value="event">
 *    <EventContextPanel
 *      metadataSettings={metadataSettings}
 *      updateMetadataSettings={updateMetadataSettings}
 *    />
 *  </TabsContent>
 */
