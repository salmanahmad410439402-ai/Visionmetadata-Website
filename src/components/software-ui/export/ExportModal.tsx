import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Asset } from "@/contexts/AssetsContext";
import { exportAssets } from "@/lib/csvExporter";
import { Download, FileSpreadsheet, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
}

type ExportFormat = "general" | "adobe" | "freepik" | "shutterstock" | "dreamstime" | "vecteezy" | "123rf" | "all";

export const ExportModal = ({ open, onOpenChange, assets }: ExportModalProps) => {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<ExportFormat | null>(null);

  // ── Vecteezy license toggle ────────────────────────────────────────────────
  const [vecteezyLicense, setVecteezyLicense] = useState<"Free" | "Pro">("Free");

  // ── Freepik AI options ─────────────────────────────────────────────────────
  const [freepikIsAI, setFreepikIsAI] = useState(false);
  const [freepikAiTool, setFreepikAiTool] = useState("");

  // ── Additional Vector Files options ────────────────────────────────────────
  const [includeVectorEps, setIncludeVectorEps] = useState(false);
  const [includeVectorAi, setIncludeVectorAi] = useState(false);
  const [includeVectorSvg, setIncludeVectorSvg] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    // Validate: if exporting Freepik with AI on, require the tool name
    if ((format === "freepik" || format === "all") && freepikIsAI && !freepikAiTool.trim()) {
      toast.error("Please enter the AI tool name for Freepik export.");
      return;
    }

    setExporting(true);
    try {
      await exportAssets(assets, format, {
        vecteezyLicense,
        freepikIsAI,
        freepikAiTool: freepikAiTool.trim(),
        includeVectorEps,
        includeVectorAi,
        includeVectorSvg
      });
      setExported(format);
      toast.success(`Exported ${assets.length} assets for ${format === "all" ? "all platforms" : format}`);
      setTimeout(() => setExported(null), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  // ── The 4 simple platforms — unchanged ────────────────────────────────────
  const simplePlatforms = [
    {
      id: "general" as const,
      name: "General CSV",
      desc: "Filename · Title · Description · Keywords",
      color: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    },
    {
      id: "adobe" as const,
      name: "Adobe Stock",
      desc: "Full title · comma-stripped · keywords",
      color: "bg-destructive/20 text-destructive border-destructive/30",
    },
    {
      id: "shutterstock" as const,
      name: "Shutterstock",
      desc: "Column order enforced · dual categories · editorial flag",
      color: "bg-accent/20 text-accent border-accent/30",
    },
    {
      id: "dreamstime" as const,
      name: "Dreamstime",
      desc: "Image Name · full description · category",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    {
      id: "123rf" as const,
      name: "123RF",
      desc: "Numeric categories · editorial flag",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-popover border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Export CSV
          </DialogTitle>
          <DialogDescription>
            Export metadata for {assets.length} asset{assets.length !== 1 ? "s" : ""} to stock platforms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">

          {/* ── Global CSV Options (Vector Support) ───────────────────────── */}
          <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-2 mb-2">
            <div>
              <Label className="text-sm font-medium">Additional File Types</Label>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                Automatically generate metadata rows for your vector files alongside JPGs. This saves you from uploading heavy vector files to the app.
              </p>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="opt-eps" checked={includeVectorEps} onCheckedChange={(c) => setIncludeVectorEps(!!c)} />
                <Label htmlFor="opt-eps" className="text-sm cursor-pointer font-medium">.eps</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="opt-ai" checked={includeVectorAi} onCheckedChange={(c) => setIncludeVectorAi(!!c)} />
                <Label htmlFor="opt-ai" className="text-sm cursor-pointer font-medium">.ai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="opt-svg" checked={includeVectorSvg} onCheckedChange={(c) => setIncludeVectorSvg(!!c)} />
                <Label htmlFor="opt-svg" className="text-sm cursor-pointer font-medium">.svg</Label>
              </div>
            </div>
          </div>

          {/* ── Simple platforms (no options) ─────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {simplePlatforms.map((platform) => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-2 px-3"
                  onClick={() => handleExport(platform.id)}
                  disabled={exporting}
                  title={platform.desc}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm">{platform.name}</span>
                    </div>
                    <Badge variant="outline" className={`${platform.color} text-[9px] px-1 py-0 h-4`}>CSV</Badge>
                  </div>
                  {exported === platform.id ? (
                    <Check className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* ── Vecteezy — Free / Pro license toggle ──────────────────────── */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <div className="w-full border border-green-500/40 rounded-lg overflow-hidden">
              {/* Top row: click to export */}
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-4 rounded-none hover:bg-muted/50"
                onClick={() => handleExport("vecteezy")}
                disabled={exporting}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Vecteezy</span>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">CSV</Badge>
                    <Badge variant="outline" className={
                      vecteezyLicense === "Pro"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
                        : "bg-muted text-muted-foreground border-border text-[10px]"
                    }>
                      {vecteezyLicense}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Filename · title · description · keywords · license</p>
                </div>
                {exported === "vecteezy" ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>

              {/* License selector */}
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-t border-green-500/20">
                <span className="text-xs text-muted-foreground">License:</span>
                <div className="flex rounded-md overflow-hidden border border-border">
                  <button
                    onClick={() => setVecteezyLicense("Free")}
                    className={`text-xs px-3 py-1 transition-colors ${
                      vecteezyLicense === "Free"
                        ? "bg-green-500/20 text-green-400 font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setVecteezyLicense("Pro")}
                    className={`text-xs px-3 py-1 transition-colors border-l border-border ${
                      vecteezyLicense === "Pro"
                        ? "bg-amber-500/20 text-amber-400 font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Pro
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground ml-auto">Toggle then click download</span>
              </div>
            </div>
          </motion.div>

          {/* ── Freepik — AI content options ──────────────────────────────── */}
          <div className="w-full border border-primary/40 rounded-lg overflow-hidden">
            {/* Top row: click to export */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-4 rounded-none hover:bg-muted/50"
                onClick={() => handleExport("freepik")}
                disabled={exporting}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Freepik</span>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">CSV</Badge>
                    {freepikIsAI && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                        AI declared
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {freepikIsAI
                      ? "Recreation prompt auto-filled from each asset's metadata"
                      : "Title · description · tags · recreation prompt · category"}
                  </p>
                </div>
                {exported === "freepik" ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </motion.div>

            {/* AI toggle row */}
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-t border-primary/20">
              <Switch
                id="freepik-ai-toggle"
                checked={freepikIsAI}
                onCheckedChange={setFreepikIsAI}
                className="scale-90"
              />
              <Label htmlFor="freepik-ai-toggle" className="text-xs text-muted-foreground cursor-pointer">
                AI-generated content
              </Label>
            </div>

            {/* Conditional: AI tool input — only shown when toggle is ON */}
            <AnimatePresence>
              {freepikIsAI && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-muted/20 border-t border-primary/20 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      AI tool used <span className="text-primary">*</span>
                    </Label>
                    <Input
                      value={freepikAiTool}
                      onChange={(e) => setFreepikAiTool(e.target.value)}
                      placeholder="e.g. Midjourney v6, DALL-E 3, Adobe Firefly..."
                      className="h-8 text-xs bg-background border-border"
                    />
                    <p className="text-[10px] text-muted-foreground pt-1">
                      Each image's recreation prompt is auto-filled from its own AI-generated metadata.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Export All ────────────────────────────────────────────────── */}
          <div className="pt-2 border-t border-border">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => handleExport("all")}
              disabled={exporting}
            >
              {exported === "all" ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Exported All
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Platforms
                </>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
