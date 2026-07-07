/**
 * Top Navigation Bar
 * Shows: time, hospital name, connection status, dark mode toggle, user profile
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Cloud, CloudOff, Cpu, Menu, Bell,
  Sun, Moon, ChevronDown, LogOut, User, Settings, Activity,
  Signal,
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
    <header className="navbar">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', padding: '6px', borderRadius: '8px',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Hospital name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {settings.hospitalName}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          IoT Cold Chain Monitoring System
        </div>
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* WiFi Status */}
        <NavStatusPill
          icon={sensorData?.wifi ? Wifi : WifiOff}
          label="WiFi"
          status={sensorData?.wifi ? 'online' : 'offline'}
          color={sensorData?.wifi ? 'var(--success)' : 'var(--danger)'}
        />

        {/* Firebase Status */}
        <NavStatusPill
          icon={connected ? Cloud : CloudOff}
          label="Firebase"
          status={connected ? 'online' : 'offline'}
          color={connected ? 'var(--success)' : 'var(--warning)'}
        />

        {/* ESP32 Status */}
        <NavStatusPill
          icon={Cpu}
          label="ESP32"
          status={deviceStatus?.esp32 ? 'online' : 'offline'}
          color={deviceStatus?.esp32 ? 'var(--success)' : 'var(--danger)'}
        />

        {/* Network Latency */}
        {latency !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 10px', borderRadius: '8px',
            background: 'var(--bg-elevated)',
            fontSize: '11px', color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <Signal size={13} />
            <span>{latency}ms</span>
          </div>
        )}
      </div>

      {/* Date & Time */}
      <div style={{
        textAlign: 'right',
        padding: '4px 12px',
        borderRadius: '10px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: '14px', fontWeight: 700,
          color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}>
          {format(now, 'HH:mm:ss')}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {format(now, 'EEE, dd MMM yyyy')}
        </div>
      </div>

      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(p => !p)}
          style={{
            background: notifOpen ? 'var(--bg-elevated)' : 'none',
            border: '1px solid ' + (notifOpen ? 'var(--border-accent)' : 'transparent'),
            color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '8px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', position: 'relative',
          }}
        >
          <Bell size={18} className={unackAlerts > 0 ? 'animate-bell' : ''} />
          {unackAlerts > 0 && (
            <span style={{
              position: 'absolute', top: '4px', right: '4px',
              width: '8px', height: '8px',
              background: 'var(--danger)', borderRadius: '50%',
              border: '2px solid var(--bg-card)',
            }} />
          )}
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{
                position: 'absolute', right: 0, top: '48px',
                width: '320px', zIndex: 200,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                {unackAlerts > 0 && (
                  <span className="badge badge-danger">{unackAlerts} new</span>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {recentAlerts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No recent alerts
                  </div>
                ) : recentAlerts.map(alert => (
                  <AlertNotifItem key={alert.id} alert={alert} />
                ))}
              </div>
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border-color)',
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
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
            background: profileOpen ? 'var(--bg-elevated)' : 'none',
            border: '1px solid ' + (profileOpen ? 'var(--border-accent)' : 'transparent'),
            borderRadius: '10px', padding: '6px 10px',
            cursor: 'pointer', color: 'var(--text-primary)',
          }}
        >
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ display: 'none' }} className="sm:block">
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{user?.displayName || 'Admin'}</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{
                position: 'absolute', right: 0, top: '48px',
                width: '220px', zIndex: 200,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{user?.displayName || 'Admin'}</div>
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
                    width: '100%', padding: '10px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontSize: '13px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'var(--bg-elevated)'; e.target.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '4px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--danger)', fontSize: '13px',
                  }}
                >
                  <LogOut size={15} />
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
  return (
    <div
      title={`${label}: ${status}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 10px', borderRadius: '8px',
        background: `${color}15`,
        border: `1px solid ${color}30`,
        fontSize: '11px', fontWeight: 600, color,
        transition: 'all 0.2s',
      }}
    >
      <Icon size={12} />
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
      padding: '10px 16px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', gap: '10px', alignItems: 'flex-start',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: priorityColor, marginTop: '5px', flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {alert.message}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
