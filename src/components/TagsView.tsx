import { useMemo } from 'react';
import { useStore } from '../store/useStore';

export function TagsView() {
  const { notes, links, files } = useStore();

  const allTags = useMemo(() => {
    const tagCounts: Record<string, { count: number; type: 'note' | 'link' | 'file' }[]> = {};

    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        if (!tagCounts[tag]) tagCounts[tag] = [];
        const existing = tagCounts[tag].find((t) => t.type === 'note');
        if (!existing) tagCounts[tag].push({ count: 1, type: 'note' });
        else existing.count++;
      });
    });

    links.forEach((link) => {
      link.tags.forEach((tag) => {
        if (!tagCounts[tag]) tagCounts[tag] = [];
        const existing = tagCounts[tag].find((t) => t.type === 'link');
        if (!existing) tagCounts[tag].push({ count: 1, type: 'link' });
        else existing.count++;
      });
    });

    files.forEach((file) => {
      file.tags.forEach((tag) => {
        if (!tagCounts[tag]) tagCounts[tag] = [];
        const existing = tagCounts[tag].find((t) => t.type === 'file');
        if (!existing) tagCounts[tag].push({ count: 1, type: 'file' });
        else existing.count++;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, types]) => ({
        name: tag,
        totalCount: types.reduce((acc, t) => acc + t.count, 0),
        types,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [notes, links, files]);

  if (allTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nenhuma tag ainda
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Adicione tags às suas notas usando <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">#tag</code> no conteúdo
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Tags
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {allTags.length} tag{allTags.length !== 1 ? 's' : ''} encontrada{allTags.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allTags.map((tag) => (
          <div
            key={tag.name}
            className="card p-4 hover:border-primary/50 border border-transparent transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="tag">#{tag.name}</span>
              <span className="text-sm text-gray-400">{tag.totalCount}</span>
            </div>
            <div className="flex gap-2">
              {tag.types.map((t) => (
                <span key={t.type} className="text-xs text-gray-400">
                  {t.type === 'note' && `${t.count} nota${t.count !== 1 ? 's' : ''}`}
                  {t.type === 'link' && `${t.count} link${t.count !== 1 ? 's' : ''}`}
                  {t.type === 'file' && `${t.count} arquivo${t.count !== 1 ? 's' : ''}`}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
