import { motion, useMotionValue, useTransform, useSpring, animate } from 'motion/react';
import { useEffect, useId, useState } from 'react';

interface AnimatedRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  onComplete?: () => void;
  className?: string;
}

export function AnimatedRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#2BA8A2',
  bgColor = 'rgba(255,255,255,0.1)',
  onComplete,
  className = '',
}: AnimatedRingProps) {
  const id = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [hasCompleted, setHasCompleted] = useState(false);

  const motionProgress = useMotionValue(0);
  const springProgress = useSpring(motionProgress, {
    stiffness: 300,
    damping: 25,
  });

  const strokeDashoffset = useTransform(
    springProgress,
    (p) => circumference * (1 - p),
  );

  useEffect(() => {
    const controls = animate(motionProgress, progress, {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    });

    if (progress >= 1 && onComplete && !hasCompleted) {
      const unsub = springProgress.on('change', (v) => {
        if (v >= 0.95 && !hasCompleted) {
          setHasCompleted(true);
          onComplete();
          unsub();
        }
      });
      return () => {
        controls.stop();
        unsub();
      };
    }

    return () => controls.stop();
  }, [progress, motionProgress, springProgress, onComplete, hasCompleted]);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      animate={progress >= 1 ? { scale: 1.05 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        style={{ strokeDashoffset, rotate: -90, transformOrigin: '50% 50%' }}
      />
      <defs>
        <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
