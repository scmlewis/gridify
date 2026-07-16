import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipeGesture } from './useSwipeGesture';

function createPointerEvent(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  overrides: Partial<PointerEventInit> = {},
): React.PointerEvent<HTMLDivElement> {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    pointerType: 'touch',
    ...overrides,
  }) as unknown as React.PointerEvent<HTMLDivElement>;
}

describe('useSwipeGesture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight: vi.fn() }),
    );

    expect(result.current.state.deltaX).toBe(0);
    expect(result.current.state.isSwiping).toBe(false);
    expect(result.current.state.direction).toBeNull();
  });

  it('calls onSwipeRight when swiped right past threshold', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight, threshold: 0.3 }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 100 }),
      );
    });

    for (let i = 1; i <= 10; i++) {
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 50 + 15 * i,
            clientY: 100,
          }),
        );
      });
    }

    act(() => {
      result.current.handlers.onPointerUp(
        createPointerEvent('pointerup', { clientX: 200, clientY: 100 }),
      );
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it('does not call onSwipeRight when swiped right below threshold', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight, threshold: 0.3 }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 50, clientY: 100 }),
      );
    });

    for (let i = 1; i <= 10; i++) {
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 50 + 5 * i,
            clientY: 100,
          }),
        );
      });
    }

    act(() => {
      result.current.handlers.onPointerUp(
        createPointerEvent('pointerup', { clientX: 100, clientY: 100 }),
      );
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('calls onSwipeLeft when swiped left past threshold', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, threshold: 0.3 }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 200, clientY: 100 }),
      );
    });

    for (let i = 1; i <= 10; i++) {
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 200 - 15 * i,
            clientY: 100,
          }),
        );
      });
    }

    act(() => {
      result.current.handlers.onPointerUp(
        createPointerEvent('pointerup', { clientX: 50, clientY: 100 }),
      );
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it('does not start swiping when vertical movement exceeds horizontal', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 100, clientY: 100 }),
      );
    });

    for (let i = 1; i <= 10; i++) {
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 100 + 2 * i,
            clientY: 100 + 10 * i,
          }),
        );
      });
    }

    act(() => {
      result.current.handlers.onPointerUp(
        createPointerEvent('pointerup', { clientX: 120, clientY: 200 }),
      );
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('calls onSwipeProgress during swipe', () => {
    const onSwipeProgress = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeProgress, threshold: 0.3 }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 0, clientY: 100 }),
      );
    });

    act(() => {
      result.current.handlers.onPointerMove(
        createPointerEvent('pointermove', { clientX: 90, clientY: 100 }),
      );
    });

    expect(onSwipeProgress).toHaveBeenCalledWith(expect.any(Number));

    act(() => {
      result.current.handlers.onPointerUp(
        createPointerEvent('pointerup', { clientX: 90, clientY: 100 }),
      );
    });

    expect(onSwipeProgress).toHaveBeenLastCalledWith(0);
  });

  it('triggers haptic feedback at threshold crossing', () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      writable: true,
    });

    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight: vi.fn(), threshold: 0.3, hapticFeedback: true }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 0, clientY: 100 }),
      );
    });

    act(() => {
      result.current.handlers.onPointerMove(
        createPointerEvent('pointermove', { clientX: 91, clientY: 100 }),
      );
    });

    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('resets state after swipe completes', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight, threshold: 0.3 }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 50, top: 0, left: 0 }),
    });
    Object.defineProperty(div, 'setPointerCapture', { value: vi.fn() });
    Object.defineProperty(div, 'releasePointerCapture', { value: vi.fn() });
    result.current.ref.current = div;

    act(() => {
      result.current.handlers.onPointerDown(
        createPointerEvent('pointerdown', { clientX: 0, clientY: 100 }),
      );
    });

    for (let i = 1; i <= 10; i++) {
      act(() => {
        result.current.handlers.onPointerMove(
          createPointerEvent('pointermove', {
            clientX: 15 * i,
            clientY: 100,
          }),
        );
      });
    }

    act(() => {
      result.current.handlers.onPointerUp(
        createPointerEvent('pointerup', { clientX: 150, clientY: 100 }),
      );
    });

    expect(result.current.state.deltaX).toBe(0);
    expect(result.current.state.isSwiping).toBe(false);
    expect(result.current.state.direction).toBeNull();
  });
});
