/**
 * Dashboard — Pharmaceutical Refrigerator Cockpit
 * The ONE screen that answers: "Is my refrigerator safe?"
 *
 * Layout:
 *   LEFT  — Device & sensor status panel
 *   CENTER — SVG refrigerator + primary telemetry
 *   RIGHT  — Live event timeline
 *   BOTTOM — Temperature & humidity trend charts
 */
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Cloud, CloudOff, Cpu,
  Thermometer, Droplets, DoorOpen, DoorClosed,
  Bell, BellOff, Activity, ShieldCheck, ShieldAlert, ShieldX,
  CheckCircle2, AlertTriangle, Zap, Clock, Wind,
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
    const alertEvents = (sensorData?.alerts || []).slice(0, 12).map(a => ({
      id: a.id,
      type: a.type,
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
    SAFE:     { color: 'var(--safe)', bg: 'var(--safe-dim)', icon: ShieldCheck, label: 'ALL SYSTEMS SAFE', sub: 'Within WHO vaccine storage guidelines' },
    WARNING:  { color: 'var(--caution)', bg: 'var(--caution-dim)', icon: ShieldAlert, label: 'ATTENTION REQUIRED', sub: 'One or more parameters need review' },
    CRITICAL: { color: 'var(--alarm)', bg: 'var(--alarm-dim)', icon: ShieldX, label: 'CRITICAL ALARM', sub: 'Immediate intervention required' },
  };
  const hc = healthConfig[overallHealth] || healthConfig.SAFE;
  const HealthIcon = hc.icon;

  const tempStatus = fridgeStatus === 'safe' ? 'SAFE' : fridgeStatus === 'warning' ? 'CAUTION' : 'ALARM';
  const tempColor = fridgeStatus === 'safe' ? 'var(--safe)' : fridgeStatus === 'warning' ? 'var(--caution)' : 'var(--alarm)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-height))' }}>

      {/* ── Three-column cockpit ──────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '230px 1fr 250px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>

        {/* ════════════════════════════════════════════
            LEFT — Device & sensor status
            ════════════════════════════════════════════ */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Panel header */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-label" style={{ marginBottom: '2px' }}>DEVICE STATUS</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {settings.hospitalName || 'City Medical Center'}
            </div>
          </div>

          {/* System health pill */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <motion.div
              key={overallHealth}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px',
                background: hc.bg,
                border: `1px solid ${hc.color}40`,
                borderRadius: '10px',
              }}
            >
              <HealthIcon size={18} color={hc.color} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: hc.color, letterSpacing: '0.04em' }}>
                  {hc.label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', lineHeight: 1.3 }}>
                  {hc.sub}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Connection status */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-label" style={{ marginBottom: '10px' }}>CONNECTIVITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <ConnRow
                icon={sensorData?.wifi ? Wifi : WifiOff}
                label="WiFi"
                value={sensorData?.wifi ? 'Connected' : 'Disconnected'}
                online={sensorData?.wifi}
              />
              <ConnRow
                icon={connected ? Cloud : CloudOff}
                label="Firebase"
                value={connected ? 'Syncing' : 'Offline'}
                online={connected}
              />
              <ConnRow
                icon={Cpu}
                label="ESP32"
                value={deviceStatus?.esp32 ? 'Online' : 'Offline'}
                online={deviceStatus?.esp32}
              />
            </div>
          </div>

          {/* Sensor health */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="panel-label" style={{ marginBottom: '10px' }}>SENSOR HEALTH</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <SensorRow
                label="DS18B20 (Fridge Temp)"
                online={deviceStatus?.ds18b20 !== false}
                value={`${fridgeTemp?.toFixed(1)}°C`}
              />
              <SensorRow
                label="DHT22 (Room Temp)"
                online={deviceStatus?.dht22 !== false}
                value={`${roomTemp?.toFixed(1)}°C`}
              />
              <SensorRow
                label="DHT22 (Humidity)"
                online={deviceStatus?.dht22 !== false}
                value={`${humidity?.toFixed(0)}%`}
              />
              <SensorRow
                label="Reed Switch (Door)"
                online={deviceStatus?.reedSwitch !== false}
                value={doorStatus === 'open' ? 'OPEN' : 'CLOSED'}
              />
              <SensorRow
                label="Buzzer"
                online={true}
                value={buzzer ? 'ACTIVE' : 'Standby'}
                warn={buzzer}
              />
            </div>
          </div>

          {/* Uptime */}
          {deviceStatus?.uptime !== undefined && (
            <div style={{ padding: '14px 18px' }}>
              <div className="panel-label" style={{ marginBottom: '8px' }}>UPTIME</div>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
                {formatDuration(deviceStatus.uptime)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Continuous operation</div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════
            CENTER — SVG Refrigerator + Primary Telemetry
            ════════════════════════════════════════════ */}
        <div style={{
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          gap: '24px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Background grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
          }} />

          {/* Primary temperature readout */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              FRIDGE TEMPERATURE
            </div>
            <motion.div
              key={Math.round(fridgeTemp * 10)}
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: '72px',
                fontWeight: 300,
                fontFamily: 'var(--font-mono)',
                color: tempColor,
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            >
              {fridgeTemp?.toFixed(1)}
              <span style={{ fontSize: '28px', color: 'var(--text-muted)', fontWeight: 300 }}>°C</span>
            </motion.div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 14px', borderRadius: '100px',
                background: fridgeStatus === 'safe' ? 'var(--safe-dim)' : fridgeStatus === 'warning' ? 'var(--caution-dim)' : 'var(--alarm-dim)',
                border: `1px solid ${tempColor}40`,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: tempColor, boxShadow: `0 0 6px ${tempColor}` }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: tempColor, letterSpacing: '0.06em' }}>
                  {tempStatus}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {thresholds.fridgeTempMin}°C – {thresholds.fridgeTempMax}°C safe zone
              </span>
            </div>
          </div>

          {/* The SVG Refrigerator */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <SVGRefrigerator
              doorStatus={doorStatus}
              overallHealth={overallHealth}
              fridgeTemp={fridgeTemp}
              buzzer={buzzer}
              size={200}
            />
          </div>

          {/* Secondary telemetry row */}
          <div style={{
            display: 'flex', gap: '16px', zIndex: 1,
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <MiniStat
              icon={Wind}
              label="Room Temp"
              value={`${roomTemp?.toFixed(1)}°C`}
              sub="Ambient"
              color={roomTemp > thresholds.roomTempMax ? 'var(--caution)' : 'var(--text-secondary)'}
            />
            <MiniStat
              icon={Droplets}
              label="Humidity"
              value={`${humidity?.toFixed(0)}%`}
              sub="Relative"
              color={humidity > thresholds.humidityMax ? 'var(--caution)' : 'var(--text-secondary)'}
            />
            <MiniStat
              icon={doorStatus === 'open' ? DoorOpen : DoorClosed}
              label="Door"
              value={doorStatus === 'open' ? 'OPEN' : 'SEALED'}
              sub={doorStatus === 'open' && doorOpenDuration > 0 ? formatDuration(doorOpenDuration) : 'Secure'}
              color={doorStatus === 'open' ? 'var(--alarm)' : 'var(--safe)'}
            />
            <MiniStat
              icon={buzzer ? Bell : BellOff}
              label="Buzzer"
              value={buzzer ? 'ALARM' : 'SILENT'}
              sub={buzzer ? 'Active' : 'Standby'}
              color={buzzer ? 'var(--alarm)' : 'var(--text-muted)'}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT — Live event timeline
            ════════════════════════════════════════════ */}
        <div style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            <div className="panel-label" style={{ marginBottom: '2px' }}>LIVE EVENTS</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {events.filter(e => !e.acked).length} active · {events.length} total
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {events.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <CheckCircle2 size={28} color="var(--safe)" style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No events logged</div>
              </div>
            ) : (
              <AnimatePresence>
                {events.map((ev, i) => (
                  <EventRow key={ev.id} event={ev} index={i} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          BOTTOM — Trend charts
          ════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        height: '180px',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Temperature trend */}
        <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '14px 18px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div className="panel-label">TEMPERATURE TREND</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                Safe zone: {thresholds.fridgeTempMin}–{thresholds.fridgeTempMax}°C
              </div>
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: tempColor }}>
              {fridgeTemp?.toFixed(1)}°C
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={chartSeries.fridgeTemp} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="tempGradDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--safe)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--safe)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 12]} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: 'rgba(22,22,26,0.95)', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--safe)' }}>
                        {payload[0].value?.toFixed(2)}°C
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={thresholds.fridgeTempMax} stroke="var(--caution)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={thresholds.fridgeTempMin} stroke="var(--interactive)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Area
                type="monotone" dataKey="value"
                stroke="var(--safe)" strokeWidth={1.5}
                fill="url(#tempGradDash)" dot={false}
                activeDot={{ r: 4, fill: 'var(--safe)', stroke: 'var(--bg-base)', strokeWidth: 2 }}
                animationDuration={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity trend */}
        <div style={{ padding: '14px 18px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div className="panel-label">HUMIDITY TREND</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                Max safe: {thresholds.humidityMax}%
              </div>
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cyan)' }}>
              {humidity?.toFixed(0)}%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={chartSeries.humidity} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="humGradDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={[30, 95]} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: 'rgba(22,22,26,0.95)', border: '1px solid var(--border-dim)', borderRadius: '8px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#06B6D4' }}>
                        {payload[0].value?.toFixed(1)}%
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={thresholds.humidityMax} stroke="var(--caution)" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Area
                type="monotone" dataKey="value"
                stroke="#06B6D4" strokeWidth={1.5}
                fill="url(#humGradDash)" dot={false}
                activeDot={{ r: 4, fill: '#06B6D4', stroke: 'var(--bg-base)', strokeWidth: 2 }}
                animationDuration={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function ConnRow({ icon: Icon, label, value, online }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: online ? 'var(--safe)' : 'var(--alarm)',
        boxShadow: online ? '0 0 5px var(--safe)' : 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
        <Icon size={13} color="var(--text-muted)" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
        <span style={{
          fontSize: '11px', fontWeight: 600,
          color: online ? 'var(--safe)' : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function SensorRow({ label, online, value, warn = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: !online ? 'var(--alarm)' : warn ? 'var(--caution)' : 'var(--safe)',
        boxShadow: !online ? 'none' : warn ? '0 0 4px var(--caution)' : '0 0 4px var(--safe)',
      }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', flex: 1, lineHeight: 1.3 }}>{label}</span>
      <span style={{
        fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)',
        color: warn ? 'var(--caution)' : online ? 'var(--text-secondary)' : 'var(--alarm)',
      }}>
        {value}
      </span>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 20px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        minWidth: '90px', gap: '6px',
      }}
    >
      <Icon size={16} color={color} />
      <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 600, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
        <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
        <div>{sub}</div>
      </div>
    </motion.div>
  );
}

const PRIORITY_COLORS = {
  critical: 'var(--alarm)',
  high:     'var(--alarm)',
  medium:   'var(--caution)',
  low:      'var(--interactive)',
  info:     'var(--text-muted)',
};

function EventRow({ event, index }) {
  const color = PRIORITY_COLORS[event.priority] || 'var(--text-muted)';
  const ago = formatTimeAgo(event.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: event.acked ? 0.45 : 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Timeline line + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '3px', gap: '3px' }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: event.acked ? 'var(--text-faint)' : color,
          boxShadow: event.acked ? 'none' : `0 0 6px ${color}`,
          flexShrink: 0,
        }} />
        {index < 11 && (
          <div style={{ width: 1, flex: 1, minHeight: '20px', background: 'var(--border-subtle)' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px', fontWeight: event.acked ? 400 : 500,
          color: event.acked ? 'var(--text-muted)' : 'var(--text-primary)',
          lineHeight: 1.35, marginBottom: '3px',
        }}>
          {event.message}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {ago}
        </div>
      </div>
    </motion.div>
  );
}
