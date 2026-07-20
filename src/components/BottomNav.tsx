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
    <nav className="fixed z-40 bottom-0 left-0 right-0 border-t border-border/60 bg-surface-card/95 backdrop-blur-md safe-area-pb md:bottom-6 md:left-1/2 md:right-auto md:w-max md:-translate-x-1/2 md:border md:rounded-full md:shadow-lg md:shadow-black/30 md:bg-surface-elevated/90">
      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1 px-2 py-1.5 md:gap-2 md:px-3 md:py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-w-[58px] md:min-w-[72px] flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
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
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_#10b981]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
