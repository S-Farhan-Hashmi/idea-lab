/**
 * DataContext — Central sensor telemetry store.
 * Subscribes to firebaseService as the single production source of truth.
 * Provides live telemetry, history, alerts, and rolling chart series to all components.
 * React only visualizes telemetry and never generates synthetic history or alerts.
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribe,
  acknowledgeAlert,
  clearAllAlerts,
  setThresholds,
  DEFAULT_THRESHOLDS,
} from '../services/firebaseService';

// ─── Chart series config ─────────────────────────────────────────────────────
const MAX_CHART_POINTS = 60; // Rolling live dataset window

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [sensorData, setSensorData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chartSeries, setChartSeries] = useState({
    fridgeTemp: [],
    roomTemp: [],
    humidity: [],
    doorEvents: [],
  });
  const [thresholds, setThresholdsState] = useState(DEFAULT_THRESHOLDS);

  // Keep a ref for the series so the callback closure doesn't go stale
  const chartSeriesRef = useRef(chartSeries);
  chartSeriesRef.current = chartSeries;

  const handleData = useCallback((data) => {
    if (!data) return;

    setSensorData(data);
    setConnected(Boolean(data.deviceStatus?.firebaseConnected || data.wifi));
    if (data.thresholds) {
      setThresholdsState(data.thresholds);
    }

    const now = Date.now();
    const formatLabel = (ts) => new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const label = formatLabel(now);

    setChartSeries(prev => {
      const trim = (arr) => arr.slice(-MAX_CHART_POINTS + 1);

      // Initialize from historical records if available and chart is empty
      if (prev.fridgeTemp.length === 0 && data.history && data.history.length > 0) {
        const historySlice = data.history.slice(-MAX_CHART_POINTS);
        return {
          fridgeTemp: historySlice.map(h => ({ time: formatLabel(h.timestamp), value: h.fridgeTemp, ts: h.timestamp })),
          roomTemp: historySlice.map(h => ({ time: formatLabel(h.timestamp), value: h.roomTemp, ts: h.timestamp })),
          humidity: historySlice.map(h => ({ time: formatLabel(h.timestamp), value: h.humidity, ts: h.timestamp })),
          doorEvents: historySlice.map(h => ({ time: formatLabel(h.timestamp), value: h.doorStatus === 'open' ? 1 : 0, status: h.doorStatus, ts: h.timestamp })),
        };
      }

      // Avoid adding duplicate timestamp points if data updates faster than 1s
      const lastPoint = prev.fridgeTemp[prev.fridgeTemp.length - 1];
      if (lastPoint && now - lastPoint.ts < 900) {
        return prev;
      }

      return {
        fridgeTemp: [...trim(prev.fridgeTemp), { time: label, value: data.fridgeTemp, ts: now }],
        roomTemp: [...trim(prev.roomTemp), { time: label, value: data.roomTemp, ts: now }],
        humidity: [...trim(prev.humidity), { time: label, value: data.humidity, ts: now }],
        doorEvents: [...trim(prev.doorEvents), {
          time: label,
          value: data.doorStatus === 'open' ? 1 : 0,
          status: data.doorStatus,
          ts: now,
        }],
      };
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(handleData);
    return () => {
      unsubscribe();
    };
  }, [handleData]);

  function updateThresholds(newThresholds) {
    setThresholdsState(newThresholds);
    setThresholds(newThresholds);
  }

  function ackAlert(alertId) {
    acknowledgeAlert(alertId);
  }

  function clearAlerts() {
    clearAllAlerts();
    setSensorData(prev => prev ? { ...prev, alerts: [] } : prev);
  }

  return (
    <DataContext.Provider value={{
      sensorData,
      connected,
      chartSeries,
      thresholds,
      updateThresholds,
      ackAlert,
      clearAlerts,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
