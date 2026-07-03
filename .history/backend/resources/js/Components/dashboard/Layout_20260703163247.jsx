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

