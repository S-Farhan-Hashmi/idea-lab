/**
 * Temperature History Page — Handcrafted Premium SaaS Style
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatTimestamp, formatTemp, formatHumidity } from '../utils/formatters';
import { exportHistoryCSV } from '../utils/exportHelpers';
import LoadingScreen from '../components/layout/LoadingScreen';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

export default function TemperatureHistory() {
  const { sensorData } = useData();

  if (!sensorData) return <LoadingScreen />;

  const history = sensorData?.history ?? [];

  const [search, setSearch] = useState('');
  const [filterDoor, setFilterDoor] = useState('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return history.filter(h => {
      const doorMatch = filterDoor === 'all' || h.doorStatus === filterDoor;
      const searchMatch = !search || formatTimestamp(h.timestamp).toLowerCase().includes(search.toLowerCase());
      return doorMatch && searchMatch;
    });
  }, [history, search, filterDoor]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function handleExport() {
    exportHistoryCSV(filtered);
    toast.success(`Exported ${filtered.length} records`);
  }

  function getTempColor(temp) {
    if (temp > 8 || temp < 2) return 'var(--danger)';
    return 'var(--success)';
  }

  return (
    <div className="page-content">
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
          {history.length} total clinical telemetry records — DS18B20 & DHT22 sensor audit trail
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
        marginBottom: '20px', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <div className="input-icon-wrap" style={{ flex: '1', minWidth: '220px', maxWidth: '360px' }}>
            <Search size={15} className="icon" />
            <input
              className="input"
              placeholder="Search by timestamp or date..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={filterDoor}
              onChange={e => { setFilterDoor(e.target.value); setPage(0); }}
              className="input"
              style={{ width: 'auto', paddingLeft: '14px', paddingRight: '28px', cursor: 'pointer' }}
            >
              <option value="all">All Door States</option>
              <option value="open">Door Open Only</option>
              <option value="closed">Door Closed Only</option>
            </select>
          </div>
        </div>

        <button
          id="export-history-csv"
          className="btn btn-secondary"
          onClick={handleExport}
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
                {['#', 'Timestamp', 'Fridge Temp (DS18B20)', 'Room Temp (DHT22)', 'Humidity', 'Door Status'].map(h => (
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '64px', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '13px',
                  }}>
                    {history.length === 0
                      ? 'No telemetry history recorded yet. Historical data will appear automatically once uploaded by the ESP32.'
                      : 'No telemetry records match your filter criteria'}
                  </td>
                </tr>
              ) : paginated.map((row, i) => (
                <motion.tr
                  key={row.id}
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
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: getTempColor(row.fridgeTemp) }} />
                      <span style={{
                        fontSize: '14px', fontWeight: 700,
                        color: getTempColor(row.fridgeTemp),
                        fontFamily: 'var(--font-mono)',
                      }}>
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
                      {row.doorStatus?.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
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
