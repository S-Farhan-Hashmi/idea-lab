/**
 * Login Page — Medical Device Boot Screen
 * Feels like powering on medical hardware.
 * Credentials: admin@coldchain.hospital / admin123
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('admin@coldchain.hospital');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    const ok = await login(email, password, rememberMe);
    setLoading(false);
    if (ok) navigate('/dashboard');
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotEmail) return;
    await resetPassword(forgotEmail);
    setForgotOpen(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090B',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Left panel — Refrigerator identity ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        padding: '60px 40px',
        position: 'relative',
        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0, 214, 143, 0.04) 0%, transparent 70%)',
      }}>
        {/* Scan line ambient */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(0, 214, 143, 0.015) 1px, transparent 1px)`,
          backgroundSize: '100% 3px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '360px' }}
        >
          {/* Device icon */}
          <div style={{ marginBottom: '32px' }}>
            <svg width="80" height="120" viewBox="0 0 80 120" fill="none" style={{ margin: '0 auto' }}>
              <defs>
                <linearGradient id="loginFridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1A1A1F" />
                  <stop offset="50%" stopColor="#222226" />
                  <stop offset="100%" stopColor="#1A1A1F" />
                </linearGradient>
              </defs>
              {/* Body */}
              <rect x="4" y="4" width="72" height="112" rx="10" fill="url(#loginFridgeGrad)" stroke="rgba(0,214,143,0.3)" strokeWidth="1" />
              {/* Freezer */}
              <rect x="8" y="8" width="64" height="28" rx="7" fill="#1A1A1F" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <text x="40" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="monospace" fill="rgba(255,255,255,0.2)" letterSpacing="2">FREEZE</text>
              {/* Divider */}
              <rect x="4" y="36" width="72" height="4" fill="#0D0D10" />
              {/* Main door */}
              <rect x="8" y="42" width="64" height="70" rx="5" fill="#1E1E22" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              {/* Handle */}
              <rect x="58" y="70" width="5" height="20" rx="2.5" fill="rgba(255,255,255,0.12)" />
              {/* LED strip */}
              <rect x="14" y="47" width="52" height="2" rx="1" fill="rgba(0,214,143,0.6)" />
              {/* Safe glow LED */}
              <circle cx="14" cy="108" r="3" fill="#00D68F" style={{ filter: 'drop-shadow(0 0 4px #00D68F)' }} />
              {/* Status border pulse */}
              <motion.rect
                x="4" y="4" width="72" height="112" rx="10" fill="none"
                stroke="#00D68F" strokeWidth="1"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {/* Product identity */}
          <div style={{
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
            color: 'var(--safe)', textTransform: 'uppercase', marginBottom: '10px',
          }}>
            ColdChain OS v1.0
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.1,
          }}>
            Pharmaceutical<br />Refrigerator Monitor
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            IoT-enabled smart cold chain &<br />vaccine storage monitoring system
          </p>

          {/* Compliance badges */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
            {['WHO PQS', 'GMP', 'ISO 13485', 'CE Mark'].map(badge => (
              <span key={badge} style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em',
                color: 'var(--text-muted)', padding: '3px 8px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                background: 'var(--bg-surface)',
              }}>
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right panel — Authentication ── */}
      <div style={{
        width: '420px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--bg-surface)',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ width: '100%', maxWidth: '340px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              OPERATOR AUTHENTICATION
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '6px' }}>
              Sign in to continue
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Access the refrigerator control panel
            </p>
          </div>

          {/* Demo hint */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(0, 214, 143, 0.06)',
            border: '1px solid rgba(0, 214, 143, 0.2)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            <span style={{ color: 'var(--safe)', fontWeight: 600 }}>Demo Credentials</span><br />
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '10px' }}>
              admin@coldchain.hospital / admin123
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <div className="input-icon-wrap">
                <Mail size={14} className="icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="operator@hospital.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={14} className="icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--safe)', width: '13px', height: '13px' }}
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '12px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', background: 'var(--safe)', color: '#000', fontWeight: 600 }}
              whileHover={{ scale: 1.01, background: '#00F5A3' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.6)', borderRadius: '50%' }}
                />
              ) : (
                <>
                  <ArrowRight size={17} />
                  Authenticate
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '32px', paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center',
          }}>
            IoT Enabled Smart Cold Chain & Vaccine Storage Monitoring<br />
            <span style={{ color: 'var(--text-faint)' }}>For authorized medical personnel only</span>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setForgotOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                borderRadius: '16px', padding: '28px',
                width: '360px', maxWidth: '90vw',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Reset Password</h3>
                <button onClick={() => setForgotOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                Enter your registered email and we'll send a password reset link.
              </p>
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-icon-wrap">
                  <Mail size={14} className="icon" />
                  <input
                    type="email"
                    className="input"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', gap: '8px' }}>
                  <ArrowRight size={14} />
                  Send Reset Link
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
