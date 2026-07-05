import { useState, useRef } from 'react';
import { Menu, FolderOpen, FileText, Download, Upload, CheckCircle, Moon, Sun, Monitor, User } from 'lucide-react';
import { OnlineStatus } from './OnlineStatus';
import { useTheme } from '../hooks/useTheme';
import { WeeklyReview } from './WeeklyReview';
import { exportCSV, exportJSON, importCSV } from '../utils/export';

interface HeaderProps {
  onImport?: () => void;
  onShowCategories?: () => void;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export function Header({ onImport, onShowCategories }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReview, setShowReview] = useState(false);
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
          <h1 className="text-xl font-extrabold tracking-wide text-primary">Gridify</h1>
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
                    <a
                      href="https://github.com/scmlewis/gridify"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <GitHubIcon className="h-4 w-4 text-text-muted" />
                      View Source
                    </a>
                    <a
                      href="https://github.com/scmlewis"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-surface-card transition-colors"
                    >
                      <User className="h-4 w-4 text-text-muted" />
                      Author
                    </a>
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
