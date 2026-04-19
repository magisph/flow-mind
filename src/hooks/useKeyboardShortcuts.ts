import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useKeyboardShortcuts() {
  const { setQuickCaptureOpen, setSearchOpen, isQuickCaptureOpen } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Quick Capture
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isQuickCaptureOpen) {
          setQuickCaptureOpen(true);
        }
      }

      // Ctrl/Cmd + F - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        setQuickCaptureOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuickCaptureOpen, setSearchOpen, isQuickCaptureOpen]);
}
