import { useState } from "react";
import { Asset, useAssets } from "@/contexts/AssetsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  Video,
  RefreshCw,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConfidenceTooltip } from "./ConfidenceTooltip";
import { AssetCardEdit } from "./AssetCardEdit";
import { InlineTagEditor } from "./InlineTagEditor";
import { downloadAssetWithMetadata } from "@/lib/metadataEmbedder";
import { checkMetadataQuality } from "@/lib/aiService";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssetCardProps {
  asset: Asset;
  onGenerate: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  showSelection: boolean;
}

export const AssetCard = ({ asset, onGenerate, isSelected, onToggleSelect, showSelection }: AssetCardProps) => {
  const { removeAsset, getRelatedAssets, updateAsset } = useAssets();
  const { activeApiKeys } = useSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  const handleCheckQuality = async () => {
    if (!asset.metadata || !asset.processedImage) return;
    setIsCheckingQuality(true);
    try {
      const report = await checkMetadataQuality(
        asset.processedImage,
        asset.metadata,
        activeApiKeys
      );
      updateAsset(asset.id, { qualityReport: report });
      toast.success("Quality check complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Quality check failed");
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
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
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to prevent browser blocking
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
          <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "ready":
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
            Ready for AI
          </Badge>
        );
      case "generating":
        return (
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 animate-pulse-glow">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Generating...
          </Badge>
        );
      case "complete":
        if (asset.qualityReport) {
          return (
            <ConfidenceTooltip
              confidence={asset.qualityReport.confidence}
              breakdown={asset.qualityReport.confidenceBreakdown}
              riskFlags={asset.qualityReport.riskAnalysis?.flags ?? []}
            />
          );
        }
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
            <Check className="w-3 h-3 mr-1" />
            Done
          </Badge>
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
    <Card 
      style={{ '--card-color': 'hsl(var(--primary))' } as React.CSSProperties}
      className={cn(
      "overflow-hidden glass-panel neon-hover-card",
      isSelected && "ring-2 ring-primary border-primary"
    )}>
      {/* Selection Checkbox */}
      {showSelection && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="bg-background/80 backdrop-blur"
          />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.file.name}
            className="w-full h-full object-cover"
            onClick={showSelection ? onToggleSelect : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Size Overlay */}
        <div className="absolute top-2 left-8 flex gap-1">
          <span className="px-2 py-0.5 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-md border border-border/30">
            {formatSize(asset.originalSize)}
          </span>
          {asset.compressedSize && (
            <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-medium rounded-md">
              → {formatSize(asset.compressedSize)}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>

        {/* Video/Vertical Badges */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {asset.type === "video" && (
            <Badge variant="outline" className="bg-background/70 backdrop-blur text-foreground border-border text-xs">
              <Video className="w-3 h-3 mr-1" />
              Video
            </Badge>
          )}
          {asset.isVertical && (
            <Badge variant="outline" className="bg-background/70 backdrop-blur text-foreground border-border text-xs">
              9:16
            </Badge>
          )}
          {asset.combinedExtensions && (
            <Badge variant="outline" className="bg-background/70 backdrop-blur text-foreground border-border text-xs">
              Vector + Preview
            </Badge>
          )}
          {asset.warnings?.includes('low_resolution') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="bg-amber-500/90 text-white border-amber-600/50 text-xs cursor-help">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  &lt; 4MP
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Resolution is below the 4 Megapixel minimum required by Adobe Stock.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Trademark HIGH Risk Banner — shown only after quality check */}
        {asset.qualityReport?.riskAnalysis?.severity === "HIGH" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 backdrop-blur-sm px-2 py-1.5 flex items-start gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
              <div className="text-white">
                <p className="text-[10px] font-bold uppercase tracking-wide leading-tight">⚠ Trademark Risk</p>
                {(asset.qualityReport?.riskAnalysis?.flags ?? []).slice(0, 2).map((f, i) => (
                  <p key={i} className="text-[9px] opacity-90 leading-tight">{f}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 h-7 w-7 bg-background/60 backdrop-blur-sm hover:bg-destructive hover:text-white text-muted-foreground rounded-lg transition-all"
          onClick={() => removeAsset(asset.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* File Name */}
        <p className="text-sm text-muted-foreground truncate">
          {asset.combinedExtensions ? `${asset.file.name.split('.').slice(0, -1).join('.')} (${asset.combinedExtensions})` : asset.file.name}
        </p>

        {/* Error Message with Regenerate Button */}
        {asset.status === "error" && (
          <div className="space-y-2">
            <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
              {asset.error || "Generation failed"}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-primary/30 text-primary"
              onClick={onGenerate}
            >
              <RefreshCw className="h-4 w-4" />
              Retry Generation
            </Button>
          </div>
        )}

        {/* Edit Mode */}
        <AnimatePresence mode="wait">
          {isEditing && asset.metadata ? (
            <AssetCardEdit asset={asset} onClose={() => setIsEditing(false)} />
          ) : asset.metadata ? (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Title</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(asset.metadata!.title, "title")}
                  >
                    {copiedField === "title" ? (
                      <Check className="h-3 w-3 text-accent" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm line-clamp-2">{asset.metadata.title}</p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Description</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(asset.metadata!.description, "description")}
                  >
                    {copiedField === "description" ? (
                      <Check className="h-3 w-3 text-accent" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {asset.metadata.description}
                </p>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Keywords ({asset.metadata.keywords.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(asset.metadata!.keywords.join(", "), "keywords")}
                  >
                    {copiedField === "keywords" ? (
                      <Check className="h-3 w-3 text-accent" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <InlineTagEditor 
                  tags={asset.metadata.keywords} 
                  onChange={(newTags) => updateAsset(asset.id, { metadata: { ...asset.metadata!, keywords: newTags } })} 
                />
              </div>

              {/* Platform Readiness — shown only after quality check */}
              {asset.qualityReport?.platformReadiness && (
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(asset.qualityReport.platformReadiness).map(([platform, status]) => (
                    <Badge
                      key={platform}
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        status === "READY" && "bg-accent/10 text-accent border-accent/30",
                        status === "REVIEW" && "bg-secondary text-secondary-foreground border-secondary",
                        status === "NOT_READY" && "bg-destructive/10 text-destructive border-destructive/30"
                      )}
                    >
                      {platform.replace(/([A-Z])/g, " $1").trim()}: {status}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Risk Flags — shown only after quality check */}
              <AnimatePresence>
                {(asset.qualityReport?.riskAnalysis?.flags?.length ?? 0) > 0 &&
                  (asset.qualityReport?.confidence ?? 100) < 85 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-2 bg-secondary border border-border rounded text-xs"
                    >
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">Rejection Risk</span>
                      </div>
                      {asset.qualityReport?.riskAnalysis?.flags?.map((flag, i) => (
                        <p key={i} className="text-muted-foreground">• {flag.replace(/_/g, " ")}</p>
                      ))}
                      {asset.qualityReport?.riskAnalysis?.reviewerReasoning?.map((r, i) => (
                        <p key={`r-${i}`} className="text-muted-foreground/70 text-[10px] mt-0.5">↳ {r}</p>
                      ))}
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* SVG Embedding Notice — shown only for .svg files */}
              {/\.svg$/i.test(asset.file.name) && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium leading-tight">.svg — Metadata embedding not supported</p>
                    <p className="text-amber-400/70 mt-0.5 leading-tight">Use <span className="font-semibold text-amber-400">Export CSV</span> to save your metadata for this file.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-1.5 pt-3 border-t border-border/50">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={onGenerate}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1",
                        asset.qualityReport && "border-accent/40 text-accent"
                      )}
                      onClick={handleCheckQuality}
                      disabled={isCheckingQuality || !asset.metadata}
                    >
                      {isCheckingQuality ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{asset.qualityReport ? "Re-check Quality" : "Check Quality"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25 rounded-lg transition-all"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center py-4">
              {asset.status === "ready" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={onGenerate}
                  disabled={false}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Metadata
                </Button>
              )}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
