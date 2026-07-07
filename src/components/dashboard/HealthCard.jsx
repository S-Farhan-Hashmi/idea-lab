/**
 * Overall Health Card — large status indicator with animated background
 */
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Zap } from 'lucide-react';

const HEALTH_CONFIG = {
  SAFE: {
    icon: ShieldCheck,
    color: 'var(--success)',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.25)',
    label: 'ALL SYSTEMS SAFE',
    desc: 'Vaccine storage within optimal parameters',
    glowClass: 'animate-glow-success',
  },
  WARNING: {
    icon: ShieldAlert,
    color: 'var(--warning)',
    bgColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.25)',
    label: 'ATTENTION REQUIRED',
    desc: 'One or more parameters need attention',
    glowClass: 'animate-glow-warning',
  },
  CRITICAL: {
    icon: ShieldX,
    color: 'var(--danger)',
    bgColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.25)',
    label: 'CRITICAL ALERT',
    desc: 'Immediate action required — vaccine safety at risk',
    glowClass: 'animate-glow-danger',
  },
};

export default function HealthCard({ overallHealth = 'SAFE', alerts = [], index = 6 }) {
  const cfg = HEALTH_CONFIG[overallHealth] || HEALTH_CONFIG.SAFE;
  const Icon = cfg.icon;
  const criticalCount = alerts.filter(a => a.priority === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.priority === 'medium' && !a.acknowledged).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={{
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: 'span 2',
      }}
    >
      {/* Animated background glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-30%', right: '-10%',
          width: '300px', height: '300px',
          background: `radial-gradient(circle, ${cfg.color}20 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Shield icon */}
        <motion.div
          animate={overallHealth !== 'SAFE' ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: '72px', height: '72px', flexShrink: 0,
            background: `${cfg.color}20`,
            border: `2px solid ${cfg.color}40`,
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 30px ${cfg.color}25`,
          }}
        >
          <Icon size={36} color={cfg.color} />
        </motion.div>

        {/* Text */}
        <div>
          <div style={{
            fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.1em', marginBottom: '6px',
          }}>
            SYSTEM HEALTH STATUS
          </div>
          <motion.div
            key={overallHealth}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: '28px', fontWeight: 900,
              color: cfg.color,
              textShadow: `0 0 30px ${cfg.color}40`,
              letterSpacing: '0.02em',
            }}
          >
            {cfg.label}
          </motion.div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {cfg.desc}
          </div>
        </div>
      </div>

      {/* Alert summary pills */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '100px',
          fontSize: '12px',
          color: criticalCount > 0 ? 'var(--danger-light)' : 'var(--text-muted)',
        }}>
          <Zap size={13} />
          <span><strong>{criticalCount}</strong> Critical Alerts</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '100px',
          fontSize: '12px',
          color: warningCount > 0 ? 'var(--warning-light)' : 'var(--text-muted)',
        }}>
          <ShieldAlert size={13} />
          <span><strong>{warningCount}</strong> Warnings</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-color)',
          borderRadius: '100px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <ShieldCheck size={13} />
          <span><strong>{alerts.filter(a => a.acknowledged).length}</strong> Acknowledged</span>
        </div>
      </div>
    </motion.div>
  );
}
