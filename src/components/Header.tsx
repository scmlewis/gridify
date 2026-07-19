import { useState, useRef } from 'react';
import { Menu, FolderOpen, FileText, Download, Upload, CheckCircle, Moon, Sun, Monitor, Info } from 'lucide-react';
import { OnlineStatus } from './OnlineStatus';
import { useTheme } from '../hooks/useTheme';
import { WeeklyReview } from './WeeklyReview';
import { AboutSheet } from './AboutSheet';
import { exportCSV, exportJSON, importCSV } from '../utils/export';

interface HeaderProps {
  onImport?: () => void;
  onShowCategories?: () => void;
}

export function Header({ onImport, onShowCategories }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const THEMES = [
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'oled' as const, label: 'OLED', icon: Monitor },
  ];

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
          <h1 className="text-xl font-extrabold tracking-wide text-primary font-display">Gridify</h1>
          <div className="flex items-center gap-2">
            <OnlineStatus />
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
                  <div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl bg-surface-elevated border border-border shadow-lg overflow-hidden">
                    <div className="px-3 pt-3 pb-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Theme</div>
                      <div className="flex rounded-lg bg-surface-card p-0.5 border border-border/50">
                        {THEMES.map((t) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id)}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                                theme === t.id
                                  ? 'bg-primary text-surface-base shadow-sm'
                                  : 'text-text-muted hover:text-text-secondary'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mx-2 border-t border-border/50" />
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
                    <div className="mx-2 border-t border-border/50" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowAbout(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <Info className="h-4 w-4 text-text-muted" />
                      About
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
      <AboutSheet isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
