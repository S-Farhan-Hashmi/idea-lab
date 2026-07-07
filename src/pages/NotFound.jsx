/**
 * 404 Not Found Page — Animated "sensor lost" illustration
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WifiOff, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, var(--bg-primary) 70%)',
      textAlign: 'center', padding: '32px',
    }}>
      {/* Animated signal lost icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{
          width: 120, height: 120,
          background: 'rgba(239,68,68,0.1)',
          border: '2px solid rgba(239,68,68,0.25)',
          borderRadius: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto',
          boxShadow: '0 0 40px rgba(239,68,68,0.15)',
        }}>
          <WifiOff size={56} color="var(--danger)" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{
          fontSize: '96px', fontWeight: 900,
          background: 'linear-gradient(135deg, rgba(239,68,68,0.7), rgba(245,158,11,0.7))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: '8px',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
          Sensor Signal Lost
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: 1.6, marginBottom: '32px' }}>
          The page you're looking for has gone offline. Check your navigation or return to the dashboard.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </motion.div>

      {/* Animated dots */}
      <div style={{
        display: 'flex', gap: '8px', marginTop: '48px',
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--danger)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
