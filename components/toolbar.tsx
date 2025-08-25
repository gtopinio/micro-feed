// 🔄 Main Navigation Toolbar
// Following Sina's recommended structure and mockup design

'use client';

interface ToolbarProps {
  displayName: string;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onComposeToggle: () => void;
  isComposerOpen: boolean;
}

export function Toolbar({
  displayName,
  onSignOut,
  searchQuery,
  onSearchChange,
  onComposeToggle,
  isComposerOpen,
}: ToolbarProps) {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">
              <i className="fas fa-rss mr-2 text-cyan-500"></i>
              Micro Feed
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400"></i>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search posts..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-full bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Compose Button */}
            <button
              onClick={onComposeToggle}
              className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                isComposerOpen
                  ? 'bg-red-500 hover:bg-red-600 text-white rotate-45'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-105'
              }`}
              title={isComposerOpen ? 'Close composer' : 'Create new post'}
            >
              <i className="fas fa-plus"></i>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {displayName[0]?.toUpperCase() || 'U'}
                </div>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
                    {displayName}
                  </div>
                  <button
                    onClick={onSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
