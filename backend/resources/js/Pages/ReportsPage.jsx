/**
 * OPMAS-001 | Reports Page (Inertia.js Version)
 * Generate and download daily/monthly/equipment reports.
 */
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/dashboard/Layout';

const REPORT_TYPES = [
  { key: 'daily',     label: 'Daily Production Report',   desc: 'Production summary for a single day' },
  { key: 'monthly',   label: 'Monthly Production Report', desc: 'Aggregated monthly production data' },
  { key: 'equipment', label: 'Equipment Health Report',   desc: 'Maintenance log and status summary' },
];

export default function ReportsPage() {
  const [selected, setSelected] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div>
      <Head title="Reports" />
      
      <h1 style={styles.title}>System Reports</h1>
      <p style={styles.subtitle}>Generate and download plant telemetry reports as PDF.</p>

      {/* Selector Cards */}
      <div style={styles.tabsGrid}>
        {REPORT_TYPES.map(r => {
          const isSelected = selected === r.key;
          return (
            <div key={r.key} onClick={() => setSelected(r.key)}
              style={{ ...styles.tabCard, ...(isSelected ? styles.tabCardActive : {}) }}>
              <div style={styles.tabLabel}>{r.label}</div>
              <div style={styles.tabDesc}>{r.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Generator Box */}
      <div style={styles.formBox}>
        <h3 style={styles.formTitle}>Generate Report</h3>
        
        <label style={styles.label}>Report Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={styles.input} />
          
        <button style={styles.btn}>
          Generate PDF
        </button>
        
        <p style={styles.note}>
          PDF generation calls the Laravel backend service.
        </p>
      </div>
    </div>
  );
}

ReportsPage.layout = page => <Layout children={page} />;

const styles = {
  title:       { color: '#102a43', marginBottom: 4, fontSize: 22, fontWeight: 'bold', fontFamily: 'Montserrat, sans-serif' },
  subtitle:    { color: '#486581', marginBottom: 24, fontSize: 13, fontFamily: 'Montserrat, sans-serif' },
  tabsGrid:    { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', fontFamily: 'Montserrat, sans-serif' },
  tabCard:     { background: '#ffffff', color: '#486581', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', border: '1px solid #e2e8f0', minWidth: 180, flex: 1 },
  tabCardActive: { background: '#159ed5', color: '#fff', border: '1px solid #159ed5' },
  tabLabel:    { fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  tabDesc:     { fontSize: 11, opacity: 0.8 },
  formBox:     { background: '#ffffff', borderRadius: 10, padding: 24, border: '1px solid #e2e8f0', maxWidth: 400, fontFamily: 'Montserrat, sans-serif' },
  formTitle:   { margin: '0 0 16px', color: '#102a43', fontSize: 16, fontWeight: '600' },
  label:       { display: 'block', marginBottom: 8, fontSize: 13, color: '#486581' },
  input:       { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #bcccdc', background: '#f8fafc', color: '#102a43', marginBottom: 16, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Montserrat, sans-serif' },
  btn:         { width: '100%', background: '#159ed5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold', fontFamily: 'Montserrat, sans-serif' },
  note:        { fontSize: 11, color: '#94a3b8', marginTop: 12, textAlign: 'center' },
};