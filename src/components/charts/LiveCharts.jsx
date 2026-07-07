/**
 * LiveCharts — High-definition telemetry charts
 * Matching commercial medical UI aesthetic
 */
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Thermometer, Droplets, DoorOpen } from 'lucide-react';

export function FridgeTempChart({ data, thresholds }) {
  const safeMin = thresholds?.fridgeTempMin ?? 2.0;
  const safeMax = thresholds?.fridgeTempMax ?? 8.0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#0A0D14',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.01em' }}>
            VACCINE CORE TEMPERATURE
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            WHO Safe Storage Range: {safeMin}°C – {safeMax}°C
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '100px',
          background: 'rgba(0, 214, 143, 0.1)',
          border: '1px solid rgba(0, 214, 143, 0.3)',
          color: 'var(--safe)', fontSize: '11px', fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', boxShadow: '0 0 6px var(--safe)' }} />
          <span>SAFE ZONE</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="fridgeTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D68F" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 12]} tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <ReferenceArea y1={safeMin} y2={safeMax} fill="rgba(0, 214, 143, 0.05)" />
          <ReferenceLine y={safeMax} stroke="rgba(245, 166, 35, 0.4)" strokeDasharray="4 4" />
          <ReferenceLine y={safeMin} stroke="rgba(0, 214, 143, 0.4)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="value" stroke="var(--safe)" strokeWidth={2} fill="url(#fridgeTempGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function RoomTempChart({ data, thresholds }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: '#0A0D14',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.01em' }}>
            AMBIENT ROOM TEMPERATURE
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            Operating Environment
          </div>
        </div>
        <Thermometer size={18} color="#38BDF8" />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="roomTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[20, 38]} tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <Area type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={2} fill="url(#roomTempGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function HumidityChart({ data, thresholds }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: '#0A0D14',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.01em' }}>
            RELATIVE HUMIDITY
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            Max Safe Humidity: 75%
          </div>
        </div>
        <Droplets size={18} color="#38BDF8" />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[30, 90]} tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <ReferenceLine y={75} stroke="rgba(56, 189, 248, 0.4)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip unit="%" />} />
          <Area type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={2} fill="url(#humGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function DoorEventsChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: '#0A0D14',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.01em' }}>
            DOOR ACCESS LOG
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            1 = Open · 0 = Closed
          </div>
        </div>
        <DoorOpen size={18} color="var(--alarm)" />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 1.5]} tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} ticks={[0, 1]} tickFormatter={v => v === 1 ? 'OPEN' : 'CLOSED'} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const val = payload[0].value;
              return (
                <div style={{ background: '#0E121C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: val === 1 ? 'var(--alarm)' : 'var(--safe)' }}>
                    {val === 1 ? 'DOOR OPEN' : 'DOOR CLOSED'}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill="var(--alarm)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const color = payload[0].color || 'var(--safe)';
  return (
    <div style={{
      background: '#0E121C',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '8px 14px',
      boxShadow: '0 12px 24px rgba(0,0,0,0.8)',
    }}>
      <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>
        {typeof val === 'number' ? val.toFixed(1) : val}{unit}
      </div>
    </div>
  );
}
