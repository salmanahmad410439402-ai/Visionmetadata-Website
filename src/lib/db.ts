import Dexie, { type Table } from 'dexie';
import type { AssetType, AssetStatus, MotionType, AssetMetadata, QualityReport } from '@/contexts/AssetsContext';

// We omit the raw `File` from the DB since files can't be easily serialized directly in Dexie 
// without converting to Blobs and handling Object URLs.
export interface PersistedAsset {
    id: string;
    version?: number;
    // Raw file details needed to reconstruct a File/Blob instance if possible, 
    // or we just store the blob directly.
    fileBlob: Blob;
    fileName: string;
    fileType: string;
    fileLastModified: number;
    originalPath?: string;

    type: AssetType;
    status: AssetStatus;
    originalSize: number;
    compressedSize?: number;

    // We don't persist ObjectURLs since they die on page reload.
    // We persist the underlying data or re-generate.
    // For previews, we might store the base64 or raw processed blob.
    thumbnailBlob?: Blob;
    processedImageBlob?: Blob;

    aspectRatio?: number;
    isVertical?: boolean;
    motionType?: MotionType;
    width?: number;
    height?: number;
    durationSec?: number;
    metadata?: AssetMetadata;
    metadataEmbedded: boolean;
    qualityReport?: QualityReport; // persisted so quality check survives app restart
    error?: string;
    createdAt: number;
    pairedAssetId?: string;
    relatedAssetIds?: string[];
    combinedExtensions?: string;
    isPrimaryOfPair?: boolean;
}

export class TagyfyDB extends Dexie {
    assets!: Table<PersistedAsset, string>;

    constructor() {
        super('TagyfyDB');
        // version(1) — original schema
        this.version(1).stores({
            assets: 'id, status, type, createdAt'
        });

        // version(2) — adds qualityReport column.
        // Dexie automatically migrates existing records; qualityReport
        // will be undefined on old rows until a quality check is run.
        this.version(2).stores({
            assets: 'id, status, type, createdAt'
        });

        // version(3) — repairs the "ghost asset" bug where assets survive
        // an app uninstall/reinstall (Windows uninstallers do NOT delete
        // AppData, so IndexedDB persists). Affected records have
        // relatedAssetIds set but isPrimaryOfPair === undefined, causing
        // the dashboard filter to hide every single asset with the message
        // "No assets match your search" even after a clean reinstall.
        //
        // Repair strategy per broken record
        // (relatedAssetIds non-empty AND isPrimaryOfPair === undefined):
        //   EPS / AI / SVG / PDF  → mark isPrimaryOfPair = true  (show as primary)
        //   JPG / PNG / WEBP etc  → strip pairing data            (show as standalone)
        //   Unknown extension     → strip pairing data            (safe fallback)
        this.version(3).stores({
            assets: 'id, status, type, createdAt'
        }).upgrade(async (tx) => {
            const VECTOR_PRIMARY = ['eps', 'ai', 'svg', 'pdf'];
            const PREVIEW_IMAGE  = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            const all = await tx.table('assets').toArray();
            const repairs: any[] = [];

            for (const record of all) {
                if (
                    (record.relatedAssetIds?.length ?? 0) > 0 &&
                    record.isPrimaryOfPair === undefined
                ) {
                    const ext = (record.fileName ?? '')
                        .split('.').pop()?.toLowerCase() ?? '';

                    if (VECTOR_PRIMARY.includes(ext)) {
                        repairs.push({ ...record, isPrimaryOfPair: true });
                    } else {
                        // Preview image or unknown — surface as standalone
                        repairs.push({
                            ...record,
                            isPrimaryOfPair: undefined,
                            relatedAssetIds: [],
                            pairedAssetId: undefined,
                        });
                    }
                }
            }

            if (repairs.length > 0) {
                await tx.table('assets').bulkPut(repairs);
                console.info(
                    `[TagyfyDB v3] Repaired ${repairs.length} ghost asset(s).`
                );
            }
        });
    }
}

export const db = new TagyfyDB();

/**
 * Converts a Blob to a File object
 */
export function blobToFile(blob: Blob, fileName: string, fileType: string, lastModified: number, originalPath?: string, originalSize?: number): File {
    const file = new File([blob], fileName, { type: fileType, lastModified });
    if (originalPath) {
        Object.defineProperty(file, 'path', { value: originalPath, writable: false });
    }
    if (originalSize !== undefined && blob.size !== originalSize) {
        Object.defineProperty(file, 'size', { value: originalSize, writable: false });
    }
    return file;
}
