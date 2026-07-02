import { useState, useRef } from 'react';
import { OnlineStatus } from './OnlineStatus';
import { ThemeToggle } from './ThemeToggle';
import { WeeklyReview } from './WeeklyReview';
import { exportCSV, exportJSON, importCSV } from '../utils/export';

interface HeaderProps {
  onImport?: () => void;
  onShowCategories?: () => void;
}

export function Header({ onImport, onShowCategories }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importCSV(text);
      setImportStatus(`Imported ${result.imported} entries, skipped ${result.skipped}`);
      setTimeout(() => setImportStatus(null), 3000);
      window.location.reload();
    } catch (err) {
      console.error('Import failed:', err);
      setImportStatus('Import failed');
      setTimeout(() => setImportStatus(null), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onImport) {
      onImport();
    }
  };

  return (
    <>
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-wide text-primary">Gridify</h1>
          <div className="flex items-center gap-2">
            <OnlineStatus />
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors"
                title="Menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
                </svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-lg bg-surface-elevated border border-border shadow-lg">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onShowCategories?.();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-card transition-colors rounded-t-lg"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6h16M4 10h16M4 14h16" strokeLinecap="round" />
                      </svg>
                      Manage Categories
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReview(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" />
                      </svg>
                      Weekly Review
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        exportCSV();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        exportJSON();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Export JSON
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-card transition-colors rounded-b-lg"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l-4-4m4 4H4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Import CSV
                    </button>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
        {importStatus && (
          <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{importStatus}</div>
        )}
      </header>
      {showReview && <WeeklyReview onClose={() => setShowReview(false)} />}
    </>
  );
}
