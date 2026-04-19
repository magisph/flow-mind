import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function QuickCapture() {
  const { isQuickCaptureOpen, setQuickCaptureOpen, addNote, addLink } = useStore();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickCaptureOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isQuickCaptureOpen]);

  const handleSubmit = async (e: React.FormEvent, openEditor = false) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();

    // Detect if it's a URL
    if (text.match(/^https?:\/\//)) {
      await addLink(text);
    } else {
      await addNote(text);
    }

    setInput('');
    if (!openEditor) {
      setQuickCaptureOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e, false);
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent, true);
    }
  };

  if (!isQuickCaptureOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl mx-4 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <form onSubmit={(e) => handleSubmit(e)} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="💡 O que está pensando?"
            className="w-full px-6 py-5 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd>
              <span>criar</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-2">Shift+Enter</kbd>
              <span>editar</span>
            </div>
            <button
              type="button"
              onClick={() => setQuickCaptureOpen(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop click to close */}
      <button
        onClick={() => setQuickCaptureOpen(false)}
        className="absolute inset-0 -z-10"
        aria-label="Fechar"
      />
    </div>
  );
}
