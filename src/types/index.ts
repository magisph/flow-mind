export type SyncStatus = 'pending' | 'synced' | 'conflict';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  localPath?: string;
  cloudPath?: string;
  tags: string[];
  createdAt: Date;
  syncStatus: SyncStatus;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sortOrder: 'newest' | 'oldest' | 'alpha';
  lastSyncAt: Date | null;
}

export type TabType = 'notes' | 'links' | 'files' | 'tags';
