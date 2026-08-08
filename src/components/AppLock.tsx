import { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isLockEnabled, verifyPin } from '../db';
import { haptic } from '../utils/haptics';

interface AppLockProps {
  onUnlock: () => void;
}

export function AppLock({ onUnlock }: AppLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isLockEnabled().then((enabled) => {
      if (!enabled) {
        onUnlock();
      } else {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    });
  }, [onUnlock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    const valid = await verifyPin(pin);
    if (valid) {
      haptic.success();
      onUnlock();
    } else {
      haptic.error();
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => {
          verifyPin(newPin).then((valid) => {
            if (valid) {
              haptic.success();
              onUnlock();
            } else {
              haptic.error();
              setError(true);
              setPin('');
              setTimeout(() => setError(false), 500);
            }
          });
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  if (loading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface-base"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-card border border-border/30">
            <Lock className="h-7 w-7 text-text-muted" />
          </div>
          <h1 className="text-lg font-bold text-text-primary font-display">Gridify</h1>
          <p className="mt-1 text-xs text-text-muted">Enter PIN to unlock</p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-11 w-9 rounded-lg border-2 transition-all ${
                    error
                      ? 'border-red-500 bg-red-500/10'
                      : i < pin.length
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface-card'
                  }`}
                />
              ))}
            </div>

            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                if (val.length === 6) {
                  setTimeout(() => {
                    verifyPin(val).then((valid) => {
                      if (valid) {
                        haptic.success();
                        onUnlock();
                      } else {
                        haptic.error();
                        setError(true);
                        setPin('');
                        setTimeout(() => setError(false), 500);
                      }
                    });
                  }, 100);
                }
              }}
              className="absolute opacity-0 w-0 h-0"
              aria-label="PIN input"
            />

            <div className="mt-8 grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((digit, i) => {
                if (digit === '') return <div key={i} />;
                if (digit === '⌫') {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={handleBackspace}
                      className="flex h-14 w-14 items-center justify-center rounded-full text-text-muted hover:bg-surface-card transition-colors active:scale-95"
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-card text-lg font-medium text-text-primary hover:bg-surface-elevated transition-colors active:scale-95 border border-border/30"
                  >
                    {digit}
                  </button>
                );
              })}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
