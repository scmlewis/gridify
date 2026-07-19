import { Calendar, Grid3x3, BarChart3, Trophy, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'today' | 'grids' | 'analytics' | 'achievements' | 'settings';
  onTabChange: (tab: 'today' | 'grids' | 'analytics' | 'achievements' | 'settings') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'today' as const, label: 'Today', icon: Calendar },
    { id: 'grids' as const, label: 'Grids', icon: Grid3x3 },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'achievements' as const, label: 'Awards', icon: Trophy },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:sticky md:bottom-auto md:mt-12 border-t md:border-t-0 border-border/60 bg-surface-card/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-1.5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className="text-[9px] font-bold uppercase tracking-wider font-mono">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_#10b981]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
