/**
 * Top Navigation Bar — Handcrafted Premium SaaS Style
 * Shows: time, hospital name, connection status, dark mode toggle, user profile
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Cloud, CloudOff, Cpu, Menu, Bell,
  ChevronDown, LogOut, User, Settings, Activity,
  Signal, Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useClock, useNetworkLatency } from '../../hooks/useCustomHooks';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { sensorData, connected } = useData();
  const { settings } = useSettings();
  const now = useClock();
  const latency = useNetworkLatency(10000);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const deviceStatus = sensorData?.deviceStatus;
  const unackAlerts = sensorData?.alerts?.filter(a => !a.acknowledged).length ?? 0;
  const recentAlerts = sensorData?.alerts?.slice(0, 5) ?? [];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="navbar" style={{
      background: 'rgba(9, 9, 11, 0.85)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      gap: '20px',
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', padding: '6px', borderRadius: '6px',
          display: 'flex', alignItems: 'center',
        }}
        className="lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Hospital name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {settings.hospitalName || 'City Medical Center'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {settings.fridgeName || 'Vaccine Refrigerator Unit-01'}
        </div>
      </div>

      {/* Status indicators (Subtle, professional pills) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <NavStatusPill
          icon={sensorData?.wifi ? Wifi : WifiOff}
          label="WiFi"
          status={sensorData?.wifi ? 'online' : 'offline'}
          color={sensorData?.wifi ? 'var(--success)' : 'var(--danger)'}
        />

        <NavStatusPill
          icon={connected ? Cloud : CloudOff}
          label="Firebase"
          status={connected ? 'online' : 'offline'}
          color={connected ? 'var(--success)' : 'var(--warning)'}
        />

        <NavStatusPill
          icon={Cpu}
          label="ESP32"
          status={deviceStatus?.esp32 ? 'online' : 'offline'}
          color={deviceStatus?.esp32 ? 'var(--success)' : 'var(--danger)'}
        />

        {latency !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 8px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.02)',
            fontSize: '11px', color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
          }}>
            <Signal size={12} color="var(--text-secondary)" />
            <span>{latency}ms</span>
          </div>
        )}
      </div>

      {/* Date & Time (Clean typography hierarchy) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '5px 12px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <Clock size={13} color="var(--text-muted)" />
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '13px', fontWeight: 600,
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            {format(now, 'HH:mm:ss')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.2 }}>
            {format(now, 'EEE, dd MMM yyyy')}
          </div>
        </div>
      </div>

      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(p => !p)}
          title="Notifications"
          style={{
            background: notifOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: '1px solid ' + (notifOpen ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'),
            color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '8px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', position: 'relative',
            transition: 'all 0.15s',
          }}
        >
          <Bell size={16} className={unackAlerts > 0 ? 'animate-bell' : ''} />
          {unackAlerts > 0 && (
            <span style={{
              position: 'absolute', top: '5px', right: '5px',
              width: '6px', height: '6px',
              background: 'var(--danger)', borderRadius: '50%',
              boxShadow: '0 0 6px var(--danger)',
            }} />
          )}
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', right: 0, top: '44px',
                width: '320px', zIndex: 200,
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Notifications</span>
                {unackAlerts > 0 && (
                  <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 6px' }}>{unackAlerts} new</span>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {recentAlerts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No recent alerts
                  </div>
                ) : recentAlerts.map(alert => (
                  <AlertNotifItem key={alert.id} alert={alert} />
                ))}
              </div>
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
                  onClick={() => { navigate('/alerts'); setNotifOpen(false); }}
                >
                  View All Alerts
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setProfileOpen(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: profileOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: '1px solid ' + (profileOpen ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'),
            borderRadius: '8px', padding: '5px 10px',
            cursor: 'pointer', color: 'var(--text-primary)',
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 26, height: 26,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0,
          }}>
            {user?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ display: 'none' }} className="sm:block">
            <div style={{ fontSize: '12px', fontWeight: 500 }}>{user?.displayName || 'Admin'}</div>
          </div>
          <ChevronDown size={13} color="var(--text-muted)" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', right: 0, top: '44px',
                width: '200px', zIndex: 200,
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.displayName || 'Admin'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              {[
                { icon: User, label: 'Profile' },
                { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                { icon: Activity, label: 'Activity' },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={() => { action?.(); setProfileOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontSize: '12px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--danger)', fontSize: '12px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function NavStatusPill({ icon: Icon, label, status, color }) {
  const isOnline = status === 'online';
  return (
    <div
      title={`${label}: ${status}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '4px 8px', borderRadius: '6px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color,
        boxShadow: isOnline ? `0 0 6px ${color}` : 'none',
      }} />
      <span style={{ display: 'none' }} className="md:inline">{label}</span>
    </div>
  );
}

function AlertNotifItem({ alert }) {
  const priorityColor = alert.priority === 'critical' ? 'var(--danger)' :
    alert.priority === 'high' ? 'var(--danger)' :
    alert.priority === 'medium' ? 'var(--warning)' : 'var(--accent)';

  return (
    <div style={{
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', gap: '10px', alignItems: 'flex-start',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: priorityColor, marginTop: '5px', flexShrink: 0,
        boxShadow: `0 0 6px ${priorityColor}`,
      }} />
      <div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {alert.message}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
