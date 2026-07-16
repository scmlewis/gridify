import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { SwipeableHabitRow } from './SwipeableHabitRow';

function createSwipeEvents(
  startX: number,
  endX: number,
  y: number = 100,
  steps: number = 10,
): Array<{ type: string; init: PointerEventInit }> {
  const events: Array<{ type: string; init: PointerEventInit }> = [];
  const stepSize = (endX - startX) / steps;

  events.push({
    type: 'pointerdown',
    init: { clientX: startX, clientY: y, pointerId: 1, pointerType: 'touch' },
  });

  for (let i = 1; i <= steps; i++) {
    events.push({
      type: 'pointermove',
      init: {
        clientX: startX + stepSize * i,
        clientY: y,
        pointerId: 1,
        pointerType: 'touch',
      },
    });
  }

  events.push({
    type: 'pointerup',
    init: { clientX: endX, clientY: y, pointerId: 1, pointerType: 'touch' },
  });

  return events;
}

describe('SwipeableHabitRow', () => {
  const defaultProps = {
    id: 'habit-1',
    name: 'Meditate',
    icon: '🧘',
    color: '#2BA8A2',
    isCompleted: false,
    onToggle: vi.fn(),
    onSwipeDelete: vi.fn(),
    onSwipeFreeze: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 50,
      top: 0,
      left: 0,
      bottom: 50,
      right: 300,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));
  });

  it('renders habit name and icon', () => {
    render(<SwipeableHabitRow {...defaultProps} />);

    expect(screen.getByText('Meditate')).toBeInTheDocument();
    expect(screen.getByText('🧘')).toBeInTheDocument();
  });

  it('renders the swipeable wrapper', () => {
    const { container } = render(<SwipeableHabitRow {...defaultProps} />);

    const wrapper = container.querySelector('[data-swipeable]');
    expect(wrapper).toBeInTheDocument();
  });

  it('completes habit on right swipe past threshold', () => {
    const onToggle = vi.fn();
    render(<SwipeableHabitRow {...defaultProps} onToggle={onToggle} />);

    const wrapper = screen.getByText('Meditate').closest('[data-swipeable]');
    expect(wrapper).toBeTruthy();

    const events = createSwipeEvents(0, 200);
    events.forEach(({ type, init }) => {
      fireEvent(wrapper!, new PointerEvent(type, { ...init, bubbles: true }));
    });

    expect(onToggle).toHaveBeenCalledWith('habit-1');
  });

  it('does not complete habit on short swipe', () => {
    const onToggle = vi.fn();
    render(<SwipeableHabitRow {...defaultProps} onToggle={onToggle} />);

    const wrapper = screen.getByText('Meditate').closest('[data-swipeable]');
    expect(wrapper).toBeTruthy();

    const events = createSwipeEvents(0, 50);
    events.forEach(({ type, init }) => {
      fireEvent(wrapper!, new PointerEvent(type, { ...init, bubbles: true }));
    });

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('calls onSwipeDelete on left swipe past threshold', () => {
    const onSwipeDelete = vi.fn();
    render(<SwipeableHabitRow {...defaultProps} onSwipeDelete={onSwipeDelete} />);

    const wrapper = screen.getByText('Meditate').closest('[data-swipeable]');
    expect(wrapper).toBeTruthy();

    const events = createSwipeEvents(300, 50);
    events.forEach(({ type, init }) => {
      fireEvent(wrapper!, new PointerEvent(type, { ...init, bubbles: true }));
    });

    expect(onSwipeDelete).toHaveBeenCalledWith('habit-1');
  });

  it('shows completed state when isCompleted is true', () => {
    render(<SwipeableHabitRow {...defaultProps} isCompleted={true} />);

    const nameEl = screen.getByText('Meditate');
    expect(nameEl).toHaveClass('opacity-60');
  });

  it('displays streak badge when provided', () => {
    render(<SwipeableHabitRow {...defaultProps} streak={7} />);

    expect(screen.getByText('7d')).toBeInTheDocument();
  });
});
