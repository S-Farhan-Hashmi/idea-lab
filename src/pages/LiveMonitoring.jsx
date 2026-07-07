/**
 * Live Monitoring Page — Full-width expanded charts + real-time stats
 */
import { motion } from 'framer-motion';
import { Activity, Thermometer, Wind, Droplets, DoorOpen, Zap } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { FridgeTempChart, RoomTempChart, HumidityChart, DoorEventsChart } from '../components/charts/LiveCharts';
import { formatTemp, formatHumidity, formatDuration } from '../utils/formatters';

function StatBadge({ label, value, color, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
      style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '14px',
        borderColor: `${color}20`,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: '11px',
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
        <div style={{
          fontSize: '22px', fontWeight: 800, color,
          fontFamily: 'var(--font-mono)', lineHeight: 1.2,
          textShadow: `0 0 12px ${color}40`,
        }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ text, time, color }) {
  return (
    <div style={{
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color, marginTop: '5px', flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{text}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{time}</div>
      </div>
    </div>
  );
}

export default function LiveMonitoring() {
  const { sensorData, chartSeries, thresholds } = useData();

  if (!sensorData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
      Loading sensor data...
    </div>
  );

  const { fridgeTemp, roomTemp, humidity, doorStatus, doorOpenDuration, buzzer, alerts } = sensorData;

  // Build activity feed from recent alerts
  const recentActivity = alerts.slice(0, 10).map(a => ({
    text: a.message,
    time: new Date(a.timestamp).toLocaleTimeString(),
    color: a.priority === 'critical' ? 'var(--danger)' :
           a.priority === 'medium' ? 'var(--warning)' : 'var(--accent)',
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Activity size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Live Monitoring</h1>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', color: 'var(--success)',
            background: 'rgba(16,185,129,0.1)', padding: '3px 10px',
            borderRadius: '100px', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <span className="status-dot online" style={{ width: 6, height: 6 }} />
            STREAMING LIVE
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Real-time sensor readings — updating every 2 seconds
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatBadge
          label="Fridge Temp"
          value={formatTemp(fridgeTemp)}
          color={fridgeTemp > thresholds.fridgeTempMax || fridgeTemp < thresholds.fridgeTempMin ? 'var(--danger)' : 'var(--success)'}
          icon={Thermometer}
        />
        <StatBadge
          label="Room Temp"
          value={formatTemp(roomTemp)}
          color="var(--warning)"
          icon={Wind}
        />
        <StatBadge
          label="Humidity"
          value={formatHumidity(humidity)}
          color={humidity > thresholds.humidityMax ? 'var(--warning)' : 'var(--cyan)'}
          icon={Droplets}
        />
        <StatBadge
          label="Door"
          value={doorStatus?.toUpperCase()}
          color={doorStatus === 'open' ? 'var(--danger)' : 'var(--success)'}
          icon={DoorOpen}
        />
        <StatBadge
          label="Buzzer"
          value={buzzer ? 'ACTIVE' : 'SILENT'}
          color={buzzer ? 'var(--danger)' : 'var(--success)'}
          icon={Zap}
        />
      </div>

      {/* Charts (full-width) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <FridgeTempChart
          data={chartSeries.fridgeTemp}
          safeMin={thresholds.fridgeTempMin}
          safeMax={thresholds.fridgeTempMax}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <RoomTempChart data={chartSeries.roomTemp} />
          <HumidityChart data={chartSeries.humidity} />
        </div>
        <DoorEventsChart data={chartSeries.doorEvents} />
      </div>

      {/* Activity Feed */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
          Live Activity Feed
        </h3>
        {recentActivity.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            No recent activity
          </div>
        ) : recentActivity.map((item, i) => (
          <ActivityItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
