import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { Header } from './components/Header';
import { QuickCapture } from './components/QuickCapture';
import { TabBar } from './components/TabBar';
import { ContentList } from './components/ContentList';
import { TagsView } from './components/TagsView';
import { NoteEditor } from './components/NoteEditor';
import { SearchModal } from './components/SearchModal';
import { SyncIndicator } from './components/SyncIndicator';

function App() {
  const { loadData, activeTab, selectedItemId } = useStore();

  // Initialize
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Theme
  useTheme();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Quick Capture - Desktop */}
      <div className="max-w-3xl mx-auto w-full px-4 py-4 hidden md:block">
        <button
          onClick={() => useStore.getState().setQuickCaptureOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors text-left"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-gray-400">💡 O que está pensando? (Ctrl+K)</span>
        </button>
      </div>

      <TabBar />

      <main className="flex-1">
        {activeTab === 'tags' ? <TagsView /> : <ContentList />}
      </main>

      {/* Modals */}
      <QuickCapture />
      <SearchModal />
      <NoteEditor />
      <SyncIndicator />
    </div>
  );
}

export default App;
