/**
 * KPI Card with radial gauge — Handcrafted Premium SaaS Style
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
    safe:     { color: 'var(--success)', label: 'NORMAL', badgeClass: 'badge-success' },
    warning:  { color: 'var(--warning)', label: 'WARNING', badgeClass: 'badge-warning' },
    critical: { color: 'var(--danger)', label: 'CRITICAL', badgeClass: 'badge-danger' },
  };

  const cfg = statusConfig[status] || statusConfig.safe;

  const trend = prevValue !== undefined && value !== undefined
    ? value > prevValue + 0.05 ? 'up'
    : value < prevValue - 0.05 ? 'down'
    : 'stable'
    : 'stable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        borderColor: status !== 'safe' ? `${cfg.color}30` : 'var(--border-color)',
      }}
    >
      {/* Subtle ambient glow for non-safe status */}
      {status !== 'safe' && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '140px', height: '140px',
          background: `radial-gradient(circle at 100% 0%, ${cfg.color}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={16} color={status === 'safe' ? 'var(--text-secondary)' : cfg.color} />
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {title}
          </div>
        </div>
        <span className={`badge ${cfg.badgeClass}`} style={{ fontSize: '10px', padding: '1px 7px' }}>
          {cfg.label}
        </span>
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '-4px 0' }}>
        <RadialGauge
          value={value}
          min={gaugeMin}
          max={gaugeMax}
          safeMin={safeMin}
          safeMax={safeMax}
          color={cfg.color}
          size={144}
        />
      </div>

      {/* Value + unit */}
      <div style={{ textAlign: 'center', marginTop: '-12px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px',
        }}>
          <span style={{
            fontSize: '34px', fontWeight: 700, color: status === 'safe' ? 'var(--text-primary)' : cfg.color,
            fontFamily: 'var(--font-mono)', lineHeight: 1,
            letterSpacing: '-0.04em',
          }}>
            {value !== undefined && value !== null ? value.toFixed(1) : '—'}
          </span>
          <span style={{
            fontSize: '14px', color: 'var(--text-muted)',
            fontWeight: 600, fontFamily: 'var(--font-sans)',
          }}>
            {unit}
          </span>

          {/* Trend indicator */}
          <div style={{
            display: 'flex', alignItems: 'center',
            color: trend === 'up' ? 'var(--danger)' : trend === 'down' ? 'var(--success)' : 'var(--text-muted)',
            marginLeft: '2px',
          }}>
            {trend === 'up' ? <TrendingUp size={13} /> : trend === 'down' ? <TrendingDown size={13} /> : <Minus size={13} />}
          </div>
        </div>

        {subtitle && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Safe range bar */}
      {safeMin !== undefined && safeMax !== undefined && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          marginTop: '2px',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px',
            fontWeight: 500,
          }}>
            <span>Safe Operating Range</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {safeMin}{unit} – {safeMax}{unit}
            </span>
          </div>
          <div style={{
            height: '3px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: status === 'safe' ? 'var(--success)' : cfg.color,
              width: `${Math.max(0, Math.min(100, ((value - gaugeMin) / (gaugeMax - gaugeMin)) * 100))}%`,
              borderRadius: '2px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
