/**
 * Settings Page — Handcrafted Premium SaaS Style
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Thermometer, Droplets, DoorOpen, Bell, Save,
  Building2, Database, CheckCircle2, Info, Sliders, Shield,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import LoadingScreen from '../components/layout/LoadingScreen';
import toast from 'react-hot-toast';

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color="var(--accent-light)" />
        </div>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '40px', fontWeight: 400 }}>{subtitle}</p>}
    </div>
  );
}

function SliderField({ label, value, min, max, step = 0.5, unit, onChange, color = 'var(--accent)' }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>
        <span style={{
          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          background: 'rgba(255,255,255,0.04)', padding: '2px 10px',
          borderRadius: '6px', border: '1px solid var(--border-color)',
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', height: '5px', borderRadius: '3px',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 100%)`,
          outline: 'none', cursor: 'pointer',
          accentColor: color,
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { sensorData, thresholds, updateThresholds } = useData();
  const { settings, updateSettings } = useSettings();

  const [localThresh, setLocalThresh] = useState({ ...thresholds });
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  if (!sensorData) return <LoadingScreen />;

  function handleSave() {
    updateThresholds(localThresh);
    updateSettings(localSettings);
    setSaved(true);
    toast.success('System preferences saved successfully');
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={18} color="var(--accent-light)" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>System Preferences</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>
          Configure clinical telemetry thresholds, alarm rules, and organizational identity
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Temperature Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0 }}
          className="card"
          style={{ padding: '24px 28px' }}
        >
          <SectionTitle icon={Thermometer} title="Temperature Thresholds" subtitle="Set safe clinical operating ranges for vaccine storage" />
          <SliderField
            label="Minimum Refrigerator Temperature"
            value={localThresh.fridgeTempMin}
            min={-5} max={5} step={0.5} unit="°C"
            color="var(--accent-light)"
            onChange={v => setLocalThresh(p => ({ ...p, fridgeTempMin: v }))}
          />
          <SliderField
            label="Maximum Refrigerator Temperature"
            value={localThresh.fridgeTempMax}
            min={5} max={15} step={0.5} unit="°C"
            color="var(--danger)"
            onChange={v => setLocalThresh(p => ({ ...p, fridgeTempMax: v }))}
          />
          <SliderField
            label="Ambient Laboratory Temperature Alert"
            value={localThresh.roomTempMax}
            min={25} max={45} step={1} unit="°C"
            color="var(--warning)"
            onChange={v => setLocalThresh(p => ({ ...p, roomTempMax: v }))}
          />
          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: '12px', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: '8px',
          }}>
            <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
            <span>Optimal clinical range: <strong style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{localThresh.fridgeTempMin}.0°C — {localThresh.fridgeTempMax}.0°C</strong></span>
          </div>
        </motion.div>

        {/* Humidity & Door Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="card"
          style={{ padding: '24px 28px' }}
        >
          <SectionTitle icon={Droplets} title="Humidity & Door Safety Rules" subtitle="Configure environmental and acoustic alarm triggers" />
          <SliderField
            label="Maximum Ambient Humidity Limit"
            value={localThresh.humidityMax}
            min={50} max={95} step={1} unit="%"
            color="var(--cyan)"
            onChange={v => setLocalThresh(p => ({ ...p, humidityMax: v }))}
          />
          <SliderField
            label="Door Open Timeout (Trigger Acoustic Alarm)"
            value={localThresh.doorOpenTimeoutSec}
            min={10} max={300} step={10} unit="s"
            color="var(--warning)"
            onChange={v => setLocalThresh(p => ({ ...p, doorOpenTimeoutSec: v }))}
          />
        </motion.div>

        {/* Hospital Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="card"
          style={{ padding: '24px 28px' }}
        >
          <SectionTitle icon={Building2} title="Organizational Identity" subtitle="Displayed on reports, telemetry headers, and audits" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Facility / Hospital Name
              </label>
              <input
                className="input"
                value={localSettings.hospitalName}
                onChange={e => setLocalSettings(p => ({ ...p, hospitalName: e.target.value }))}
                placeholder="e.g. City Medical Center"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Refrigerator Unit Identifier
              </label>
              <input
                className="input"
                value={localSettings.fridgeName}
                onChange={e => setLocalSettings(p => ({ ...p, fridgeName: e.target.value }))}
                placeholder="e.g. Vaccine Refrigerator Unit-01"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="card"
          style={{ padding: '24px 28px' }}
        >
          <SectionTitle icon={Bell} title="Notification Channels" subtitle="Manage browser toasts and acoustic audio alerts" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'notificationsEnabled', label: 'Browser Toast Notifications', desc: 'Display real-time popup alerts in the dashboard overlay' },
              { key: 'soundEnabled', label: 'Acoustic Audio Alarms', desc: 'Play audible warning tones on critical temperature breaches' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
                </div>
                <button
                  onClick={() => setLocalSettings(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: '100px',
                    background: localSettings[key] ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white',
                    position: 'absolute', top: '3px',
                    left: localSettings[key] ? '23px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Firebase Config */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="card"
          style={{ padding: '24px 28px', gridColumn: 'span 2' }}
        >
          <SectionTitle icon={Database} title="Firebase Realtime Database Link" subtitle="Hardware IoT gateway credentials and connection state" />
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            padding: '16px', borderRadius: '10px',
            background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)',
            marginBottom: '20px',
          }}>
            <Info size={16} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The application is operating in <strong style={{ color: 'var(--safe)' }}>Live Telemetry Mode</strong> connected to Firebase Realtime Database.
              Hardware IoT telemetry is streaming directly from the ESP32 via Firebase listeners in <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>src/services/firebaseService.js</code>.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Realtime Database URL', placeholder: 'https://smart-cold-chain-rtdb.firebaseio.com' },
              { label: 'Authentication Domain', placeholder: 'smart-cold-chain.firebaseapp.com' },
              { label: 'Project Identifier', placeholder: 'smart-cold-chain-iot' },
              { label: 'Web API Key', placeholder: 'AIzaSyA889_...' },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                <input
                  className="input"
                  placeholder={placeholder}
                  disabled
                  style={{ fontSize: '12px', opacity: 0.5, fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.4)' }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px', gap: '12px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => { setLocalThresh({ ...thresholds }); setLocalSettings({ ...settings }); toast('Reset to current values'); }}
          style={{ padding: '10px 18px' }}
        >
          Reset to Current
        </button>
        <motion.button
          id="save-settings"
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '10px 24px', fontWeight: 600 }}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'Preferences Saved!' : 'Save System Preferences'}
        </motion.button>
      </div>
    </div>
  );
}
