import { useState } from "react";
import { Asset, useAssets } from "@/contexts/AssetsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  Video,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceTooltip } from "./ConfidenceTooltip";
import { downloadAssetWithMetadata } from "@/lib/metadataEmbedder";
import { toast } from "sonner";

interface AssetListItemProps {
  asset: Asset;
  onGenerate: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  showSelection: boolean;
}

export const AssetListItem = ({ asset, onGenerate, isSelected, onToggleSelect, showSelection }: AssetListItemProps) => {
  const { removeAsset, getRelatedAssets } = useAssets();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API can fail if document is not focused or permission denied
      toast.error("Failed to copy — please copy manually.");
    }
  };

  const handleDownload = async () => {
    if (!asset.metadata) {
      toast.error("No metadata to download");
      return;
    }

    try {
      setIsDownloading(true);
      await downloadAssetWithMetadata(asset);
      toast.success(`Downloaded ${asset.file.name} with metadata`);

      // Download related assets if exist
      if (asset.relatedAssetIds) {
        const related = getRelatedAssets(asset.id);
        for (const rel of related) {
          if (rel.metadata) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
            await downloadAssetWithMetadata(rel);
            toast.success(`Downloaded ${rel.file.name} with metadata`);
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = () => {
    switch (asset.status) {
      case "uploading":
      case "processing":
        return (
          <Badge variant="secondary" className="bg-secondary/50">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "ready":
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
            Ready
          </Badge>
        );
      case "generating":
        return (
          <Badge variant="secondary" className="bg-primary/20 text-primary animate-pulse-glow">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Generating
          </Badge>
        );
      case "complete":
        const confidence = asset.metadata?.confidence ?? 0;
        return (
          <ConfidenceTooltip
            confidence={confidence}
            breakdown={asset.metadata?.confidenceBreakdown}
            riskFlags={asset.metadata?.riskAnalysis?.flags ?? []}
          />
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors",
      isSelected && "ring-2 ring-primary border-primary"
    )}>
      {/* Selection Checkbox */}
      {showSelection && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
        />
      )}

      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
        {asset.type === "video" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center">
            <Video className="w-3 h-3 inline" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {asset.combinedExtensions ? `${asset.file.name.split('.').slice(0, -1).join('.')} (${asset.combinedExtensions})` : asset.file.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {asset.combinedExtensions && (
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="h-4 px-1 text-[10px]">Vector + Preview</Badge>
              <span>•</span>
            </span>
          )}
          <span>{formatSize(asset.originalSize)}</span>
          {asset.isVertical && <span>• 9:16</span>}
        </div>
        {asset.metadata && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {asset.metadata.title}
          </p>
        )}
      </div>

      {/* Keywords Count */}
      {asset.metadata && (
        <div className="hidden md:flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {asset.metadata.keywords.length} keywords
          </Badge>
        </div>
      )}

      {/* Status */}
      <div className="flex-shrink-0">
        {getStatusBadge()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {asset.status === "error" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={onGenerate}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {asset.status === "ready" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onGenerate}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}

        {asset.metadata && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleCopy(asset.metadata!.keywords.join(", "), "keywords")}
            >
              {copiedField === "keywords" ? (
                <Check className="h-4 w-4 text-accent" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => removeAsset(asset.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
