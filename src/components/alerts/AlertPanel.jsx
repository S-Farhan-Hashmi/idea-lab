/**
 * Alert Panel — Live alert feed with priority, timestamp, and actions
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
  Thermometer, DoorOpen, Droplets, Wifi, Cloud,
  AlertTriangle, Bell, Zap, Info, X, CheckCheck,
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

const ALERT_ICONS = {
  temp_high: Thermometer,
  temp_low: Thermometer,
  door_open: DoorOpen,
  humidity_high: Droplets,
  sensor_failure: AlertTriangle,
  wifi_lost: Wifi,
  firebase_offline: Cloud,
  system_start: Info,
  temp_ok: CheckCheck,
  default: Bell,
};

const PRIORITY_CONFIG = {
  critical: { color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'CRITICAL' },
  high:     { color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'HIGH' },
  medium:   { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'MEDIUM' },
  low:      { color: 'var(--accent)', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', label: 'LOW' },
  info:     { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border-color)', label: 'INFO' },
};

function AlertItem({ alert, onAck }) {
  const Icon = ALERT_ICONS[alert.type] || ALERT_ICONS.default;
  const pcfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: alert.acknowledged ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 12px',
        background: alert.acknowledged ? 'transparent' : pcfg.bg,
        border: `1px solid ${alert.acknowledged ? 'var(--border-color)' : pcfg.border}`,
        borderRadius: '10px',
        transition: 'all 0.3s',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '8px',
        background: `${pcfg.color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: '1px',
      }}>
        <Icon size={14} color={pcfg.color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700,
            color: pcfg.color, letterSpacing: '0.05em',
          }}>
            {pcfg.label}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {formatTimeAgo(alert.timestamp)}
          </span>
          {alert.acknowledged && (
            <span style={{ fontSize: '10px', color: 'var(--success)' }}>✓ ACK</span>
          )}
        </div>
        <div style={{
          fontSize: '12px', color: alert.acknowledged ? 'var(--text-muted)' : 'var(--text-primary)',
          lineHeight: 1.4,
        }}>
          {alert.message}
        </div>
      </div>

      {!alert.acknowledged && (
        <button
          onClick={() => onAck(alert.id)}
          title="Acknowledge"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px', borderRadius: '6px',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--success)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          <X size={13} />
        </button>
      )}
    </motion.div>
  );
}

export default function AlertPanel({ maxItems = 8 }) {
  const { sensorData, ackAlert, clearAlerts } = useData();
  const alerts = sensorData?.alerts?.slice(0, maxItems) ?? [];
  const unackCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>Live Alerts</div>
          {unackCount > 0 && (
            <span style={{
              background: 'var(--danger)', color: 'white',
              fontSize: '10px', fontWeight: 700,
              padding: '2px 7px', borderRadius: '100px',
              animation: 'glow-danger 1.5s infinite',
            }}>
              {unackCount}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={clearAlerts}>
            Clear All
          </button>
        )}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
        maxHeight: '340px', overflowY: 'auto',
      }}>
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: '32px',
                color: 'var(--text-muted)', fontSize: '13px',
              }}
            >
              <CheckCheck size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              No active alerts
            </motion.div>
          ) : alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} onAck={ackAlert} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
