// 🔄 Filter Tabs Component
// For filtering between All Posts and My Posts

'use client';

export type FilterType = 'all' | 'my-posts';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  myPostsCount?: number;
  allPostsCount?: number;
}

export function FilterTabs({
  activeFilter,
  onFilterChange,
  myPostsCount,
  allPostsCount,
}: FilterTabsProps) {
  const tabs = [
    {
      id: 'all' as FilterType,
      label: 'All Posts',
      count: allPostsCount,
      icon: 'fas fa-globe',
    },
    {
      id: 'my-posts' as FilterType,
      label: 'My Posts',
      count: myPostsCount,
      icon: 'fas fa-user',
    },
  ];

  return (
    <div className="border-b border-slate-800">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`relative py-4 px-1 text-sm font-medium transition-colors ${
                activeFilter === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      activeFilter === tab.id
                        ? 'bg-cyan-400/20 text-cyan-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
