import { useStore } from '../store/useStore';
import { NoteCard } from './NoteCard';
import { LinkCard } from './LinkCard';
import { FileCard } from './FileCard';

export function ContentList() {
  const { activeTab, notes, links, files, setQuickCaptureOpen } = useStore();

  const renderEmptyState = () => {
    const icon = activeTab === 'notes' ? (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ) : activeTab === 'links' ? (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ) : (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    );

    const title = activeTab === 'notes' ? 'Nenhuma nota ainda' : activeTab === 'links' ? 'Nenhum link ainda' : 'Nenhum arquivo ainda';
    const description = activeTab === 'notes' ? 'Use Ctrl+K para criar sua primeira nota' : activeTab === 'links' ? 'Cole uma URL para salvar um link' : 'Arraste arquivos para adicionar';

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="text-gray-300 dark:text-gray-600 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
          {description}
        </p>
        {activeTab === 'notes' && (
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="btn btn-primary"
          >
            Criar nota
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {activeTab === 'notes' && (
        notes.length === 0 ? renderEmptyState() : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )
      )}

      {activeTab === 'links' && (
        links.length === 0 ? renderEmptyState() : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )
      )}

      {activeTab === 'files' && (
        files.length === 0 ? renderEmptyState() : (
          <div className="space-y-3">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
