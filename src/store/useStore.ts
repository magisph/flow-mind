import { create } from 'zustand';
import { Note, Link, FileItem, TabType, UserPreferences } from '../types';
import { db, getPreferences } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // UI State
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isQuickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;

  // Data
  notes: Note[];
  links: Link[];
  files: FileItem[];
  preferences: UserPreferences;

  // Sync
  syncStatus: 'idle' | 'syncing' | 'synced' | 'offline';
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'offline') => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Actions
  loadData: () => Promise<void>;
  addNote: (title: string, content?: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (type: 'note' | 'link', id: string) => Promise<void>;

  addLink: (url: string, title?: string, description?: string) => Promise<Link>;
  updateLink: (id: string, updates: Partial<Link>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  addFile: (file: File) => Promise<FileItem>;
  deleteFile: (id: string) => Promise<void>;

  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // UI State
  activeTab: 'notes',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isQuickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ isQuickCaptureOpen: open }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),

  // Data
  notes: [],
  links: [],
  files: [],
  preferences: {
    theme: 'system',
    sortOrder: 'newest',
    lastSyncAt: null,
  },

  // Sync
  syncStatus: 'idle',
  setSyncStatus: (status) => set({ syncStatus: status }),

  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  // Load data from IndexedDB
  loadData: async () => {
    const [notes, links, files, preferences] = await Promise.all([
      db.notes.orderBy('updatedAt').reverse().toArray(),
      db.links.orderBy('updatedAt').reverse().toArray(),
      db.files.orderBy('createdAt').reverse().toArray(),
      getPreferences(),
    ]);

    set({ notes, links, files, preferences });

    // Apply theme
    if (preferences.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      set({ theme: isDark ? 'dark' : 'light' });
    } else {
      set({ theme: preferences.theme });
    }
  },

  // Note Actions
  addNote: async (title, content = '') => {
    const now = new Date();
    const note: Note = {
      id: uuidv4(),
      title: title || 'Nova nota',
      content,
      tags: [],
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await db.notes.add(note);
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  updateNote: async (id, updates) => {
    const updatedAt = new Date();
    await db.notes.update(id, { ...updates, updatedAt, syncStatus: 'pending' });
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt, syncStatus: 'pending' } : n
      ),
    }));
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },

  toggleFavorite: async (type, id) => {
    if (type === 'note') {
      const note = await db.notes.get(id);
      if (note) {
        await db.notes.update(id, { isFavorite: !note.isFavorite, syncStatus: 'pending' });
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
          ),
        }));
      }
    } else {
      const link = await db.links.get(id);
      if (link) {
        await db.links.update(id, { isFavorite: !link.isFavorite, syncStatus: 'pending' });
        set((state) => ({
          links: state.links.map((l) =>
            l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
          ),
        }));
      }
    }
  },

  // Link Actions
  addLink: async (url, title, description) => {
    const now = new Date();
    const link: Link = {
      id: uuidv4(),
      url,
      title: title || url,
      description,
      tags: [],
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await db.links.add(link);
    set((state) => ({ links: [link, ...state.links] }));
    return link;
  },

  updateLink: async (id, updates) => {
    const updatedAt = new Date();
    await db.links.update(id, { ...updates, updatedAt, syncStatus: 'pending' });
    set((state) => ({
      links: state.links.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt, syncStatus: 'pending' } : l
      ),
    }));
  },

  deleteLink: async (id) => {
    await db.links.delete(id);
    set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
  },

  // File Actions
  addFile: async (file) => {
    const now = new Date();
    const fileItem: FileItem = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      tags: [],
      createdAt: now,
      syncStatus: 'pending',
    };

    await db.files.add(fileItem);
    set((state) => ({ files: [fileItem, ...state.files] }));
    return fileItem;
  },

  deleteFile: async (id) => {
    await db.files.delete(id);
    set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
  },

  // Preferences
  updatePreferences: async (prefs) => {
    const currentPrefs = get().preferences;
    const newPrefs = { ...currentPrefs, ...prefs };
    await db.preferences.toCollection().modify(prefs);
    set({ preferences: newPrefs });

    if (prefs.theme) {
      if (prefs.theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        set({ theme: isDark ? 'dark' : 'light' });
      } else {
        set({ theme: prefs.theme });
      }
    }
  },
}));
