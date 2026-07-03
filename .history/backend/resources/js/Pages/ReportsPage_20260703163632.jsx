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

