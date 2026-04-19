import { supabase } from './supabase';
import { db } from './db';
import { Note, Link, FileItem, SyncStatus, UserPreferences } from '../types';
import { getPreferences, savePreferences } from './db';

export class SyncEngine {
  private supabase: any;
  private db: any;
  private userId: string | null = null;
  private isPaused = false;
  private lastSyncTime: Date | null = null;
  private isSyncing = false;

  constructor() {
    this.supabase = supabase;
    this.db = db;
    this.initializeAuthListener();
    this.initializeOnlineListeners();
  }

  private async initializeAuthListener() {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (_event, session) => {
        this.userId = session?.user?.id ?? null;
        if (this.userId && !this.isPaused) {
          await this.loadLastSyncTime();
        }
      }
    );
  }

  private async loadLastSyncTime() {
    const prefs = await getPreferences();
    this.lastSyncTime = prefs.lastSyncAt;
  }

  private initializeOnlineListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private handleOnline() {
    if (this.userId && !this.isPaused) {
      this.sync().catch(console.error);
    }
  }

  private handleOffline() {
    // Show offline indicator - to be implemented by UI
    console.log('Offline');
  }

  async syncToCloud(): Promise<{ pushed: number; errors: string[] }> {
    if (!this.userId) throw new Error('No authenticated user');
    if (this.isPaused) throw new Error('Sync is paused');

    let pushed = 0;
    const errors: string[] = [];

    const tables: Array<{ name: string; table: any }> = [
      { name: 'notes', table: this.db.notes },
      { name: 'links', table: this.db.links },
      { name: 'files', table: this.db.files }
    ];

    for (const { name, table } of tables) {
      try {
        const pending = await table.where('syncStatus').equals('pending').toArray();
        for (const record of pending) {
          try {
            if (record.deletedAt !== null) {
              // Soft delete in Supabase
              await this.supabase
                .from(name)
                .update({ deleted_at: record.deletedAt.toISOString() })
                .eq('id', record.id)
                .eq('user_id', this.userId);
            } else {
              // Upsert record
              await this.supabase
                .from(name)
                .upsert(this.toSupabaseRecord(name, record))
                .eq('user_id', this.userId);
            }
            // Mark as synced locally
            await table.update(record.id, {
              syncStatus: 'synced',
              cloudUpdatedAt: new Date() // We'll update with actual cloud timestamp on pull
            });
            pushed++;
          } catch (err) {
            errors.push(`Failed to sync ${name} ${record.id}: ${err.message}`);
          }
        }
      } catch (err) {
        errors.push(`Failed to fetch pending ${name}: ${err.message}`);
      }
    }

    return { pushed, errors };
  }

  async syncFromCloud(): Promise<{ pulled: number; errors: string[] }> {
    if (!this.userId) throw new Error('No authenticated user');
    if (this.isPaused) throw new Error('Sync is paused');

    const since = this.lastSyncTime ?? new Date(0);
    let pulled = 0;
    const errors: string[] = [];

    const tables: Array<{ name: string; table: any }> = [
      { name: 'notes', table: this.db.notes },
      { name: 'links', table: this.db.links },
      { name: 'files', table: this.db.files }
    ];

    for (const { name, table } of tables) {
      try {
        const { data: records, error } = await this.supabase
          .from(name)
          .select('*')
          .eq('user_id', this.userId)
          .gt('updated_at', since.toISOString())
          .or(`deleted_at.is.null,deleted_at.gt.${since.toISOString()}`);

        if (error) throw error;

        for (const cloudRecord of records) {
          try {
            const localRecord = await table.get(cloudRecord.id);
            const cloudTime = new Date(cloudRecord.updated_at);
            const deletedAt = cloudRecord.deleted_at ? new Date(cloudRecord.deleted_at) : null;

            if (!localRecord) {
              // Insert new record
              await table.add(this.fromSupabaseRecord(name, cloudRecord));
              pulled++;
            } else {
              // Update existing record
              const localTime = localRecord.updatedAt;
              if (deletedAt !== null) {
                // Record deleted in cloud - delete locally
                await table.delete(cloudRecord.id);
                pulled++;
              } else if (cloudTime > localTime) {
                // Cloud version wins
                await table.update(cloudRecord.id, {
                  ...this.fromSupabaseRecord(name, cloudRecord),
                  syncStatus: 'synced',
                  cloudUpdatedAt: cloudTime
                });
                pulled++;
              } else {
                // Local version wins or tie - update cloud timestamp only
                await table.update(cloudRecord.id, {
                  cloudUpdatedAt: cloudTime,
                  syncStatus: 'synced'
                });
              }
            }
          } catch (err) {
            errors.push(`Failed to process ${name} ${cloudRecord.id}: ${err.message}`);
          }
        }
      } catch (err) {
        errors.push(`Failed to fetch ${name} changes: ${err.message}`);
      }
    }

    // Update last sync time
    const now = new Date();
    await savePreferences({ lastSyncAt: now });
    this.lastSyncTime = now;

    return { pulled, errors };
  }

  async mergeChanges(): Promise<void> {
    // For MVP with last-write-wins, merge happens during pull/push
    // This method is kept for compatibility but does nothing
    return Promise.resolve();
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  async getPendingChanges(): Promise<any[]> {
    if (!this.userId) return [];
    const pending: any[] = [];
    const tables = [this.db.notes, this.db.links, this.db.files];
    for (const table of tables) {
      const items = await table.where('syncStatus').equals('pending').toArray();
      pending.push(...items);
    }
    return pending;
  }

  async getConflicts(): Promise<any[]> {
    // For last-write-wins, we don't track conflicts separately
    // This would require more complex implementation
    return [];
  }

  async forceSync(): Promise<void> {
    if (!this.userId) throw new Error('No authenticated user');
    if (this.isPaused) throw new Error('Sync is paused');

    await this.sync();
  }

  pauseSync(): void {
    this.isPaused = true;
  }

  resumeSync(): void {
    this.isPaused = false;
    if (this.userId) {
      this.sync().catch(console.error);
    }
  }

  private async sync(): Promise<void> {
    try {
      await this.syncFromCloud();
      await this.syncToCloud();
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    }
  }

  private toSupabaseRecord(tableName: string, record: any): any {
    const base = {
      id: record.id,
      user_id: this.userId,
      title: record.title,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };

    if (tableName === 'notes') {
      return {
        ...base,
        content: record.content,
        tags: record.tags,
        isFavorite: record.isFavorite
      };
    } else if (tableName === 'links') {
      return {
        ...base,
        url: record.url,
        description: record.description ?? null,
        thumbnail: record.thumbnail ?? null,
        favicon: record.favicon ?? null,
        tags: record.tags,
        isFavorite: record.isFavorite
      };
    } else if (tableName === 'files') {
      return {
        ...base,
        name: record.name,
        type: record.type,
        size: record.size,
        localPath: record.localPath ?? null,
        cloudPath: record.cloudPath ?? null,
        tags: record.tags
      };
    }
    return base;
  }

  private fromSupabaseRecord(tableName: string, record: any): any {
    const base = {
      id: record.id,
      title: record.title,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      syncStatus: 'synced' as SyncStatus
    };

    if (tableName === 'notes') {
      return {
        ...base,
        content: record.content,
        tags: record.tags ?? [],
        isFavorite: record.isFavorite ?? false
      };
    } else if (tableName === 'links') {
      return {
        ...base,
        url: record.url,
        description: record.description,
        thumbnail: record.thumbnail,
        favicon: record.favicon,
        tags: record.tags ?? [],
        isFavorite: record.isFavorite ?? false
      };
    } else if (tableName === 'files') {
      return {
        ...base,
        name: record.name,
        type: record.type,
        size: record.size,
        localPath: record.localPath,
        cloudPath: record.cloudPath,
        tags: record.tags ?? []
      };
    }
    return base;
  }
}

// Export a singleton instance
export const syncEngine = new SyncEngine();