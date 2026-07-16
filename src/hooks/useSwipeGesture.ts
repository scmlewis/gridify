import { useRef, useCallback, type PointerEvent as ReactPointerEvent } from 'react';

interface SwipeGestureOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onSwipeProgress?: (progress: number) => void;
  threshold?: number;
  hapticFeedback?: boolean;
}

interface SwipeGestureHandlers {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
}

interface SwipeGestureState {
  deltaX: number;
  isSwiping: boolean;
  direction: 'left' | 'right' | null;
}

export function useSwipeGesture(options: SwipeGestureOptions): {
  handlers: SwipeGestureHandlers;
  state: SwipeGestureState;
  ref: React.RefObject<HTMLDivElement | null>;
} {
  const {
    onSwipeRight,
    onSwipeLeft,
    onSwipeProgress,
    threshold = 0.3,
    hapticFeedback = true,
  } = options;

  const stateRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    isSwiping: false,
    hasTriggeredHaptic: false,
    deltaX: 0,
    direction: null as 'left' | 'right' | null,
  });

  const ref = useRef<HTMLDivElement | null>(null);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [hapticFeedback]);

  const getSwipeProgress = useCallback(
    (deltaX: number, width: number) => {
      if (width === 0) return 0;
      return Math.abs(deltaX) / width;
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      stateRef.current.startX = e.clientX;
      stateRef.current.startY = e.clientY;
      stateRef.current.currentX = e.clientX;
      stateRef.current.isSwiping = false;
      stateRef.current.hasTriggeredHaptic = false;
      stateRef.current.deltaX = 0;
      stateRef.current.direction = null;

      const el = ref.current;
      if (el) {
        el.setPointerCapture(e.pointerId);
      }
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const s = stateRef.current;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;

      if (!s.isSwiping) {
        if (Math.abs(dx) < 5) return;
        if (Math.abs(dy) > Math.abs(dx)) return;
        s.isSwiping = true;
      }

      s.currentX = e.clientX;
      s.deltaX = dx;
      s.direction = dx > 0 ? 'right' : 'left';

      const el = ref.current;
      const width = el?.getBoundingClientRect().width ?? 300;
      const progress = getSwipeProgress(dx, width);

      onSwipeProgress?.(progress);

      const pastThreshold = progress >= threshold;
      if (pastThreshold && !s.hasTriggeredHaptic) {
        s.hasTriggeredHaptic = true;
        triggerHaptic();
      } else if (!pastThreshold && s.hasTriggeredHaptic) {
        s.hasTriggeredHaptic = false;
      }
    },
    [getSwipeProgress, onSwipeProgress, threshold, triggerHaptic],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const s = stateRef.current;

      if (s.isSwiping) {
        const el = ref.current;
        const width = el?.getBoundingClientRect().width ?? 300;
        const progress = getSwipeProgress(s.deltaX, width);

        if (progress >= threshold) {
          if (s.direction === 'right') {
            onSwipeRight?.();
          } else if (s.direction === 'left') {
            onSwipeLeft?.();
          }
        }
      }

      s.isSwiping = false;
      s.deltaX = 0;
      s.direction = null;
      s.hasTriggeredHaptic = false;
      onSwipeProgress?.(0);

      const el = ref.current;
      if (el) {
        el.releasePointerCapture(e.pointerId);
      }
    },
    [getSwipeProgress, onSwipeLeft, onSwipeProgress, onSwipeRight, threshold],
  );

  const handlePointerCancel = useCallback(
    (e: ReactPointerEvent) => {
      stateRef.current.isSwiping = false;
      stateRef.current.deltaX = 0;
      stateRef.current.direction = null;
      stateRef.current.hasTriggeredHaptic = false;
      onSwipeProgress?.(0);

      const el = ref.current;
      if (el) {
        el.releasePointerCapture(e.pointerId);
      }
    },
    [onSwipeProgress],
  );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    state: {
      get deltaX() {
        return stateRef.current.deltaX;
      },
      get isSwiping() {
        return stateRef.current.isSwiping;
      },
      get direction() {
        return stateRef.current.direction;
      },
    },
    ref,
  };
}
