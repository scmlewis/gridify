interface BottomNavProps {
  activeTab: 'today' | 'grids' | 'analytics';
  onTabChange: (tab: 'today' | 'grids' | 'analytics') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    {
      id: 'today' as const,
      label: 'Today',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'grids' as const,
      label: 'Grids',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="8" y="2" width="5" height="5" rx="1" />
          <rect x="14" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="8" width="5" height="5" rx="1" />
          <rect x="8" y="8" width="5" height="5" rx="1" />
          <rect x="14" y="8" width="5" height="5" rx="1" />
          <rect x="2" y="14" width="5" height="5" rx="1" />
          <rect x="8" y="14" width="5" height="5" rx="1" />
          <rect x="14" y="14" width="5" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 17V9M7 17V5M11 17V8M15 17V3" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-surface-card/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-4 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 min-h-[44px] ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <div className={`transition-transform duration-200 ${activeTab === tab.id ? 'scale-110 drop-shadow-[0_0_6px_rgba(43,168,162,0.4)]' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-semibold">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
