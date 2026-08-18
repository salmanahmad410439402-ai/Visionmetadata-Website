import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent, DialogTitle } from './dialog';
import { Upload, RefreshCw, Trash2, FileDown, Settings, Sparkles, FileArchive } from 'lucide-react';
import { toast } from 'sonner';

interface CommandPaletteProps {
  onUpload: () => void;
  onRetryFailed: () => void;
  onClearAll: () => void;
  onExportCsv: () => void;
  onExportZip: () => void;
  onOpenSettings: () => void;
  onGenerateAll: () => void;
  hasAssets: boolean;
  hasFailed: boolean;
  hasReady: boolean;
}

export function CommandPalette({
  onUpload,
  onRetryFailed,
  onClearAll,
  onExportCsv,
  onExportZip,
  onOpenSettings,
  onGenerateAll,
  hasAssets,
  hasFailed,
  hasReady
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 bg-transparent border-none shadow-2xl max-w-2xl sm:max-w-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command 
          className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-card/95 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_hsl(190_95%_50%/0.15)]"
          loop
        >
          <div className="flex items-center border-b border-white/10 px-3">
            <Command.Input 
              placeholder="Type a command or search..." 
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-white" 
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
              <kbd className="font-sans">esc</kbd>
            </div>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 text-white">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            
            <Command.Group heading="Quick Actions" className="text-xs text-muted-foreground px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              <Command.Item 
                onSelect={() => runCommand(onUpload)}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload Assets</span>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => runCommand(onOpenSettings)}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Open Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-white/10 my-1" />

            <Command.Group heading="Metadata Tasks" className="text-xs text-muted-foreground px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              <Command.Item 
                onSelect={() => {
                  if (!hasReady) {
                    toast.error("No ready assets to generate.");
                    return;
                  }
                  runCommand(onGenerateAll);
                }}
                disabled={!hasReady}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-white aria-disabled:opacity-50 aria-disabled:pointer-events-none transition-colors"
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span>Generate All Ready Assets</span>
              </Command.Item>

              <Command.Item 
                onSelect={() => {
                  if (!hasFailed) {
                    toast.error("No failed assets to retry.");
                    return;
                  }
                  runCommand(onRetryFailed);
                }}
                disabled={!hasFailed}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-red-500/20 aria-selected:text-red-400 aria-disabled:opacity-50 aria-disabled:pointer-events-none transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Retry Failed Assets</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-white/10 my-1" />

            <Command.Group heading="Export & Manage" className="text-xs text-muted-foreground px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-semibold">
              <Command.Item 
                onSelect={() => {
                  if (!hasAssets) return toast.error("No assets to export.");
                  runCommand(onExportCsv);
                }}
                disabled={!hasAssets}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-white aria-disabled:opacity-50 aria-disabled:pointer-events-none transition-colors"
              >
                <FileDown className="mr-2 h-4 w-4" />
                <span>Export CSV</span>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => {
                  if (!hasAssets) return toast.error("No assets to export.");
                  runCommand(onExportZip);
                }}
                disabled={!hasAssets}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-primary/20 aria-selected:text-white aria-disabled:opacity-50 aria-disabled:pointer-events-none transition-colors"
              >
                <FileArchive className="mr-2 h-4 w-4" />
                <span>Download ZIP</span>
              </Command.Item>

              <Command.Item 
                onSelect={() => {
                  if (!hasAssets) return toast.error("No assets to clear.");
                  runCommand(onClearAll);
                }}
                disabled={!hasAssets}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none aria-selected:bg-red-500/20 aria-selected:text-red-400 aria-disabled:opacity-50 aria-disabled:pointer-events-none transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Clear All Assets</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
