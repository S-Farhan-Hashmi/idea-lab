/**
 * Door Status Card — Handcrafted Premium SaaS Style
 */
import { motion } from 'framer-motion';
import { DoorOpen, DoorClosed, Clock, AlertTriangle } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export default function DoorCard({ doorStatus, doorOpenDuration, timeout = 60, index = 3 }) {
  const isOpen = doorStatus === 'open';
  const isTimeout = isOpen && doorOpenDuration >= timeout;

  const statusColor = isOpen
    ? isTimeout ? 'var(--danger)' : 'var(--warning)'
    : 'var(--success)';

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
        borderColor: isOpen ? `${statusColor}30` : 'var(--border-color)',
        position: 'relative',
      }}
    >
      {/* Subtle ambient glow when open */}
      {isOpen && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: 'absolute', top: 0, right: 0,
            width: '140px', height: '140px',
            background: `radial-gradient(circle at 100% 0%, ${statusColor}12 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isOpen ? <DoorOpen size={16} color={statusColor} /> : <DoorClosed size={16} color="var(--text-secondary)" />}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            DOOR STATUS
          </div>
        </div>
        {isTimeout && (
          <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 7px' }}>
            ⚠ TIMEOUT
          </span>
        )}
      </div>

      {/* Animated Door Icon */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0' }}>
        <div style={{ position: 'relative' }}>
          {/* Door frame */}
          <div style={{
            width: 90, height: 110,
            border: `2px solid rgba(255,255,255,0.08)`,
            borderRadius: '4px 4px 0 0',
            position: 'relative',
            background: 'rgba(255,255,255,0.01)',
            overflow: 'hidden',
          }}>
            {/* Animated door panel */}
            <motion.div
              animate={{
                rotateY: isOpen ? -60 : 0,
                x: isOpen ? 6 : 0,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: 0,
                background: isOpen ? `linear-gradient(135deg, ${statusColor}20, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isOpen ? `${statusColor}40` : 'rgba(255,255,255,0.06)'}`,
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Door handle */}
              <div style={{
                position: 'absolute', right: '12px', top: '50%',
                width: '4px', height: '16px',
                background: isOpen ? statusColor : 'var(--text-muted)',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                boxShadow: isOpen ? `0 0 8px ${statusColor}` : 'none',
              }} />
            </motion.div>

            {/* Interior (visible when door is open) */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(59,130,246,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  fontSize: '9px', color: 'var(--text-muted)',
                  writingMode: 'vertical-rl',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}>
                  OPEN
                </div>
              </motion.div>
            )}
          </div>
          {/* Floor */}
          <div style={{
            width: '102px', height: '2px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '1px',
            marginLeft: '-6px',
          }} />
        </div>
      </div>

      {/* Status + timer */}
      <div style={{ textAlign: 'center', marginTop: '-4px' }}>
        <motion.div
          key={doorStatus}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '22px', fontWeight: 700,
            color: statusColor,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.03em',
            marginBottom: '4px',
          }}
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </motion.div>

        {isOpen && doorOpenDuration > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            color: isTimeout ? 'var(--danger)' : 'var(--text-secondary)',
            fontSize: '12px', fontWeight: 500,
          }}>
            <Clock size={12} />
            <span>Open for <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatDuration(doorOpenDuration)}</strong></span>
          </div>
        )}

        {!isOpen && (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>
            Refrigerator sealed ✓
          </div>
        )}
      </div>

      {/* Progress bar for door open timeout */}
      {isOpen && (
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
            <span>Timeout in {formatDuration(Math.max(0, timeout - doorOpenDuration))}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{Math.min(100, Math.round((doorOpenDuration / timeout) * 100))}%</span>
          </div>
          <div style={{
            height: '3px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: isTimeout ? 'var(--danger)' : 'var(--warning)',
                borderRadius: '2px',
              }}
              animate={{ width: `${Math.min(100, (doorOpenDuration / timeout) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
