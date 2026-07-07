/**
 * Temperature History Page — searchable, filterable, paginated table with CSV export
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatTimestamp, formatTemp, formatHumidity } from '../utils/formatters';
import { exportHistoryCSV } from '../utils/exportHelpers';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

export default function TemperatureHistory() {
  const { sensorData } = useData();
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

  function getStatusColor(doorStatus) {
    return doorStatus === 'open' ? 'var(--danger)' : 'var(--success)';
  }

  function getTempColor(temp) {
    if (temp > 8 || temp < 2) return 'var(--danger)';
    return 'var(--success)';
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Thermometer size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Temperature History</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {history.length} total records — DS18B20 & DHT22 sensor log
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div className="input-icon-wrap" style={{ flex: '1', minWidth: '200px', maxWidth: '340px' }}>
          <Search size={15} className="icon" />
          <input
            className="input"
            placeholder="Search by timestamp..."
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
            style={{ width: 'auto', paddingLeft: '12px' }}
          >
            <option value="all">All Door States</option>
            <option value="open">Door Open</option>
            <option value="closed">Door Closed</option>
          </select>
        </div>

        <button
          id="export-history-csv"
          className="btn btn-secondary"
          onClick={handleExport}
          style={{ gap: '6px' }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['#', 'Timestamp', 'Fridge Temp', 'Room Temp', 'Humidity', 'Door Status'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    background: 'rgba(255,255,255,0.02)',
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
                    padding: '48px', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '13px',
                  }}>
                    No records found
                  </td>
                </tr>
              ) : paginated.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(row.timestamp)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: 700,
                      color: getTempColor(row.fridgeTemp),
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {formatTemp(row.fridgeTemp)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
                    {formatTemp(row.roomTemp)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                    {formatHumidity(row.humidity)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${row.doorStatus === 'open' ? 'badge-danger' : 'badge-success'}`}>
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
            padding: '14px 16px', borderTop: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '0 8px' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
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
