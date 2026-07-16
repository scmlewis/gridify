import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

interface ParticleBurstProps {
  trigger: boolean;
  color?: string;
  particleCount?: number;
  lifetime?: number;
  className?: string;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + (Math.random() * 30 - 15),
    distance: 40 + Math.random() * 60,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 0.1,
  }));
}

export function ParticleBurst({
  trigger,
  color = '#FFD23F',
  particleCount = 10,
  lifetime = 400,
  className = '',
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger) {
      setParticles(generateParticles(particleCount));
      setKey((k) => k + 1);

      const timer = setTimeout(() => {
        setParticles([]);
      }, lifetime + 100);

      return () => clearTimeout(timer);
    }
  }, [trigger, particleCount, lifetime]);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <AnimatePresence>
        {particles.map((particle) => {
          const radians = (particle.angle * Math.PI) / 180;
          const x = Math.cos(radians) * particle.distance;
          const y = Math.sin(radians) * particle.distance;

          return (
            <motion.div
              key={`${key}-${particle.id}`}
              initial={{
                opacity: 1,
                scale: 1,
                x: '50%',
                y: '50%',
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: `calc(50% + ${x}px)`,
                y: `calc(50% + ${y}px)`,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: lifetime / 1000,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                backgroundColor: color,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
