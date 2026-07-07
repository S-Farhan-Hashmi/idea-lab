/**
 * Export helpers — PDF and CSV generation
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { formatTimestamp, formatTemp, formatHumidity } from './formatters';
import { format } from 'date-fns';

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportHistoryCSV(history, filename = 'cold_chain_history') {
  const rows = history.map(h => ({
    Timestamp: formatTimestamp(h.timestamp),
    'Fridge Temp (°C)': h.fridgeTemp?.toFixed(2) ?? '',
    'Room Temp (°C)': h.roomTemp?.toFixed(2) ?? '',
    'Humidity (%)': h.humidity?.toFixed(2) ?? '',
    'Door Status': h.doorStatus ?? '',
  }));

  const csv = Papa.unparse(rows);
  downloadFile(csv, `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`, 'text/csv');
}

export function exportAlertsCSV(alerts, filename = 'cold_chain_alerts') {
  const rows = alerts.map(a => ({
    Timestamp: formatTimestamp(a.timestamp),
    Type: a.type ?? '',
    Message: a.message ?? '',
    Priority: a.priority ?? '',
    Acknowledged: a.acknowledged ? 'Yes' : 'No',
  }));

  const csv = Papa.unparse(rows);
  downloadFile(csv, `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`, 'text/csv');
}

// ─── PDF Report ───────────────────────────────────────────────────────────────

export function generatePDFReport({ sensorData, history, alerts, settings, period = 'Daily' }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const primaryColor = [59, 130, 246];
  const darkColor = [11, 17, 32];
  const textColor = [55, 65, 81];

  // Header
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('IoT Cold Chain Monitoring Report', 14, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${period} Report — Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 28);
  doc.text(settings?.hospitalName || 'Medical Center', 14, 35);

  // Summary section
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('System Summary', 14, 52);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summary = [
    ['Refrigerator Name', settings?.fridgeName || 'Vaccine Unit-01'],
    ['Current Fridge Temperature', formatTemp(sensorData?.fridgeTemp)],
    ['Current Room Temperature', formatTemp(sensorData?.roomTemp)],
    ['Current Humidity', formatHumidity(sensorData?.humidity)],
    ['Door Status', sensorData?.doorStatus?.toUpperCase() || '—'],
    ['Overall Health', sensorData?.overallHealth || '—'],
    ['Report Generated', format(new Date(), 'dd MMM yyyy HH:mm:ss')],
    ['Total Alerts', String(alerts?.length || 0)],
  ];

  autoTable(doc, {
    startY: 56,
    head: [['Parameter', 'Value']],
    body: summary,
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // History table
  if (history?.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Temperature & Humidity History', 14, 20);

    const histRows = history.slice(0, 50).map(h => [
      formatTimestamp(h.timestamp),
      formatTemp(h.fridgeTemp),
      formatTemp(h.roomTemp),
      formatHumidity(h.humidity),
      h.doorStatus?.toUpperCase() || '—',
    ]);

    autoTable(doc, {
      startY: 24,
      head: [['Timestamp', 'Fridge Temp', 'Room Temp', 'Humidity', 'Door']],
      body: histRows,
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  // Alerts table
  if (alerts?.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Alert Log', 14, 20);

    const alertRows = alerts.slice(0, 50).map(a => [
      formatTimestamp(a.timestamp),
      a.type?.replace(/_/g, ' ').toUpperCase() || '—',
      a.message || '—',
      a.priority?.toUpperCase() || '—',
    ]);

    autoTable(doc, {
      startY: 24,
      head: [['Timestamp', 'Type', 'Message', 'Priority']],
      body: alertRows,
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
    doc.text('IoT Smart Cold Chain & Vaccine Storage Monitoring System', 105, 292, { align: 'center' });
  }

  doc.save(`ColdChain_${period}_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
