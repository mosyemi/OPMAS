/**
 * OPMAS-001 | Reports Page
 * Generate and download daily/monthly/equipment reports.
 * Backend integration (PDF generation via Laravel) comes in Phase D.
 */
import React, { useState } from 'react';

const REPORT_TYPES = [
  { key: 'daily',     label: 'Daily Production Report',   desc: 'Production summary for a single day' },
  { key: 'monthly',   label: 'Monthly Production Report', desc: 'Aggregated monthly production data' },
  { key: 'equipment', label: 'Equipment Health Report',   desc: 'Maintenance log and status summary' },
];

export default function ReportsPage() {
  const [selected, setSelected] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#1b3a6b', marginBottom: 4 }}>Reports</h1>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 13 }}>Generate and download plant reports as PDF.</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {REPORT_TYPES.map(r => (
          <div key={r.key} onClick={() => setSelected(r.key)}
            style={{ background: selected === r.key ? '#1b3a6b' : '#fff', color: selected === r.key ? '#fff' : '#1e293b', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', border: '1px solid #e2e8f0', minWidth: 180 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #e2e8f0', maxWidth: 400 }}>
        <h3 style={{ margin: '0 0 16px', color: '#1b3a6b' }}>Generate Report</h3>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#374151' }}>Report Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 16, fontSize: 14, boxSizing: 'border-box' }} />
        <button style={{ background: '#1b3a6b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
          Generate PDF
        </button>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
          PDF generation requires the Laravel API to be connected.
        </p>
      </div>
    </div>
  );
}
