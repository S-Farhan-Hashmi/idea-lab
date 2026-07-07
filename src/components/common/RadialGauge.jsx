/**
 * Radial Gauge Component
 * SVG-based animated gauge for temperature/humidity display
 */
import { useEffect, useRef, useState } from 'react';

const RADIUS = 60;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * @param {number} value - Current value
 * @param {number} min - Minimum of range
 * @param {number} max - Maximum of range
 * @param {string} color - Stroke color (CSS variable or hex)
 * @param {number} size - SVG size in px (default 160)
 * @param {number} arcPercent - How much of circle to use (default 0.75)
 */
export default function RadialGauge({ value, min, max, color = 'var(--accent)', size = 160, safeMin, safeMax }) {
  const [animValue, setAnimValue] = useState(min);
  const animRef = useRef(null);
  const prevValue = useRef(min);

  useEffect(() => {
    if (value === null || value === undefined) return;
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();
    const duration = 600;

    cancelAnimationFrame(animRef.current);
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimValue(start + (end - start) * eased);
      if (progress < 1) animRef.current = requestAnimationFrame(step);
      else prevValue.current = end;
    }
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  const arcPercent = 0.75;
  const r = RADIUS;
  const cx = size / 2;
  const cy = size / 2;

  // Arc path: starts at bottom-left, goes clockwise, ends at bottom-right
  const startAngle = Math.PI * (1 + (1 - arcPercent) / 2);
  const totalAngle = Math.PI * 2 * arcPercent;

  const pct = Math.max(0, Math.min(1, (animValue - min) / (max - min)));
  const arcLength = CIRCUMFERENCE * arcPercent;
  const dashOffset = arcLength - pct * arcLength;

  // Convert polar to cartesian
  function polarToCart(angle) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  const startPt = polarToCart(startAngle);
  const endPt = polarToCart(startAngle + totalAngle);

  // Build arc path
  function describeArc(startAngle, endAngle) {
    const start = polarToCart(startAngle);
    const end = polarToCart(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const bgPath = describeArc(startAngle, startAngle + totalAngle);
  const valuePath = describeArc(startAngle, startAngle + pct * totalAngle);

  // Safe zone indicator
  let safeStartPct = 0, safeEndPct = 1;
  if (safeMin !== undefined && safeMax !== undefined) {
    safeStartPct = Math.max(0, Math.min(1, (safeMin - min) / (max - min)));
    safeEndPct = Math.max(0, Math.min(1, (safeMax - min) / (max - min)));
  }

  const safeArcPath = (safeMin !== undefined && safeMax !== undefined)
    ? describeArc(startAngle + safeStartPct * totalAngle, startAngle + safeEndPct * totalAngle)
    : null;

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible' }}
    >
      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />

      {/* Safe zone highlight */}
      {safeArcPath && (
        <path
          d={safeArcPath}
          fill="none"
          stroke="rgba(16,185,129,0.2)"
          strokeWidth={STROKE + 2}
          strokeLinecap="round"
        />
      )}

      {/* Value arc */}
      <path
        d={valuePath}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
          transition: 'none',
        }}
      />

      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const angle = startAngle + p * totalAngle;
        const innerPt = { x: cx + (r - STROKE - 6) * Math.cos(angle), y: cy + (r - STROKE - 6) * Math.sin(angle) };
        const outerPt = { x: cx + (r + STROKE - 2) * Math.cos(angle), y: cy + (r + STROKE - 2) * Math.sin(angle) };
        return (
          <line
            key={i}
            x1={innerPt.x} y1={innerPt.y}
            x2={outerPt.x} y2={outerPt.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Center value display */}
      <text
        x={cx} y={cy + 6}
        textAnchor="middle"
        style={{
          fontSize: '20px',
          fontWeight: 800,
          fill: color,
          fontFamily: 'var(--font-mono)',
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      >
        {typeof animValue === 'number' ? animValue.toFixed(1) : '—'}
      </text>

      {/* Min/Max labels */}
      <text x={startPt.x} y={startPt.y + 16} textAnchor="middle"
        style={{ fontSize: '9px', fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {min}
      </text>
      <text x={endPt.x} y={endPt.y + 16} textAnchor="middle"
        style={{ fontSize: '9px', fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {max}
      </text>
    </svg>
  );
}
