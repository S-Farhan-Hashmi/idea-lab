/**
 * Reports Page — PDF and CSV report generation
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, FileSpreadsheet, Calendar,
  BarChart3, CheckCircle, Loader,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { generatePDFReport, exportHistoryCSV, exportAlertsCSV } from '../utils/exportHelpers';
import LoadingScreen from '../components/layout/LoadingScreen';
import toast from 'react-hot-toast';

function ReportCard({ title, description, period, icon: Icon, color, onGenerate, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: 46, height: 46, borderRadius: '12px',
          background: `${color}15`, border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={color} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          id={`generate-pdf-${period.toLowerCase()}`}
          className="btn btn-primary btn-sm"
          onClick={() => onGenerate('pdf', period)}
          disabled={loading}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {loading ? <Loader size={13} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <FileText size={13} />}
          PDF Report
        </button>
        <button
          id={`export-csv-${period.toLowerCase()}`}
          className="btn btn-secondary btn-sm"
          onClick={() => onGenerate('csv', period)}
          disabled={loading}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <FileSpreadsheet size={13} />
          Export CSV
        </button>
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const { sensorData } = useData();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  if (!sensorData) return <LoadingScreen />;

  const history = sensorData?.history ?? [];
  const alerts = sensorData?.alerts ?? [];

  async function handleGenerate(type, period) {
    setLoading(true);
    try {
      if (type === 'pdf') {
        generatePDFReport({ sensorData, history, alerts, settings, period });
        toast.success(`${period} PDF report generated!`);
      } else {
        if (period === 'Alerts') {
          exportAlertsCSV(alerts, `cold_chain_alerts_${period.toLowerCase()}`);
        } else {
          exportHistoryCSV(history, `cold_chain_history_${period.toLowerCase()}`);
        }
        toast.success(`${period} CSV exported!`);
      }
      setLastGenerated({ type, period, time: new Date().toLocaleTimeString() });
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const reports = [
    {
      title: 'Daily Report',
      description: 'Today\'s temperature, humidity, door events, and alerts summary',
      period: 'Daily',
      icon: Calendar,
      color: 'var(--accent)',
    },
    {
      title: 'Weekly Report',
      description: 'Last 7 days aggregated data with trend analysis and statistics',
      period: 'Weekly',
      icon: BarChart3,
      color: 'var(--purple)',
    },
    {
      title: 'Monthly Report',
      description: 'Full month summary with compliance indicators and critical events',
      period: 'Monthly',
      icon: FileText,
      color: 'var(--success)',
    },
    {
      title: 'Alerts Report',
      description: 'Complete alert log with priorities, timestamps, and acknowledgements',
      period: 'Alerts',
      icon: CheckCircle,
      color: 'var(--warning)',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <FileText size={18} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Reports</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Generate PDF reports or export data as CSV for compliance and auditing
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px', marginBottom: '28px',
      }}>
        {[
          { label: 'History Records', value: history.length, color: 'var(--accent)' },
          { label: 'Total Alerts', value: alerts.length, color: 'var(--warning)' },
          { label: 'Last Report', value: lastGenerated ? `${lastGenerated.period} at ${lastGenerated.time}` : 'None yet', color: 'var(--success)' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
            style={{ padding: '16px 20px' }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>
              {s.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        {reports.map((r, i) => (
          <motion.div key={r.period} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <ReportCard {...r} onGenerate={handleGenerate} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Report info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card"
        style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
      >
        <Download size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Report Information</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Reports are generated from mock sensor data in demo mode. When connected to Firebase, reports will include real hardware readings from your ESP32.
            PDFs include a summary table, history log, and alert log. CSVs can be opened in Excel or Google Sheets for further analysis.
            Reports are designed for pharmaceutical compliance documentation (WHO PQS, GDP cold chain guidelines).
          </div>
        </div>
      </motion.div>
    </div>
  );
}
