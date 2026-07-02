import { useState, useRef } from 'react';
import { Menu, FolderOpen, FileText, Download, Upload, CheckCircle } from 'lucide-react';
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
                className="rounded-full p-2.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-xl bg-surface-elevated border border-border shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onShowCategories?.();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <FolderOpen className="h-4 w-4 text-text-muted" />
                      Manage Categories
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReview(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <FileText className="h-4 w-4 text-text-muted" />
                      Weekly Review
                    </button>
                    <div className="mx-2 border-t border-border/50" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        exportCSV();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <Download className="h-4 w-4 text-text-muted" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        exportJSON();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <Download className="h-4 w-4 text-text-muted" />
                      Export JSON
                    </button>
                    <div className="mx-2 border-t border-border/50" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <Upload className="h-4 w-4 text-text-muted" />
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
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {importStatus}
          </div>
        )}
      </header>
      {showReview && <WeeklyReview onClose={() => setShowReview(false)} />}
    </>
  );
}
