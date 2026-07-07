/**
 * Login Page — Glassmorphism card on animated gradient background
 * Demo credentials: admin@coldchain.hospital / admin123
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Snowflake, AlertCircle, X, ArrowRight } from 'lucide-react';
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
    <div className="login-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Animated background particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: i % 2 === 0 ? '300px' : '200px',
            height: i % 2 === 0 ? '300px' : '200px',
            borderRadius: '50%',
            background: i % 3 === 0
              ? 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)'
              : i % 3 === 1
              ? 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)',
            left: `${(i * 17) % 90}%`,
            top: `${(i * 23) % 80}%`,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div style={{
        width: '100%', maxWidth: '460px',
        padding: '24px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(59,130,246,0.35)',
          }}>
            <Snowflake size={36} color="white" />
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 800,
            background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>
            ColdChain Monitor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            IoT Smart Vaccine Storage System
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass"
          style={{
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
              Sign In
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Access the monitoring dashboard
            </p>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '12px 14px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '10px',
            marginBottom: '24px',
          }}>
            <AlertCircle size={14} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--accent-light)' }}>Demo Mode</strong><br />
              Email: <code style={{ color: 'var(--text-primary)' }}>admin@coldchain.hospital</code><br />
              Password: <code style={{ color: 'var(--text-primary)' }}>admin123</code>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <div className="input-icon-wrap">
                <Mail size={15} className="icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={15} className="icon" />
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
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: '14px', height: '14px' }}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent-light)', fontSize: '13px', fontWeight: 500,
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                />
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In to Dashboard
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Hospital badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center', marginTop: '20px',
            fontSize: '11px', color: 'var(--text-muted)',
          }}
        >
          🏥 City Medical Center — Pharmacy Cold Chain Division<br />
          <span style={{ color: 'var(--border-color)' }}>
            IoT Enabled Smart Cold Chain & Vaccine Storage Monitoring System
          </span>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setForgotOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              borderRadius: '20px', padding: '32px',
              width: '360px', maxWidth: '90vw',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Reset Password</h3>
              <button onClick={() => setForgotOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Enter your email and we'll send a password reset link.
            </p>
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-icon-wrap">
                <Mail size={15} className="icon" />
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <ArrowRight size={15} />
                Send Reset Link
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
