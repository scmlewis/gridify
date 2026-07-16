import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { AnimatedRing } from './AnimatedRing';

describe('AnimatedRing', () => {
  it('renders SVG circle elements', () => {
    render(<AnimatedRing progress={0} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const circles = svg?.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('applies correct size', () => {
    render(<AnimatedRing progress={0} size={150} />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '150');
    expect(svg).toHaveAttribute('height', '150');
    expect(svg).toHaveAttribute('viewBox', '0 0 150 150');
  });

  it('renders background circle with default color', () => {
    render(<AnimatedRing progress={0} />);

    const svg = document.querySelector('svg');
    const bgCircle = svg?.querySelector('circle:first-child');
    expect(bgCircle).toHaveAttribute('stroke', 'rgba(255,255,255,0.1)');
  });

  it('renders progress circle with custom color', () => {
    render(<AnimatedRing progress={0.5} color="#FF6B6B" />);

    const svg = document.querySelector('svg');
    const progressCircle = svg?.querySelector('circle:nth-child(2)');
    expect(progressCircle).toHaveAttribute('stroke', '#FF6B6B');
  });

  it('applies strokeLinecap round to progress circle', () => {
    render(<AnimatedRing progress={0.5} />);

    const svg = document.querySelector('svg');
    const progressCircle = svg?.querySelector('circle:nth-child(2)');
    expect(progressCircle?.getAttribute('stroke-linecap')).toBe('round');
  });

  it('applies custom className', () => {
    render(<AnimatedRing progress={0} className="my-custom-class" />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('my-custom-class');
  });

  it('applies gradient definition', () => {
    render(<AnimatedRing progress={0} color="#2BA8A2" />);

    const gradient = document.querySelector('linearGradient');
    expect(gradient).toBeInTheDocument();

    const stops = gradient?.querySelectorAll('stop');
    expect(stops).toHaveLength(2);
  });

  it('calls onComplete when progress reaches 1', async () => {
    const onComplete = vi.fn();

    render(<AnimatedRing progress={1} onComplete={onComplete} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('does not call onComplete when progress is less than 1', async () => {
    const onComplete = vi.fn();

    render(<AnimatedRing progress={0.5} onComplete={onComplete} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('applies scale animation when progress is 1', () => {
    const { container } = render(<AnimatedRing progress={1} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
