/**
 * OS Shell — Top status bar + icon navigation rail
 * Replaces traditional Sidebar + Navbar with a medical device OS chrome
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, BarChart3, Thermometer,
  Bell, FileText, Settings, LogOut, Wifi, WifiOff,
  Cloud, CloudOff, Cpu, Signal, Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useClock, useNetworkLatency } from '../../hooks/useCustomHooks';
import { format } from 'date-fns';

const NAV_ITEMS = [
  { path: '/dashboard',  icon: LayoutDashboard, label: 'Control' },
  { path: '/live',       icon: Activity,         label: 'Live' },
  { path: '/analytics',  icon: BarChart3,         label: 'Analytics' },
  { path: '/history',    icon: Thermometer,       label: 'History' },
  { path: '/alerts',     icon: Bell,              label: 'Alerts' },
  { path: '/reports',    icon: FileText,          label: 'Reports' },
  { path: '/settings',  icon: Settings,           label: 'Settings' },
];

export default function OSShell() {
  const { user, logout } = useAuth();
  const { sensorData, connected } = useData();
  const { settings } = useSettings();
  const now = useClock();
  const latency = useNetworkLatency(10000);
  const navigate = useNavigate();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const unackAlerts = sensorData?.alerts?.filter(a => !a.acknowledged).length ?? 0;
  const overallHealth = sensorData?.overallHealth || 'SAFE';

  const statusColor = overallHealth === 'SAFE'
    ? 'var(--safe)' : overallHealth === 'WARNING'
    ? 'var(--caution)' : 'var(--alarm)';

  async function handleLogout() {
    if (!logoutConfirm) { setLogoutConfirm(true); return; }
    await logout();
    navigate('/login');
  }

  return (
    <>
      {/* ── Top status bar ──────────────────────────────── */}
      <div className="os-topbar">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto' }}>
          <div style={{
            width: 22, height: 22,
            borderRadius: '5px',
            background: 'rgba(0, 214, 143, 0.12)',
            border: '1px solid rgba(0, 214, 143, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v4M4 3h4M2 7h8M2 9.5C2 10.3 2.7 11 3.5 11h5c.8 0 1.5-.7 1.5-1.5V5.5C10 4.7 9.3 4 8.5 4h-5C2.7 4 2 4.7 2 5.5V9.5z" stroke="var(--safe)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
            ColdChain OS
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
            {settings.fridgeName || 'Vaccine Unit 01'}
          </span>
        </div>

        {/* Connection indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <TopbarIndicator
            active={sensorData?.wifi}
            icon={sensorData?.wifi ? Wifi : WifiOff}
            label="WiFi"
          />
          <TopbarIndicator
            active={connected}
            icon={connected ? Cloud : CloudOff}
            label="Database"
          />
          <TopbarIndicator
            active={sensorData?.deviceStatus?.esp32}
            icon={Cpu}
            label="ESP32"
          />
          {latency !== null && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {latency}ms
            </span>
          )}
        </div>

        {/* System status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px',
          borderRadius: '100px',
          background: overallHealth === 'SAFE' ? 'var(--safe-dim)' : overallHealth === 'WARNING' ? 'var(--caution-dim)' : 'var(--alarm-dim)',
          border: `1px solid ${statusColor}40`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
          }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor, letterSpacing: '0.04em' }}>
            {overallHealth}
          </span>
        </div>

        {/* Clock */}
        <div style={{ textAlign: 'right', paddingLeft: '14px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {format(now, 'HH:mm:ss')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '1px' }}>
            {format(now, 'dd MMM yyyy')}
          </div>
        </div>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          paddingLeft: '14px', borderLeft: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)',
          }}>
            {user?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <button
            onClick={handleLogout}
            onBlur={() => setLogoutConfirm(false)}
            title={logoutConfirm ? 'Click again to confirm logout' : 'Logout'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: logoutConfirm ? 'var(--alarm)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
              padding: '4px',
              borderRadius: '5px',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* ── Navigation rail ─────────────────────────────── */}
      <nav className="os-rail">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            title={label}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span style={{ fontSize: '9px', fontWeight: 500, color: 'inherit', letterSpacing: '0.02em', lineHeight: 1 }}>
              {label}
            </span>
            {path === '/alerts' && unackAlerts > 0 && <span className="rail-badge" />}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function TopbarIndicator({ active, icon: Icon, label }) {
  return (
    <div
      title={`${label}: ${active ? 'Online' : 'Offline'}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        color: active ? 'var(--safe)' : 'var(--text-muted)',
        fontSize: '11px', fontWeight: 500,
      }}
    >
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: active ? 'var(--safe)' : 'var(--text-faint)',
        boxShadow: active ? '0 0 5px var(--safe)' : 'none',
      }} />
      <Icon size={12} />
    </div>
  );
}
