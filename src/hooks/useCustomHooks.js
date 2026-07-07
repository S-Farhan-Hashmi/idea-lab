// Custom React hooks for common patterns

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Persist state to localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value) {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  }

  return [storedValue, setValue];
}

/**
 * Live clock — updates every second
 */
export function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

/**
 * Network latency probe — pings a small endpoint
 */
export function useNetworkLatency(interval = 5000) {
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    async function probe() {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
        setLatency(Math.round(performance.now() - start));
      } catch {
        setLatency(null);
      }
    }
    probe();
    const timer = setInterval(probe, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return latency;
}

/**
 * Previous value hook — compare to detect changes
 */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

/**
 * Debounce hook
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Count-up animation
 */
export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();
    const from = 0;

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(from + (target - from) * eased);
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [target, duration]);

  return value;
}
