import { useRef, useCallback, useState, type PointerEvent as ReactPointerEvent } from 'react';

interface LongPressOptions {
  onLongPress?: () => void;
  delay?: number;
  movementThreshold?: number;
}

interface LongPressHandlers {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
}

export function useLongPress(options: LongPressOptions): {
  handlers: LongPressHandlers;
  isPressed: boolean;
} {
  const { onLongPress, delay = 500, movementThreshold = 10 } = options;
  const [isPressed, setIsPressed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasTriggeredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      hasTriggeredRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      setIsPressed(true);

      timerRef.current = setTimeout(() => {
        hasTriggeredRef.current = true;
        onLongPress?.();
      }, delay);
    },
    [delay, onLongPress],
  );

  const handlePointerUp = useCallback(
    (_e: ReactPointerEvent) => {
      clearTimer();
      setIsPressed(false);
    },
    [clearTimer],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > movementThreshold) {
        clearTimer();
        setIsPressed(false);
      }
    },
    [clearTimer, movementThreshold],
  );

  const handlePointerCancel = useCallback(
    (_e: ReactPointerEvent) => {
      clearTimer();
      setIsPressed(false);
    },
    [clearTimer],
  );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onPointerCancel: handlePointerCancel,
    },
    isPressed,
  };
}
