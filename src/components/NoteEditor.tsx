import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function NoteEditor() {
  const { selectedItemId, setSelectedItemId, notes, updateNote } = useStore();
  const note = notes.find((n) => n.id === selectedItemId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<number>();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      // Focus title if new note
      if (note.title === 'Nova nota' || note.title === '') {
        setTimeout(() => titleRef.current?.select(), 100);
      }
    }
  }, [note?.id]);

  if (!note) return null;

  const handleClose = () => {
    setSelectedItemId(null);
  };

  const handleSave = () => {
    if (title !== note.title || content !== note.content) {
      updateNote(note.id, { title, content });
    }
  };

  // Auto-save with debounce
  const handleChange = (field: 'title' | 'content', value: string) => {
    if (field === 'title') {
      setTitle(value);
    } else {
      setContent(value);
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      handleSave();
    }, 1000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <span className="text-sm text-gray-400">
            Editando nota
          </span>

          <button
            onClick={handleSave}
            className="btn btn-primary text-sm"
          >
            Salvar
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Título da nota"
          className="w-full text-2xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-300 mb-4"
        />

        <textarea
          value={content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Escreva seus pensamentos..."
          className="w-full min-h-[60vh] text-base bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 resize-none"
        />

        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-400">
            Criado em {formatDate(note.createdAt)}
          </p>
          {note.updatedAt !== note.createdAt && (
            <p className="text-sm text-gray-400">
              Atualizado em {formatDate(note.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
