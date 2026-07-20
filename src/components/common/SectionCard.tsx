import { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  hoverable?: boolean;
  glow?: boolean;
  variant?: "default" | "elevated" | "outlined";
}

export const SectionCard = ({
  children,
  className = "",
  bordered = true,
  hoverable = true,
  glow = false,
  variant = "default",
}: SectionCardProps) => {
  const baseClass =
    "rounded-2xl p-6 sm:p-7 transition-all duration-300 bg-card-primary";

  const borderClass = bordered ? "border border-card-primary" : "";

  const hoverClass = hoverable
    ? "hover:border-card-secondary hover:scale-[1.01] hover:shadow-lg"
    : "";

  const glowClass = glow ? "card-glow" : "";

  const variantClass = {
    default: "",
    elevated:
      "shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20",
    outlined: "border-2 border-card-secondary bg-transparent",
  }[variant];

  return (
    <div
      className={`${baseClass} ${borderClass} ${hoverClass} ${glowClass} ${variantClass} ${className}`}
    >
      {children}
    </div>
  );
};
