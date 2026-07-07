/**
 * Utility: Value formatters
 */

import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';

export function formatTemp(val, unit = '°C') {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(1)}${unit}`;
}

export function formatHumidity(val) {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(1)}%`;
}

export function formatTimestamp(ts) {
  if (!ts) return '—';
  return format(new Date(ts), 'dd MMM yyyy, HH:mm:ss');
}

export function formatTimeAgo(ts) {
  if (!ts) return '—';
  return formatDistanceToNow(new Date(ts), { addSuffix: true });
}

export function formatDuration(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}

export function getStatusColor(status) {
  switch (status) {
    case 'safe': case 'SAFE': case 'online': case 'closed': return 'var(--success)';
    case 'warning': case 'WARNING': return 'var(--warning)';
    case 'critical': case 'CRITICAL': case 'offline': case 'open': return 'var(--danger)';
    default: return 'var(--text-muted)';
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'critical': return 'danger';
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'accent';
    case 'info': return 'accent';
    default: return 'muted';
  }
}

export function formatDate(ts) {
  if (!ts) return '—';
  return format(new Date(ts), 'dd MMM yyyy');
}

export function formatTime(ts) {
  if (!ts) return '—';
  return format(new Date(ts), 'HH:mm:ss');
}
