import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Asset, AssetMetadata, useAssets } from "@/contexts/AssetsContext";
import { toast } from "sonner";
import {
    Search,
    Replace,
    Plus,
    Minus,
    ChevronUp,
    ChevronDown,
    Table,
    Trash2,
    X,
} from "lucide-react";

interface BulkEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type EditField = "title" | "description" | "keywords";

interface RowEdit {
    title: string;
    description: string;
    keywords: string;
}

export const BulkEditorModal = ({ open, onOpenChange }: BulkEditorModalProps) => {
    const { assets, updateAsset } = useAssets();
    const assetsWithMeta = useMemo(() => assets.filter((a) => a.metadata), [assets]);

    // Local edits buffer: assetId -> { title, description, keywords }
    const [localEdits, setLocalEdits] = useState<Record<string, RowEdit>>({});
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<EditField>("title");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // Bulk toolbar state
    const [findText, setFindText] = useState("");
    const [replaceText, setReplaceText] = useState("");
    const [findTargets, setFindTargets] = useState<Record<EditField, boolean>>({
        title: true,
        description: true,
        keywords: false,
    });
    const [appendText, setAppendText] = useState("");
    const [appendTarget, setAppendTarget] = useState<EditField>("keywords");
    const [appendMode, setAppendMode] = useState<"append" | "prepend">("append");

    // Remove Words state
    const [removeText, setRemoveText] = useState("");
    const [removeTargets, setRemoveTargets] = useState<Record<EditField, boolean>>({
        title: true,
        description: true,
        keywords: true,
    });

    // ─── Helpers ───────────────────────────────────────────────────

    /** Read the LIVE value for a field: local edit buffer takes priority, then asset metadata */
    const getRowValue = (asset: Asset, field: EditField): string => {
        const edit = localEdits[asset.id];
        if (edit && field in edit) return edit[field];
        if (!asset.metadata) return "";
        if (field === "keywords") return asset.metadata.keywords.join(", ");
        return (asset.metadata as any)[field] ?? "";
    };

    /**
     * Write a single field to the local edit buffer.
     * IMPORTANT: We pre-populate ALL three fields from the asset's real metadata
     * on first touch, so Save always has a complete RowEdit object.
     */
    const setRowValue = (assetId: string, field: EditField, value: string) => {
        setLocalEdits((prev) => {
            const existing = prev[assetId];
            if (existing) {
                return { ...prev, [assetId]: { ...existing, [field]: value } };
            }
            // First edit for this asset — seed ALL fields from live metadata
            const asset = assetsWithMeta.find((a) => a.id === assetId);
            const meta = asset?.metadata;
            const seed: RowEdit = {
                title: meta?.title ?? "",
                description: meta?.description ?? "",
                keywords: meta?.keywords?.join(", ") ?? "",
            };
            seed[field] = value;
            return { ...prev, [assetId]: seed };
        });
    };

    const toggleRow = (id: string) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelectedRows((prev) =>
            prev.size === assetsWithMeta.length
                ? new Set()
                : new Set(assetsWithMeta.map((a) => a.id))
        );
    };

    const toggleSort = (field: EditField) => {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    const sortedAssets = useMemo(() => {
        return [...assetsWithMeta].sort((a, b) => {
            const av = getRowValue(a, sortField).toLowerCase();
            const bv = getRowValue(b, sortField).toLowerCase();
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [assetsWithMeta, localEdits, sortField, sortDir]);

    // ─── Bulk Operations ────────────────────────────────────────────
    const targets = selectedRows.size > 0
        ? assetsWithMeta.filter((a) => selectedRows.has(a.id))
        : assetsWithMeta;

    /** Case-insensitive find & replace across selected fields */
    const handleFindReplace = () => {
        const needle = findText.trim();
        if (!needle) { toast.error("Find text cannot be empty"); return; }
        // Build a safe regex for case-insensitive global replace
        const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "gi");
        let fieldCount = 0;
        let assetCount = 0;
        targets.forEach((asset) => {
            let touched = false;
            (["title", "description", "keywords"] as EditField[]).forEach((f) => {
                if (!findTargets[f]) return;
                const current = getRowValue(asset, f);
                if (!regex.test(current)) return;
                // Reset lastIndex because we used .test() above
                regex.lastIndex = 0;
                const updated = current.replace(regex, replaceText);
                if (updated !== current) {
                    setRowValue(asset.id, f, updated);
                    fieldCount++;
                    touched = true;
                }
            });
            if (touched) assetCount++;
        });
        if (fieldCount === 0) {
            toast.info(`No matches found for "${needle}"`);
        } else {
            toast.success(`Replaced in ${fieldCount} field(s) across ${assetCount} asset(s)`);
        }
    };

    /**
     * Bulk append or prepend text to a field.
     * Mode is passed directly to avoid stale React state.
     */
    const handleBulkAppend = (mode: "append" | "prepend") => {
        const text = appendText.trim();
        if (!text) { toast.error("Text cannot be empty"); return; }
        const field = appendTarget;
        targets.forEach((asset) => {
            const current = getRowValue(asset, field);
            let updated: string;
            if (field === "keywords") {
                // Comma-separated: add keyword(s) at start or end
                updated = mode === "append"
                    ? (current ? `${current}, ${text}` : text)
                    : (current ? `${text}, ${current}` : text);
            } else {
                // Title / Description: space-separated
                updated = mode === "append"
                    ? `${current} ${text}`.trim()
                    : `${text} ${current}`.trim();
            }
            setRowValue(asset.id, field, updated);
        });
        toast.success(`${mode === "append" ? "Appended" : "Prepended"} "${text}" to ${field} on ${targets.length} asset(s)`);
    };

    /** Clear a specific field across all targeted assets */
    const handleClearField = (field: EditField) => {
        targets.forEach((asset) => setRowValue(asset.id, field, ""));
        toast.success(`Cleared ${field} on ${targets.length} asset(s)`);
    };

    /**
     * Remove a word/phrase from selected fields across targeted assets.
     *
     * Keywords: removes any individual keyword that is an exact (case-insensitive)
     *   match, then cleans up empty slots. This is safer than substring matching
     *   for keywords — you don't want "art" removing "heart" or "artist".
     *
     * Title / Description: removes ALL occurrences of the phrase (case-insensitive
     *   substring), then collapses double-spaces and trims. Substring matching is
     *   correct here because prose fields use words in sentences, not tags.
     */
    const handleRemoveWords = () => {
        const word = removeText.trim();
        if (!word) { toast.error("Enter a word or phrase to remove"); return; }

        const activeFields = (["title", "description", "keywords"] as EditField[]).filter(
            (f) => removeTargets[f]
        );
        if (activeFields.length === 0) {
            toast.error("Select at least one field to remove from");
            return;
        }

        // Pre-build a case-insensitive regex for title/description removal
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const phraseRegex = new RegExp(escaped, "gi");

        let fieldCount = 0;
        let assetCount = 0;

        targets.forEach((asset) => {
            let touched = false;

            activeFields.forEach((field) => {
                const current = getRowValue(asset, field);
                let updated: string;

                if (field === "keywords") {
                    // Split on comma, trim each keyword, filter out exact matches
                    const kwList = current
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k.length > 0);
                    const filtered = kwList.filter(
                        (k) => k.toLowerCase() !== word.toLowerCase()
                    );
                    if (filtered.length === kwList.length) return; // no change
                    updated = filtered.join(", ");
                } else {
                    // Title / Description: remove phrase substring, clean up spacing
                    phraseRegex.lastIndex = 0;
                    if (!phraseRegex.test(current)) return; // no match
                    phraseRegex.lastIndex = 0;
                    updated = current
                        .replace(phraseRegex, "")
                        .replace(/\s{2,}/g, " ")
                        .trim();
                }

                if (updated !== current) {
                    setRowValue(asset.id, field, updated);
                    fieldCount++;
                    touched = true;
                }
            });

            if (touched) assetCount++;
        });

        if (fieldCount === 0) {
            toast.info(`"${word}" not found in any targeted ${activeFields.join(" / ")} field`);
        } else {
            toast.success(
                `Removed "${word}" from ${fieldCount} field(s) across ${assetCount} asset(s)`
            );
        }
    };

    // ─── Save All ──────────────────────────────────────────────────
    const handleSaveAll = () => {
        const entries = Object.entries(localEdits);
        if (entries.length === 0) { toast.info("No changes to save"); return; }
        let saved = 0;
        entries.forEach(([id, edit]) => {
            const asset = assets.find((a) => a.id === id);
            if (!asset?.metadata) return;
            updateAsset(id, {
                metadata: {
                    ...asset.metadata,
                    title: edit.title,
                    description: edit.description,
                    keywords: edit.keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean),
                } as AssetMetadata,
            });
            saved++;
        });
        setLocalEdits({});
        toast.success(`Saved changes to ${saved} asset(s)`);
    };

    const dirtyCount = Object.keys(localEdits).length;

    const SortIcon = ({ field }: { field: EditField }) =>
        sortField === field ? (
            sortDir === "asc" ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />
        ) : null;

    // ─── Toolbar tab state ───────────────────────────────────────
    const [activeToolTab, setActiveToolTab] = useState<"find" | "append" | "actions" | "remove">("find");
    const [showToolbar, setShowToolbar] = useState(true);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[96vw] max-h-[95vh] flex flex-col overflow-hidden bg-popover border-border p-0">
                {/* ─── Header ──────────────────────────────────────────── */}
                <div className="px-5 pt-4 pb-0">
                    <DialogHeader className="p-0 mb-0">
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-lg font-bold">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                    <Table className="w-4 h-4 text-primary" />
                                </div>
                                Bulk Metadata Editor
                            </div>
                            <div className="flex items-center gap-2">
                                {assetsWithMeta.length > 0 && (
                                    <Badge variant="outline" className="text-xs font-normal gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {assetsWithMeta.length} assets
                                    </Badge>
                                )}
                                {selectedRows.size > 0 && (
                                    <Badge variant="outline" className="text-xs font-normal gap-1 border-blue-500/30 text-blue-400">
                                        {selectedRows.size} selected
                                    </Badge>
                                )}
                                {dirtyCount > 0 && (
                                    <Badge className="text-xs font-normal gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        {dirtyCount} unsaved
                                    </Badge>
                                )}
                            </div>
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Spreadsheet-style bulk metadata editor
                        </DialogDescription>
                    </DialogHeader>

                    {/* ─── Toolbar Tabs ──────────────────────────────────── */}
                    <div className="flex items-center gap-1 mt-3 border-b border-border">
                        <button
                            onClick={() => { setActiveToolTab("find"); setShowToolbar(true); }}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative ${activeToolTab === "find" && showToolbar ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Search className="w-3.5 h-3.5" />
                            Find & Replace
                            {activeToolTab === "find" && showToolbar && (
                                <motion.div layoutId="bulkToolTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveToolTab("append"); setShowToolbar(true); }}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative ${activeToolTab === "append" && showToolbar ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Append / Prepend
                            {activeToolTab === "append" && showToolbar && (
                                <motion.div layoutId="bulkToolTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveToolTab("actions"); setShowToolbar(true); }}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative ${activeToolTab === "actions" && showToolbar ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear Fields
                            {activeToolTab === "actions" && showToolbar && (
                                <motion.div layoutId="bulkToolTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveToolTab("remove"); setShowToolbar(true); }}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative ${activeToolTab === "remove" && showToolbar ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Minus className="w-3.5 h-3.5" />
                            Remove Words
                            {activeToolTab === "remove" && showToolbar && (
                                <motion.div layoutId="bulkToolTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <div className="flex-1" />
                        <button
                            onClick={() => setShowToolbar(!showToolbar)}
                            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
                        >
                            {showToolbar ? "Hide Toolbar ▲" : "Show Toolbar ▼"}
                        </button>
                    </div>

                    {/* ─── Toolbar Content ───────────────────────────────── */}
                    <AnimatePresence>
                        {showToolbar && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                            >
                                <div className="py-3">
                                    {/* Find & Replace Panel */}
                                    {activeToolTab === "find" && (
                                        <div className="flex items-end gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <Label className="text-xs text-muted-foreground font-medium">Find</Label>
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                    <Input
                                                        value={findText}
                                                        onChange={(e) => setFindText(e.target.value)}
                                                        className="h-9 text-sm pl-8"
                                                        placeholder="Search text..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <Label className="text-xs text-muted-foreground font-medium">Replace with</Label>
                                                <div className="relative">
                                                    <Replace className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                    <Input
                                                        value={replaceText}
                                                        onChange={(e) => setReplaceText(e.target.value)}
                                                        className="h-9 text-sm pl-8"
                                                        placeholder="Replacement text..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs text-muted-foreground font-medium">Search in</Label>
                                                <div className="flex gap-3 h-9 items-center px-3 rounded-md bg-background border border-input">
                                                    {(["title", "description", "keywords"] as EditField[]).map((f) => (
                                                        <label key={f} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                                                            <Checkbox
                                                                checked={findTargets[f]}
                                                                onCheckedChange={(v) =>
                                                                    setFindTargets((prev) => ({ ...prev, [f]: !!v }))
                                                                }
                                                                className="h-3.5 w-3.5"
                                                            />
                                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button size="sm" className="h-9 gap-1.5 px-4" onClick={handleFindReplace}>
                                                <Replace className="w-3.5 h-3.5" />
                                                Replace All
                                            </Button>
                                        </div>
                                    )}

                                    {/* Append / Prepend Panel */}
                                    {activeToolTab === "append" && (
                                        <div className="flex items-end gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <Label className="text-xs text-muted-foreground font-medium">Text to add</Label>
                                                <Input
                                                    value={appendText}
                                                    onChange={(e) => setAppendText(e.target.value)}
                                                    className="h-9 text-sm"
                                                    placeholder="e.g. season_2025, new_keyword"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs text-muted-foreground font-medium">Target field</Label>
                                                <select
                                                    value={appendTarget}
                                                    onChange={(e) => setAppendTarget(e.target.value as EditField)}
                                                    className="h-9 rounded-md border border-input text-sm px-3 bg-background min-w-[130px]"
                                                >
                                                    <option value="title">Title</option>
                                                    <option value="description">Description</option>
                                                    <option value="keywords">Keywords</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <Button
                                                    size="sm"
                                                    className="h-9 gap-1.5 px-4"
                                                    onClick={() => handleBulkAppend("prepend")}
                                                >
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                    Prepend
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-9 gap-1.5 px-4"
                                                    onClick={() => handleBulkAppend("append")}
                                                >
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                    Append
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Clear Fields Panel */}
                                    {activeToolTab === "actions" && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                                            <span className="text-xs text-muted-foreground mr-1">Clear field for {selectedRows.size > 0 ? `${selectedRows.size} selected` : "all"} assets:</span>
                                            {(["title", "description", "keywords"] as EditField[]).map((f) => (
                                                <Button
                                                    key={f}
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                                                    onClick={() => handleClearField(f)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Clear {f.charAt(0).toUpperCase() + f.slice(1)}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Remove Words Panel */}
                                    {activeToolTab === "remove" && (
                                        <div className="flex items-end gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                                            {/* Word/phrase input */}
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <Label className="text-xs text-muted-foreground font-medium">
                                                    Word or phrase to remove
                                                </Label>
                                                <div className="relative">
                                                    <Minus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                    <Input
                                                        value={removeText}
                                                        onChange={(e) => setRemoveText(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && handleRemoveWords()}
                                                        className="h-9 text-sm pl-8"
                                                        placeholder="e.g. beautiful, high quality, premium..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Field checkboxes */}
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs text-muted-foreground font-medium">
                                                    Remove from
                                                </Label>
                                                <div className="flex gap-3 h-9 items-center px-3 rounded-md bg-background border border-input">
                                                    {(["title", "description", "keywords"] as EditField[]).map((f) => (
                                                        <label
                                                            key={f}
                                                            className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                                                        >
                                                            <Checkbox
                                                                checked={removeTargets[f]}
                                                                onCheckedChange={(v) =>
                                                                    setRemoveTargets((prev) => ({ ...prev, [f]: !!v }))
                                                                }
                                                                className="h-3.5 w-3.5"
                                                            />
                                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Scope note */}
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs text-muted-foreground font-medium">
                                                    Scope
                                                </Label>
                                                <div className="h-9 flex items-center px-3 rounded-md bg-background border border-input text-xs text-muted-foreground whitespace-nowrap">
                                                    {selectedRows.size > 0
                                                        ? `${selectedRows.size} selected`
                                                        : "All assets"}
                                                </div>
                                            </div>

                                            {/* Remove button */}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-9 gap-1.5 px-4 bg-destructive/80 hover:bg-destructive"
                                                onClick={handleRemoveWords}
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ─── Data Grid ──────────────────────────────────────── */}
                <div className="flex-1 overflow-auto border-t border-border">
                    {assetsWithMeta.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20 gap-3">
                            <Table className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No assets with metadata yet.</p>
                            <p className="text-xs opacity-60">Generate metadata first, then come back to edit in bulk.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-10 bg-popover/95 backdrop-blur-sm">
                                <tr className="border-b-2 border-border">
                                    <th className="p-2.5 text-center w-10">
                                        <Checkbox
                                            checked={selectedRows.size === assetsWithMeta.length && assetsWithMeta.length > 0}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                    <th className="p-2.5 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider w-[140px]">File</th>
                                    <th
                                        className="p-2.5 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => toggleSort("title")}
                                    >
                                        Title <SortIcon field="title" />
                                    </th>
                                    <th
                                        className="p-2.5 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => toggleSort("description")}
                                    >
                                        Description <SortIcon field="description" />
                                    </th>
                                    <th className="p-2.5 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wider w-[28%]">Keywords</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence initial={false}>
                                    {sortedAssets.map((asset, idx) => {
                                        const isDirty = !!localEdits[asset.id];
                                        const isHighRisk = asset.metadata?.riskAnalysis?.severity === "HIGH";
                                        const isSelected = selectedRows.has(asset.id);
                                        return (
                                            <motion.tr
                                                key={asset.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`border-b border-border/30 transition-colors group
                                                    ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"}
                                                    ${isSelected ? "!bg-primary/5 ring-inset ring-1 ring-primary/20" : "hover:bg-muted/20"}
                                                    ${isDirty ? "ring-inset ring-1 ring-amber-500/30" : ""}
                                                    ${isHighRisk ? "ring-inset ring-1 ring-red-500/40" : ""}`}
                                            >
                                                <td className="p-2.5 text-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleRow(asset.id)}
                                                    />
                                                </td>
                                                <td className="p-2 max-w-[140px]">
                                                    <div className="flex items-center gap-2">
                                                        {asset.thumbnail && (
                                                            <img
                                                                src={asset.thumbnail}
                                                                alt=""
                                                                className="w-9 h-9 object-cover rounded-md flex-shrink-0 border border-border/40"
                                                            />
                                                        )}
                                                        <div className="min-w-0">
                                                            <span className="text-xs font-medium truncate block max-w-[90px]">
                                                                {asset.file.name}
                                                            </span>
                                                            {isHighRisk && (
                                                                <Badge className="mt-0.5 text-[8px] px-1 py-0 bg-red-500/15 text-red-400 border-red-500/30">
                                                                    ⚠ RISK
                                                                </Badge>
                                                            )}
                                                            {isDirty && !isHighRisk && (
                                                                <Badge className="mt-0.5 text-[8px] px-1 py-0 bg-amber-500/15 text-amber-400 border-amber-500/30">
                                                                    edited
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-1.5">
                                                    <input
                                                        className="w-full bg-transparent border border-border/30 focus:border-primary/60 focus:bg-background/50 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/40"
                                                        value={getRowValue(asset, "title")}
                                                        onChange={(e) => setRowValue(asset.id, "title", e.target.value)}
                                                        placeholder="Enter title..."
                                                    />
                                                </td>
                                                <td className="p-1.5">
                                                    <input
                                                        className="w-full bg-transparent border border-border/30 focus:border-primary/60 focus:bg-background/50 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/40"
                                                        value={getRowValue(asset, "description")}
                                                        onChange={(e) => setRowValue(asset.id, "description", e.target.value)}
                                                        placeholder="Enter description..."
                                                    />
                                                </td>
                                                <td className="p-1.5">
                                                    <input
                                                        className="w-full bg-transparent border border-border/30 focus:border-primary/60 focus:bg-background/50 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/40"
                                                        value={getRowValue(asset, "keywords")}
                                                        onChange={(e) => setRowValue(asset.id, "keywords", e.target.value)}
                                                        placeholder="keyword1, keyword2, ..."
                                                    />
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ─── Footer ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        {selectedRows.size > 0
                            ? `${selectedRows.size} of ${assetsWithMeta.length} selected — bulk ops apply to selection only`
                            : `${assetsWithMeta.length} rows — bulk ops apply to all`}
                    </span>
                    <div className="flex items-center gap-2">
                        {dirtyCount > 0 && (
                            <span className="text-xs text-amber-400 mr-2">
                                {dirtyCount} unsaved change(s)
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => { setLocalEdits({}); toast.info("All changes discarded"); }}
                            disabled={dirtyCount === 0}
                        >
                            Discard
                        </Button>
                        <Button
                            size="sm"
                            disabled={dirtyCount === 0}
                            className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-5"
                            onClick={handleSaveAll}
                        >
                            Save {dirtyCount > 0 ? `(${dirtyCount})` : "All"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

