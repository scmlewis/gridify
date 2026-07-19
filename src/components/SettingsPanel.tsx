import { useState } from 'react';
import { Moon, Sun, Monitor, Download, Upload, FolderOpen, Info, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../hooks/useTheme';
import { exportCSV, exportJSON } from '../utils/export';
import { staggerContainer, staggerItem } from '../utils/animations';
import { haptic } from '../utils/haptics';

interface SettingsPanelProps {
  onShowCategories?: () => void;
  onShowAbout?: () => void;
  onImport?: () => void;
}

export function SettingsPanel({ onShowCategories, onShowAbout, onImport }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const THEMES = [
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'oled' as const, label: 'OLED', icon: Monitor },
  ];

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const { importCSV } = await import('../utils/export');
        const result = await importCSV(text);
        setImportStatus(`Imported ${result.imported} entries, skipped ${result.skipped}`);
        setTimeout(() => setImportStatus(null), 3000);
        window.location.reload();
      } catch (err) {
        console.error('Import failed:', err);
        setImportStatus('Import failed');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    input.click();
    onImport?.();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-text-primary font-display">Settings</h2>
        <p className="text-xs text-text-muted font-mono">Configure your experience</p>
      </div>

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Theme Section */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-border/30 bg-surface-card p-4">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted font-mono">
            Theme
          </div>
          <div className="flex rounded-xl bg-surface-elevated p-1 border border-border/30">
            {THEMES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    haptic.light();
                    setTheme(t.id);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
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
        </motion.div>

        {/* Data Section */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-border/30 bg-surface-card p-4">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted font-mono">
            Data
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                haptic.light();
                onShowCategories?.();
              }}
              className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Manage Categories</span>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>

            <button
              onClick={() => {
                haptic.light();
                exportCSV();
              }}
              className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Export CSV</span>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>

            <button
              onClick={() => {
                haptic.light();
                exportJSON();
              }}
              className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Export JSON</span>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>

            <button
              onClick={() => {
                haptic.light();
                handleImport();
              }}
              className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Import CSV</span>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          {importStatus && (
            <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              {importStatus}
            </div>
          )}
        </motion.div>

        {/* About Section */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-border/30 bg-surface-card p-4">
          <button
            onClick={() => {
              haptic.light();
              onShowAbout?.();
            }}
            className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-text-muted" />
              <span className="text-sm text-text-primary">About Gridify</span>
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
