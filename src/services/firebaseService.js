/**
 * Firebase Service — Production Single Source of Truth
 * Telemetry flows strictly: ESP32 -> Firebase Realtime Database -> React Dashboard.
 * React only reads and visualizes telemetry without generating synthetic history or alerts.
 */

import { ref, onValue, off, set, push, update, remove, serverTimestamp } from 'firebase/database';
import { db } from '../firebase/config';

export const DEFAULT_THRESHOLDS = {
  fridgeTempMin: 2,
  fridgeTempMax: 8,
  roomTempMax: 35,
  humidityMax: 75,
  doorOpenTimeoutSec: 60,
};

let _listeners = [];
let _doorOpenSince = null;
let _doorTimer = null;
let _initialSnapshotReceived = false;

let _currentSnapshot = {
  device: {},
  sensors: {},
  history: {},
  alerts: {},
  settings: null,
  connected: false,
};

let _refs = {};

function _compileData() {
  if (db && !_initialSnapshotReceived) {
    return null;
  }

  const rawDevice = _currentSnapshot.device || {};
  const rawSensors = _currentSnapshot.sensors || {};
  const rawHistory = _currentSnapshot.history || {};
  const rawAlerts = _currentSnapshot.alerts || {};
  const rawSettings = _currentSnapshot.settings || {};

  const thresholds = { ...DEFAULT_THRESHOLDS, ...rawSettings };

  // device/status -> deviceStatus.status and deviceStatus.esp32
  const statusStr = rawDevice.status ?? 'OFFLINE';
  const esp32Online = statusStr === 'ONLINE' || statusStr === 'online' || statusStr === true || Boolean(rawDevice.ip);

  // device/rssi -> deviceStatus.rssi and deviceStatus.wifiStrength (convert RSSI into percentage)
  const rawRssi = Number(rawDevice.rssi ?? -100);
  const wifiStrength = rawRssi < 0 ? Math.min(Math.max(Math.round(2 * (rawRssi + 100)), 0), 100) : rawRssi;

  // device/ip -> deviceStatus.ip
  const ipAddr = rawDevice.ip ?? 'Unknown';

  // device/uptime -> deviceStatus.uptime
  const uptimeSec = Number(rawDevice.uptime ?? 0);

  // sensors/fridgeTemperature -> fridgeTemp
  const fridgeTemp = Number(rawSensors.fridgeTemperature ?? rawSensors.fridgeTemp ?? 0);

  // sensors/roomTemperature -> roomTemp
  const roomTemp = Number(rawSensors.roomTemperature ?? rawSensors.roomTemp ?? 0);

  // sensors/humidity -> humidity
  const humidity = Number(rawSensors.humidity ?? 0);

  // sensors/doorOpen -> doorStatus
  const isDoorOpen = rawSensors.doorOpen === true || rawSensors.doorStatus === 'open' || rawSensors.doorOpen === 'open';
  const doorStatus = isDoorOpen ? 'open' : 'closed';

  // Door duration tracking
  if (isDoorOpen) {
    if (!_doorOpenSince) _doorOpenSince = Date.now();
  } else {
    _doorOpenSince = null;
  }
  const doorOpenDuration = _doorOpenSince ? Math.floor((Date.now() - _doorOpenSince) / 1000) : 0;

  // Manage door timer for real-time duration updates while open
  if (isDoorOpen && !_doorTimer && _listeners.length > 0) {
    _doorTimer = setInterval(() => {
      _notifyListeners();
    }, 1000);
  } else if (!isDoorOpen && _doorTimer) {
    clearInterval(_doorTimer);
    _doorTimer = null;
  }

  // Compute status
  const fridgeStatus =
    fridgeTemp > thresholds.fridgeTempMax ? 'critical' :
    fridgeTemp < thresholds.fridgeTempMin ? 'warning' :
    'safe';

  const overallHealth =
    fridgeStatus === 'critical' ? 'CRITICAL' :
    (isDoorOpen && doorOpenDuration > thresholds.doorOpenTimeoutSec) ? 'WARNING' :
    humidity > thresholds.humidityMax ? 'WARNING' :
    fridgeStatus === 'warning' ? 'WARNING' :
    'SAFE';

  const buzzer = fridgeStatus !== 'safe' || (isDoorOpen && doorOpenDuration > thresholds.doorOpenTimeoutSec);

  // History mapping (read-only from ESP32 uploads)
  const history = Object.entries(rawHistory).map(([id, val]) => ({
    id,
    timestamp: Number(val?.timestamp ?? Date.now()),
    fridgeTemp: Number(val?.fridgeTemperature ?? val?.fridgeTemp ?? 0),
    roomTemp: Number(val?.roomTemperature ?? val?.roomTemp ?? 0),
    humidity: Number(val?.humidity ?? 0),
    doorStatus: (val?.doorOpen === true || val?.doorStatus === 'open' || val?.doorOpen === 'open') ? 'open' : 'closed',
    rssi: Number(val?.rssi ?? 0),
    uptime: Number(val?.uptime ?? 0),
  })).sort((a, b) => b.timestamp - a.timestamp);

  // Alerts mapping (read-only from ESP32 uploads)
  const alerts = Object.entries(rawAlerts).map(([id, val]) => ({
    id,
    type: val?.type ?? 'system_event',
    message: val?.message ?? 'System notification',
    priority: val?.priority ?? 'info',
    timestamp: Number(val?.timestamp ?? Date.now()),
    acknowledged: Boolean(val?.acknowledged),
  })).sort((a, b) => b.timestamp - a.timestamp);

  return {
    fridgeTemp: parseFloat(fridgeTemp.toFixed(2)),
    roomTemp: parseFloat(roomTemp.toFixed(2)),
    humidity: parseFloat(humidity.toFixed(2)),
    doorStatus,
    doorOpenDuration,
    buzzer,
    wifi: _currentSnapshot.connected,
    timestamp: Date.now(),
    fridgeStatus,
    overallHealth,
    deviceStatus: {
      esp32: esp32Online,
      status: statusStr,
      wifiConnected: _currentSnapshot.connected && esp32Online,
      firebaseConnected: _currentSnapshot.connected,
      wifiStrength,
      rssi: rawRssi,
      ip: ipAddr,
      lastSync: Date.now(),
      uptime: uptimeSec,
    },
    alerts,
    history,
    thresholds,
  };
}

function _notifyListeners() {
  const data = _compileData();
  _listeners.forEach(cb => {
    try {
      cb(data);
    } catch (e) {
      console.error('Error in listener callback:', e);
    }
  });
}

function _attachListeners() {
  if (!db) return;

  const nodes = ['device', 'sensors', 'history', 'alerts', 'settings'];
  nodes.forEach(node => {
    _refs[node] = ref(db, node);
    onValue(_refs[node], (snapshot) => {
      _initialSnapshotReceived = true;
      _currentSnapshot[node] = snapshot.val() || (node === 'settings' ? null : {});
      _notifyListeners();
    }, (error) => {
      console.warn(`Firebase read error on /${node}:`, error.message);
    });
  });

  _refs.connected = ref(db, '.info/connected');
  onValue(_refs.connected, (snapshot) => {
    _initialSnapshotReceived = true;
    _currentSnapshot.connected = Boolean(snapshot.val());
    _notifyListeners();
  });
}

function _detachListeners() {
  if (!db) return;
  _initialSnapshotReceived = false;
  Object.keys(_refs).forEach(key => {
    if (_refs[key]) {
      off(_refs[key]);
      delete _refs[key];
    }
  });
  if (_doorTimer) {
    clearInterval(_doorTimer);
    _doorTimer = null;
  }
}

/**
 * Subscribe to real-time telemetry from Firebase.
 * Automatically manages shared listeners to prevent duplicates and memory leaks.
 */
export function subscribe(callback) {
  if (typeof callback !== 'function') return () => {};

  _listeners.push(callback);
  if (_listeners.length === 1) {
    _attachListeners();
  }

  // Immediately notify new subscriber with latest compiled state
  callback(_compileData());

  return () => {
    _listeners = _listeners.filter(l => l !== callback);
    if (_listeners.length === 0) {
      _detachListeners();
    }
  };
}

export function getCurrentData() {
  return _compileData();
}

// No-op development stubs to maintain interface compatibility
export function startMockData() {}
export function stopMockData() {}

/**
 * Acknowledge an alert in Firebase
 */
export async function acknowledgeAlert(alertId) {
  if (!db || !alertId) return;
  try {
    const alertRef = ref(db, `alerts/${alertId}`);
    await update(alertRef, { acknowledged: true });
  } catch (err) {
    console.error('Failed to acknowledge alert in Firebase:', err);
  }
}

/**
 * Clear all alerts in Firebase
 */
export async function clearAllAlerts() {
  if (!db) return;
  try {
    const alertsRef = ref(db, 'alerts');
    await remove(alertsRef);
  } catch (err) {
    console.error('Failed to clear alerts in Firebase:', err);
  }
}

/**
 * Push an alert to Firebase
 */
export async function pushAlert(type, message, priority = 'medium') {
  if (!db) return;
  try {
    const alertsRef = ref(db, 'alerts');
    await push(alertsRef, { type, message, priority, timestamp: serverTimestamp(), acknowledged: false });
  } catch (err) {
    console.error('Failed to push alert to Firebase:', err);
  }
}

/**
 * Update settings/thresholds in Firebase
 */
export async function updateSettings(settings) {
  if (!db) return;
  try {
    const settingsRef = ref(db, 'settings');
    await set(settingsRef, settings);
  } catch (err) {
    console.error('Failed to update settings in Firebase:', err);
  }
}

export function setThresholds(thresholds) {
  updateSettings(thresholds);
}
