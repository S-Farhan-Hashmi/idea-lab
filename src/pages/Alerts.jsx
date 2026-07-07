/**
 * Alerts Page — Full alert log with filters, acknowledgement, and export
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
import toast from 'react-hot-toast';

const ALERT_ICONS = {
  temp_high: Thermometer, temp_low: Thermometer,
  door_open: DoorOpen, humidity_high: Droplets,
  sensor_failure: AlertTriangle, wifi_lost: Wifi,
  firebase_offline: Cloud, system_start: Info,
  temp_ok: CheckCheck, default: Bell,
};

const PRIORITY_CONFIG = {
  critical: { color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', label: 'CRITICAL' },
  high:     { color: 'var(--danger)', bg: 'rgba(239,68,68,0.06)', label: 'HIGH' },
  medium:   { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', label: 'MEDIUM' },
  low:      { color: 'var(--accent)', bg: 'rgba(59,130,246,0.08)', label: 'LOW' },
  info:     { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)', label: 'INFO' },
};

export default function AlertsPage() {
  const { sensorData, ackAlert, clearAlerts } = useData();
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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Bell size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Alerts</h1>
          {unackCount > 0 && (
            <span style={{
              background: 'var(--danger)', color: 'white',
              fontSize: '11px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '100px',
            }}>
              {unackCount} unacknowledged
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {alerts.length} total alerts generated
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div className="input-icon-wrap" style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search size={15} className="icon" />
          <input className="input" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input" style={{ width: 'auto', paddingLeft: '12px' }}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={showAcked} onChange={e => setShowAcked(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
          Show acknowledged
        </label>

        <button className="btn btn-secondary btn-sm" onClick={handleExport}>
          <Download size={13} /> Export
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => { clearAlerts(); toast.success('All alerts cleared'); }}>
          <Trash2 size={13} /> Clear All
        </button>
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card"
              style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}
            >
              <CheckCheck size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <div style={{ fontSize: '15px', fontWeight: 600 }}>No alerts found</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Try adjusting your filters</div>
            </motion.div>
          ) : filtered.map((alert, i) => {
            const pcfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.info;
            const Icon = ALERT_ICONS[alert.type] || ALERT_ICONS.default;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: alert.acknowledged ? 0.55 : 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px',
                  background: alert.acknowledged ? 'rgba(255,255,255,0.02)' : pcfg.bg,
                  border: `1px solid ${alert.acknowledged ? 'var(--border-color)' : `${pcfg.color}20`}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '9px',
                  background: `${pcfg.color}15`, border: `1px solid ${pcfg.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={pcfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span className={`badge badge-${alert.priority === 'critical' || alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'accent'}`}>
                      {pcfg.label}
                    </span>
                    {alert.acknowledged && (
                      <span style={{ fontSize: '10px', color: 'var(--success)' }}>✓ Acknowledged</span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {alert.message}
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatTimeAgo(alert.timestamp)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(100,116,139,0.6)', marginTop: '2px' }}>
                    {formatTimestamp(alert.timestamp)}
                  </div>
                </div>

                {/* Ack button */}
                {!alert.acknowledged && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => ackAlert(alert.id)}
                    style={{ flexShrink: 0 }}
                  >
                    <CheckCheck size={13} />
                    Ack
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
