/**
 * Analytics Page — Aggregated statistics from real Firebase history records
 * Charts are derived from actual ESP32 sensor timestamps, not simulated day buckets
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown,
  Thermometer, Droplets, DoorOpen, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
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

// Build hourly buckets from the last N hours of real history records
function buildHourlyBuckets(history, hours = 24) {
  if (!history.length) return [];

  const now = Date.now();
  const cutoff = now - hours * 60 * 60 * 1000;
  const recent = history.filter(h => h.timestamp >= cutoff);

  const buckets = {};
  for (let i = 0; i < hours; i++) {
    const bucketTime = cutoff + i * 60 * 60 * 1000;
    const label = new Date(bucketTime).toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
    buckets[i] = { hour: label, fridgeTemps: [], roomTemps: [], humidities: [], doorEvents: 0 };
  }

  recent.forEach(h => {
    const idx = Math.floor((h.timestamp - cutoff) / (60 * 60 * 1000));
    if (idx >= 0 && idx < hours) {
      if (h.fridgeTemp != null) buckets[idx].fridgeTemps.push(h.fridgeTemp);
      if (h.roomTemp != null) buckets[idx].roomTemps.push(h.roomTemp);
      if (h.humidity != null) buckets[idx].humidities.push(h.humidity);
      if (h.doorStatus === 'open') buckets[idx].doorEvents += 1;
    }
  });

  const avg = arr => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null;

  return Object.values(buckets).map(b => ({
    hour: b.hour,
    avgFridgeTemp: avg(b.fridgeTemps),
    avgRoomTemp: avg(b.roomTemps),
    avgHumidity: avg(b.humidities),
    doorEvents: b.doorEvents,
  })).filter(b => b.avgFridgeTemp !== null || b.avgRoomTemp !== null || b.avgHumidity !== null || b.doorEvents > 0);
}

// Build a 7-day summary from real history timestamps
function buildDailyBuckets(history) {
  if (!history.length) return [];

  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  const recent = history.filter(h => h.timestamp >= cutoff);

  const buckets = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(cutoff + i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    buckets[i] = { day: label, fridgeTemps: [], humidities: [], doorEvents: 0 };
  }

  recent.forEach(h => {
    const idx = Math.floor((h.timestamp - cutoff) / (24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < 7) {
      if (h.fridgeTemp != null) buckets[idx].fridgeTemps.push(h.fridgeTemp);
      if (h.humidity != null) buckets[idx].humidities.push(h.humidity);
      if (h.doorStatus === 'open') buckets[idx].doorEvents += 1;
    }
  });

  const avg = arr => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;

  return Object.values(buckets).map(b => ({
    day: b.day,
    avgTemp: avg(b.fridgeTemps),
    avgHumidity: avg(b.humidities),
    doorEvents: b.doorEvents,
  }));
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0E121C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px' }}>
      <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: p.color }}>
          {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}{unit}
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { sensorData, thresholds } = useData();

  if (!sensorData) return <LoadingScreen />;

  const history = sensorData?.history ?? [];
  const alerts  = sensorData?.alerts  ?? [];

  // Aggregate KPIs
  const stats = useMemo(() => {
    if (!history.length) return null;
    const fridgeTemps = history.map(h => h.fridgeTemp).filter(v => v != null && !isNaN(v));
    const roomTemps   = history.map(h => h.roomTemp).filter(v => v != null && !isNaN(v));
    const humidities  = history.map(h => h.humidity).filter(v => v != null && !isNaN(v));
    const doorOpens   = history.filter(h => h.doorStatus === 'open').length;
    const min2 = thresholds?.fridgeTempMin ?? 2;
    const max8 = thresholds?.fridgeTempMax ?? 8;
    const excursions = fridgeTemps.filter(t => t < min2 || t > max8).length;
    const compliancePct = fridgeTemps.length ? ((fridgeTemps.length - excursions) / fridgeTemps.length * 100).toFixed(1) : '100.0';

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      avgFridge: avg(fridgeTemps),
      maxFridge: Math.max(...fridgeTemps),
      minFridge: Math.min(...fridgeTemps),
      avgRoom: avg(roomTemps),
      avgHumidity: avg(humidities),
      maxHumidity: Math.max(...humidities),
      doorOpens,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.priority === 'critical').length,
      excursions,
      compliancePct,
    };
  }, [history, alerts, thresholds]);

  const hourlyData = useMemo(() => buildHourlyBuckets(history, 24), [history]);
  const dailyData  = useMemo(() => buildDailyBuckets(history), [history]);

  const hasData = history.length > 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BarChart3 size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Analytics</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {hasData
            ? `Aggregated insights from ${history.length} sensor readings · last updated ${new Date(history[0]?.timestamp ?? Date.now()).toLocaleTimeString()}`
            : 'Waiting for historical records from the ESP32...'}
        </p>
      </div>

      {/* No data state */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ padding: '64px', textAlign: 'center' }}
        >
          <BarChart3 size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            No Historical Data Yet
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
            Analytics charts will populate automatically as the ESP32 uploads sensor records to Firebase.
          </div>
        </motion.div>
      )}

      {hasData && <>
        {/* Summary KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <StatCard title="AVG FRIDGE TEMP"   value={stats.avgFridge?.toFixed(1) ?? '—'} unit="°C" icon={Thermometer}   color="var(--accent)"  index={0} />
          <StatCard title="MAX FRIDGE TEMP"   value={stats.maxFridge?.toFixed(1) ?? '—'} unit="°C" icon={TrendingUp}    color="var(--danger)"  subtitle="All-time maximum" index={1} />
          <StatCard title="MIN FRIDGE TEMP"   value={stats.minFridge?.toFixed(1) ?? '—'} unit="°C" icon={TrendingDown}  color="var(--success)" subtitle="All-time minimum" index={2} />
          <StatCard title="AVG HUMIDITY"      value={stats.avgHumidity?.toFixed(1) ?? '—'} unit="%" icon={Droplets}     color="var(--cyan)"    index={3} />
          <StatCard title="DOOR OPENS"        value={stats.doorOpens ?? 0}                unit=""  icon={DoorOpen}      color="var(--warning)" subtitle="From recorded history" index={4} />
          <StatCard title="TEMP EXCURSIONS"   value={stats.excursions ?? 0}               unit=""  icon={AlertTriangle} color="var(--danger)"  subtitle={`${stats.compliancePct}% compliant`} index={5} />
          <StatCard title="TOTAL ALERTS"      value={stats.totalAlerts ?? 0}              unit=""  icon={AlertTriangle} color="var(--danger)"  subtitle={`${stats.criticalAlerts ?? 0} critical`} index={6} />
          <StatCard title="WHO COMPLIANCE"    value={stats.compliancePct ?? '100.0'}      unit="%" icon={ShieldCheck}   color="var(--success)" subtitle="2–8°C safe range" index={7} />
        </div>

        {/* 24-Hour Trend Charts */}
        {hourlyData.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '14px' }}>
              24-HOUR TREND (REAL TIMESTAMPS)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Fridge Temp 24h */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Fridge Temperature (24h)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="h24Temp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="hour" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[0, 12]} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
                    <ReferenceLine y={thresholds?.fridgeTempMax ?? 8} stroke="rgba(245,166,35,0.5)" strokeDasharray="4 4" />
                    <ReferenceLine y={thresholds?.fridgeTempMin ?? 2} stroke="rgba(0,214,143,0.4)" strokeDasharray="4 4" />
                    <Tooltip content={<CustomTooltip unit="°C" />} />
                    <Area type="monotone" dataKey="avgFridgeTemp" stroke="#00D68F" fill="url(#h24Temp)" strokeWidth={2} dot={false} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Humidity 24h */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Humidity (24h)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="h24Hum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="hour" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <ReferenceLine y={thresholds?.humidityMax ?? 75} stroke="rgba(56,189,248,0.4)" strokeDasharray="4 4" />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Area type="monotone" dataKey="avgHumidity" stroke="#06B6D4" fill="url(#h24Hum)" strokeWidth={2} dot={false} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        )}

        {/* 7-Day Summary Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Weekly Fridge Temp */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>7-Day Avg Fridge Temperature</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="wkTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
                <ReferenceLine y={thresholds?.fridgeTempMax ?? 8} stroke="rgba(245,166,35,0.4)" strokeDasharray="4 4" />
                <Tooltip content={<CustomTooltip unit="°C" />} />
                <Area type="monotone" dataKey="avgTemp" stroke="#3B82F6" fill="url(#wkTemp)" strokeWidth={2} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly Humidity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>7-Day Avg Humidity</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="wkHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area type="monotone" dataKey="avgHumidity" stroke="#06B6D4" fill="url(#wkHum)" strokeWidth={2} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Door Events Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card" style={{ padding: '20px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Door Open Events — Past 7 Days</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip unit=" opens" />} />
                <Bar dataKey="doorEvents" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </>}
    </div>
  );
}
