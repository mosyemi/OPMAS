/**
 * OPMAS-001 | Equipment Page (Inertia.js Version)
 * Shows compressor, beds, and tank status with maintenance schedule.
 */
import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/dashboard/Layout';

export default function EquipmentPage({ equipment }) {
  // Use initial list passed from Laravel (or fall back to static list if empty)
  const list = equipment || [
    { code: 'COMP-01',  name: 'Air Compressor',      type: 'compressor', status: 'running',  last: '2026-05-01', next: '2026-11-01' },
    { code: 'BED-A',    name: 'PSA Tower Bed A',      type: 'adsorber',   status: 'active',   last: '2026-04-15', next: '2026-10-15' },
    { code: 'BED-B',    name: 'PSA Tower Bed B',      type: 'adsorber',   status: 'standby',  last: '2026-04-15', next: '2026-10-15' },
    { code: 'TANK-01',  name: 'Oxygen Receiver Tank', type: 'tank',       status: 'normal',   last: '2026-03-01', next: '2027-03-01' },
    { code: 'DRYER-01', name: 'Air Dryer / Filters',  type: 'dryer',      status: 'normal',   last: '2026-05-10', next: '2026-11-10' },
  ];

  return (
    <div>
      <Head title="Equipment" />
      <h1 style={styles.title}>Equipment Status</h1>
      
      <div style={styles.grid}>
        {list.map(eq => (
          <div key={eq.code} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.name}>{eq.name}</div>
                <div style={styles.code}>{eq.code}</div>
              </div>
              <span style={styles.statusBadge}>
                {eq.status.toUpperCase()}
              </span>
            </div>
            <div style={styles.meta}>
              <div>Last service: <strong style={styles.date}>{eq.last || eq.last_service || '—'}</strong></div>
              <div>Next service: <strong style={styles.highlightDate}>{eq.next || eq.next_service || '—'}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

EquipmentPage.layout = page => <Layout children={page} />;

const styles = {
  title:       { color: '#f8fafc', marginBottom: 20, fontSize: 22, fontWeight: 'bold', fontFamily: 'Montserrat, sans-serif' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card:        { background: '#102a43', borderRadius: 10, padding: 20, border: '1px solid #183350', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontFamily: 'Montserrat, sans-serif' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name:        { fontWeight: 'bold', color: '#f8fafc', fontSize: 15 },
  code:        { color: '#bcccdc', fontSize: 12 },
  statusBadge: { background: '#14532d', color: '#4ade80', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 'bold' },
  meta:        { fontSize: 12, color: '#bcccdc', display: 'flex', flexDirection: 'column', gap: 4 },
  date:        { color: '#cbd5e1' },
  highlightDate: { color: '#159ed5' }, // Kijabe Sky Blue
};