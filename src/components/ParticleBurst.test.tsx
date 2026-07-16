import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { ParticleBurst } from './ParticleBurst';

describe('ParticleBurst', () => {
  it('renders nothing when trigger is false', () => {
    const { container } = render(<ParticleBurst trigger={false} />);

    const particles = container.querySelectorAll('[style*="border-radius: 50%"]');
    expect(particles).toHaveLength(0);
  });

  it('spawns particles when trigger is true', () => {
    const { container } = render(
      <ParticleBurst trigger={true} particleCount={5} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('pointer-events-none');

    const particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('generates correct number of particles', () => {
    const { container } = render(
      <ParticleBurst trigger={true} particleCount={8} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    const particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles).toHaveLength(8);
  });

  it('applies custom color to particles', () => {
    const { container } = render(
      <ParticleBurst trigger={true} color="#FF0000" particleCount={3} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    const particles = wrapper.querySelectorAll('[style*="border-radius"]');

    particles.forEach((particle) => {
      expect(particle).toHaveStyle({ backgroundColor: '#FF0000' });
    });
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <ParticleBurst trigger={true} className="custom-class" />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('cleans up particles after lifetime', async () => {
    const { container } = render(
      <ParticleBurst trigger={true} particleCount={3} lifetime={100} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    let particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles.length).toBeGreaterThan(0);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles).toHaveLength(0);
  });

  it('resets particles on re-trigger', async () => {
    const { container, rerender } = render(
      <ParticleBurst trigger={false} particleCount={3} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    let particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles).toHaveLength(0);

    rerender(<ParticleBurst trigger={true} particleCount={3} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('positions particles absolutely within wrapper', () => {
    const { container } = render(
      <ParticleBurst trigger={true} particleCount={3} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('absolute', 'inset-0');
  });

  it('uses default particle count of 10', () => {
    const { container } = render(<ParticleBurst trigger={true} />);

    const wrapper = container.firstChild as HTMLElement;
    const particles = wrapper.querySelectorAll('[style*="border-radius"]');
    expect(particles).toHaveLength(10);
  });
});
