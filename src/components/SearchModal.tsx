import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function SearchModal() {
  const { isSearchOpen, setSearchOpen, notes, links, files, setSelectedItemId, setActiveTab } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const searchResults = () => {
    if (!query.trim()) return { notes: [], links: [], files: [] };

    const q = query.toLowerCase();

    return {
      notes: notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 5),
      links: links.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 5),
      files: files.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 5),
    };
  };

  const results = searchResults();
  const totalResults = results.notes.length + results.links.length + results.files.length;

  const handleSelect = (type: 'note' | 'link', id: string) => {
    if (type === 'note') {
      setActiveTab('notes');
      setSelectedItemId(id);
    } else {
      setActiveTab('links');
    }
    setSearchOpen(false);
    setQuery('');
  };

  const handleClose = () => {
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl mx-4 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar notas, links, arquivos..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-500">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="px-4 py-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Digite para buscar...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              <p>Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Notes */}
              {results.notes.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
                    Notas
                  </div>
                  {results.notes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => handleSelect('note', note.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {note.title || 'Nota sem título'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {note.content || 'Sem conteúdo'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Links */}
              {results.links.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
                    Links
                  </div>
                  {results.links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleSelect('link', link.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {link.title}
                        </p>
                        <p className="text-sm text-primary truncate">{link.url}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Files */}
              {results.files.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
                    Arquivos
                  </div>
                  {results.files.map((file) => (
                    <button
                      key={file.id}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                    >
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-400">
          <span>{totalResults} resultado{totalResults !== 1 ? 's' : ''}</span>
          <button onClick={handleClose} className="hover:text-gray-600 dark:hover:text-gray-200">
            Fechar
          </button>
        </div>
      </div>

      <button onClick={handleClose} className="absolute inset-0 -z-10" aria-label="Fechar" />
    </div>
  );
}
