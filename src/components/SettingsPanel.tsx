import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Download, Upload, FolderOpen, Info, ChevronRight, FileText, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';
import { staggerContainer, staggerItem } from '../utils/animations';
import { haptic } from '../utils/haptics';
import { WeeklyReview } from './WeeklyReview';
import { isLockEnabled, setPin, removePin } from '../db';

const MAX_IMPORT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface SettingsPanelProps {
  onShowCategories?: () => void;
  onShowAbout?: () => void;
  onImport?: () => void;
}

export function SettingsPanel({ onShowCategories, onShowAbout, onImport }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    isLockEnabled().then(setLockEnabled);
  }, []);

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

      if (file.size > MAX_IMPORT_SIZE_BYTES) {
        setImportStatus('File too large (max 5MB)');
        setTimeout(() => setImportStatus(null), 3000);
        return;
      }

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
                setShowReview(true);
              }}
              className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Weekly Review</span>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>

            <button
              onClick={async () => {
                haptic.light();
                const { exportCSV } = await import('../utils/export');
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
              onClick={async () => {
                haptic.light();
                const { exportJSON } = await import('../utils/export');
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

        {/* Security Section */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-border/30 bg-surface-card p-4">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted font-mono">
            Security
          </div>
          <div className="space-y-2">
            <button
              onClick={async () => {
                haptic.light();
                if (lockEnabled) {
                  await removePin();
                  setLockEnabled(false);
                } else {
                  setShowPinSetup(true);
                }
              }}
              className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                {lockEnabled ? (
                  <Lock className="h-4 w-4 text-primary" />
                ) : (
                  <Unlock className="h-4 w-4 text-text-muted" />
                )}
                <span className="text-sm text-text-primary">
                  {lockEnabled ? 'Disable App Lock' : 'Enable App Lock'}
                </span>
              </div>
              <div className={`h-5 w-9 rounded-full transition-colors ${lockEnabled ? 'bg-primary' : 'bg-surface-elevated border border-border/30'}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${lockEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
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

      {showReview && <WeeklyReview onClose={() => setShowReview(false)} />}

      <AnimatePresence>
        {showPinSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); setPinError(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-surface-card p-6 border border-border/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary font-display">Set App Lock PIN</h3>
              <p className="mt-1 text-xs text-text-muted">
                Enter a 6-digit PIN to lock the app. This is a soft lock for shared devices.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-lg bg-surface-elevated px-4 py-3 text-center text-lg tracking-[0.5em] text-text-primary outline-none border border-border focus:border-primary transition-colors"
                    placeholder="------"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Confirm PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-lg bg-surface-elevated px-4 py-3 text-center text-lg tracking-[0.5em] text-text-primary outline-none border border-border focus:border-primary transition-colors"
                    placeholder="------"
                  />
                </div>
                {pinError && (
                  <p className="text-xs text-red-500">{pinError}</p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); setPinError(''); }}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (newPin.length !== 6) {
                      setPinError('PIN must be 6 digits');
                      return;
                    }
                    if (newPin !== confirmPin) {
                      setPinError('PINs do not match');
                      return;
                    }
                    haptic.success();
                    await setPin(newPin);
                    setLockEnabled(true);
                    setShowPinSetup(false);
                    setNewPin('');
                    setConfirmPin('');
                    setPinError('');
                  }}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                >
                  Set PIN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
