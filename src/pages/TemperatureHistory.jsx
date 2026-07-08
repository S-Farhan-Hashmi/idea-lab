/**
 * Temperature History Page — Real Firebase telemetry audit trail
 * Reads live records from sensorData.history (pushed by ESP32)
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Search, Download, Filter, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatTimestamp, formatTemp, formatHumidity } from '../utils/formatters';
import { exportHistoryCSV } from '../utils/exportHelpers';
import LoadingScreen from '../components/layout/LoadingScreen';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

export default function TemperatureHistory() {
  const { sensorData, thresholds } = useData();

  const [search, setSearch]         = useState('');
  const [filterDoor, setFilterDoor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'safe' | 'out-of-range'
  const [page, setPage]             = useState(0);

  // History is always an array (empty while loading or genuinely empty)
  const history = sensorData?.history ?? [];

  const safeMin = thresholds?.fridgeTempMin ?? 2;
  const safeMax = thresholds?.fridgeTempMax ?? 8;

  const filtered = useMemo(() => {
    return history.filter(h => {
      const doorMatch = filterDoor === 'all' || h.doorStatus === filterDoor;
      const searchMatch = !search || formatTimestamp(h.timestamp).toLowerCase().includes(search.toLowerCase());
      const tempOk = h.fridgeTemp >= safeMin && h.fridgeTemp <= safeMax;
      const statusMatch =
        filterStatus === 'all' ||
        (filterStatus === 'safe' && tempOk) ||
        (filterStatus === 'out-of-range' && !tempOk);
      return doorMatch && searchMatch && statusMatch;
    });
  }, [history, search, filterDoor, filterStatus, safeMin, safeMax]);

  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Summary stats from ALL history (not just filtered)
  const summaryStats = useMemo(() => {
    if (!history.length) return null;
    const temps = history.map(h => h.fridgeTemp).filter(v => v != null);
    const excursions = temps.filter(t => t < safeMin || t > safeMax).length;
    return {
      total: history.length,
      excursions,
      compliance: temps.length ? ((temps.length - excursions) / temps.length * 100).toFixed(1) : '100.0',
      minTemp: temps.length ? Math.min(...temps).toFixed(1) : '—',
      maxTemp: temps.length ? Math.max(...temps).toFixed(1) : '—',
    };
  }, [history, safeMin, safeMax]);

  if (!sensorData) return <LoadingScreen />;

  function handleExport() {
    exportHistoryCSV(filtered);
    toast.success(`Exported ${filtered.length} records`);
  }

  function getTempColor(temp) {
    if (temp > safeMax || temp < safeMin) return 'var(--danger)';
    return 'var(--success)';
  }

  function resetPage() { setPage(0); }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Thermometer size={18} color="var(--accent-light)" />
          </div>
          <h1 style={{ fontSize: '20px', letterSpacing: '-0.025em' }}>Temperature History Log</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>
          {history.length > 0
            ? `${history.length} total clinical telemetry records — DS18B20 & DHT22 sensor audit trail`
            : 'No records yet — telemetry will appear automatically as the ESP32 uploads readings to Firebase'}
        </p>
      </div>

      {/* Summary Stats Bar */}
      {summaryStats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px',
        }}>
          {[
            { label: 'TOTAL RECORDS',  value: summaryStats.total,       color: 'var(--accent)' },
            { label: 'EXCURSIONS',     value: summaryStats.excursions,   color: summaryStats.excursions > 0 ? 'var(--danger)' : 'var(--success)' },
            { label: 'COMPLIANCE',     value: `${summaryStats.compliance}%`, color: summaryStats.compliance >= 95 ? 'var(--success)' : 'var(--warning)' },
            { label: 'MIN TEMP',       value: `${summaryStats.minTemp}°C`,   color: 'var(--cyan)' },
            { label: 'MAX TEMP',       value: `${summaryStats.maxTemp}°C`,   color: 'var(--warning)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
        marginBottom: '20px', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <div className="input-icon-wrap" style={{ flex: '1', minWidth: '220px', maxWidth: '320px' }}>
            <Search size={15} className="icon" />
            <input
              className="input"
              placeholder="Search by timestamp or date..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={filterDoor}
              onChange={e => { setFilterDoor(e.target.value); resetPage(); }}
              className="input"
              style={{ width: 'auto', paddingLeft: '14px', paddingRight: '28px', cursor: 'pointer' }}
            >
              <option value="all">All Door States</option>
              <option value="open">Door Open Only</option>
              <option value="closed">Door Closed Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); resetPage(); }}
              className="input"
              style={{ width: 'auto', paddingLeft: '14px', paddingRight: '28px', cursor: 'pointer' }}
            >
              <option value="all">All Temp Status</option>
              <option value="safe">Safe Range Only</option>
              <option value="out-of-range">Excursions Only</option>
            </select>
          </div>
        </div>

        <button
          id="export-history-csv"
          className="btn btn-secondary"
          onClick={handleExport}
          disabled={filtered.length === 0}
          style={{ gap: '8px' }}
        >
          <Download size={15} />
          Export CSV Log
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card"
        style={{ overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                {['#', 'Timestamp', 'Fridge Temp (DS18B20)', 'Room Temp (DHT22)', 'Humidity', 'Door Status', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '80px', textAlign: 'center' }}>
                    <Database size={36} color="var(--text-muted)" style={{ margin: '0 auto 14px', opacity: 0.3 }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      No Telemetry Records Yet
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                      Historical data will appear automatically once the ESP32 uploads readings to Firebase under the <code style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>/history</code> node.
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No records match your filter criteria
                  </td>
                </tr>
              ) : paginated.map((row, i) => {
                const tempColor = getTempColor(row.fridgeTemp);
                const isOut = row.fridgeTemp > safeMax || row.fridgeTemp < safeMin;
                return (
                  <motion.tr
                    key={row.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.035)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {page * PAGE_SIZE + i + 1}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: tempColor, boxShadow: `0 0 4px ${tempColor}` }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: tempColor, fontFamily: 'var(--font-mono)' }}>
                          {formatTemp(row.fridgeTemp)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
                      {formatTemp(row.roomTemp)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                      {formatHumidity(row.humidity)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${row.doorStatus === 'open' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {row.doorStatus?.toUpperCase() ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '100px',
                        background: isOut ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                        color: isOut ? 'var(--danger)' : 'var(--success)',
                        border: `1px solid ${isOut ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      }}>
                        {isOut ? 'EXCURSION' : 'SAFE'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderTop: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{page * PAGE_SIZE + 1}</strong>–<strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{filtered.length}</strong>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: '6px 10px' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 8px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {page + 1} / {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{ padding: '6px 10px' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
