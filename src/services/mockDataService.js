/**
 * Mock Data Service
 * Generates realistic sensor data for development/demo mode.
 * To switch to Firebase: replace this service in DataContext with firebaseService.
 *
 * Firebase DB Structure:
 * coldStorage/
 *   fridgeTemp    : number
 *   roomTemp      : number
 *   humidity      : number
 *   doorStatus    : "open" | "closed"
 *   buzzer        : boolean
 *   wifi          : boolean
 *   timestamp     : number (unix ms)
 *   deviceStatus  : { esp32, wifiStrength, lastSync, uptime }
 *   alerts/       : { [id]: { type, message, priority, timestamp } }
 *   history/      : { [id]: { fridgeTemp, roomTemp, humidity, doorStatus, timestamp } }
 */

import { format } from 'date-fns';

// ─── Internal State ───────────────────────────────────────────────────────────
let _fridgeTemp = 4.5;
let _roomTemp = 27.0;
let _humidity = 58.0;
let _doorOpen = false;
let _doorOpenSince = null;
let _buzzerOn = false;
let _uptimeSeconds = 0;
let _alertIdCounter = 1;
let _historyIdCounter = 1;
let _alerts = [];
let _history = [];
let _interval = null;
let _listeners = [];

// ─── Threshold Defaults ───────────────────────────────────────────────────────
export const DEFAULT_THRESHOLDS = {
  fridgeTempMin: 2,
  fridgeTempMax: 8,
  roomTempMax: 35,
  humidityMax: 75,
  doorOpenTimeoutSec: 60,
};

let _thresholds = { ...DEFAULT_THRESHOLDS };

export function setThresholds(t) {
  _thresholds = { ...t };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function drift(current, min, max, speed = 0.3) {
  const delta = (Math.random() - 0.5) * speed;
  return clamp(current + delta, min, max);
}

function randomBool(probability = 0.15) {
  return Math.random() < probability;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ─── Alert Generation ─────────────────────────────────────────────────────────
function pushAlert(type, message, priority = 'medium') {
  const alert = {
    id: generateId(),
    type,
    message,
    priority,
    timestamp: Date.now(),
    acknowledged: false,
  };
  _alerts = [alert, ..._alerts].slice(0, 100); // keep last 100
  return alert;
}

// ─── History Recording ────────────────────────────────────────────────────────
function recordHistory(data) {
  _history = [
    {
      id: generateId(),
      ...data,
      timestamp: Date.now(),
    },
    ..._history,
  ].slice(0, 500); // keep last 500 records
}

// ─── Sensor Simulation Tick ───────────────────────────────────────────────────
function tick() {
  _uptimeSeconds += 2;

  // Simulate temperature drift with occasional spikes
  const tempSpike = randomBool(0.03) ? (Math.random() * 3 - 1.5) : 0;
  _fridgeTemp = drift(_fridgeTemp + tempSpike, 1.5, 9.5, 0.2);
  _roomTemp = drift(_roomTemp, 22, 34, 0.15);
  _humidity = drift(_humidity, 38, 78, 0.5);

  // Simulate door events (15% chance to toggle each tick)
  const prevDoorOpen = _doorOpen;
  if (randomBool(0.12)) {
    _doorOpen = !_doorOpen;
    if (_doorOpen) {
      _doorOpenSince = Date.now();
    } else {
      _doorOpenSince = null;
    }
  }

  // Door open too long alert
  const doorOpenDuration = _doorOpen && _doorOpenSince
    ? Math.floor((Date.now() - _doorOpenSince) / 1000)
    : 0;

  // ─── Alert Logic ────────────────────────────────────────────────
  if (_fridgeTemp > _thresholds.fridgeTempMax) {
    _buzzerOn = true;
    if (Math.random() < 0.3) {
      pushAlert('temp_high', `Fridge temperature high: ${_fridgeTemp.toFixed(1)}°C (max ${_thresholds.fridgeTempMax}°C)`, 'critical');
    }
  } else if (_fridgeTemp < _thresholds.fridgeTempMin) {
    _buzzerOn = true;
    if (Math.random() < 0.3) {
      pushAlert('temp_low', `Fridge temperature low: ${_fridgeTemp.toFixed(1)}°C (min ${_thresholds.fridgeTempMin}°C)`, 'high');
    }
  } else {
    _buzzerOn = false;
  }

  if (_doorOpen && doorOpenDuration > _thresholds.doorOpenTimeoutSec) {
    _buzzerOn = true;
    if (Math.random() < 0.2) {
      pushAlert('door_open', `Door open for ${doorOpenDuration}s — exceeds timeout of ${_thresholds.doorOpenTimeoutSec}s`, 'high');
    }
  }

  if (_humidity > _thresholds.humidityMax) {
    if (Math.random() < 0.2) {
      pushAlert('humidity_high', `Humidity high: ${_humidity.toFixed(1)}% (max ${_thresholds.humidityMax}%)`, 'medium');
    }
  }

  // Random sensor failure simulation (very rare)
  if (randomBool(0.005)) {
    pushAlert('sensor_failure', 'DS18B20 sensor read timeout — check connections', 'critical');
  }

  // Record history every 5 ticks (every 10s in real time for demo)
  if (_historyIdCounter % 5 === 0) {
    recordHistory({
      fridgeTemp: _fridgeTemp,
      roomTemp: _roomTemp,
      humidity: _humidity,
      doorStatus: _doorOpen ? 'open' : 'closed',
    });
  }
  _historyIdCounter++;

  const data = getCurrentData();
  _listeners.forEach(cb => cb(data));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getCurrentData() {
  const doorOpenDuration = _doorOpen && _doorOpenSince
    ? Math.floor((Date.now() - _doorOpenSince) / 1000)
    : 0;

  const fridgeStatus =
    _fridgeTemp > _thresholds.fridgeTempMax ? 'critical' :
    _fridgeTemp < _thresholds.fridgeTempMin ? 'warning' :
    'safe';

  const overallHealth =
    fridgeStatus === 'critical' ? 'CRITICAL' :
    (_doorOpen && doorOpenDuration > _thresholds.doorOpenTimeoutSec) ? 'WARNING' :
    _humidity > _thresholds.humidityMax ? 'WARNING' :
    fridgeStatus === 'warning' ? 'WARNING' :
    'SAFE';

  return {
    fridgeTemp: parseFloat(_fridgeTemp.toFixed(2)),
    roomTemp: parseFloat(_roomTemp.toFixed(2)),
    humidity: parseFloat(_humidity.toFixed(2)),
    doorStatus: _doorOpen ? 'open' : 'closed',
    doorOpenDuration,
    buzzer: _buzzerOn,
    wifi: true,
    timestamp: Date.now(),
    fridgeStatus,
    overallHealth,
    deviceStatus: {
      esp32: true,
      wifiConnected: true,
      firebaseConnected: false, // will be true when Firebase is integrated
      wifiStrength: Math.floor(Math.random() * 20 + 70), // -70 to -50 dBm simulated as %
      lastSync: Date.now(),
      uptime: _uptimeSeconds,
    },
    alerts: _alerts,
    history: _history,
    thresholds: _thresholds,
  };
}

export function subscribe(callback) {
  _listeners.push(callback);
  // Immediately emit current data
  callback(getCurrentData());
  return () => {
    _listeners = _listeners.filter(l => l !== callback);
  };
}

export function startMockData() {
  if (_interval) return;
  // Pre-populate history
  for (let i = 0; i < 30; i++) {
    const t = drift(_fridgeTemp, 2, 8, 0.3);
    const r = drift(_roomTemp, 24, 32, 0.5);
    const h = drift(_humidity, 40, 75, 1);
    _history.push({
      id: generateId(),
      fridgeTemp: parseFloat(t.toFixed(2)),
      roomTemp: parseFloat(r.toFixed(2)),
      humidity: parseFloat(h.toFixed(2)),
      doorStatus: Math.random() > 0.8 ? 'open' : 'closed',
      timestamp: Date.now() - (30 - i) * 10000,
    });
  }
  // Add some initial alerts
  pushAlert('system_start', 'IoT Monitoring System initialized', 'info');
  pushAlert('temp_ok', 'Fridge temperature within safe range (2–8°C)', 'low');

  _interval = setInterval(tick, 2000);
}

export function stopMockData() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
  _listeners = [];
}

export function acknowledgeAlert(alertId) {
  _alerts = _alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a);
}

export function clearAllAlerts() {
  _alerts = [];
}

export function getHistory() {
  return _history;
}
