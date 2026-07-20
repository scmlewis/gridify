import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

type Tab = 'today' | 'grids' | 'analytics' | 'achievements' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-surface-base pb-24 md:pb-20 flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <ErrorBoundary>
            <Header
              onImport={() => setRefreshTrigger(r => r + 1)}
              onShowCategories={() => setShowCategories(true)}
            />
          </ErrorBoundary>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:py-8">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeTab === 'today' && (
                <TodayTab onRefresh={setRefreshTrigger} refreshKey={refreshTrigger} onShowCategories={() => setShowCategories(true)} />
              )}
              {activeTab === 'grids' && (
                <GridsTab refreshTrigger={refreshTrigger} onRefresh={setRefreshTrigger} />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab refreshTrigger={refreshTrigger} />
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
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
        {showCategories && (
          <CategoryManagement isOpen={showCategories} onClose={() => setShowCategories(false)} />
        )}
        <AboutSheet isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <UpdatePrompt />
    </div>
  );
}

export default App;
