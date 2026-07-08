/**
 * Analytics Page — Aggregated statistics and weekly/monthly charts
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Minus,
  Thermometer, Droplets, DoorOpen, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useData } from '../contexts/DataContext';
import { formatTemp, formatHumidity, formatDuration } from '../utils/formatters';
import LoadingScreen from '../components/layout/LoadingScreen';

function StatCard({ title, value, unit, icon: Icon, color, subtitle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card"
      style={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '8px',
          background: `${color}15`, border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 800, color,
        fontFamily: 'var(--font-mono)',
        textShadow: `0 0 20px ${color}30`,
      }}>
        {value}{unit}
      </div>
      {subtitle && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</div>
      )}
    </motion.div>
  );
}

export default function Analytics() {
  const { sensorData } = useData();

  if (!sensorData) return <LoadingScreen />;

  const history = sensorData?.history ?? [];
  const alerts = sensorData?.alerts ?? [];

  // Compute stats from history
  const stats = useMemo(() => {
    if (!history.length) return {};
    const fridgeTemps = history.map(h => h.fridgeTemp).filter(Boolean);
    const roomTemps = history.map(h => h.roomTemp).filter(Boolean);
    const humidities = history.map(h => h.humidity).filter(Boolean);
    const doorOpens = history.filter(h => h.doorStatus === 'open').length;

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const max = arr => arr.length ? Math.max(...arr) : 0;
    const min = arr => arr.length ? Math.min(...arr) : 0;

    return {
      avgFridge: avg(fridgeTemps),
      maxFridge: max(fridgeTemps),
      minFridge: min(fridgeTemps),
      avgRoom: avg(roomTemps),
      avgHumidity: avg(humidities),
      maxHumidity: max(humidities),
      doorOpens,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.priority === 'critical').length,
    };
  }, [history, alerts]);

  // Build weekly chart data (group by simulated day buckets)
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const slice = history.filter((_, idx) => idx % 7 === i);
      const temps = slice.map(h => h.fridgeTemp).filter(Boolean);
      const hums = slice.map(h => h.humidity).filter(Boolean);
      const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return {
        day,
        avgTemp: parseFloat(avg(temps).toFixed(2)),
        avgHumidity: parseFloat(avg(hums).toFixed(1)),
        doorEvents: slice.filter(h => h.doorStatus === 'open').length,
      };
    });
  }, [history]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BarChart3 size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Analytics</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Aggregated insights from {history.length} sensor readings
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatCard title="AVG FRIDGE TEMP" value={stats.avgFridge?.toFixed(1) ?? '—'} unit="°C" icon={Thermometer} color="var(--accent)" index={0} />
        <StatCard title="MAX FRIDGE TEMP" value={stats.maxFridge?.toFixed(1) ?? '—'} unit="°C" icon={TrendingUp} color="var(--danger)" subtitle="All-time maximum" index={1} />
        <StatCard title="MIN FRIDGE TEMP" value={stats.minFridge?.toFixed(1) ?? '—'} unit="°C" icon={TrendingDown} color="var(--success)" subtitle="All-time minimum" index={2} />
        <StatCard title="AVG HUMIDITY" value={stats.avgHumidity?.toFixed(1) ?? '—'} unit="%" icon={Droplets} color="var(--cyan)" index={3} />
        <StatCard title="DOOR OPENS" value={stats.doorOpens ?? 0} unit="" icon={DoorOpen} color="var(--warning)" subtitle="From recorded history" index={4} />
        <StatCard title="TOTAL ALERTS" value={stats.totalAlerts ?? 0} unit="" icon={AlertTriangle} color="var(--danger)" subtitle={`${stats.criticalAlerts ?? 0} critical`} index={5} />
      </div>

      {/* Weekly Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Weekly Temp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
          style={{ padding: '20px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
            Weekly Avg Fridge Temperature
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="wkTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
              <Tooltip />
              <Area type="monotone" dataKey="avgTemp" stroke="#3B82F6" fill="url(#wkTemp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Humidity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
          style={{ padding: '20px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
            Weekly Avg Humidity
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="wkHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip />
              <Area type="monotone" dataKey="avgHumidity" stroke="#06B6D4" fill="url(#wkHum)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Door Events Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
          style={{ padding: '20px', gridColumn: 'span 2' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
            Door Open Events per Day
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="doorEvents" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
