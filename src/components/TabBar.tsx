interface TabBarProps {
  activeTab: 'today' | 'grids';
  onTabChange: (tab: 'today' | 'grids') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => onTabChange('today')}
        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${
          activeTab === 'today'
            ? 'border-b-2 border-primary text-primary'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        Today
      </button>
      <button
        onClick={() => onTabChange('grids')}
        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${
          activeTab === 'grids'
            ? 'border-b-2 border-primary text-primary'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        Grids
      </button>
    </div>
  );
}
