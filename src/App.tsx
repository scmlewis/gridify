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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCategories, setShowCategories] = useState(false);


  return (
    <div className="min-h-screen bg-surface-base pb-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="sticky top-0 z-30 bg-surface-base pt-6">
          <ErrorBoundary>
            <Header
              onImport={() => setRefreshTrigger(r => r + 1)}
              onShowCategories={() => setShowCategories(true)}
            />
          </ErrorBoundary>
        </div>
        <div className="mt-4 space-y-4">
          <ErrorBoundary>
            {activeTab === 'today' && (
              <TodayTab onRefresh={setRefreshTrigger} refreshKey={refreshTrigger} onShowCategories={() => setShowCategories(true)} />
            )}
            {activeTab === 'grids' && (
              <GridsTab refreshTrigger={refreshTrigger} onRefresh={setRefreshTrigger} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab refreshTrigger={refreshTrigger} />
            )}
          </ErrorBoundary>
          {showCategories && (
            <CategoryManagement isOpen={showCategories} onClose={() => setShowCategories(false)} />
          )}
        </div>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <UpdatePrompt />
    </div>
  );
}

export default App;
