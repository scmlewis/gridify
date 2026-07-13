import { useState } from 'react';
import { CategoryManagement } from './components/CategoryManagement';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayTab } from './components/TodayTab';
import { GridsTab } from './components/GridsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { UpdatePrompt } from './components/UpdatePrompt';

function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'grids' | 'analytics'>('today');
  const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCategories, setShowCategories] = useState(false);

  const tabOrder = { today: 0, grids: 1, analytics: 2 };

  const handleTabChange = (tab: 'today' | 'grids' | 'analytics') => {
    const prevIndex = tabOrder[activeTab];
    const nextIndex = tabOrder[tab];
    setTabDirection(nextIndex > prevIndex ? 'right' : 'left');
    setActiveTab(tab);
  };


  return (
    <div className="min-h-screen bg-surface-base pb-[var(--nav-h)]">
      <header className="fixed top-0 inset-x-0 z-30 bg-surface-base border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <ErrorBoundary>
            <Header
              onImport={() => setRefreshTrigger(r => r + 1)}
              onShowCategories={() => setShowCategories(true)}
            />
          </ErrorBoundary>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pt-20 space-y-4">
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
        </ErrorBoundary>
        {showCategories && (
          <CategoryManagement isOpen={showCategories} onClose={() => setShowCategories(false)} />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <UpdatePrompt />
    </div>
  );
}

export default App;
