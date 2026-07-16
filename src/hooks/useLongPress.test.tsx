import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from './useLongPress';

function createPointerEvent(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  overrides: Partial<PointerEventInit> = {},
): React.PointerEvent<HTMLDivElement> {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100,
    pointerId: 1,
    pointerType: 'touch',
    ...overrides,
  }) as unknown as React.PointerEvent<HTMLDivElement>;
}

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with isPressed false', () => {
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn() }),
    );

    expect(result.current.isPressed).toBe(false);
  });

  it('fires onLongPress after delay', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, delay: 500 }),
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown'));
    });

    expect(result.current.isPressed).toBe(true);
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onLongPress when released before delay', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, delay: 500 }),
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown'));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.handlers.onPointerUp(createPointerEvent('pointerup'));
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('cancels long press when moved beyond threshold', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, delay: 500, movementThreshold: 10 }),
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
      }));
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.handlers.onPointerMove(createPointerEvent('pointermove', {
        clientX: 120,
        clientY: 100,
      }));
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
    expect(result.current.isPressed).toBe(false);
  });

  it('cancels long press on pointer cancel', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, delay: 500 }),
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown'));
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.handlers.onPointerCancel(createPointerEvent('pointercancel'));
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
    expect(result.current.isPressed).toBe(false);
  });

  it('sets isPressed to false after pointer up', () => {
    const { result } = renderHook(() =>
      useLongPress({ onLongPress: vi.fn(), delay: 500 }),
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown'));
    });

    expect(result.current.isPressed).toBe(true);

    act(() => {
      result.current.handlers.onPointerUp(createPointerEvent('pointerup'));
    });

    expect(result.current.isPressed).toBe(false);
  });

  it('does not stack multiple timers on rapid presses', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, delay: 500 }),
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown'));
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.handlers.onPointerUp(createPointerEvent('pointerup'));
    });

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent('pointerdown'));
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
