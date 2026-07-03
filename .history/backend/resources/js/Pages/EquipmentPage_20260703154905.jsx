/**
 * OPMAS-001 | Equipment Page
 * Shows compressor, beds, and tank status with maintenance schedule.
 */
import React from 'react';

const EQUIPMENT = [
  { code: 'COMP-01',  name: 'Air Compressor',      type: 'compressor', status: 'Running',  last: '2026-05-01', next: '2026-11-01' },
  { code: 'BED-A',    name: 'PSA Tower Bed A',      type: 'adsorber',   status: 'Active',   last: '2026-04-15', next: '2026-10-15' },
  { code: 'BED-B',    name: 'PSA Tower Bed B',      type: 'adsorber',   status: 'Standby',  last: '2026-04-15', next: '2026-10-15' },
  { code: 'TANK-01',  name: 'Oxygen Receiver Tank', type: 'tank',       status: 'Normal',   last: '2026-03-01', next: '2027-03-01' },
  { code: 'DRYER-01', name: 'Air Dryer / Filters',  type: 'dryer',      status: 'Normal',   last: '2026-05-10', next: '2026-11-10' },
];

export default function EquipmentPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#1b3a6b', marginBottom: 20 }}>Equipment Status</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {EQUIPMENT.map(eq => (
          <div key={eq.code} style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#1b3a6b', fontSize: 15 }}>{eq.name}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{eq.code}</div>
              </div>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 'bold' }}>
                {eq.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              <div>Last service: <strong>{eq.last}</strong></div>
              <div>Next service: <strong style={{ color: '#1b3a6b' }}>{eq.next}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
