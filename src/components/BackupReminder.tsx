import { useState, useEffect } from 'react';
import { AlertTriangle, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { shouldShowBackupReminder, markBackupReminderShown } from '../db';
import { haptic } from '../utils/haptics';

export function BackupReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    shouldShowBackupReminder().then((shouldShow) => {
      if (shouldShow) setShow(true);
    });
  }, []);

  const handleDismiss = () => {
    haptic.light();
    markBackupReminderShown();
    setShow(false);
  };

  const handleExport = async () => {
    haptic.success();
    const { exportCSV } = await import('../utils/export');
    exportCSV();
    markBackupReminderShown();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-accent-gold/30 bg-surface-card p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-gold/10">
              <AlertTriangle className="h-4 w-4 text-accent-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Backup your data</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Your habits are stored locally. Export regularly to avoid losing data.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-gold px-3 py-1.5 text-xs font-bold text-surface-base hover:bg-accent-light transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Export Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-full p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
