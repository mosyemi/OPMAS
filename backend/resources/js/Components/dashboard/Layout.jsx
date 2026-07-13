/**
 * OPMAS-001 | Layout (Inertia.js Version)
 * Sidebar navigation + top bar + content area.
 */
import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

const NAV = [
  { path: '/dashboard', label: 'Dashboard',  icon: '📊' },
  { path: '/alarms',    label: 'Alarms',     icon: '🔔' },
  { path: '/equipment', label: 'Equipment',  icon: '⚙️'  },
  { path: '/reports',   label: 'Reports',    icon: '📄' },
];

export default function Layout({ children }) {
  const [collectorAlive, setCollectorAlive] = useState(true);
  const { url } = usePage(); // Gets the current URL path

  useEffect(() => {
    const check = async () => {
      try {
        // Simple fetch request to the Laravel API endpoint
        const res = await fetch('/api/collector/heartbeat');
        const status = await res.json();
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
          {NAV.map(({ path, label, icon }) => {
            const isActive = url.startsWith(path);
            return (
              <Link
                key={path}
                href={path}
                style={{ 
                  ...styles.navLink, 
                  ...(isActive ? styles.navLinkActive : {}) 
                }}
              >
                <span style={styles.navIcon}>{icon}</span>
                {label}
              </Link>
            );
          })}
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

      {/* Main Content Area */}
      <main style={styles.main}>
        {/* Top bar with right-aligned Sign Out button */}
        <div style={styles.topbar}>
          <div />
          <div>
            <Link href="/logout" method="post" as="button" style={styles.topbarLogout}>
              Sign Out 🚪
            </Link>
          </div>
        </div>
        {!collectorAlive && (
          <div style={styles.alert}>
            ⚠ Collector is not responding — displayed data may be stale
          </div>
        )}
        
        {/* Render the current page here */}
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell:    { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Montserrat, sans-serif' }, // Light gray page background
  sidebar:  { width: 220, background: '#102a43', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #183350' }, // High-contrast dark sidebar
  logo:     { display: 'flex', alignItems: 'center', gap: 10, padding: '24px 16px', borderBottom: '1px solid #183350' },
  logoIcon: { background: '#159ed5', color: '#ffffff', fontWeight: 'bold', fontSize: 18, width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoTitle:{ color: '#f8fafc', fontWeight: 'bold', fontSize: 16 },
  logoSub:  { color: '#bcccdc', fontSize: 11 },
  nav:      { flex: 1, padding: '16px 0' },
  navLink:  { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', color: '#bcccdc', textDecoration: 'none', fontSize: 14, transition: 'background 0.15s' },
  navLinkActive: { background: '#0c1a30', color: '#159ed5', borderLeft: '3px solid #159ed5' },
  navIcon:  { fontSize: 16 },
  sidebarFooter: { padding: 16, borderTop: '1px solid #183350' },
  collectorStatus: { display: 'flex', alignItems: 'center', gap: 8 },
  dot:      { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  collectorLabel: { color: '#bcccdc', fontSize: 12 },
  logoutBtn: { 
    display: 'block', 
    width: '100%', 
    textAlign: 'left', 
    background: 'none', 
    border: 'none', 
    color: '#bcccdc', 
    padding: '8px 4px', 
    fontSize: 13, 
    cursor: 'pointer', 
    marginTop: 12, 
    transition: 'color 0.15s',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '500'
  },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(16,42,67,0.06)', background: '#ffffff', boxShadow: '0 1px 0 rgba(16,42,67,0.02)' },
  topbarLogout: { background: 'transparent', border: '1px solid #e6eef6', color: '#0b3b56', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  main:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', background: '#f8fafc' }, // Light body background
  content:  { padding: 24, flex: 1 },
  alert:    { background: '#fef3c7', color: '#92400e', padding: '10px 20px', fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #fcd34d' },
};