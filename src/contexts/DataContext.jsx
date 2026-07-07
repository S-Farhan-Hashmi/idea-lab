/**
 * DataContext — central sensor data store.
 * Subscribes to mockDataService (swap with firebaseService for production).
 * Provides live data, history, alerts, and chart series to all components.
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribe,
  startMockData,
  stopMockData,
  acknowledgeAlert,
  clearAllAlerts,
  setThresholds,
  DEFAULT_THRESHOLDS,
} from '../services/mockDataService';

// ─── Chart series config ─────────────────────────────────────────────────────
const MAX_CHART_POINTS = 60; // ~2 minutes of data at 2s intervals

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
    setSensorData(data);
    setConnected(true);

    const now = Date.now();
    const label = new Date(now).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setChartSeries(prev => {
      const trim = (arr) => arr.slice(-MAX_CHART_POINTS + 1);
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
    startMockData();
    const unsubscribe = subscribe(handleData);
    return () => {
      unsubscribe();
      stopMockData();
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
