/**
 * Device Health Panel — ESP32, WiFi, Firebase, Sensor status
 */
import { motion } from 'framer-motion';
import { Cpu, Wifi, Cloud, Thermometer, Clock, Activity, CheckCircle, XCircle } from 'lucide-react';
import { formatUptime, formatTimeAgo } from '../../utils/formatters';

function StatusRow({ icon: Icon, label, status, detail }) {
  const online = status === true || status === 'online';
  const color = online ? 'var(--success)' : 'var(--danger)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '10px',
      border: `1px solid ${online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '8px',
        background: `${color}15`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {detail && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{detail}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div className="status-dot" style={{
          background: color,
          animation: online ? 'glow-success 2s infinite' : 'glow-danger 1.5s infinite',
        }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color }}>
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

export default function DeviceHealthPanel({ deviceStatus, connected }) {
  if (!deviceStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card"
      style={{ padding: '20px' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Device Health
        </div>
        <span className={`badge ${deviceStatus.esp32 ? 'badge-success' : 'badge-danger'}`}>
          {deviceStatus.esp32 ? 'CONNECTED' : 'OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <StatusRow icon={Cpu} label="ESP32 Microcontroller" status={deviceStatus.esp32} detail="Dual-core 240MHz" />
        <StatusRow icon={Wifi} label="WiFi Connection" status={deviceStatus.wifiConnected}
          detail={deviceStatus.wifiConnected ? `Signal: ${deviceStatus.wifiStrength ?? 0}%` : 'No network'} />
        <StatusRow icon={Cloud} label="Firebase Database" status={connected}
          detail={connected ? 'Real-time sync active' : 'Mock data mode'} />
        <StatusRow icon={Thermometer} label="DS18B20 Sensor" status={deviceStatus.esp32}
          detail="Waterproof temperature probe" />
        <StatusRow icon={Activity} label="DHT22 Sensor" status={deviceStatus.esp32}
          detail="Temperature & humidity" />
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '8px', marginTop: '16px',
      }}>
        <StatMini
          icon={Clock}
          label="Last Sync"
          value={deviceStatus.lastSync ? formatTimeAgo(deviceStatus.lastSync) : '—'}
        />
        <StatMini
          icon={Activity}
          label="Uptime"
          value={formatUptime(deviceStatus.uptime ?? 0)}
        />
      </div>
    </motion.div>
  );
}

function StatMini({ icon: Icon, label, value }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '10px',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <Icon size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
