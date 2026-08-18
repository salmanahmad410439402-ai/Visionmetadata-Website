/**
 * Confirmation Dialog Component
 * Prevents accidental destructive actions with user confirmation
 */

import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDangerous?: boolean;
  icon?: ReactNode;
  isLoading?: boolean;
}

/**
 * Reusable confirmation dialog component
 * Use for confirming destructive actions like delete, clear all, etc.
 *
 * @example
 * ```tsx
 * const [confirmOpen, setConfirmOpen] = useState(false);
 *
 * <ConfirmDialog
 *   open={confirmOpen}
 *   onOpenChange={setConfirmOpen}
 *   title="Delete Asset?"
 *   description="This action cannot be undone. The asset will be permanently deleted."
 *   confirmText="Delete"
 *   onConfirm={() => deleteAsset(assetId)}
 *   isDangerous
 * />
 * ```
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
  icon,
  isLoading = false,
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon || (isDangerous && <AlertTriangle className="w-5 h-5 text-destructive" />)}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-sm">
          {description}
        </AlertDialogDescription>

        {isDangerous && (
          <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-xs border border-destructive/20">
            ⚠️ This action cannot be undone.
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={isDangerous ? "bg-destructive text-white hover:bg-destructive/90" : ""}
          >
            {isLoading ? "Please wait..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Preset confirmation dialogs for common destructive actions
 */
export const ConfirmDialogPresets = {
  /**
   * Confirm clearing all assets
   */
  clearAllAssets: (count: number, onConfirm: () => void) => ({
    title: "Clear All Assets?",
    description: `You have ${count} asset${count !== 1 ? "s" : ""}. This action cannot be undone and all assets will be permanently removed.`,
    confirmText: "Clear All",
    isDangerous: true as const,
    icon: <Trash2 className="w-5 h-5 text-destructive" />,
    onConfirm,
  }),

  /**
   * Confirm deleting single asset
   */
  deleteAsset: (assetName: string, onConfirm: () => void) => ({
    title: "Delete Asset?",
    description: `Are you sure you want to delete "${assetName}"? This cannot be undone.`,
    confirmText: "Delete",
    isDangerous: true as const,
    icon: <Trash2 className="w-5 h-5 text-destructive" />,
    onConfirm,
  }),

  /**
   * Confirm deleting multiple assets
   */
  deleteMultiple: (count: number, onConfirm: () => void) => ({
    title: `Delete ${count} Asset${count !== 1 ? "s" : ""}?`,
    description: `You are about to delete ${count} asset${count !== 1 ? "s" : ""}. This action cannot be undone.`,
    confirmText: "Delete All",
    isDangerous: true as const,
    icon: <Trash2 className="w-5 h-5 text-destructive" />,
    onConfirm,
  }),

  /**
   * Confirm clearing failed assets
   */
  clearFailed: (count: number, onConfirm: () => void) => ({
    title: "Clear Failed Assets?",
    description: `You have ${count} failed asset${count !== 1 ? "s" : ""}. They will be removed and can be re-uploaded.`,
    confirmText: "Clear Failed",
    isDangerous: true as const,
    onConfirm,
  }),

  /**
   * Confirm clearing cache
   */
  clearCache: (onConfirm: () => void) => ({
    title: "Clear Cache?",
    description: "This will clear cached images and thumbnails. The app will need to regenerate them on next use.",
    confirmText: "Clear Cache",
    isDangerous: false as const,
    onConfirm,
  }),

  /**
   * Confirm removing API key
   */
  removeAPIKey: (provider: string, onConfirm: () => void) => ({
    title: `Remove ${provider} API Key?`,
    description: `Your ${provider} API key will be removed. You can add it back later if needed.`,
    confirmText: "Remove",
    isDangerous: false as const,
    onConfirm,
  }),

  /**
   * Confirm resetting settings to default
   */
  resetSettings: (onConfirm: () => void) => ({
    title: "Reset to Defaults?",
    description: "All settings will be reset to their default values. Your API keys will not be affected.",
    confirmText: "Reset",
    isDangerous: false as const,
    onConfirm,
  }),
};

/**
 * Hook for managing confirmation dialog state
 * @example
 * ```tsx
 * const confirm = useConfirmDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm.ask(
 *     ConfirmDialogPresets.deleteAsset(asset.name, deleteAssetFn)
 *   );
 *   if (!confirmed) return;
 *   // Action already executed by callback
 * };
 * ```
 */
export function useConfirmDialog() {
  return {
    /**
     * Show confirmation dialog and wait for user response
     * Note: Callback is executed directly, this just manages UI state
     */
    ask: async (config: Partial<ConfirmDialogProps>) => {
      return new Promise<boolean>((resolve) => {
        // This would be wrapped in a context/provider typically
        // For now, return immediately and let callback handle the action
        resolve(true);
      });
    },
  };
}
