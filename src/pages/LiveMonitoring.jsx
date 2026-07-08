/**
 * Live Monitoring Page — OS-style full telemetry view
 * Powered entirely by live Firebase sensor data
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Wind, Droplets, DoorOpen, Bell, CheckCircle2, Wifi, Clock, Cpu } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { FridgeTempChart, RoomTempChart, HumidityChart, DoorEventsChart } from '../components/charts/LiveCharts';
import { formatTemp, formatHumidity, formatDuration, formatTimeAgo } from '../utils/formatters';
import LoadingScreen from '../components/layout/LoadingScreen';

export default function LiveMonitoring() {
  const { sensorData, chartSeries, thresholds } = useData();

  if (!sensorData) return <LoadingScreen />;

  const {
    fridgeTemp, roomTemp, humidity, doorStatus, doorOpenDuration,
    buzzer, history, deviceStatus,
  } = sensorData;

  // Use live history records as the event feed (latest 10, newest first)
  const recentActivity = useMemo(() => {
    return (history || []).slice(0, 10);
  }, [history]);

  const tempSafe = fridgeTemp >= (thresholds?.fridgeTempMin ?? 2) && fridgeTemp <= (thresholds?.fridgeTempMax ?? 8);
  const humSafe  = humidity <= (thresholds?.humidityMax ?? 75);

  return (
    <div className="page-content">
      {/* Page header */}
      <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '9px',
            background: 'var(--safe-dim)', border: '1px solid var(--safe-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={17} color="var(--safe)" />
          </div>
          <h1 style={{ fontSize: '20px' }}>Live Telemetry Monitor</h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '100px',
            background: 'var(--safe-dim)', border: '1px solid var(--safe-glow)',
          }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)' }}
            />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--safe)', letterSpacing: '0.05em' }}>STREAMING</span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '48px' }}>
          Real-time sensor readings updating via ESP32 → Firebase · {history?.length ?? 0} records stored
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <LiveStat
          icon={Thermometer}
          label="Fridge Temperature"
          value={formatTemp(fridgeTemp)}
          status={tempSafe ? 'safe' : 'alarm'}
          note={tempSafe ? 'Within safe zone' : 'OUT OF RANGE!'}
        />
        <LiveStat
          icon={Wind}
          label="Room Temperature"
          value={formatTemp(roomTemp)}
          status={roomTemp > (thresholds?.roomTempMax ?? 35) ? 'caution' : 'neutral'}
          note="Ambient"
        />
        <LiveStat
          icon={Droplets}
          label="Humidity"
          value={formatHumidity(humidity)}
          status={humSafe ? 'neutral' : 'caution'}
          note={`Max ${thresholds?.humidityMax ?? 75}%`}
        />
        <LiveStat
          icon={DoorOpen}
          label="Door Status"
          value={doorStatus?.toUpperCase()}
          status={doorStatus === 'open' ? 'alarm' : 'safe'}
          note={doorStatus === 'open' && doorOpenDuration > 0 ? `Open ${formatDuration(doorOpenDuration)}` : 'Sealed'}
        />
        <LiveStat
          icon={Bell}
          label="Alarm"
          value={buzzer ? 'ACTIVE' : 'SILENT'}
          status={buzzer ? 'alarm' : 'neutral'}
          note={buzzer ? 'Acoustic alarm on' : 'No active alarm'}
        />
      </div>

      {/* Device Info Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px',
      }}>
        <DeviceInfoCard icon={Cpu} label="ESP32 Status" value={deviceStatus?.esp32 ? 'Online' : 'Offline'} sub={deviceStatus?.ip || 'No IP'} ok={!!deviceStatus?.esp32} />
        <DeviceInfoCard icon={Wifi} label="WiFi Signal" value={`${deviceStatus?.wifiStrength ?? 0}%`} sub={`RSSI ${deviceStatus?.rssi ?? '—'} dBm`} ok={(deviceStatus?.wifiStrength ?? 0) > 20} />
        <DeviceInfoCard icon={Clock} label="Uptime" value={formatDuration(deviceStatus?.uptime ?? 0)} sub="Continuous operation" ok={true} />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <FridgeTempChart
          data={chartSeries?.fridgeTemp || []}
          thresholds={thresholds}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <RoomTempChart data={chartSeries?.roomTemp || []} />
          <HumidityChart data={chartSeries?.humidity || []} />
        </div>
        <DoorEventsChart data={chartSeries?.doorEvents || []} />
      </div>

      {/* Live History Event Feed */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="panel-label">LIVE EVENT FEED</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {recentActivity.length} most recent readings
          </div>
        </div>
        {recentActivity.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={28} color="var(--safe)" style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontSize: '13px' }}>No telemetry history yet — readings will appear here automatically</div>
          </div>
        ) : recentActivity.map((record, i) => {
          const fTemp = record.fridgeTemp ?? 0;
          const isOut = fTemp > (thresholds?.fridgeTempMax ?? 8) || fTemp < (thresholds?.fridgeTempMin ?? 2);
          const doorOpen = record.doorStatus === 'open';
          const color = isOut ? 'var(--alarm)' : doorOpen ? 'var(--caution)' : 'var(--text-muted)';
          return (
            <motion.div
              key={record.id || i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, marginTop: '4px', flexShrink: 0, boxShadow: `0 0 4px ${color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {formatTemp(fTemp)} · {formatHumidity(record.humidity ?? 0)} · Door {record.doorStatus?.toUpperCase() ?? '—'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {formatTimeAgo(record.timestamp)} · Room {formatTemp(record.roomTemp ?? 0)}
                  {isOut ? '  ⚠ Temp out of range' : ''}
                  {doorOpen ? '  ⚠ Door open' : ''}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LiveStat({ icon: Icon, label, value, status, note }) {
  const colors = {
    safe:    'var(--safe)',
    alarm:   'var(--alarm)',
    caution: 'var(--caution)',
    neutral: 'var(--text-secondary)',
  };
  const color = colors[status] || colors.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '16px 18px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Icon size={14} color={color} />
        <span className="panel-label">{label.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{note}</div>
    </motion.div>
  );
}

function DeviceInfoCard({ icon: Icon, label, value, sub, ok }) {
  const color = ok ? 'var(--safe)' : 'var(--alarm)';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '10px',
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '2px' }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{sub}</div>
      </div>
    </motion.div>
  );
}
