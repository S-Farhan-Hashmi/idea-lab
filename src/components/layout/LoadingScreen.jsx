/**
 * LoadingScreen — Medical device boot sequence
 */
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Initializing telemetry...' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, gap: '32px',
    }}>
      {/* Refrigerator SVG */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
          <defs>
            <linearGradient id="loadBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A1A1F" />
              <stop offset="50%" stopColor="#222226" />
              <stop offset="100%" stopColor="#1A1A1F" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="56" height="86" rx="8" fill="url(#loadBodyGrad)" stroke="rgba(0,214,143,0.4)" strokeWidth="1" />
          <rect x="5" y="5" width="50" height="22" rx="5" fill="#191919" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <rect x="2" y="27" width="56" height="4" fill="#0D0D10" />
          <rect x="5" y="33" width="50" height="51" rx="4" fill="#1C1C20" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <rect x="8" y="36" width="44" height="2" rx="1" fill="rgba(0,214,143,0.5)" />
          <rect x="46" y="55" width="4" height="14" rx="2" fill="rgba(255,255,255,0.1)" />
          <motion.circle cx="10" cy="82" r="3" fill="#00D68F"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 4px #00D68F)' }}
          />
          <motion.rect x="2" y="2" width="56" height="86" rx="8" fill="none"
            stroke="#00D68F" strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>

      <div style={{ textAlign: 'center', maxWidth: '280px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--safe)', textTransform: 'uppercase', marginBottom: '12px' }}>
          ColdChain OS
        </div>

        {/* Progress bar */}
        <div style={{
          width: '200px', height: '2px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '2px', overflow: 'hidden',
          margin: '0 auto 14px',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            style={{ height: '100%', background: 'var(--safe)', borderRadius: '2px' }}
          />
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {message}
        </div>
      </div>
    </div>
  );
}
