/**
 * Alerts Page — Handcrafted Premium SaaS Style
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Filter, Download, CheckCheck, Trash2,
  Thermometer, DoorOpen, Droplets, Wifi, Cloud, AlertTriangle, Info,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatTimestamp, formatTimeAgo } from '../utils/formatters';
import { exportAlertsCSV } from '../utils/exportHelpers';
import LoadingScreen from '../components/layout/LoadingScreen';
import toast from 'react-hot-toast';

const ALERT_ICONS = {
  temp_high: Thermometer, temp_low: Thermometer,
  door_open: DoorOpen, humidity_high: Droplets,
  sensor_failure: AlertTriangle, wifi_lost: Wifi,
  firebase_offline: Cloud, system_start: Info,
  temp_ok: CheckCheck, default: Bell,
};

const PRIORITY_CONFIG = {
  critical: { color: 'var(--danger)', bg: 'rgba(239,68,68,0.05)', label: 'CRITICAL', border: 'rgba(239,68,68,0.25)' },
  high:     { color: 'var(--danger)', bg: 'rgba(239,68,68,0.04)', label: 'HIGH', border: 'rgba(239,68,68,0.2)' },
  medium:   { color: 'var(--warning)', bg: 'rgba(245,158,11,0.04)', label: 'MEDIUM', border: 'rgba(245,158,11,0.2)' },
  low:      { color: 'var(--accent-light)', bg: 'rgba(59,130,246,0.04)', label: 'LOW', border: 'rgba(59,130,246,0.2)' },
  info:     { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.02)', label: 'INFO', border: 'var(--border-color)' },
};

export default function AlertsPage() {
  const { sensorData, ackAlert, clearAlerts } = useData();

  if (!sensorData) return <LoadingScreen />;

  const alerts = sensorData?.alerts ?? [];

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAcked, setShowAcked] = useState(true);

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      const prioMatch = filterPriority === 'all' || a.priority === filterPriority;
      const typeMatch = filterType === 'all' || a.type === filterType;
      const ackMatch = showAcked || !a.acknowledged;
      const searchMatch = !search || a.message?.toLowerCase().includes(search.toLowerCase());
      return prioMatch && typeMatch && ackMatch && searchMatch;
    });
  }, [alerts, search, filterPriority, filterType, showAcked]);

  function handleExport() {
    exportAlertsCSV(filtered);
    toast.success(`Exported ${filtered.length} alerts`);
  }

  const unackCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={18} color="var(--danger)" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>System Alerts & Notifications</h1>
          {unackCount > 0 && (
            <span style={{
              background: 'var(--danger)', color: 'white',
              fontSize: '11px', fontWeight: 700,
              padding: '2px 10px', borderRadius: '100px',
              boxShadow: '0 0 10px rgba(239,68,68,0.4)',
            }}>
              {unackCount} unacknowledged
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>
          {alerts.length} total diagnostic events and clinical alarm triggers recorded
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: '220px', maxWidth: '360px' }}>
            <Search size={15} className="icon" />
            <input className="input" placeholder="Search alert messages..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input" style={{ width: 'auto', paddingLeft: '14px', paddingRight: '28px', cursor: 'pointer' }}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>

          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', color: 'var(--text-secondary)',
            cursor: 'pointer', whiteSpace: 'nowrap',
            padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)', borderRadius: '8px',
            userSelect: 'none',
          }}>
            <input type="checkbox" checked={showAcked} onChange={e => setShowAcked(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            Show acknowledged alerts
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ gap: '6px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-danger" onClick={() => { clearAlerts(); toast.success('All alerts cleared'); }} style={{ gap: '6px' }}>
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card"
              style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}
            >
              <CheckCheck size={40} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'var(--success)' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {alerts.length === 0 ? 'No Alerts Yet' : 'No alerts found'}
              </div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>
                {alerts.length === 0
                  ? 'No diagnostic events or clinical alarms have been uploaded by the ESP32 yet.'
                  : 'All clinical storage parameters are within safe limits or filtered out'}
              </div>
            </motion.div>
          ) : filtered.map((alert, i) => {
            const pcfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.info;
            const Icon = ALERT_ICONS[alert.type] || ALERT_ICONS.default;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: alert.acknowledged ? 0.6 : 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px',
                  background: alert.acknowledged ? 'rgba(255,255,255,0.015)' : pcfg.bg,
                  border: `1px solid ${alert.acknowledged ? 'var(--border-color)' : pcfg.border}`,
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s',
                  boxShadow: alert.acknowledged ? 'none' : 'var(--shadow-sm)',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '10px',
                  background: alert.acknowledged ? 'rgba(255,255,255,0.03)' : `${pcfg.color}15`,
                  border: `1px solid ${alert.acknowledged ? 'var(--border-color)' : `${pcfg.color}30`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color={alert.acknowledged ? 'var(--text-muted)' : pcfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge badge-${alert.priority === 'critical' || alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'accent'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {pcfg.label}
                    </span>
                    {alert.acknowledged && (
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: alert.acknowledged ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 600, lineHeight: 1.3 }}>
                    {alert.message}
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                    {formatTimeAgo(alert.timestamp)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {formatTimestamp(alert.timestamp)}
                  </div>
                </div>

                {/* Ack button */}
                {!alert.acknowledged && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => ackAlert(alert.id)}
                    style={{ flexShrink: 0, padding: '6px 14px', fontWeight: 600 }}
                  >
                    <CheckCheck size={14} />
                    Acknowledge
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
