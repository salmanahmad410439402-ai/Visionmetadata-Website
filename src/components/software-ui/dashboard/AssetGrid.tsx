import { Asset, useAssets } from "@/contexts/AssetsContext";
import { AssetCard } from "./AssetCard";
import { AssetListItem } from "./AssetListItem";
import { ViewToggle, ViewType } from "./ViewToggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CheckSquare, XSquare, CloudUpload, ArrowDownUp } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AssetGridProps {
  assets: Asset[];
  onGenerate: (assetId: string) => void;
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedAssets: string[];
  onToggleSelect: (assetId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
  showSelection: boolean;
  onToggleSelectionMode: () => void;
  onDeployFtp?: () => void;
  sortFilter: "all" | "generated" | "remaining" | "failed";
  onSortFilterChange: (filter: "all" | "generated" | "remaining" | "failed") => void;
}

export const AssetGrid = ({
  assets,
  onGenerate,
  viewType,
  onViewChange,
  selectedAssets,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onDeleteAll,
  showSelection,
  onToggleSelectionMode,
  onDeployFtp,
  sortFilter,
  onSortFilterChange,
}: AssetGridProps) => {
  const allSelected = assets.length > 0 && selectedAssets.length === assets.length;
  const someSelected = selectedAssets.length > 0;

  return (
    <div className="space-y-4">
      {/* Header with View Toggle and Selection Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Asset Dashboard</h2>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {onDeployFtp && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeployFtp}
                className="gap-1 border-primary/50 text-primary hover:bg-primary/10"
              >
                <CloudUpload className="h-4 w-4" />
                <span className="hidden sm:inline">Deploy (FTP)</span>
              </Button>
            )}

            {someSelected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete ({selectedAssets.length})</span>
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteAll}
                className="gap-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete All</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border/50 bg-background/50 backdrop-blur-sm">
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline capitalize">
                  {sortFilter === "all" ? "Sort: Default" : `Sort: ${sortFilter} First`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onSortFilterChange("all")} className={sortFilter === "all" ? "bg-accent/50" : ""}>
                Default (Upload Order)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortFilterChange("generated")} className={sortFilter === "generated" ? "bg-accent/50" : ""}>
                Generated First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortFilterChange("remaining")} className={sortFilter === "remaining" ? "bg-accent/50" : ""}>
                Remaining First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortFilterChange("failed")} className={sortFilter === "failed" ? "bg-accent/50" : ""}>
                Failed First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewToggle viewType={viewType} onViewChange={onViewChange} />
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No assets match your search.
        </div>
      ) : viewType === "grid" ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <AssetCard
                asset={asset}
                onGenerate={() => onGenerate(asset.id)}
                isSelected={selectedAssets.includes(asset.id)}
                onToggleSelect={() => onToggleSelect(asset.id)}
                showSelection={showSelection}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.2) }}
            >
              <AssetListItem
                asset={asset}
                onGenerate={() => onGenerate(asset.id)}
                isSelected={selectedAssets.includes(asset.id)}
                onToggleSelect={() => onToggleSelect(asset.id)}
                showSelection={showSelection}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
