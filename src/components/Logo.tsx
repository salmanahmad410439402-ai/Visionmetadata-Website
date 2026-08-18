import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showPro?: boolean;
}

export const Logo = ({ size = "md", showPro = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg", pro: "text-[8px] px-1" },
    md: { icon: 32, text: "text-xl", pro: "text-[10px] px-1.5" },
    lg: { icon: 48, text: "text-3xl", pro: "text-xs px-2" },
  };

  const { icon, text, pro } = sizes[size];

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Custom Icon from User */}
      <div className="relative flex items-center justify-center">
        <img
          src="/icon.jpg"
          alt="Tagyfy Logo"
          width={icon}
          height={icon}
          className="rounded-full object-contain badge-glow relative z-10"
          onError={(e) => {
            // Fallback to icon.png if icon.jpg is not yet placed in public/
            (e.target as HTMLImageElement).src = '/icon.png';
          }}
        />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary opacity-20 blur-md" />
      </div>

      {/* Text */}
      <div className="flex items-center gap-1.5">
        <span className={`${text} font-bold text-foreground`}>Vision</span>
        <span className={`${text} font-bold text-gradient`}>Metadata</span>
        
        {showPro && (
          <motion.span
            className={`${pro} py-0.5 bg-primary text-primary-foreground font-semibold rounded uppercase tracking-wider`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            PRO
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};
