/**
 * KPI Card with radial gauge — Temperature, Humidity etc.
 */
import { motion } from 'framer-motion';
import RadialGauge from '../common/RadialGauge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePrevious } from '../../hooks/useCustomHooks';

export default function KPICard({
  title,
  value,
  unit,
  status,       // 'safe' | 'warning' | 'critical'
  icon: Icon,
  gaugeMin,
  gaugeMax,
  safeMin,
  safeMax,
  subtitle,
  index = 0,
}) {
  const prevValue = usePrevious(value);

  const statusConfig = {
    safe:     { color: 'var(--success)', label: 'NORMAL', badgeClass: 'badge-success', glowClass: 'animate-glow-success' },
    warning:  { color: 'var(--warning)', label: 'WARNING', badgeClass: 'badge-warning', glowClass: 'animate-glow-warning' },
    critical: { color: 'var(--danger)', label: 'CRITICAL', badgeClass: 'badge-danger', glowClass: 'animate-glow-danger' },
  };

  const cfg = statusConfig[status] || statusConfig.safe;

  const trend = prevValue !== undefined && value !== undefined
    ? value > prevValue + 0.05 ? 'up'
    : value < prevValue - 0.05 ? 'down'
    : 'stable'
    : 'stable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        borderColor: status !== 'safe' ? `${cfg.color}30` : undefined,
      }}
    >
      {/* Background glow */}
      {status !== 'safe' && (
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '120px', height: '120px',
          background: `radial-gradient(circle, ${cfg.color}15 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 38, height: 38,
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}30`,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={cfg.color} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {title}
            </div>
          </div>
        </div>
        <span className={`badge ${cfg.badgeClass}`}>
          {cfg.label}
        </span>
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <RadialGauge
          value={value}
          min={gaugeMin}
          max={gaugeMax}
          safeMin={safeMin}
          safeMax={safeMax}
          color={cfg.color}
          size={150}
        />
      </div>

      {/* Value + unit */}
      <div style={{ textAlign: 'center', marginTop: '-10px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px',
        }}>
          <span style={{
            fontSize: '36px', fontWeight: 800, color: cfg.color,
            fontFamily: 'var(--font-mono)', lineHeight: 1,
            textShadow: `0 0 20px ${cfg.color}40`,
          }}>
            {value !== undefined && value !== null ? value.toFixed(1) : '—'}
          </span>
          <span style={{
            fontSize: '16px', color: 'var(--text-secondary)',
            fontWeight: 600, marginBottom: '4px',
          }}>
            {unit}
          </span>

          {/* Trend indicator */}
          <div style={{
            display: 'flex', alignItems: 'center',
            color: trend === 'up' ? 'var(--danger)' : trend === 'down' ? 'var(--success)' : 'var(--text-muted)',
            marginBottom: '4px',
          }}>
            {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
          </div>
        </div>

        {subtitle && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Safe range bar */}
      {safeMin !== undefined && safeMax !== undefined && (
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px',
          }}>
            <span>Safe Range</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
              {safeMin}{unit} – {safeMax}{unit}
            </span>
          </div>
          <div style={{
            height: '4px', background: 'var(--bg-elevated)',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: status === 'safe' ? 'var(--success)' : cfg.color,
              width: `${Math.max(0, Math.min(100, ((value - gaugeMin) / (gaugeMax - gaugeMin)) * 100))}%`,
              borderRadius: '2px',
              transition: 'width 0.6s ease',
              boxShadow: `0 0 6px ${cfg.color}`,
            }} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
