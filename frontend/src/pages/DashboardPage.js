/**
 * OPMAS-001 | Dashboard Page
 * Live readings, trend chart, and bed/compressor status.
 */
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getLatestReadings, getSensorHistory } from '../services/api';

const REFRESH_MS = 5000;

export default function DashboardPage() {
  const [latest,  setLatest]  = useState(null);
  const [history, setHistory] = useState([]);
  const [chartKey, setChartKey] = useState('O2_PURITY');
  const [loading, setLoading] = useState(true);

  // Poll latest readings every 5 seconds
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getLatestReadings();
        setLatest(data);
      } catch (e) {
        console.error('Failed to fetch latest readings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
    const t = setInterval(fetchLatest, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  // Fetch chart history when chartKey changes
  useEffect(() => {
    getSensorHistory(chartKey).then(d => setHistory(d?.data || []));
  }, [chartKey]);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  const readings = latest?.readings || [];
  const keyReadings  = ['O2_PURITY', 'PRESSURE', 'FLOW_RATE', 'TANK_LEVEL'];
  const statusReadings = ['COMPRESSOR', 'BED_A_STATUS', 'BED_B_STATUS'];

  const find = (key) => readings.find(r => r.key === key);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Live Dashboard</h1>
      <p style={styles.ts}>Last updated: {latest?.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : '—'}</p>

      {/* Key Gauges */}
      <div style={styles.gaugeGrid}>
        {keyReadings.map(key => {
          const r = find(key);
          if (!r) return null;
          return (
            <div key={key} style={styles.gaugeCard} onClick={() => setChartKey(key)}>
              <div style={styles.gaugeLabel}>{r.label}</div>
              <div style={styles.gaugeValue}>
                {r.value !== null ? r.value : '—'}
                <span style={styles.gaugeUnit}>{r.unit}</span>
              </div>
              <div style={{ ...styles.gaugeBadge, background: r.status === 'normal' ? '#dcfce7' : '#fee2e2', color: r.status === 'normal' ? '#166534' : '#991b1b' }}>
                {r.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status indicators */}
      <div style={styles.statusRow}>
        {statusReadings.map(key => {
          const r = find(key);
          if (!r) return null;
          const on = r.value === 1;
          const fault = r.value === 2;
          const color = fault ? '#ef4444' : on ? '#22c55e' : '#94a3b8';
          return (
            <div key={key} style={styles.statusCard}>
              <span style={{ ...styles.statusDot, background: color }} />
              <div>
                <div style={styles.statusLabel}>{r.label}</div>
                <div style={{ ...styles.statusValue, color }}>
                  {key === 'COMPRESSOR'
                    ? ['OFF', 'RUNNING', 'FAULT'][r.value] || '?'
                    : on ? 'ACTIVE' : 'IDLE'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h2 style={styles.chartTitle}>Trend — {find(chartKey)?.label}</h2>
          <div style={styles.chartTabs}>
            {keyReadings.map(k => (
              <button key={k} onClick={() => setChartKey(k)}
                style={{ ...styles.tab, ...(k === chartKey ? styles.tabActive : {}) }}>
                {find(k)?.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={history.slice(-144)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="ts" tickFormatter={v => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip labelFormatter={v => new Date(v).toLocaleString()} formatter={v => [v, find(chartKey)?.label]} />
            {chartKey === 'O2_PURITY' && <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Warning 90%', fontSize: 10 }} />}
            {chartKey === 'O2_PURITY' && <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical 85%', fontSize: 10 }} />}
            <Line type="monotone" dataKey="value" stroke="#1b3a6b" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  page:        { padding: 24 },
  title:       { margin: '0 0 4px', color: '#1b3a6b', fontSize: 22 },
  ts:          { margin: '0 0 20px', color: '#64748b', fontSize: 12 },
  loading:     { padding: 40, textAlign: 'center', color: '#64748b' },
  gaugeGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 20 },
  gaugeCard:   { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', border: '1px solid #e2e8f0' },
  gaugeLabel:  { fontSize: 12, color: '#64748b', marginBottom: 8 },
  gaugeValue:  { fontSize: 32, fontWeight: 'bold', color: '#1b3a6b', lineHeight: 1 },
  gaugeUnit:   { fontSize: 14, fontWeight: 'normal', marginLeft: 4, color: '#94a3b8' },
  gaugeBadge:  { display: 'inline-block', marginTop: 8, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 'bold' },
  statusRow:   { display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  statusCard:  { background: '#fff', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  statusDot:   { width: 14, height: 14, borderRadius: '50%', flexShrink: 0 },
  statusLabel: { fontSize: 12, color: '#64748b' },
  statusValue: { fontWeight: 'bold', fontSize: 14 },
  chartCard:   { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  chartTitle:  { margin: 0, color: '#1b3a6b', fontSize: 15 },
  chartTabs:   { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab:         { padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 12, color: '#64748b' },
  tabActive:   { background: '#1b3a6b', color: '#fff', border: '1px solid #1b3a6b' },
};
