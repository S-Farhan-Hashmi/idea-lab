/**
 * Door Status Card — animated door icon, open/close detection, timer
 */
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, DoorClosed, Clock, AlertTriangle } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export default function DoorCard({ doorStatus, doorOpenDuration, timeout = 60, index = 4 }) {
  const isOpen = doorStatus === 'open';
  const isTimeout = isOpen && doorOpenDuration >= timeout;

  const statusColor = isOpen
    ? isTimeout ? 'var(--danger)' : 'var(--warning)'
    : 'var(--success)';

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
        borderColor: isOpen ? `${statusColor}30` : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pulse when open */}
      {isOpen && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at center, ${statusColor}10, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
          DOOR STATUS
        </div>
        {isTimeout && (
          <span className="badge badge-danger" style={{ animation: 'glow-danger 1.5s infinite' }}>
            ⚠ TIMEOUT
          </span>
        )}
      </div>

      {/* Animated Door Icon */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
        <div style={{ position: 'relative' }}>
          {/* Door frame */}
          <div style={{
            width: 100, height: 120,
            border: `3px solid rgba(255,255,255,0.1)`,
            borderRadius: '4px 4px 0 0',
            position: 'relative',
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}>
            {/* Animated door panel */}
            <motion.div
              animate={{
                rotateY: isOpen ? -65 : 0,
                x: isOpen ? 10 : 0,
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, ${statusColor}20, ${statusColor}10)`,
                border: `1px solid ${statusColor}40`,
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Door handle */}
              <div style={{
                position: 'absolute', right: '15px', top: '50%',
                width: '6px', height: '18px',
                background: statusColor,
                borderRadius: '3px',
                transform: 'translateY(-50%)',
                boxShadow: `0 0 8px ${statusColor}`,
              }} />
            </motion.div>

            {/* Interior (visible when door is open) */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(59,130,246,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  fontSize: '10px', color: 'var(--text-muted)',
                  writing: 'vertical',
                }}>
                  OPEN
                </div>
              </motion.div>
            )}
          </div>
          {/* Floor */}
          <div style={{
            width: '110px', height: '3px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px',
            marginLeft: '-5px',
          }} />
        </div>
      </div>

      {/* Status + timer */}
      <div style={{ textAlign: 'center' }}>
        <motion.div
          key={doorStatus}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '24px', fontWeight: 800,
            color: statusColor,
            textShadow: `0 0 20px ${statusColor}40`,
            marginBottom: '6px',
          }}
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </motion.div>

        {isOpen && doorOpenDuration > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            color: isTimeout ? 'var(--danger)' : 'var(--text-secondary)',
            fontSize: '13px',
          }}>
            <Clock size={13} />
            <span>Open for <strong>{formatDuration(doorOpenDuration)}</strong></span>
          </div>
        )}

        {!isOpen && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Refrigerator sealed ✓
          </div>
        )}
      </div>

      {/* Progress bar for door open timeout */}
      {isOpen && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px',
          }}>
            <span>Timeout in {formatDuration(Math.max(0, timeout - doorOpenDuration))}</span>
            <span>{Math.min(100, Math.round((doorOpenDuration / timeout) * 100))}%</span>
          </div>
          <div style={{
            height: '4px', background: 'var(--bg-elevated)',
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
