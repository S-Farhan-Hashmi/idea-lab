/**
 * Live Charts — Handcrafted Premium SaaS Style
 */
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Thermometer, Droplets, DoorOpen } from 'lucide-react';

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(20, 20, 24, 0.9)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-hover)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 600, color: entry.color,
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
          <span>{entry.value?.toFixed(2)}{unit}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Chart Card Wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, icon: Icon, color, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{ padding: '20px' }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && (
            <div style={{
              width: 34, height: 34, borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} color={color} />
            </div>
          )}
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 400 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--success)', fontWeight: 600,
          background: 'rgba(16,185,129,0.08)',
          padding: '3px 9px', borderRadius: '6px',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <span className="status-dot online" style={{ width: 6, height: 6 }} />
          LIVE
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Fridge Temperature Chart ──────────────────────────────────────────────────
export function FridgeTempChart({ data, safeMin = 2, safeMax = 8 }) {
  return (
    <ChartCard
      title="Fridge Temperature"
      subtitle="DS18B20 clinical sensor • Safe range: 2.0–8.0°C"
      icon={Thermometer}
      color="var(--accent-light)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <defs>
            <linearGradient id="fridgeTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#71717A', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 12]}
            tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}°`}
          />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <ReferenceLine y={safeMax} stroke="rgba(245,158,11,0.6)" strokeDasharray="4 4" label={{ value: `Max ${safeMax}°C`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={safeMin} stroke="rgba(59,130,246,0.6)" strokeDasharray="4 4" label={{ value: `Min ${safeMin}°C`, fill: '#60A5FA', fontSize: 10, position: 'insideBottomRight' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#fridgeTempGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Room Temperature Chart ────────────────────────────────────────────────────
export function RoomTempChart({ data }) {
  return (
    <ChartCard
      title="Room Temperature"
      subtitle="DHT22 ambient sensor • Laboratory environment"
      icon={TrendingUp}
      color="var(--warning)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <defs>
            <linearGradient id="roomTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" />
          <XAxis dataKey="time" tick={{ fill: '#71717A', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} interval="preserveStartEnd" />
          <YAxis domain={[20, 38]} tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#roomTempGrad)" dot={false}
            activeDot={{ r: 5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} animationDuration={300} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Humidity Chart ────────────────────────────────────────────────────────────
export function HumidityChart({ data }) {
  return (
    <ChartCard
      title="Humidity"
      subtitle="DHT22 ambient sensor • Relative humidity"
      icon={Droplets}
      color="var(--cyan)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <defs>
            <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" />
          <XAxis dataKey="time" tick={{ fill: '#71717A', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} interval="preserveStartEnd" />
          <YAxis domain={[30, 90]} tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <ReferenceLine y={75} stroke="rgba(245,158,11,0.6)" strokeDasharray="4 4" label={{ value: 'Max 75%', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
          <Tooltip content={<CustomTooltip unit="%" />} />
          <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} fill="url(#humidityGrad)" dot={false}
            activeDot={{ r: 5, fill: '#06B6D4', stroke: '#fff', strokeWidth: 2 }} animationDuration={300} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Door Events Chart ─────────────────────────────────────────────────────────
export function DoorEventsChart({ data }) {
  return (
    <ChartCard
      title="Door Events Timeline"
      subtitle="Magnetic reed switch • Open=1, Closed=0"
      icon={DoorOpen}
      color="var(--purple)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" />
          <XAxis dataKey="time" tick={{ fill: '#71717A', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} interval="preserveStartEnd" />
          <YAxis domain={[0, 1.5]} tick={{ fill: '#71717A', fontSize: 11 }} tickLine={false} axisLine={false} ticks={[0, 1]} tickFormatter={v => v === 1 ? 'OPEN' : 'CLOSED'} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value;
              return (
                <div style={{
                  background: 'rgba(20, 20, 24, 0.9)', backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border-hover)',
                  borderRadius: '10px', padding: '10px 14px', boxShadow: 'var(--shadow-lg)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: v ? 'var(--danger)' : 'var(--success)', marginTop: '4px' }}>
                    {v ? '🔓 DOOR OPEN' : '🔒 DOOR CLOSED'}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={300} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
