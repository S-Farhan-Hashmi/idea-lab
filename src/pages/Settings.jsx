/**
 * Settings Page — Threshold sliders, hospital config, Firebase settings
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Thermometer, Droplets, DoorOpen, Bell, Save,
  Building2, Database, CheckCircle, Info,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
        <Icon size={16} color="var(--accent)" />
        <span style={{ fontSize: '14px', fontWeight: 700 }}>{title}</span>
      </div>
      {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '24px' }}>{subtitle}</p>}
    </div>
  );
}

function SliderField({ label, value, min, max, step = 0.5, unit, onChange, color = 'var(--accent)' }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>
        <span style={{
          fontSize: '14px', fontWeight: 700, color,
          fontFamily: 'var(--font-mono)',
          background: `${color}15`, padding: '2px 10px',
          borderRadius: '6px', border: `1px solid ${color}25`,
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
          width: '100%', height: '6px', borderRadius: '3px',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
          outline: 'none', cursor: 'pointer',
          accentColor: color,
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { thresholds, updateThresholds } = useData();
  const { settings, updateSettings } = useSettings();

  // Local state for thresholds
  const [localThresh, setLocalThresh] = useState({ ...thresholds });
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateThresholds(localThresh);
    updateSettings(localSettings);
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Settings size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Settings</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Configure thresholds, notifications, and system preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Temperature Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <SectionTitle icon={Thermometer} title="Temperature Thresholds" subtitle="Set safe operating ranges for vaccine storage" />
          <SliderField
            label="Minimum Fridge Temperature"
            value={localThresh.fridgeTempMin}
            min={-5} max={5} step={0.5} unit="°C"
            color="var(--accent)"
            onChange={v => setLocalThresh(p => ({ ...p, fridgeTempMin: v }))}
          />
          <SliderField
            label="Maximum Fridge Temperature"
            value={localThresh.fridgeTempMax}
            min={5} max={15} step={0.5} unit="°C"
            color="var(--danger)"
            onChange={v => setLocalThresh(p => ({ ...p, fridgeTempMax: v }))}
          />
          <SliderField
            label="Max Room Temperature (Warning)"
            value={localThresh.roomTempMax}
            min={25} max={45} step={1} unit="°C"
            color="var(--warning)"
            onChange={v => setLocalThresh(p => ({ ...p, roomTempMax: v }))}
          />
          {/* Current fridge range preview */}
          <div style={{
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
            fontSize: '12px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <CheckCircle size={14} color="var(--success)" />
            Safe fridge range: <strong style={{ color: 'var(--success)' }}>{localThresh.fridgeTempMin}°C — {localThresh.fridgeTempMax}°C</strong>
          </div>
        </motion.div>

        {/* Humidity & Door Thresholds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <SectionTitle icon={Droplets} title="Humidity & Door Settings" />
          <SliderField
            label="Maximum Humidity"
            value={localThresh.humidityMax}
            min={50} max={95} step={1} unit="%"
            color="var(--cyan)"
            onChange={v => setLocalThresh(p => ({ ...p, humidityMax: v }))}
          />
          <SliderField
            label="Door Open Timeout (Alert After)"
            value={localThresh.doorOpenTimeoutSec}
            min={10} max={300} step={10} unit="s"
            color="var(--warning)"
            onChange={v => setLocalThresh(p => ({ ...p, doorOpenTimeoutSec: v }))}
          />
        </motion.div>

        {/* Hospital Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <SectionTitle icon={Building2} title="Hospital Configuration" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Hospital Name
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
                Refrigerator Unit Name
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <SectionTitle icon={Bell} title="Notifications" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'notificationsEnabled', label: 'Browser Notifications', desc: 'Show toast alerts in dashboard' },
              { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play audio on critical alerts' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                <button
                  onClick={() => setLocalSettings(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: '100px',
                    background: localSettings[key] ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: 'none', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white',
                    position: 'absolute', top: '3px',
                    left: localSettings[key] ? '23px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Firebase Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
          style={{ padding: '24px', gridColumn: 'span 2' }}
        >
          <SectionTitle icon={Database} title="Firebase Configuration" subtitle="Edit src/firebase/config.js to update these values" />
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            padding: '14px', borderRadius: '10px',
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            marginBottom: '16px',
          }}>
            <Info size={14} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The app is currently running in <strong style={{ color: 'var(--accent-light)' }}>Mock Data Mode</strong>.
              To connect to Firebase: update <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>src/firebase/config.js</code> with your Firebase project credentials.
              Then swap <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>mockDataService</code> with <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>firebaseService</code> in <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>DataContext.jsx</code>.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Database URL', placeholder: 'https://your-project-rtdb.firebaseio.com' },
              { label: 'Auth Domain', placeholder: 'your-project.firebaseapp.com' },
              { label: 'Project ID', placeholder: 'your-project-id' },
              { label: 'API Key', placeholder: 'AIzaSy...' },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>{label}</label>
                <input
                  className="input"
                  placeholder={placeholder}
                  disabled
                  style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => { setLocalThresh({ ...thresholds }); setLocalSettings({ ...settings }); }}
        >
          Reset to Current
        </button>
        <motion.button
          id="save-settings"
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
}
