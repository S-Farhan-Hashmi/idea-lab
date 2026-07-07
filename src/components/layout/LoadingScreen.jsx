/**
 * Animated Loading Screen — shown while app initializes
 */
import { motion } from 'framer-motion';
import { Snowflake, Activity } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          top: '10%', left: '20%', borderRadius: '50%',
          animation: 'spin-slow 20s linear infinite',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          bottom: '20%', right: '15%', borderRadius: '50%',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ textAlign: 'center', zIndex: 1 }}
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(59,130,246,0.3)',
          }}
        >
          <Snowflake size={40} color="white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-light), #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            ColdChain Monitor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
            IoT Smart Vaccine Storage System
          </p>

          {/* Loading bar */}
          <div style={{
            width: '200px', height: '3px',
            background: 'var(--bg-elevated)',
            borderRadius: '100px', margin: '0 auto 16px',
            overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent), #6366f1)',
                borderRadius: '100px',
              }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            color: 'var(--text-muted)', fontSize: '12px',
          }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Activity size={14} />
            </motion.div>
            Connecting to sensors...
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
