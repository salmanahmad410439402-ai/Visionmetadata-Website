import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewType = "grid" | "list";

interface ViewToggleProps {
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewToggle = ({ viewType, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center bg-muted/50 rounded-md p-1 border border-border">
      <button
        onClick={() => onViewChange("grid")}
        className={cn(
          "p-2 rounded transition-all duration-200",
          viewType === "grid"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "p-2 rounded transition-all duration-200",
          viewType === "list"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};
