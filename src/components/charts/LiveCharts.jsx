/**
 * Live Charts — Recharts components with dark theme and animations
 */
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 600, color: entry.color,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
          {entry.value?.toFixed(2)}{unit}
        </div>
      ))}
    </div>
  );
}

// ─── Chart Card Wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, icon: Icon, color, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
      style={{ padding: '20px' }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {Icon && (
              <div style={{
                width: 28, height: 28, borderRadius: '7px',
                background: `${color}20`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} color={color} />
              </div>
            )}
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '11px', color: 'var(--success)',
          background: 'rgba(16,185,129,0.1)',
          padding: '4px 10px', borderRadius: '100px',
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
      subtitle="DS18B20 sensor • Safe range: 2–8°C"
      icon={TrendingUp}
      color="var(--accent)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="fridgeTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#64748B', fontSize: 10 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 12]}
            tick={{ fill: '#64748B', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}°`}
          />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <ReferenceLine y={safeMax} stroke="rgba(245,158,11,0.5)" strokeDasharray="4 4" label={{ value: `Max ${safeMax}°C`, fill: '#F59E0B', fontSize: 10 }} />
          <ReferenceLine y={safeMin} stroke="rgba(59,130,246,0.5)" strokeDasharray="4 4" label={{ value: `Min ${safeMin}°C`, fill: '#60A5FA', fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2.5}
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
      subtitle="DHT22 sensor • Ambient monitoring"
      color="var(--warning)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="roomTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[20, 38]} tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} fill="url(#roomTempGrad)" dot={false}
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
      subtitle="DHT22 sensor • Relative humidity"
      color="var(--cyan)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[30, 90]} tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <ReferenceLine y={75} stroke="rgba(245,158,11,0.5)" strokeDasharray="4 4" label={{ value: 'Max 75%', fill: '#F59E0B', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip unit="%" />} />
          <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2.5} fill="url(#humidityGrad)" dot={false}
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
      subtitle="Reed switch • Open=1, Closed=0"
      color="var(--purple)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 1.5]} tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} ticks={[0, 1]} tickFormatter={v => v === 1 ? 'OPEN' : 'CLOSED'} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value;
              return (
                <div style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
                  borderRadius: '10px', padding: '10px 14px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: v ? 'var(--danger)' : 'var(--success)', marginTop: '4px' }}>
                    {v ? '🔓 OPEN' : '🔒 CLOSED'}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill="#8B5CF6" radius={[3,3,0,0]} maxBarSize={20} animationDuration={300} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
