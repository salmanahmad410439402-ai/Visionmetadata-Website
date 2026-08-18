import { useState, useRef } from "react";
import { Asset, useAssets } from "@/contexts/AssetsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, GripVertical, Save, RotateCcw } from "lucide-react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";

interface AssetCardEditProps {
  asset: Asset;
  onClose: () => void;
}

interface KeywordItemProps {
  keyword: string;
  index: number;
  onRemove: () => void;
}

const KeywordItem = ({ keyword, index, onRemove }: KeywordItemProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={keyword}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-1"
    >
      <Badge
        variant="secondary"
        className={cn(
          "text-xs cursor-grab active:cursor-grabbing flex items-center gap-1",
          index < 10 && "bg-primary/20 text-primary border-primary/30"
        )}
      >
        <GripVertical
          className="w-3 h-3 text-muted-foreground"
          onPointerDown={(e) => controls.start(e)}
        />
        <span>{keyword}</span>
        <X
          className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
          onClick={onRemove}
        />
      </Badge>
    </Reorder.Item>
  );
};

export const AssetCardEdit = ({ asset, onClose }: AssetCardEditProps) => {
  const { updateAsset } = useAssets();
  const [title, setTitle] = useState(asset.metadata?.title || "");
  const [description, setDescription] = useState(asset.metadata?.description || "");
  const [keywords, setKeywords] = useState<string[]>(asset.metadata?.keywords || []);
  const [newKeyword, setNewKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
      inputRef.current?.focus();
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSave = () => {
    if (!asset.metadata) return;

    updateAsset(asset.id, {
      metadata: {
        ...asset.metadata,
        title,
        description,
        keywords,
      },
    });

    // Sync metadata to related assets if they exist
    if (asset.relatedAssetIds) {
      asset.relatedAssetIds.forEach(id => {
        updateAsset(id, {
          metadata: {
            ...asset.metadata, // merge existing in case of drift
            title,
            description,
            keywords,
            // Sync other AI fields if they exist on the primary
            confidence: asset.metadata?.confidence,
            confidenceBreakdown: asset.metadata?.confidenceBreakdown,
            riskAnalysis: asset.metadata?.riskAnalysis,
            platformReadiness: asset.metadata?.platformReadiness,
            isAIGenerated: asset.metadata?.isAIGenerated,
            noPeopleDetected: asset.metadata?.noPeopleDetected,
          } as any, // Cast to avoid partial type issues during merge
        });
      });
    }
    onClose();
  };

  const handleReset = () => {
    setTitle(asset.metadata?.title || "");
    setDescription(asset.metadata?.description || "");
    setKeywords(asset.metadata?.keywords || []);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
          className="bg-muted/50"
        />
        <span className="text-xs text-muted-foreground">
          {title.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description..."
          className="bg-muted/50 min-h-[80px]"
        />
        <span className="text-xs text-muted-foreground">
          {description.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Keywords ({keywords.length}) - Drag to reorder
        </label>

        {/* Add keyword input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add keyword..."
            className="bg-muted/50 flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Draggable keywords */}
        <Reorder.Group
          axis="x"
          values={keywords}
          onReorder={setKeywords}
          className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 bg-muted/30 rounded-md"
        >
          {keywords.map((keyword, index) => (
            <KeywordItem
              key={`${keyword}-${index}`}
              keyword={keyword}
              index={index}
              onRemove={() => handleRemoveKeyword(keyword)}
            />
          ))}
        </Reorder.Group>

        <p className="text-xs text-muted-foreground">
          First 10 keywords (highlighted) are most important for SEO
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={handleReset}
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1 bg-primary hover:bg-primary/90"
          onClick={handleSave}
        >
          <Save className="h-3 w-3" />
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
};
