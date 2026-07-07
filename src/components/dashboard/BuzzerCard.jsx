/**
 * Buzzer Status Card — animated bell icon with pulse rings
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';

export default function BuzzerCard({ buzzerOn, index = 5 }) {
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
        borderColor: buzzerOn ? 'rgba(239,68,68,0.3)' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
        BUZZER STATUS
      </div>

      {/* Animated bell with pulse rings */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', position: 'relative' }}>
        {/* Pulse rings when active */}
        <AnimatePresence>
          {buzzerOn && [0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{}}
              transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity, repeatDelay: 0.6 }}
              style={{
                position: 'absolute',
                width: '60px', height: '60px',
                borderRadius: '50%',
                border: '2px solid var(--danger)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </AnimatePresence>

        <motion.div
          animate={buzzerOn ? {
            rotate: [-8, 8, -8, 8, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          } : { rotate: 0, scale: 1 }}
          transition={buzzerOn ? {
            duration: 0.5, repeat: Infinity, repeatDelay: 0.3,
          } : {}}
          style={{
            width: '60px', height: '60px',
            background: buzzerOn ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)',
            border: `2px solid ${buzzerOn ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'}`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            boxShadow: buzzerOn
              ? '0 0 20px rgba(239,68,68,0.3)'
              : '0 0 12px rgba(16,185,129,0.15)',
          }}
        >
          {buzzerOn
            ? <Bell size={28} color="var(--danger)" />
            : <BellOff size={28} color="var(--success)" />
          }
        </motion.div>
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center' }}>
        <motion.div
          key={buzzerOn ? 'on' : 'off'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '24px', fontWeight: 800,
            color: buzzerOn ? 'var(--danger)' : 'var(--success)',
            textShadow: `0 0 20px ${buzzerOn ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
            marginBottom: '8px',
          }}
        >
          {buzzerOn ? 'ALARM ACTIVE' : 'SILENT'}
        </motion.div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px',
          background: buzzerOn ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          borderRadius: '100px',
          fontSize: '12px',
          color: buzzerOn ? 'var(--danger-light)' : 'var(--success-light)',
          border: `1px solid ${buzzerOn ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
        }}>
          {buzzerOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {buzzerOn ? 'Local alarm triggered' : 'No active alarm'}
        </div>
      </div>
    </motion.div>
  );
}
