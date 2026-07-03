/**
 * OPMAS-001 | Alarms Page (Inertia.js Version)
 * Lists active and resolved alarms. Operators can resolve active alarms.
 */
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/dashboard/Layout';

const SEVERITY_STYLE = {
  CRITICAL: { bg: '#7f1d1d', color: '#f87171', border: '#b91c1c' },
  WARNING:  { bg: '#78350f', color: '#fbbf24', border: '#b45309' },
  INFO:     { bg: '#1e3a8a', color: '#60a5fa', border: '#1d4ed8' },
};

export default function AlarmsPage({ initialAlarms }) {
  const [alarms, setAlarms] = useState(initialAlarms || []);
  const [filter, setFilter] = useState('active'); // active | all

  const load = async () => {
    try {
      const res = await fetch('/api/alarms');
      const data = await res.json();
      setAlarms(data.alarms || []);
    } catch (e) {
      console.error('Failed to load alarms:', e);
    }
  };

  // Poll for alarms every 15 seconds
  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);

  const handleResolve = async (id) => {
    try {
      await fetch(`/api/alarms/${id}/resolve`, { method: 'POST' });
      load();
    } catch (e) {
      console.error('Failed to resolve alarm:', e);
    }
  };

  const visible = filter === 'active'
    ? alarms.filter(a => !a.resolved_at)
    : alarms;

  const activeCount = alarms.filter(a => !a.resolved_at).length;

  return (
    <div style={styles.page}>
      <Head title="Alarms" />

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Alarms</h1>
          {activeCount > 0 && <p style={styles.activeCount}>{activeCount} active alarm{activeCount > 1 ? 's' : ''}</p>}
        </div>
        <div style={styles.tabs}>
          {['active', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.tab, ...(f === filter ? styles.tabActive : {}) }}>
              {f === 'active' ? 'Active' : 'All History'}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <div style={styles.empty}>
          {filter === 'active' ? '✅ No active alarms. System running normally.' : 'No alarms recorded'}
        </div>
      )}

      <div style={styles.list}>
        {visible.map(alarm => {
          const s = SEVERITY_STYLE[alarm.severity] || SEVERITY_STYLE.INFO;
          const resolved = !!alarm.resolved_at;
          return (
            <div key={alarm.id} style={{ ...styles.card, background: s.bg, borderColor: s.border, opacity: resolved ? 0.6 : 1 }}>
              <div style={styles.cardLeft}>
                <div style={styles.cardTop}>
                  <span style={{ ...styles.badge, color: s.color }}>{alarm.severity}</span>
                  <span style={styles.type}>{alarm.type.replace(/_/g, ' ')}</span>
                  {resolved && <span style={styles.resolvedBadge}>RESOLVED</span>}
                </div>
                <p style={styles.message}>{alarm.message}</p>
                <div style={styles.timestamps}>
                  <span>Triggered: {new Date(alarm.triggered_at).toLocaleString()}</span>
                  {alarm.resolved_at && <span> · Resolved: {new Date(alarm.resolved_at).toLocaleString()}</span>}
                </div>
              </div>
              {!resolved && (
                <button style={styles.resolveBtn} onClick={() => handleResolve(alarm.id)}>
                  Resolve
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

AlarmsPage.layout = page => <Layout children={page} />;

const styles = {
  page:          { color: '#f8fafc' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:         { margin: 0, color: '#f8fafc', fontSize: 22, fontWeight: 'bold' },
  activeCount:   { margin: '4px 0 0', color: '#f87171', fontSize: 13, fontWeight: 'bold' },
  tabs:          { display: 'flex', gap: 8 },
  tab:           { padding: '6px 16px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', cursor: 'pointer', fontSize: 13, color: '#94a3b8' },
  tabActive:     { background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6' },
  empty:         { textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 15 },
  list:          { display: 'flex', flexDirection: 'column', gap: 12 },
  card:          { border: '1px solid', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  cardLeft:      { flex: 1 },
  cardTop:       { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  badge:         { fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  type:          { fontWeight: 'bold', color: '#f8fafc', fontSize: 14 },
  resolvedBadge: { background: '#14532d', color: '#4ade80', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 'bold' },
  message:       { margin: '0 0 6px', color: '#cbd5e1', fontSize: 13 },
  timestamps:    { color: '#94a3b8', fontSize: 11 },
  resolveBtn:    { padding: '6px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap' },
};