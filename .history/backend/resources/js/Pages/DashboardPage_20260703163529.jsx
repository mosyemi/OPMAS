/**
 * OPMAS-001 | Dashboard Page (Inertia.js Version)
 * Live readings, trend chart, and bed/compressor status.
 */
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/dashboard/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const REFRESH_MS = 5000;

export default function DashboardPage({ initialLatest, initialHistory }) {
  // Use initial props from Laravel as the starting state
  const [latest, setLatest] = useState(initialLatest);
  const [history, setHistory] = useState(initialHistory || []);
  const [chartKey, setChartKey] = useState('O2_PURITY');

  // 1. Telemetry Polling: fetch fresh readings every 5 seconds
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/sensors/latest');
        const data = await res.json();
        setLatest(data);
      } catch (e) {
        console.error('Failed to poll latest readings:', e);
      }
    };

    const t = setInterval(fetchLatest, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  // 2. Fetch history when the active chart register changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/sensors/history?register=${chartKey}`);
        const data = await res.json();
        setHistory(data.data || []);
      } catch (e) {
        console.error('Failed to fetch history:', e);
      }
    };
    fetchHistory();
  }, [chartKey]);

  const readings = latest?.readings || [];
  const keyReadings  = ['O2_PURITY', 'PRESSURE', 'FLOW_RATE', 'TANK_LEVEL'];
  const statusReadings = ['COMPRESSOR', 'BED_A_STATUS', 'BED_B_STATUS'];

  const find = (key) => readings.find(r => r.key === key);

  return (
    <div style={styles.page}>
      <Head title="Live Dashboard" />

      <h1 style={styles.title}>Live Telemetry</h1>
      <p style={styles.ts}>
        Last updated: {latest?.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : '—'}
      </p>

      {/* Key Gauges Grid */}
      <div style={styles.gaugeGrid}>
        {keyReadings.map(key => {
          const r = find(key);
          if (!r) return null;
          return (
            <div key={key} style={{ ...styles.gaugeCard, ...(key === chartKey ? styles.gaugeCardActive : {}) }} onClick={() => setChartKey(key)}>
              <div style={styles.gaugeLabel}>{r.label}</div>
              <div style={styles.gaugeValue}>
                {r.value !== null ? r.value : '—'}
                <span style={styles.gaugeUnit}>{r.unit}</span>
              </div>
              <div style={{ 
                ...styles.gaugeBadge, 
                background: r.status === 'normal' ? '#14532d' : '#7f1d1d', 
                color: r.status === 'normal' ? '#4ade80' : '#fca5a5' 
              }}>
                {r.status.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hardware Status Row */}
      <div style={styles.statusRow}>
        {statusReadings.map(key => {
          const r = find(key);
          if (!r) return null;
          const on = r.value === 1;
          const fault = r.value === 2;
          const color = fault ? '#f87171' : on ? '#4ade80' : '#64748b';
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

      {/* Trend Chart Card */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h2 style={styles.chartTitle}>Trend History — {find(chartKey)?.label}</h2>
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
          <LineChart data={history.slice(-144)} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /> {/* Light grid lines */}
            <XAxis 
              dataKey="ts" 
              tickFormatter={v => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
              tick={{ fontSize: 11, fill: '#486581' }} 
            />
            <YAxis tick={{ fontSize: 11, fill: '#486581' }} />
            <Tooltip 
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#102a43' }}
              labelFormatter={v => new Date(v).toLocaleString()} 
              formatter={v => [v, find(chartKey)?.label]} 
            />
            {chartKey === 'O2_PURITY' && <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Warning 90%', fill: '#f59e0b', fontSize: 10 }} />}
            {chartKey === 'O2_PURITY' && <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical 85%', fill: '#ef4444', fontSize: 10 }} />}
            <Line type="monotone" dataKey="value" stroke="#159ed5" dot={false} strokeWidth={2.5} /> {/* Kijabe Sky Blue Line */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Attach persistent layout
DashboardPage.layout = page => <Layout children={page} />;

