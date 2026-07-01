import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const COLORS = ['#2BA8A2', '#FFD23F', '#EF6C4A', '#3CC4BD', '#5DADE2'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    velocityX: number;
    velocityY: number;
    rotation: number;
  }[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: randomBetween(20, 80),
      y: randomBetween(30, 60),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(4, 8),
      velocityX: randomBetween(-2, 2),
      velocityY: randomBetween(-4, -1),
      rotation: randomBetween(0, 360),
    }));

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 1.5s ease-out forwards`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
