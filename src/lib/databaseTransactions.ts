/**
 * Database Transaction Helpers
 * Provides safe, atomic database operations using Dexie transactions
 */

import { db, PersistedAsset } from "@/lib/db";

/**
 * Atomically update a single asset in the database
 * Ensures the update is committed before resolving
 */
export async function updateAssetTransactional(
  id: string,
  updates: Partial<PersistedAsset>
): Promise<PersistedAsset> {
  return await db.transaction("rw", db.assets, async () => {
    // Get current asset
    const current = await db.assets.get(id);
    if (!current) {
      throw new Error(`Asset not found: ${id}`);
    }

    // Merge updates with current data
    const merged: PersistedAsset = {
      ...current,
      ...updates,
    };

    // Write merged asset back
    await db.assets.put(merged);

    // Return the updated asset
    return merged;
  });
}

/**
 * Atomically update multiple assets in a single transaction
 * Ensures all updates succeed or all fail (no partial updates)
 */
export async function updateAssetsTransactional(
  updates: Array<{ id: string; data: Partial<PersistedAsset> }>
): Promise<PersistedAsset[]> {
  return await db.transaction("rw", db.assets, async () => {
    const results: PersistedAsset[] = [];

    for (const { id, data } of updates) {
      const current = await db.assets.get(id);
      if (!current) {
        throw new Error(`Asset not found: ${id}`);
      }

      const merged: PersistedAsset = {
        ...current,
        ...data,
      };

      await db.assets.put(merged);
      results.push(merged);
    }

    return results;
  });
}

/**
 * Atomically delete an asset and verify deletion
 */
export async function deleteAssetTransactional(id: string): Promise<void> {
  return await db.transaction("rw", db.assets, async () => {
    const exists = await db.assets.get(id);
    if (!exists) {
      throw new Error(`Asset not found: ${id}`);
    }

    await db.assets.delete(id);

    // Verify deletion
    const deleted = await db.assets.get(id);
    if (deleted) {
      throw new Error(`Failed to delete asset: ${id}`);
    }
  });
}

/**
 * Atomically add a new asset to the database
 */
export async function addAssetTransactional(
  asset: PersistedAsset
): Promise<PersistedAsset> {
  return await db.transaction("rw", db.assets, async () => {
    // Check for duplicate ID
    const exists = await db.assets.get(asset.id);
    if (exists) {
      throw new Error(`Asset already exists: ${asset.id}`);
    }

    // Add new asset
    await db.assets.add(asset);

    // Verify addition
    const added = await db.assets.get(asset.id);
    if (!added) {
      throw new Error(`Failed to add asset: ${asset.id}`);
    }

    return added;
  });
}

/**
 * Atomically update asset metadata with conflict detection
 * Uses version field to detect concurrent modifications
 */
export async function updateAssetMetadataWithConflictDetection(
  id: string,
  metadata: any,
  expectedVersion: number
): Promise<PersistedAsset> {
  return await db.transaction("rw", db.assets, async () => {
    const current = await db.assets.get(id);
    if (!current) {
      throw new Error(`Asset not found: ${id}`);
    }

    // Check version for conflicts
    const currentVersion = (current as any).version || 0;
    if (currentVersion !== expectedVersion) {
      throw new Error(
        `Conflict detected: asset was modified (expected v${expectedVersion}, found v${currentVersion})`
      );
    }

    // Update with new version
    const merged: PersistedAsset = {
      ...current,
      metadata,
    } as any;

    // Increment version
    (merged as any).version = currentVersion + 1;

    await db.assets.put(merged);
    return merged;
  });
}

/**
 * Atomically clear all assets and verify
 */
export async function clearAllAssetsTransactional(): Promise<void> {
  return await db.transaction("rw", db.assets, async () => {
    await db.assets.clear();

    // Verify clear
    const count = await db.assets.count();
    if (count > 0) {
      throw new Error("Failed to clear assets from database");
    }
  });
}

/**
 * Batch update with atomicity - either all succeed or all fail
 * Useful for operations that must all succeed together
 */
export async function batchUpdateAssetsTransactional(
  idList: string[],
  updateFn: (asset: PersistedAsset) => Partial<PersistedAsset>
): Promise<PersistedAsset[]> {
  return await db.transaction("rw", db.assets, async () => {
    const results: PersistedAsset[] = [];

    for (const id of idList) {
      const current = await db.assets.get(id);
      if (!current) {
        throw new Error(`Asset not found: ${id}`);
      }

      const updates = updateFn(current);
      const merged: PersistedAsset = {
        ...current,
        ...updates,
      };

      await db.assets.put(merged);
      results.push(merged);
    }

    return results;
  });
}

/**
 * Safe read-only query within transaction
 * Ensures consistency of reads
 */
export async function readAssetsTransactional(
  filter?: (asset: PersistedAsset) => boolean
): Promise<PersistedAsset[]> {
  return await db.transaction("r", db.assets, async () => {
    const all = await db.assets.toArray();
    return filter ? all.filter(filter) : all;
  });
}
