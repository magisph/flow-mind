import Dexie, { Table } from 'dexie';
import { Note, Link, FileItem, UserPreferences, SyncStatus } from '../types';

export class FlowMindDB extends Dexie {
  notes!: Table<Note & { 
    cloudUpdatedAt?: Date | null;
    deletedAt?: Date | null;
  }>;
  links!: Table<Link & { 
    cloudUpdatedAt?: Date | null;
    deletedAt?: Date | null;
  }>;
  files!: Table<FileItem & { 
    cloudUpdatedAt?: Date | null;
    deletedAt?: Date | null;
  }>;
  preferences!: Table<UserPreferences & { id?: number }>;

  constructor() {
    super('FlowMindDB');
    this.version(1).stores({
      notes: 'id, title, *tags, isFavorite, createdAt, updatedAt, syncStatus, cloudUpdatedAt, deletedAt',
      links: 'id, url, title, *tags, isFavorite, createdAt, updatedAt, syncStatus, cloudUpdatedAt, deletedAt',
      files: 'id, name, type, *tags, createdAt, syncStatus, cloudUpdatedAt, deletedAt',
      preferences: '++id',
    });
  }
}

export const db = new FlowMindDB();

export async function getPreferences(): Promise<UserPreferences> {
  const prefs = await db.preferences.toCollection().first();
  if (prefs) {
    const { id, ...rest } = prefs;
    return rest;
  }
  return {
    theme: 'system',
    sortOrder: 'newest',
    lastSyncAt: null,
  };
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const existing = await db.preferences.toCollection().first();
  if (existing?.id) {
    await db.preferences.update(existing.id, prefs);
  } else {
    await db.preferences.add({ ...prefs } as UserPreferences & { id?: number });
  }
}
