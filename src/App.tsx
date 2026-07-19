import { useState } from 'react';
import { CategoryManagement } from './components/CategoryManagement';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayTab } from './components/TodayTab';
import { GridsTab } from './components/GridsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { AchievementsView } from './components/AchievementsView';
import { SettingsPanel } from './components/SettingsPanel';
import { AboutSheet } from './components/AboutSheet';
import { UpdatePrompt } from './components/UpdatePrompt';

function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'grids' | 'analytics' | 'achievements' | 'settings'>('today');
  const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const tabOrder = { today: 0, grids: 1, analytics: 2, achievements: 3, settings: 4 };

  const handleTabChange = (tab: 'today' | 'grids' | 'analytics' | 'achievements' | 'settings') => {
    const prevIndex = tabOrder[activeTab];
    const nextIndex = tabOrder[tab];
    setTabDirection(nextIndex > prevIndex ? 'right' : 'left');
    setActiveTab(tab);
  };


  return (
    <div className="min-h-screen bg-surface-base pb-24 md:pb-8 flex flex-col">
      <header className="sticky top-0 z-40 bg-surface-base/90 border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <ErrorBoundary>
            <Header
              onImport={() => setRefreshTrigger(r => r + 1)}
              onShowCategories={() => setShowCategories(true)}
            />
          </ErrorBoundary>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:py-8 space-y-6">
        <ErrorBoundary>
          {activeTab === 'today' && (
            <TodayTab onRefresh={setRefreshTrigger} refreshKey={refreshTrigger} onShowCategories={() => setShowCategories(true)} tabDirection={tabDirection} />
          )}
          {activeTab === 'grids' && (
            <GridsTab refreshTrigger={refreshTrigger} onRefresh={setRefreshTrigger} tabDirection={tabDirection} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab refreshTrigger={refreshTrigger} tabDirection={tabDirection} />
          )}
          {activeTab === 'achievements' && (
            <AchievementsView />
          )}
          {activeTab === 'settings' && (
            <SettingsPanel
              onShowCategories={() => setShowCategories(true)}
              onShowAbout={() => setShowAbout(true)}
              onImport={() => setRefreshTrigger(r => r + 1)}
            />
          )}
        </ErrorBoundary>
        {showCategories && (
          <CategoryManagement isOpen={showCategories} onClose={() => setShowCategories(false)} />
        )}
        <AboutSheet isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <UpdatePrompt />
    </div>
  );
}

export default App;
