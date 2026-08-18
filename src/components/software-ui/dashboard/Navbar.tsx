import { Search, Download, Sparkles, Upload, Settings, FileArchive, Loader2, Table, Square, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useSettings } from "@/contexts/SettingsContext";
import { useAssets } from "@/contexts/AssetsContext";
import { motion } from "framer-motion";
import { isDesktop } from "@/lib/env";

interface NavbarProps {
  onUpload: () => void;
  onExportCSV: () => void;
  onBulkEdit: () => void;
  onGenerateAll: () => Promise<void> | void;
  onRetryAllFailed: () => Promise<void> | void;
  onDownloadZip: () => Promise<void> | void;
  onCancelGeneration: () => void;
  isDownloadingZip: boolean;
  isGenerating?: boolean;
  errorCount: number;
  isOnline?: boolean;
}

export const Navbar = ({ onUpload, onExportCSV, onBulkEdit, onGenerateAll, onRetryAllFailed, onDownloadZip, onCancelGeneration, isDownloadingZip, isGenerating: isGeneratingProp, errorCount, isOnline = true }: NavbarProps) => {
  const { setIsSettingsOpen, metadataSettings } = useSettings();
  const { searchQuery, setSearchQuery, assets, processingQueue } = useAssets();

  const readyCount = assets.filter((a) => a.status === "ready").length;
  const completeCount = assets.filter((a) => a.metadata).length;
  const isGenerating = isGeneratingProp ?? processingQueue.length > 0;

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 navbar-glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Logo size="md" />

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/40 border-border/50 rounded-lg focus:bg-muted/70 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Connection Status Indicator */}
            <div className={`hidden md:flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              isOnline 
                ? "bg-green-500/10 text-green-700 dark:text-green-400" 
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
              onClick={onDownloadZip}
              disabled={completeCount === 0 || isDownloadingZip}
            >
              {isDownloadingZip ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileArchive className="h-4 w-4" />
              )}
              <span className="hidden lg:inline">
                {isDownloadingZip 
                  ? (isDesktop() ? "Saving Files..." : "Creating Zip...") 
                  : (isDesktop() ? `Embed & Save Files (${completeCount})` : `Download Zip (${completeCount})`)}
              </span>
            </Button>

            <Button variant="outline" size="sm" className="gap-2" onClick={onExportCSV} disabled={isGenerating}>
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Export CSV</span>
            </Button>

            {completeCount > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={onBulkEdit}>
                <Table className="h-4 w-4" />
                <span className="hidden lg:inline">Bulk Edit</span>
              </Button>
            )}

            {errorCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                onClick={onRetryAllFailed}
                disabled={isGenerating}
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                <span className="hidden lg:inline">
                  {isGenerating ? "Retrying..." : `Retry Failed (${errorCount})`}
                </span>
              </Button>
            )}

            {/* ── Generate All / Stop toggle ──────────────────────────────
                When a batch is running, the Generate button becomes a red Stop
                button. Clicking it sets isCancelledRef=true in Dashboard — all
                workers stop grabbing new assets after their current one finishes.
                The button is always visible so the user has a clear escape hatch
                even mid-batch on 100+ asset queues.
            ────────────────────────────────────────────────────────────── */}
            {isGenerating ? (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-lg animate-pulse"
                onClick={onCancelGeneration}
              >
                <Square className="h-4 w-4 fill-current" />
                <span className="hidden lg:inline">Stop Processing</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onGenerateAll}
                disabled={readyCount === 0}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline">
                  Generate All ({readyCount})
                </span>
              </Button>
            )}

            <Button size="sm" className="gap-2 btn-primary-glow font-semibold" onClick={onUpload}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Assets</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="relative overflow-hidden w-12 h-12 flex items-center justify-center p-0 btn-primary-glow"
            >
              <Settings className="w-8 h-8 z-10" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
