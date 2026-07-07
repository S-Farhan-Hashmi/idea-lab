/**
 * Sidebar Navigation Component — Handcrafted Premium SaaS Style
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Thermometer,
  Bell,
  FileText,
  Settings,
  LogOut,
  Snowflake,
  X,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live', label: 'Live Monitoring', icon: Activity },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/history', label: 'History Log', icon: Thermometer },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const { sensorData } = useData();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const unackAlerts = sensorData?.alerts?.filter(a => !a.acknowledged).length ?? 0;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const overallHealth = sensorData?.overallHealth || 'SAFE';
  const healthColor = overallHealth === 'SAFE'
    ? 'var(--success)'
    : overallHealth === 'WARNING'
    ? 'var(--warning)'
    : 'var(--danger)';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${open ? 'open' : ''}`}
        initial={false}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        <div>
          {/* Logo area */}
          <div style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32, height: 32,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 12px -2px rgba(59, 130, 246, 0.3)',
              }}>
                <Snowflake size={18} color="var(--accent-light)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  ColdChain
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                  ENTERPRISE IoT
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px', borderRadius: '6px',
              }}
              className="lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* System status mini-card */}
          <div style={{
            margin: '14px 12px 6px',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div className="status-dot" style={{
                background: healthColor,
                boxShadow: `0 0 8px ${healthColor}`,
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {settings.fridgeName || 'Vaccine Unit 01'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>System {overallHealth}</span>
                </div>
              </div>
            </div>
            {overallHealth === 'SAFE' ? (
              <ShieldCheck size={14} color="var(--success)" style={{ flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={14} color="var(--warning)" style={{ flexShrink: 0 }} />
            )}
          </div>

          {/* Navigation */}
          <nav style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', padding: '6px 20px 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Monitoring
            </div>
            {NAV_ITEMS.slice(0, 4).map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={16} strokeWidth={2} />
                <span style={{ flex: 1 }}>{label}</span>
              </NavLink>
            ))}

            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', padding: '12px 20px 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Management
            </div>
            {NAV_ITEMS.slice(4).map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={16} strokeWidth={2} />
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Alerts' && unackAlerts > 0 && (
                  <span style={{
                    background: 'var(--danger)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '100px',
                    minWidth: '16px',
                    textAlign: 'center',
                  }}>
                    {unackAlerts > 99 ? '99+' : unackAlerts}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User profile + logout */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: 32, height: 32,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)', flexShrink: 0,
              }}>
                {user?.displayName?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.displayName || 'Admin'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.role?.toUpperCase() || 'LOGISTICS'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '6px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
