/**
 * OPMAS-001 | Alarms Page (Inertia.js Version)
 * Lists active and resolved alarms. Operators can resolve active alarms.
 */
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/dashboard/Layout';

const SEVERITY_STYLE = {
  CRITICAL: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  WARNING:  { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  INFO:     { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
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

