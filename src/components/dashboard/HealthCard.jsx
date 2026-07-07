/**
 * Overall Health Card — Handcrafted Premium SaaS Style
 */
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Zap, CheckCircle2 } from 'lucide-react';

const HEALTH_CONFIG = {
  SAFE: {
    icon: ShieldCheck,
    color: 'var(--success)',
    bgColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    label: 'ALL SYSTEMS SAFE',
    desc: 'Vaccine cold chain storage operating within optimal clinical parameters',
  },
  WARNING: {
    icon: ShieldAlert,
    color: 'var(--warning)',
    bgColor: 'rgba(245, 158, 11, 0.04)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    label: 'ATTENTION REQUIRED',
    desc: 'One or more storage parameters require clinical or technical attention',
  },
  CRITICAL: {
    icon: ShieldX,
    color: 'var(--danger)',
    bgColor: 'rgba(239, 68, 68, 0.04)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    label: 'CRITICAL ALERT',
    desc: 'Immediate intervention required — vaccine potency and safety at risk',
  },
};

export default function HealthCard({ overallHealth = 'SAFE', alerts = [], index = 5 }) {
  const cfg = HEALTH_CONFIG[overallHealth] || HEALTH_CONFIG.SAFE;
  const Icon = cfg.icon;
  const criticalCount = alerts.filter(a => a.priority === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.priority === 'medium' && !a.acknowledged).length;
  const ackCount = alerts.filter(a => a.acknowledged).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: 'span 2',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Subtle top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${cfg.color}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Shield icon */}
          <div style={{
            width: 56, height: 56, flexShrink: 0,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${cfg.borderColor}`,
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${cfg.color}15`,
          }}>
            <Icon size={28} color={cfg.color} />
          </div>

          {/* Text */}
          <div>
            <div style={{
              fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600,
              letterSpacing: '0.05em', marginBottom: '4px', textTransform: 'uppercase',
            }}>
              SYSTEM HEALTH STATUS
            </div>
            <motion.div
              key={overallHealth}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                fontSize: '24px', fontWeight: 800,
                color: cfg.color,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {cfg.label}
            </motion.div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 400 }}>
              {cfg.desc}
            </div>
          </div>
        </div>

        {/* Alert summary pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px',
            background: criticalCount > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${criticalCount > 0 ? 'rgba(239,68,68,0.25)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            fontSize: '12px', fontWeight: 500,
            color: criticalCount > 0 ? 'var(--danger)' : 'var(--text-muted)',
          }}>
            <Zap size={13} />
            <span><strong style={{ fontFamily: 'var(--font-mono)' }}>{criticalCount}</strong> Critical</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px',
            background: warningCount > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${warningCount > 0 ? 'rgba(245,158,11,0.25)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            fontSize: '12px', fontWeight: 500,
            color: warningCount > 0 ? 'var(--warning)' : 'var(--text-muted)',
          }}>
            <ShieldAlert size={13} />
            <span><strong style={{ fontFamily: 'var(--font-mono)' }}>{warningCount}</strong> Warnings</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '12px', fontWeight: 500,
            color: 'var(--text-secondary)',
          }}>
            <CheckCircle2 size={13} color="var(--success)" />
            <span><strong style={{ fontFamily: 'var(--font-mono)' }}>{ackCount}</strong> Acknowledged</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
