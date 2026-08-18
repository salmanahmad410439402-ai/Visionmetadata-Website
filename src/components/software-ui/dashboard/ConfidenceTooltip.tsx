import { ConfidenceBreakdown } from "@/contexts/AssetsContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ConfidenceTooltipProps {
  confidence: number;
  breakdown?: ConfidenceBreakdown;
  riskFlags?: string[];
}

export const ConfidenceTooltip = ({ confidence, breakdown, riskFlags }: ConfidenceTooltipProps) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 90) return "text-accent";
    if (value >= 80) return "text-primary";
    if (value >= 70) return "text-muted-foreground";
    return "text-destructive";
  };

  const getBadgeStyle = (value: number) => {
    if (value >= 90) return "bg-accent/20 text-accent border-accent/30";
    if (value >= 80) return "bg-primary/20 text-primary border-primary/30";
    if (value >= 70) return "bg-secondary text-secondary-foreground border-secondary";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const getBarColor = (value: number) => {
    const percentage = (value / 25) * 100;
    if (percentage >= 80) return "bg-accent";
    if (percentage >= 60) return "bg-primary";
    if (percentage >= 40) return "bg-muted-foreground";
    return "bg-destructive";
  };

  const categories = breakdown
    ? [
        { label: "Subject Clarity", value: breakdown.subjectClarity },
        { label: "Differentiator", value: breakdown.differentiatorStrength },
        { label: "Keywords", value: breakdown.keywordPrecision },
        { label: "Compliance", value: breakdown.complianceSafety },
      ]
    : [];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className={`cursor-help ${getBadgeStyle(confidence)}`}>
          {confidence}%
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="left" className="w-64 p-3 bg-popover border-border">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence Score</span>
            <span className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}%
            </span>
          </div>

          {/* Breakdown Bars */}
          {breakdown && (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{cat.label}</span>
                    <span className="font-medium">{cat.value}/25</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getBarColor(cat.value)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.value / 25) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Risk Flags */}
          {riskFlags && riskFlags.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground">Risk Flags:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {riskFlags.map((flag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded"
                  >
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="pt-2 border-t border-border text-[10px] text-muted-foreground">
            <div className="flex justify-between">
              <span>90+: Submit Ready</span>
              <span>80-89: Review</span>
              <span>&lt;80: Edit</span>
            </div>
          </div>
        </motion.div>
      </TooltipContent>
    </Tooltip>
  );
};
