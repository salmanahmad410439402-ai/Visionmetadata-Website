# VisionMetadata Pro - Style Guide & Component Library

## 📖 Table of Contents

1. [Design System](#design-system)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Accessibility](#accessibility)
7. [Best Practices](#best-practices)

---

## Design System

### Philosophy

The VisionMetadata Pro design system prioritizes:

- **Consistency**: Standardized components and utilities across the site
- **Accessibility**: WCAG AA compliance with keyboard navigation
- **Performance**: CSS-based styling (avoid inline styles)
- **Maintainability**: Reusable components and clear naming conventions
- **Responsiveness**: Mobile-first approach with breakpoint considerations

### Key Files

- `src/styles/colors.css` - Color variables and semantic classes
- `src/styles/spacing.css` - Spacing and layout utilities
- `src/components/common/` - Reusable component library
- `src/components/ui/` - Base UI components

---

## Color System

### Text Colors

| Class | Usage | Contrast |
|-------|-------|----------|
| `.text-foreground` | Primary text (headings) | WCAG AAA ✓ |
| `.text-secondary` | Standard body text | WCAG AA ✓ |
| `.text-tertiary` | Subtle descriptive text | WCAG AA ✓ |
| `.text-quaternary` | Very muted text | WCAG AA ✓ |
| `.text-minimal` | Footer-level text | WCAG AA ✓ |
| `.text-accent` | Cyan highlight text | High contrast ✓ |

**HTML Values:**
```css
.text-secondary { color: hsl(215 20% 75%); }
.text-tertiary { color: hsl(215 20% 65%); }
.text-quaternary { color: hsl(215 20% 60%); }
```

### Background Colors

| Class | Usage |
|-------|-------|
| `.bg-card-primary` | Main card background |
| `.bg-card-secondary` | Lighter card variant |
| `.accent-cyan-light` | Subtle cyan tint background |
| `.bg-success-light` | Success state background |
| `.bg-error-light` | Error state background |

### Border Colors

| Class | Usage |
|-------|-------|
| `.border-card-primary` | Standard card border |
| `.border-card-secondary` | Lighter border variant |
| `.border-interactive` | Focus/hover state |
| `.border-success` | Success border |
| `.border-error` | Error border |

### Shadow & Glow Effects

| Class | Usage |
|-------|-------|
| `.glow-cyan` | Subtle glow |
| `.glow-cyan-md` | Medium glow |
| `.glow-cyan-lg` | Strong glow (hover) |
| `.shadow-subtle` | Subtle elevation |
| `.shadow-standard` | Standard elevation |
| `.shadow-elevated` | Strong elevation |

**Usage:**
```jsx
// Cyan accent background with border
<div className="accent-cyan-light accent-cyan-border text-accent">
  Content here
</div>

// Card with shadow
<div className="bg-card-primary border border-card-primary shadow-lg">
  Card content
</div>

// Glow effect on hover
<button className="hover:glow-cyan-lg">
  Interactive element
</button>
```

---

## Typography

### Heading Scale

**Semantic Classes:**
```css
.text-heading-1 /* text-3xl sm:text-4xl lg:text-5xl */
.text-heading-2 /* text-2xl sm:text-3xl lg:text-4xl */
.text-heading-3 /* text-xl sm:text-2xl */
.text-heading-4 /* text-base sm:text-lg */
```

### Recommended Usage

| Element | Class | Details |
|---------|-------|---------|
| Page Hero | `.text-heading-1` | Main headline |
| Section Title | `.text-heading-2` | Section h2 |
| Card Title | `.text-heading-4` | Small heading |
| Body Text | `.text-body` | Main paragraph |
| Caption | `.text-small` | Metadata, timestamps |

### Font Stack

```css
/* Defined in globals/tailwind */
font-family: system-ui, -apple-system, sans-serif;
```

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Black: 900

---

## Spacing

### Section Padding

**Utility Classes:**
```css
.section-padding      /* pt-12 pb-16 px-6 sm:px-8 */
.section-padding-sm   /* pt-8 pb-12 px-6 */
.section-padding-lg   /* pt-16 pb-20 px-6 */
```

### Container Sizing

```css
.container-sm  /* max-w-3xl */
.container-md  /* max-w-4xl */
.container-lg  /* max-w-6xl */
.container-xl  /* max-w-7xl */
```

### Grid Gaps

```css
.gap-standard  /* gap-5 sm:gap-6 md:gap-7 */
.gap-compact   /* gap-3 sm:gap-4 */
.gap-relaxed   /* gap-6 sm:gap-8 */
```

### Form Spacing

```css
.form-spacing      /* space-y-5 sm:space-y-6 */
.form-input-height /* h-12 sm:h-11 */
.form-button-height /* h-12 sm:h-11 */
```

---

## Components

### SectionHeader

Reusable header component for section titles with badges.

**Import:**
```tsx
import { SectionHeader } from "@/components/common/SectionHeader";
```

**Basic Usage:**
```tsx
<SectionHeader
  badge="How It Works"
  title="From file to upload-ready in four steps"
  description="Everything happens inside the app"
  centered={true}
/>
```

**Props:**
- `badge?: string` - Optional cyan badge
- `title: string` - Main heading (required)
- `description?: string` - Subtitle text
- `centered?: boolean` - Center alignment (default: true)
- `className?: string` - Additional classes

**Features:**
✓ Reveal animations included
✓ Responsive text sizing
✓ Handled badge styling
✓ Optional centering

---

### SectionCard

Flexible card component with multiple variants.

**Import:**
```tsx
import { SectionCard } from "@/components/common/SectionCard";
```

**Basic Usage:**
```tsx
<SectionCard bordered={true} hoverable={true} variant="default">
  <h3 className="text-lg font-bold">Card Title</h3>
  <p className="text-tertiary">Card content goes here</p>
</SectionCard>
```

**Props:**
- `children: ReactNode` - Card content (required)
- `bordered?: boolean` - Show border (default: true)
- `hoverable?: boolean` - Enable hover effects (default: true)
- `glow?: boolean` - Add glow effect (default: false)
- `variant?: 'default' | 'elevated' | 'outlined'` - Style variant
- `className?: string` - Additional classes

**Variants:**
- `default` - Standard card with border
- `elevated` - Card with shadow elevation
- `outlined` - Border without background

---

### Button

Enhanced button component with multiple states.

**Features:**
```tsx
// Primary button with glow
<Button className="hover:glow-cyan-lg">
  Download
</Button>

// Outline variant
<Button variant="outline">
  View Pricing
</Button>

// Ghost variant (minimal)
<Button variant="ghost">
  Learn More
</Button>
```

**States:**
- Normal: Default appearance
- Hover: `scale-[1.02]` + shadow/glow
- Active: `scale-[0.98]` (press effect)
- Focus: Visible ring (keyboard nav)
- Disabled: Opacity reduced

---

### ContactForm

Professional contact form with validation.

**Features:**
✓ Real-time field validation
✓ Error messages with icons
✓ Loading state with spinner
✓ Success/error notifications
✓ Character counter

**Example:**
```tsx
import ContactForm from "@/components/ContactForm";

<ContactForm />
```

**Validation Rules:**
- Name: 2+ characters
- Email: Valid email format
- Message: 10+ characters

---

## Accessibility

### WCAG Compliance

✅ **Level AA** compliance for all text
✅ **Contrast Ratios:**
- Primary text: 7:1 (AAA for large text)
- Secondary text: 4.5:1 (AA minimum)
- UI components: 3:1 (AA minimum)

### Keyboard Navigation

**Focus States:**
```css
/* Visible focus ring */
button {
  focus-visible:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-primary
}

/* Tab order preserved in DOM */
```

**Skip Links:**
```tsx
<a href="#main" className="sr-only">
  Skip to main content
</a>
```

### ARIA Labels

**Form Inputs:**
```tsx
<label htmlFor="email" className="block text-sm font-semibold">
  Email Address
</label>
<input id="email" type="email" />
```

**Buttons:**
```tsx
<button aria-label="Toggle navigation menu">
  <Menu />
</button>
```

---

## Best Practices

### ✅ DO

1. **Use CSS classes instead of inline styles**
   ```tsx
   // ✓ Good
   <p className="text-secondary">Text</p>
   
   // ✗ Bad
   <p style={{ color: "hsl(215 20% 75%)" }}>Text</p>
   ```

2. **Use semantic color classes for consistency**
   ```tsx
   // ✓ Good
   <div className="bg-card-primary border border-card-primary">
   
   // ✗ Bad
   <div style={{ background: "hsl(220 40% 8%)" }}>
   ```

3. **Leverage spacing utilities for responsive design**
   ```tsx
   // ✓ Good
   <section className="pt-12 pb-16 px-6 sm:px-8">
   
   // ✗ Bad
   <section style={{ padding: "48px 24px" }}>
   ```

4. **Add focus-visible for keyboard accessibility**
   ```tsx
   // ✓ Good
   <button className="focus-visible:ring-2 focus-visible:ring-primary">
   
   // ✗ Bad
   <button>
   ```

5. **Use reveal animations for entrance effects**
   ```tsx
   // ✓ Good
   <h2 className="reveal reveal-delay-1">Title</h2>
   
   // ✗ Bad
   <h2>Title</h2>
   ```

### ❌ DON'T

1. **Avoid deep nesting of components**
   - Prefer flat component hierarchies
   - Extract reusable sub-components

2. **Don't use color hex values in JSX**
   - Use CSS classes from colors.css instead
   - Ensures consistency across the app

3. **Don't hardcode breakpoints in components**
   - Use Tailwind responsive prefixes (sm:, md:, lg:)
   - Defined in tailwind.config.ts

4. **Avoid duplicate spacing values**
   - Use spacing.css utility classes
   - Reduces CSS bloat

5. **Don't override button styles with inline styles**
   - Use Button component with variants
   - Maintains consistent interaction patterns

---

## Migration Guide

### Converting to New System

**Before:**
```tsx
<div
  className="rounded-2xl border p-6"
  style={{
    background: "hsl(220 40% 8%)",
    borderColor: "hsl(220 30% 16%)",
    color: "hsl(215 20% 65%)"
  }}
>
  <p style={{ fontSize: "14px", color: "hsl(215 20% 60%)" }}>
    Description text
  </p>
</div>
```

**After:**
```tsx
<SectionCard>
  <p className="text-quaternary">Description text</p>
</SectionCard>
```

---

## Resources

### Color Utility Classes
- See: `src/styles/colors.css`
- 60+ utility classes for colors and effects

### Spacing System
- See: `src/styles/spacing.css`
- Mobile-first responsive utilities

### Component Library
- See: `src/components/common/`
- Reusable, documented components

### UI Components
- See: `src/components/ui/`
- Base components (Button, Input, etc.)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-15 | Initial design system documentation |

---

## Questions?

Refer to specific component JSDoc comments:
```tsx
// Hover over component import to see JSDoc
import { SectionHeader } from "@/components/common/SectionHeader";
```

Or check individual component files for detailed usage examples.
