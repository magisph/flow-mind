import { useStore } from '../store/useStore';
import { TabType } from '../types';

const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
  {
    id: 'notes',
    label: 'Notas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: 'links',
    label: 'Links',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    id: 'files',
    label: 'Arquivos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    ),
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
];

export function TabBar() {
  const { activeTab, setActiveTab, notes, links, files } = useStore();

  const counts = {
    notes: notes.length,
    links: links.length,
    files: files.length,
    tags: 0, // Will calculate from data
  };

  return (
    <div className="sticky top-14 z-30 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-3xl mx-auto">
        <nav className="flex px-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const count = tab.id !== 'tags' ? counts[tab.id] : null;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span className={`
                    px-2 py-0.5 text-xs rounded-full
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
