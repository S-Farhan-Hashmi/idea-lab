/**
 * Live Monitoring Page — OS-style full telemetry view
 */
import { motion } from 'framer-motion';
import { Activity, Thermometer, Wind, Droplets, DoorOpen, Bell, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { FridgeTempChart, RoomTempChart, HumidityChart, DoorEventsChart } from '../components/charts/LiveCharts';
import { formatTemp, formatHumidity, formatDuration, formatTimeAgo } from '../utils/formatters';

export default function LiveMonitoring() {
  const { sensorData, chartSeries, thresholds } = useData();

  if (!sensorData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      Connecting to sensor telemetry...
    </div>
  );

  const { fridgeTemp, roomTemp, humidity, doorStatus, doorOpenDuration, buzzer, alerts } = sensorData;

  const recentActivity = (alerts || []).slice(0, 10);

  const tempSafe = fridgeTemp >= thresholds.fridgeTempMin && fridgeTemp <= thresholds.fridgeTempMax;
  const humSafe = humidity <= thresholds.humidityMax;

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
          Real-time sensor readings updating every 2 seconds via ESP32 → Firebase
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <LiveStat
          icon={Thermometer}
          label="Fridge Temperature"
          value={formatTemp(fridgeTemp)}
          status={tempSafe ? 'safe' : 'alarm'}
          note={tempSafe ? 'Within safe zone' : 'Out of range!'}
        />
        <LiveStat
          icon={Wind}
          label="Room Temperature"
          value={formatTemp(roomTemp)}
          status={roomTemp > thresholds.roomTempMax ? 'caution' : 'neutral'}
          note="Ambient"
        />
        <LiveStat
          icon={Droplets}
          label="Humidity"
          value={formatHumidity(humidity)}
          status={humSafe ? 'neutral' : 'caution'}
          note={`Max ${thresholds.humidityMax}%`}
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

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <FridgeTempChart
          data={chartSeries.fridgeTemp}
          safeMin={thresholds.fridgeTempMin}
          safeMax={thresholds.fridgeTempMax}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <RoomTempChart data={chartSeries.roomTemp} />
          <HumidityChart data={chartSeries.humidity} />
        </div>
        <DoorEventsChart data={chartSeries.doorEvents} />
      </div>

      {/* Activity feed */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-label">LIVE EVENT FEED</div>
        </div>
        {recentActivity.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={28} color="var(--safe)" style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontSize: '13px' }}>No recent events</div>
          </div>
        ) : recentActivity.map((a, i) => {
          const color = a.priority === 'critical' || a.priority === 'high' ? 'var(--alarm)' :
                        a.priority === 'medium' ? 'var(--caution)' : 'var(--text-muted)';
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: a.acknowledged ? 0.5 : 1 }}
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
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>{a.message}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formatTimeAgo(a.timestamp)}</div>
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
