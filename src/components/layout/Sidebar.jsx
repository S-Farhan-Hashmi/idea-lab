/**
 * Sidebar Navigation Component
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
  Wifi,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live', label: 'Live Monitoring', icon: Activity },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/history', label: 'Temperature History', icon: Thermometer },
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
      >
        {/* Logo area */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, var(--accent), #6366f1)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Snowflake size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                ColdChain
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                IoT Monitor v1.0
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
          margin: '12px',
          padding: '10px 14px',
          background: `${healthColor}15`,
          border: `1px solid ${healthColor}30`,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div className="status-dot" style={{
            background: healthColor,
            animation: overallHealth !== 'SAFE' ? 'glow-danger 1.5s infinite' : 'glow-success 2s infinite',
          }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: healthColor }}>
              System {overallHealth}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {settings.fridgeName}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={2} />
              <span style={{ flex: 1 }}>{label}</span>
              {label === 'Alerts' && unackAlerts > 0 && (
                <span style={{
                  background: 'var(--danger)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '100px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>
                  {unackAlerts > 99 ? '99+' : unackAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile + logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px', color: 'white', flexShrink: 0,
            }}>
              {user?.displayName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || 'Admin'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px' }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
}
