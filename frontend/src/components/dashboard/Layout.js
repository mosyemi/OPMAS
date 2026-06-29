/**
 * OPMAS-001 | Layout
 * Sidebar navigation + top bar + content area.
 */
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { getCollectorStatus } from '../../services/api';

const NAV = [
  { path: '/dashboard', label: 'Dashboard',  icon: '📊' },
  { path: '/alarms',    label: 'Alarms',     icon: '🔔' },
  { path: '/equipment', label: 'Equipment',  icon: '⚙️'  },
  { path: '/reports',   label: 'Reports',    icon: '📄' },
];

export default function Layout() {
  const [collectorAlive, setCollectorAlive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      try {
        const status = await getCollectorStatus();
        setCollectorAlive(status.alive);
      } catch {
        setCollectorAlive(false);
      }
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>O₂</div>
          <div>
            <div style={styles.logoTitle}>OPMAS</div>
            <div style={styles.logoSub}>OX-PLANT-01</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {NAV.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
            >
              <span style={styles.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.collectorStatus}>
            <span style={{ ...styles.dot, background: collectorAlive ? '#22c55e' : '#ef4444' }} />
            <span style={styles.collectorLabel}>
              {collectorAlive ? 'Collector Live' : 'Collector Down'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {!collectorAlive && (
          <div style={styles.alert}>
            ⚠ Collector is not responding — displayed data may be stale
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  shell:    { display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Arial, sans-serif' },
  sidebar:  { width: 220, background: '#1b3a6b', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:     { display: 'flex', alignItems: 'center', gap: 10, padding: '24px 16px', borderBottom: '1px solid #2d5099' },
  logoIcon: { background: '#c9a84c', color: '#1b3a6b', fontWeight: 'bold', fontSize: 18, width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoTitle:{ color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoSub:  { color: '#93b4e0', fontSize: 11 },
  nav:      { flex: 1, padding: '16px 0' },
  navLink:  { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', color: '#93b4e0', textDecoration: 'none', fontSize: 14, transition: 'background 0.15s' },
  navLinkActive: { background: '#2d5099', color: '#fff', borderLeft: '3px solid #c9a84c' },
  navIcon:  { fontSize: 16 },
  sidebarFooter: { padding: 16, borderTop: '1px solid #2d5099' },
  collectorStatus: { display: 'flex', alignItems: 'center', gap: 8 },
  dot:      { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  collectorLabel: { color: '#93b4e0', fontSize: 12 },
  main:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  alert:    { background: '#fef3c7', color: '#92400e', padding: '10px 20px', fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #fcd34d' },
};
