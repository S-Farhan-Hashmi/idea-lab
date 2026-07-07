/**
 * Dashboard — Pharmaceutical Refrigerator Cockpit
 * Exact aesthetic match to commercial medical device UI screenshot
 */
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Cloud, CloudOff, Cpu,
  Thermometer, Droplets, DoorOpen, DoorClosed,
  Bell, BellOff, Activity, ShieldCheck, ShieldAlert, ShieldX,
  CheckCircle2, AlertTriangle, Zap, Clock, Wind,
  ChevronDown, FileText,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useClock } from '../hooks/useCustomHooks';
import SVGRefrigerator from '../components/dashboard/SVGRefrigerator';
import LoadingScreen from '../components/layout/LoadingScreen';
import { formatTimeAgo, formatDuration } from '../utils/formatters';

export default function Dashboard() {
  const { sensorData, connected, chartSeries, thresholds } = useData();
  const { settings } = useSettings();
  const now = useClock();

  // Build event timeline from alerts + history (newest first)
  const events = useMemo(() => {
    const alertEvents = (sensorData?.alerts || []).slice(0, 10).map(a => ({
      id: a.id,
      type: a.type || 'System Event',
      message: a.message,
      timestamp: a.timestamp,
      priority: a.priority,
      acked: a.acknowledged,
    }));
    return alertEvents.sort((a, b) => b.timestamp - a.timestamp);
  }, [sensorData?.alerts]);

  if (!sensorData) return <LoadingScreen />;

  const {
    fridgeTemp, roomTemp, humidity, doorStatus, doorOpenDuration,
    buzzer, fridgeStatus, overallHealth, deviceStatus, history,
  } = sensorData;

  // Health visual config
  const healthConfig = {
    SAFE:     { color: 'var(--safe)', bg: 'var(--safe-dim)', icon: ShieldCheck, label: 'SAFE', sub: 'Within WHO vaccine storage guidelines' },
    WARNING:  { color: 'var(--caution)', bg: 'var(--caution-dim)', icon: ShieldAlert, label: 'WARNING', sub: 'One or more parameters need review' },
    CRITICAL: { color: 'var(--alarm)', bg: 'var(--alarm-dim)', icon: ShieldX, label: 'CRITICAL', sub: 'Immediate intervention required' },
  };
  const hc = healthConfig[overallHealth] || healthConfig.SAFE;
  const HealthIcon = hc.icon;

  const tempColor = fridgeStatus === 'safe' ? 'var(--safe)' : fridgeStatus === 'warning' ? 'var(--caution)' : 'var(--alarm)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 32px' }}>

      {/* ── Top Cockpit Section (Left / Center / Right) ──────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        gap: '32px',
        alignItems: 'stretch',
      }}>

        {/* ════════════════════════════════════════════
            LEFT — System Health & Connectivity
            ════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', justifyContent: 'space-between' }}>
          
          {/* 1. System Health */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ShieldCheck size={14} color="var(--safe)" />
              <span className="panel-label">SYSTEM HEALTH</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: hc.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>
              {hc.label}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>
              {hc.sub}
            </div>
          </div>

          {/* 2. Connectivity */}
          <div>
            <div className="panel-label" style={{ marginBottom: '12px' }}>CONNECTIVITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ConnRow
                label="WiFi"
                value={sensorData?.wifi !== false ? 'Connected' : 'Disconnected'}
                online={sensorData?.wifi !== false}
              />
              <ConnRow
                label="Firebase"
                value={connected ? 'Syncing' : 'Offline'}
                online={connected}
              />
              <ConnRow
                label="ESP32"
                value={deviceStatus?.esp32 !== false ? 'Online' : 'Offline'}
                online={deviceStatus?.esp32 !== false}
              />
            </div>
          </div>

          {/* 3. Live Metrics */}
          <div>
            <div className="panel-label" style={{ marginBottom: '12px' }}>LIVE METRICS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <MetricRow label="Room Temperature" value={`${roomTemp?.toFixed(1)}°C`} color="#38BDF8" />
              <MetricRow label="Humidity" value={`${humidity?.toFixed(0)}%`} color="#F3F4F6" />
              <MetricRow label="Door Status" value={doorStatus?.toUpperCase()} color={doorStatus === 'open' ? 'var(--alarm)' : 'var(--safe)'} />
              <MetricRow label="Buzzer" value={buzzer ? 'Active' : 'Silent'} color={buzzer ? 'var(--alarm)' : '#9CA3AF'} />
            </div>
          </div>

          {/* 4. Uptime Card */}
          <div style={{
            background: '#0E121C',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
                <Clock size={13} />
                <span>UPTIME</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F3F4F6', lineHeight: 1.1 }}>
                {formatDuration(deviceStatus?.uptime || 4680)}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                Continuous Operation
              </div>
            </div>

            {/* Sparkline decoration */}
            <svg width="64" height="28" viewBox="0 0 64 28" fill="none">
              <path d="M2 22 Q 14 24, 24 18 T 44 18 T 62 4" stroke="var(--safe)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M2 22 Q 14 24, 24 18 T 44 18 T 62 4 L 62 28 L 2 28 Z" fill="rgba(0, 214, 143, 0.1)" />
            </svg>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            CENTER — Hero Refrigerator & Readout
            ════════════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '10px 0',
        }}>
          {/* Primary temperature readout */}
          <div style={{ textAlign: 'center', marginBottom: '20px', zIndex: 10 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
              CURRENT TEMPERATURE
            </div>
            <div style={{
              fontSize: '84px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: tempColor,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              textShadow: `0 0 32px ${tempColor}40`,
            }}>
              {fridgeTemp?.toFixed(1)}
              <span style={{ fontSize: '36px', fontWeight: 400, color: tempColor, marginLeft: '2px' }}>°C</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 14px', borderRadius: '100px',
                background: fridgeStatus === 'safe' ? 'var(--safe-dim)' : 'var(--alarm-dim)',
                border: `1px solid ${tempColor}50`,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: tempColor, boxShadow: `0 0 6px ${tempColor}` }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: tempColor, letterSpacing: '0.06em' }}>
                  {fridgeStatus?.toUpperCase() || 'SAFE'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
                WHO Safe Range: 2°C – 8°C
              </span>
            </div>
          </div>

          {/* Refrigerator Centerpiece with Flanking Circular Badges */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', my: '10px' }}>
            
            {/* Left Circular Floating Badge (Room Temp) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'absolute',
                left: '2%',
                zIndex: 10,
                width: 96, height: 96,
                borderRadius: '50%',
                background: '#0E121C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center',
                gap: '2px',
              }}
            >
              <Thermometer size={18} color="#38BDF8" />
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F3F4F6', marginTop: '2px' }}>
                {roomTemp?.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 500 }}>
                Room Temp
              </div>
            </motion.div>

            {/* The Refrigerator SVG */}
            <div style={{ zIndex: 5 }}>
              <SVGRefrigerator
                doorStatus={doorStatus}
                overallHealth={overallHealth}
                fridgeTemp={fridgeTemp}
                buzzer={buzzer}
                size={300}
              />
            </div>

            {/* Right Circular Floating Badge (Humidity) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'absolute',
                right: '2%',
                zIndex: 10,
                width: 96, height: 96,
                borderRadius: '50%',
                background: '#0E121C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center',
                gap: '2px',
              }}
            >
              <Droplets size={18} color="#38BDF8" />
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F3F4F6', marginTop: '2px' }}>
                {humidity?.toFixed(0)}%
              </div>
              <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 500 }}>
                Humidity
              </div>
            </motion.div>
          </div>

          {/* Bottom Floating Pill Card (Door Status) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '16px',
              background: '#081410',
              border: `1px solid ${doorStatus === 'open' ? 'var(--alarm)' : 'var(--safe)'}60`,
              borderRadius: '100px',
              padding: '10px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: `0 8px 32px ${doorStatus === 'open' ? 'var(--alarm)' : 'var(--safe)'}20`,
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: doorStatus === 'open' ? 'var(--alarm)' : 'var(--safe)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>
              <FileText size={15} />
              <span>{doorStatus === 'open' ? 'DOOR OPEN' : 'DOOR CLOSED'}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
              {doorStatus === 'open' ? 'Immediate closure recommended' : 'Sealed & Secure'}
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT — System Log Card
            ════════════════════════════════════════════ */}
        <div style={{
          background: '#0A0D14',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <span className="panel-label" style={{ fontSize: '12px' }}>SYSTEM LOG</span>
            <button style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#D1D5DB',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              View All
            </button>
          </div>

          {/* Timeline List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '4px' }}>
            {events.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                No events logged
              </div>
            ) : (
              events.map((ev, i) => (
                <LogItem key={ev.id || i} event={ev} isLast={i === events.length - 1} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row Trend Charts (Temperature & Humidity) ────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '8px' }}>
        
        {/* 1. Temperature Trend Card */}
        <div style={{
          background: '#0A0D14',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.01em' }}>
                TEMPERATURE TREND
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                Safe Range: 2°C – 8°C
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#D1D5DB',
              cursor: 'pointer',
            }}>
              <span>24H</span>
              <ChevronDown size={13} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartSeries.fridgeTemp} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="tempTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D68F" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 12]} tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°C`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: '#0E121C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px' }}>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--safe)' }}>
                        {payload[0].value?.toFixed(2)}°C
                      </div>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--safe)" strokeWidth={2} fill="url(#tempTrendGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Humidity Trend Card */}
        <div style={{
          background: '#0A0D14',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F3F4F6', letterSpacing: '-0.01em' }}>
                HUMIDITY TREND
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                Max Safe: 75%
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#D1D5DB',
              cursor: 'pointer',
            }}>
              <span>24H</span>
              <ChevronDown size={13} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartSeries.humidity} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="humTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <ReferenceLine y={75} stroke="rgba(56, 189, 248, 0.4)" strokeDasharray="4 4" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: '#0E121C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px' }}>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38BDF8' }}>
                        {payload[0].value?.toFixed(0)}%
                      </div>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={2} fill="url(#humTrendGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components matching screenshot ─────────────────────── */

function ConnRow({ label, value, online }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D1D5DB', fontWeight: 500 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: online ? 'var(--safe)' : 'var(--alarm)',
          boxShadow: online ? '0 0 6px var(--safe)' : '0 0 6px var(--alarm)',
        }} />
        <span>{label}</span>
      </div>
      <span style={{
        fontWeight: 600,
        color: online ? 'var(--safe)' : 'var(--alarm)',
      }}>
        {value}
      </span>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
      <span style={{ color: '#D1D5DB', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: color || '#F3F4F6',
      }}>
        {value}
      </span>
    </div>
  );
}

function LogItem({ event, isLast }) {
  const isAlarm = event.priority === 'critical' || event.priority === 'high' || event.message?.toLowerCase().includes('open');
  const dotColor = isAlarm ? 'var(--alarm)' : event.priority === 'medium' ? 'var(--caution)' : '#38BDF8';
  const ago = formatTimeAgo(event.timestamp);

  return (
    <div style={{ display: 'flex', gap: '14px', position: 'relative' }}>
      {/* Vertical Timeline Line */}
      {!isLast && (
        <div style={{
          position: 'absolute',
          left: 3, top: 16, bottom: -20,
          width: 2, background: 'rgba(255, 255, 255, 0.08)',
        }} />
      )}

      {/* Glowing Dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: dotColor,
        boxShadow: `0 0 8px ${dotColor}`,
        marginTop: '12px',
        flexShrink: 0,
        zIndex: 2,
      }} />

      {/* Icon Box */}
      <div style={{
        width: 34, height: 34, borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Thermometer size={16} color="#9CA3AF" />
      </div>

      {/* Text Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
          {new Date(event.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F3F4F6', lineHeight: 1.3 }}>
          {event.message}
        </div>
        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
          {event.type || 'within safe range (2–8°C)'}
        </div>
      </div>
    </div>
  );
}
