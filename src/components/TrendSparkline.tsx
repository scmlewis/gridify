import { useMemo } from 'react';
import { formatDate, addDays } from '../utils/date-utils';

interface TrendSparklineProps {
  logs: Map<string, number>;
  color?: string;
  days?: number;
}

export function TrendSparkline({ logs, color = '#2BA8A2', days = 30 }: TrendSparklineProps) {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const points: { date: string; value: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      const dateStr = formatDate(date);
      const value = logs.get(dateStr) ?? 0;
      points.push({ date: dateStr, value });
    }

    return points;
  }, [logs, days]);

  const maxValue = Math.max(...data.map(p => p.value), 1);

  const width = 280;
  const height = 60;
  const padding = 4;

  const points = useMemo(() => {
    if (data.length === 0) return [];

    const xStep = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / maxValue;

    return data.map((p, i) => ({
      date: p.date,
      value: p.value,
      x: padding + i * xStep,
      y: height - padding - p.value * yScale,
    }));
  }, [data, maxValue, width, height, padding]);

  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const lastPoint = points[points.length - 1];
    const bottomY = height - padding;
    return `${path} L ${lastPoint.x} ${bottomY} L ${padding} ${bottomY} Z`;
  }, [points, height, padding]);

  const avgValue = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, p) => acc + p.value, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }, [data]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Last {days} days</span>
        <span>Avg: {avgValue}</span>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
      >
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#sparklineGradient)"
          />
        )}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p) => {
          if (p.value === 0) return null;
          return (
            <circle
              key={p.date}
              cx={p.x}
              cy={p.y}
              r="2"
              fill={color}
              opacity="0.8"
            />
          );
        })}
      </svg>
    </div>
  );
}
