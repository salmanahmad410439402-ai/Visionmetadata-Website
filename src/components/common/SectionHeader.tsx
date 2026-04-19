import { ReactNode } from "react";

/**
 * SectionHeader Component
 *
 * A reusable header component for page sections featuring an optional badge,
 * title, and description. Handles reveal animations and centering automatically.
 *
 * @component
 *
 * @example
 * <SectionHeader
 *   badge="Features"
 *   title="Everything You Need"
 *   description="Built specifically for stock contributors"
 *   centered={true}
 * />
 *
 * @param {Object} props - Component properties
 * @param {string} [props.badge] - Optional badge text (displays in cyan accent)
 * @param {string} props.title - Main heading text
 * @param {string} [props.description] - Optional subtitle/description text
 * @param {boolean} [props.centered=true] - Whether to center-align content
 * @param {string} [props.className] - Additional CSS classes to apply
 *
 * @returns {React.ReactElement} The rendered section header
 */
interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader = ({
  badge,
  title,
  description,
  centered = true,
  className = "",
}: SectionHeaderProps) => {
  const containerClass = centered ? "text-center" : "";
  const descriptionClass = centered ? "max-w-xl mx-auto" : "max-w-2xl";

  return (
    <div className={`${containerClass} ${className}`}>
      {badge && (
        <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-cyan-light accent-cyan-border text-accent">
          {badge}
        </div>
      )}
      <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {description && (
        <p className={`reveal reveal-delay-2 ${descriptionClass} text-tertiary`}>
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * SectionLabel Component
 *
 * A small badge/label component for highlighting section categories or tags.
 * Features cyan accent styling with subtle background.
 *
 * @component
 *
 * @example
 * <SectionLabel text="How It Works" />
 *
 * @param {Object} props - Component properties
 * @param {string} props.text - The label text to display
 *
 * @returns {React.ReactElement} The rendered section label
 */
interface SectionLabelProps {
  text: string;
}

export const SectionLabel = ({ text }: SectionLabelProps) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest accent-cyan-light accent-cyan-border text-accent">
    {text}
  </div>
);
