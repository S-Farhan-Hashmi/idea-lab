/**
 * OSShell — Top status bar + icon navigation rail
 * Exactly matching the commercial medical hardware UI screenshot
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Activity, BarChart3, Thermometer,
  Bell, FileText, Settings, LogOut, Sun, ChevronDown,
  Snowflake, ShieldCheck, ShieldAlert, ShieldX,
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

  const statusMap = {
    SAFE:     { color: 'var(--safe)', bg: 'var(--safe-dim)', icon: ShieldCheck, text: 'SAFE' },
    WARNING:  { color: 'var(--caution)', bg: 'var(--caution-dim)', icon: ShieldAlert, text: 'WARNING' },
    CRITICAL: { color: 'var(--alarm)', bg: 'var(--alarm-dim)', icon: ShieldX, text: 'CRITICAL' },
  };
  const st = statusMap[overallHealth] || statusMap.SAFE;
  const StatusIcon = st.icon;

  async function handleLogout() {
    if (!logoutConfirm) { setLogoutConfirm(true); return; }
    await logout();
    navigate('/login');
  }

  return (
    <>
      {/* ── Top status bar ──────────────────────────────── */}
      <header className="os-topbar">
        {/* Brand & Unit Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginRight: 'auto' }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: '8px',
            background: 'rgba(0, 214, 143, 0.15)',
            border: '1px solid rgba(0, 214, 143, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 214, 143, 0.2)',
          }}>
            <Snowflake size={18} color="var(--safe)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.02em' }}>
              ColdChain OS
            </span>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
              {settings.fridgeName || 'Vaccine Refrigerator Unit-01'}
            </span>
          </div>
        </div>

        {/* Center/Right Connectivity & Health Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <TopbarIndicator active={sensorData?.wifi !== false} label="WiFi" />
          <TopbarIndicator active={sensorData?.deviceStatus?.esp32 !== false} label="ESP32" />
          <TopbarIndicator active={connected} label="Firebase" />

          {latency !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
              <span>⏱</span>
              <span>{latency}ms</span>
            </div>
          )}

          {/* SAFE status pill button */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px',
            borderRadius: '100px',
            background: st.bg,
            border: `1px solid ${st.color}50`,
            boxShadow: `0 0 12px ${st.color}20`,
          }}>
            <StatusIcon size={14} color={st.color} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: st.color, letterSpacing: '0.04em' }}>
              {st.text}
            </span>
          </div>
        </div>

        {/* Far Right Clock & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingLeft: '16px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F3F4F6', lineHeight: 1 }}>
              {format(now, 'HH:mm:ss')}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', fontWeight: 500 }}>
              {format(now, 'dd MMM yyyy')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleLogout}
              onBlur={() => setLogoutConfirm(false)}
              title={logoutConfirm ? 'Click again to logout' : 'User Profile'}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: logoutConfirm ? 'var(--alarm-dim)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${logoutConfirm ? 'var(--alarm)' : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: logoutConfirm ? 'var(--alarm)' : '#E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {logoutConfirm ? <LogOut size={15} /> : (user?.displayName?.[0]?.toUpperCase() || 'D')}
            </button>
            <ChevronDown size={14} color="#6B7280" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </header>

      {/* ── Left Navigation Rail ─────────────────────────── */}
      <nav className="os-rail">
        {/* Top Logo box */}
        <div style={{
          width: 40, height: 40, borderRadius: '10px',
          background: 'rgba(0, 214, 143, 0.15)',
          border: '1px solid rgba(0, 214, 143, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px',
          boxShadow: '0 0 16px rgba(0, 214, 143, 0.2)',
        }}>
          <Snowflake size={20} color="var(--safe)" />
        </div>

        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            title={label}
          >
            <Icon size={20} strokeWidth={1.75} />
            {path === '/alerts' && unackAlerts > 0 && <span className="rail-badge" />}
          </NavLink>
        ))}

        {/* Bottom Theme/Brightness Icon */}
        <div style={{ marginTop: 'auto', paddingBottom: '8px' }}>
          <button
            title="Theme Brightness"
            style={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280', cursor: 'pointer', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
          >
            <Sun size={20} strokeWidth={1.75} />
          </button>
        </div>
      </nav>
    </>
  );
}

function TopbarIndicator({ active, label }) {
  return (
    <div
      title={`${label}: ${active ? 'Online' : 'Offline'}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '13px', fontWeight: 600, color: '#D1D5DB',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: active ? 'var(--safe)' : 'var(--alarm)',
        boxShadow: active ? '0 0 8px var(--safe)' : '0 0 8px var(--alarm)',
      }} />
      <span>{label}</span>
    </div>
  );
}
