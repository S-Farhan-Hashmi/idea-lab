/**
 * Buzzer Status Card — Handcrafted Premium SaaS Style
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';

export default function BuzzerCard({ buzzerOn, index = 4 }) {
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
        borderColor: buzzerOn ? 'rgba(239,68,68,0.3)' : 'var(--border-color)',
        position: 'relative',
      }}
    >
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
            {buzzerOn ? <Bell size={16} color="var(--danger)" /> : <BellOff size={16} color="var(--text-secondary)" />}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            BUZZER STATUS
          </div>
        </div>
        <span className={`badge ${buzzerOn ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '10px', padding: '1px 7px' }}>
          {buzzerOn ? 'ACTIVE' : 'SILENT'}
        </span>
      </div>

      {/* Animated bell with subtle pulse */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0', position: 'relative' }}>
        <AnimatePresence>
          {buzzerOn && [0, 1].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{}}
              transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity }}
              style={{
                position: 'absolute',
                width: '56px', height: '56px',
                borderRadius: '50%',
                border: '1px solid var(--danger)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>

        <motion.div
          animate={buzzerOn ? {
            rotate: [-6, 6, -6, 6, 0],
            scale: [1, 1.05, 1, 1.05, 1],
          } : { rotate: 0, scale: 1 }}
          transition={buzzerOn ? {
            duration: 0.6, repeat: Infinity, repeatDelay: 0.4,
          } : {}}
          style={{
            width: '56px', height: '56px',
            background: buzzerOn ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${buzzerOn ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            boxShadow: buzzerOn ? '0 0 16px rgba(239,68,68,0.25)' : 'none',
          }}
        >
          {buzzerOn
            ? <Bell size={24} color="var(--danger)" />
            : <BellOff size={24} color="var(--text-muted)" />
          }
        </motion.div>
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center', marginTop: '-4px' }}>
        <motion.div
          key={buzzerOn ? 'on' : 'off'}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '22px', fontWeight: 700,
            color: buzzerOn ? 'var(--danger)' : 'var(--success)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.03em',
            marginBottom: '4px',
          }}
        >
          {buzzerOn ? 'ALARM ACTIVE' : 'SILENT'}
        </motion.div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '6px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
          fontWeight: 500,
        }}>
          {buzzerOn ? <Volume2 size={12} color="var(--danger)" /> : <VolumeX size={12} />}
          {buzzerOn ? 'Local acoustic alarm triggered' : 'No acoustic alarm active'}
        </div>
      </div>
    </motion.div>
  );
}
