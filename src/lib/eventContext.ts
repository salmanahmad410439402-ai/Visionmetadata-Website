/**
 * ═══════════════════════════════════════════════════════
 *  EVENT CONTEXT — Add these exports to seoPrompts.ts
 * ═══════════════════════════════════════════════════════
 *
 *  INTEGRATION INSTRUCTIONS
 *  ─────────────────────────
 *  1. Add the EventContext type export near the top of seoPrompts.ts.
 *
 *  2. Add the `eventContext?: EventContext` parameter to getSystemPrompt():
 *
 *       export const getSystemPrompt = (
 *         settings: MetadataSettings,
 *         isVideo: boolean,
 *         isVertical: boolean,
 *         isAIGenerated: boolean,
 *         eventContext?: EventContext,   // ← ADD THIS
 *       ): string => {
 *
 *  3. Inside getSystemPrompt(), call buildEventContextBlock() and inject it
 *     into the returned string just BEFORE the JSON output rules section:
 *
 *       const eventBlock = buildEventContextBlock(eventContext);
 *
 *     Then in the template literal, add:
 *       ${eventBlock}
 *     right before the closing JSON format instructions.
 *
 *  4. Also add the event context to getUserPrompt() via the same parameter
 *     so the user message reminds the model about the active event.
 *
 *  WHY THIS TECHNIQUE
 *  ──────────────────
 *  The "Dual-Strategy" approach is the professional stock technique:
 *
 *  • LAYER 1 (Event-targeted): Title + first 12 keywords are pinned to the
 *    specific event. Buyers searching "World Environment Day 2026" or
 *    "environment day poster" will find the content immediately.
 *
 *  • LAYER 2 (General discoverability): Remaining keywords use broad, timeless
 *    terms. Buyers searching "nature", "sustainability", "green earth",
 *    "eco-friendly" will ALSO find the content — even years after the event.
 *
 *  This is exactly what top-earning Adobe Stock contributors do for seasonal
 *  and event content. Without Layer 2, the asset becomes unsearchable after
 *  the event passes. Without Layer 1, it gets buried during the event.
 */

// ─────────────────────────────────────────────────────────────────────────
//  Type definition — also add this to SettingsContext.tsx
// ─────────────────────────────────────────────────────────────────────────

export interface EventContext {
  /** Whether event targeting is currently active. */
  enabled: boolean;

  /**
   * The event name as it should appear in metadata.
   * Examples: "World Environment Day 2026", "Christmas 2026", "Black Friday Sale"
   */
  name: string;

  /**
   * Optional ISO date string (YYYY-MM-DD) or human-readable date.
   * Used by the AI to include date-related keywords (e.g., "June 2026").
   */
  date?: string;

  /**
   * Optional short description of the event's theme and content focus.
   * This helps the AI generate more accurate event-specific keywords.
   * Example: "Global awareness day for environmental protection and sustainability"
   */
  theme?: string;

  /**
   * Optional list of required keywords the user wants pinned to the event.
   * The AI will include ALL of these in the first 12 keyword positions.
   * Example: ["World Environment Day", "environment day", "June 5", "2026"]
   */
  requiredKeywords?: string[];

  /**
   * The maximum number of keyword slots to dedicate to event-specific terms.
   * Remaining slots use general discoverability keywords.
   * Default: 12  (out of the user's total keywordCount)
   */
  eventKeywordSlots?: number;
}

// ─────────────────────────────────────────────────────────────────────────
//  Prompt block builder — call this inside getSystemPrompt()
// ─────────────────────────────────────────────────────────────────────────

export function buildEventContextBlock(ctx: EventContext | undefined | null): string {
  if (!ctx || !ctx.enabled || !ctx.name?.trim()) return "";

  const eventSlots    = ctx.eventKeywordSlots ?? 12;
  const requiredKwStr = ctx.requiredKeywords?.length
    ? `\nYou MUST include ALL of these exact phrases somewhere in the keywords:\n${ctx.requiredKeywords.map(k => `  • "${k}"`).join("\n")}`
    : "";
  const dateStr  = ctx.date  ? `\nEvent date: ${ctx.date}` : "";
  const themeStr = ctx.theme ? `\nTheme/focus: ${ctx.theme}` : "";

  return `
## ════════════════════════════════════════════════════════
## ACTIVE EVENT CONTEXT — DUAL-STRATEGY METADATA REQUIRED
## ════════════════════════════════════════════════════════

This batch of content has been created specifically for:
🎯 EVENT: "${ctx.name}"${dateStr}${themeStr}

You MUST apply the Dual-Strategy approach below. Do NOT use a generic approach.

### STRATEGY 1 — EVENT-TARGETED (Title + Keywords 1–${eventSlots})
The title and the FIRST ${eventSlots} keywords must directly reference this event.

TITLE RULES for event content:
- The title must include the event name OR a clear reference to it.
- Lead with the visual subject, then tie it to the event theme.
- ✅ Good: "Green Earth and Tree Planting Concept for World Environment Day"
- ✅ Good: "Global Environmental Awareness Day with Nature and Sustainability Theme"
- ❌ Bad:  A generic title with no mention of the event or its theme.

KEYWORD RULES for first ${eventSlots} slots:
- Slot 1–3:  The event name itself and common search variations
  (e.g., "World Environment Day", "Environment Day 2026", "June 5 environment")
- Slot 4–7:  Core event themes and visual elements specific to this event
  (e.g., "environmental awareness", "save the planet", "tree planting")
- Slot 8–${eventSlots}: Date/year references and platform-specific tags buyers use
  (e.g., "June 2026", "2026 event", "awareness campaign", "environmental poster")${requiredKwStr}

### STRATEGY 2 — GENERAL DISCOVERABILITY (Keywords ${eventSlots + 1}–END)
After the first ${eventSlots} event-specific keywords, fill all remaining slots
with BROAD, TIMELESS keywords that help buyers find this content even when
they are NOT searching for the specific event.

Purpose: Your content should still sell months or years after the event.
- Include: general subject terms (nature, forest, earth, environment)
- Include: mood and style terms (peaceful, green, sustainable, eco)
- Include: use-case terms (poster, banner, campaign, social media, background)
- Include: color and composition terms visible in the image

### CRITICAL: Both strategies must coexist in the SAME metadata.
The title targets the event. The keyword list starts with event terms and
transitions into general discoverability terms. This is the professional
stock contributor approach for seasonal and event content.
## ════════════════════════════════════════════════════════
`;
}

// ─────────────────────────────────────────────────────────────────────────
//  Updated getUserPrompt — also accepts eventContext for the user message
// ─────────────────────────────────────────────────────────────────────────

/**
 * REPLACE the existing getUserPrompt() in seoPrompts.ts with this version.
 * The only change is the optional eventContext parameter that adds a
 * one-line reminder in the user message so the model doesn't forget the
 * event between the system prompt and the actual image turn.
 */
export function getUserPromptWithEvent(
  isVideo: boolean,
  motionType?: string,
  eventContext?: EventContext | null,
): string {
  const eventReminder = eventContext?.enabled && eventContext.name
    ? `\n\n⚠️ REMINDER: Apply Dual-Strategy metadata for "${eventContext.name}". ` +
      `First ${eventContext.eventKeywordSlots ?? 12} keywords = event-targeted. Remaining = general discoverability.`
    : "";

  if (isVideo) {
    return `Analyze this 2x2 grid of video frames (extracted at 0%, 33%, 66%, and 100% timestamps) and generate comprehensive metadata.

${motionType ? `Detected motion type: ${motionType}` : ""}

Consider:
1. The overall narrative/action across frames
2. Visual consistency and style
3. Motion patterns (camera movement, subject movement)
4. Temporal keywords (before/after, sequence, transition)

Generate metadata optimized for stock video licensing.${eventReminder}`;
  }

  return `Analyze this image and generate comprehensive metadata optimized for stock photography licensing.

Consider:
1. Main subject and composition
2. Unique visual elements that differentiate it
3. Commercial use cases and target buyers
4. Technical aspects (lighting, style, format)

Generate metadata following all the rules in your system instructions.${eventReminder}`;
}
