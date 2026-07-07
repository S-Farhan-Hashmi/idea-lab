/**
 * Firebase Service
 * Drop-in replacement for mockDataService when real hardware is connected.
 * Usage: In DataContext.jsx, replace mockDataService import with firebaseService.
 */

import { ref, onValue, off, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../firebase/config';

const ROOT = 'coldStorage';

/**
 * Subscribe to real-time sensor data from Firebase.
 * @param {Function} callback - Called with sensor data object on every update
 * @returns {Function} unsubscribe function
 */
export function subscribe(callback) {
  const dataRef = ref(db, ROOT);
  onValue(dataRef, (snapshot) => {
    const raw = snapshot.val();
    if (!raw) return;

    const data = {
      fridgeTemp: raw.fridgeTemp ?? 0,
      roomTemp: raw.roomTemp ?? 0,
      humidity: raw.humidity ?? 0,
      doorStatus: raw.doorStatus ?? 'closed',
      doorOpenDuration: raw.doorOpenDuration ?? 0,
      buzzer: raw.buzzer ?? false,
      wifi: raw.wifi ?? false,
      timestamp: raw.timestamp ?? Date.now(),
      fridgeStatus: getFridgeStatus(raw.fridgeTemp),
      overallHealth: getOverallHealth(raw),
      deviceStatus: raw.deviceStatus ?? {},
      alerts: raw.alerts ? Object.values(raw.alerts).sort((a,b) => b.timestamp - a.timestamp) : [],
      history: raw.history ? Object.values(raw.history).sort((a,b) => b.timestamp - a.timestamp) : [],
    };
    callback(data);
  });

  return () => off(dataRef);
}

function getFridgeStatus(temp) {
  if (!temp) return 'unknown';
  if (temp > 8) return 'critical';
  if (temp < 2) return 'warning';
  return 'safe';
}

function getOverallHealth(raw) {
  if (raw.fridgeTemp > 8 || raw.fridgeTemp < 2) return 'CRITICAL';
  if (raw.humidity > 75) return 'WARNING';
  return 'SAFE';
}

export function getCurrentData() {
  return null; // Firebase is real-time; use subscribe()
}

export function startMockData() {} // no-op for Firebase mode
export function stopMockData() {}  // no-op for Firebase mode

/**
 * Push an alert to Firebase
 */
export async function pushAlert(type, message, priority = 'medium') {
  const alertsRef = ref(db, `${ROOT}/alerts`);
  await push(alertsRef, { type, message, priority, timestamp: serverTimestamp(), acknowledged: false });
}

/**
 * Update settings/thresholds in Firebase
 */
export async function updateSettings(settings) {
  const settingsRef = ref(db, `${ROOT}/settings`);
  await set(settingsRef, settings);
}
