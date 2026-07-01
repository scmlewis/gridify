import { useState } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { TodayTab } from './components/TodayTab';
import { GridsTab } from './components/GridsTab';
import { UpdatePrompt } from './components/UpdatePrompt';

function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'grids'>('today');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-surface-base px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <Header onImport={() => setRefreshTrigger(r => r + 1)} />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'today' ? <TodayTab onRefresh={setRefreshTrigger} refreshKey={refreshTrigger} /> : <GridsTab refreshTrigger={refreshTrigger} onRefresh={setRefreshTrigger} />}
      </div>
      <UpdatePrompt />
    </div>
  );
}

export default App;
