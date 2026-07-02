import { Calendar, Grid3x3, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'today' | 'grids' | 'analytics';
  onTabChange: (tab: 'today' | 'grids' | 'analytics') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'today' as const, label: 'Today', icon: Calendar },
    { id: 'grids' as const, label: 'Grids', icon: Grid3x3 },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-surface-card/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-4 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 min-h-[44px] ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-all duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(43,168,162,0.4)]' : ''}`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
