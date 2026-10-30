import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Plus, ExternalLink, CheckCircle2, Sparkles } from "lucide-react";
import { GEMINI_QUOTA_VIDEO_ID } from "@/components/TutorialsSection";

export const OPEN_QUOTA_TUTORIAL_EVENT = "tagyfy:open-quota-tutorial";

/**
 * Triggers the in-app Gemini Free Quota video tutorial modal from anywhere inside
 * the /tool workspace without navigating away or losing uploaded assets.
 */
export function openQuotaTutorialModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_QUOTA_TUTORIAL_EVENT));
  }
}

interface QuotaTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
}

export const QuotaTutorialModal = ({
  open,
  onOpenChange,
  onOpenSettings,
}: QuotaTutorialModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[95vw] max-w-3xl max-h-[92vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-border/80 p-5 sm:p-7 rounded-2xl md:rounded-3xl shadow-2xl">
      <DialogHeader className="text-left space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/15 border border-primary/30 text-primary">
            <Sparkles className="w-3 h-3" />
            Free Quota Recovery Guide
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Key className="w-3 h-3" />
            Session Files Preserved
          </span>
        </div>

        <DialogTitle className="text-lg sm:text-2xl font-bold text-foreground leading-snug pr-6">
          How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects
        </DialogTitle>

        <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Generating multiple Gemini API keys inside a{" "}
          <strong className="text-foreground font-semibold">single Google Cloud project</strong>{" "}
          does not multiply your free quota — all keys in that project share one project-level
          limit. Watch how to create separate projects (1 key per project) so Tagyfy rotates across
          independent free quotas.
        </DialogDescription>
      </DialogHeader>

      {/* Responsive 16:9 YouTube Embed — Lazy-loaded, No Autoplay */}
      {open && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border/80 bg-black shadow-xl my-2">
          <iframe
            src={`https://www.youtube.com/embed/${GEMINI_QUOTA_VIDEO_ID}?rel=0`}
            title="How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      )}

      {/* Quick 3-Step Recovery Checklist */}
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">
          Quick 3-Step Fix to Resume Your Batch
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Open Google AI Studio / Google Cloud and create a{" "}
              <strong className="text-foreground">new separate Google Cloud project</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Generate <strong className="text-foreground">one dedicated Gemini API key</strong>{" "}
              inside each separate project (avoid multiple keys in the same project).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Click <strong className="text-foreground">Add New Key in Settings</strong> below,
              paste or bulk-import your keys, and click <strong className="text-foreground">Retry Failed</strong>.
            </span>
          </li>
        </ul>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <a
          href="/tutorials#gemini-api-quota-tutorial"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1"
        >
          Open written guide in new tab
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            Add New Key in Settings
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
