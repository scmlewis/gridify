interface TabBarProps {
  activeTab: 'today' | 'grids';
  onTabChange: (tab: 'today' | 'grids') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-border relative">
      <button
        onClick={() => onTabChange('today')}
        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
          activeTab === 'today'
            ? 'text-primary'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        Today
      </button>
      <button
        onClick={() => onTabChange('grids')}
        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
          activeTab === 'grids'
            ? 'text-primary'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        Grids
      </button>
      <div
        className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
        style={{
          width: '50%',
          transform: activeTab === 'grids' ? 'translateX(100%)' : 'translateX(0)',
        }}
      />
    </div>
  );
}
