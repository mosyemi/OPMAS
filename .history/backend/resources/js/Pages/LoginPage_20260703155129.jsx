/**
 * OPMAS-001 | Login Page (Inertia.js Version)
 */
import React from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function LoginPage() {
  // 1. Initialize the Inertia form helper
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  });

  // 2. Submit the form to Laravel's web login route
  const handleLogin = (e) => {
    e?.preventDefault();
    post('/login');
  };

  return (
    <div style={styles.shell}>
      {/* 3. Manage the document <head> using Inertia */}
      <Head title="Sign In" />
      
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <div style={styles.logoIcon}>O₂</div>
          <div style={styles.logoTitle}>OPMAS-001</div>
          <div style={styles.logoSub}>Oxygen Plant Monitoring System</div>
        </div>

        {/* 4. Display any errors returned from the Laravel validation */}
        {errors.email && <div style={styles.error}>{errors.email}</div>}
        {errors.password && <div style={styles.error}>{errors.password}</div>}

        <input 
          type="email"    
          placeholder="Email"    
          value={data.email}    
          onChange={e => setData('email', e.target.value)}    
          style={styles.input} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={data.password} 
          onChange={e => setData('password', e.target.value)} 
          style={styles.input} 
          onKeyDown={e => e.key === 'Enter' && handleLogin(e)} 
        />

        <button onClick={handleLogin} disabled={processing} style={styles.btn}>
          {processing ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={styles.note}>CONFIDENTIAL — Authorised personnel only</p>
      </div>
    </div>
  );
}

const styles = {
  shell:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'Arial, sans-serif' }, // Dark slate theme
  card:      { background: '#1e293b', borderRadius: 14, padding: '40px 36px', width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', border: '1px solid #334155' },
  logoBox:   { textAlign: 'center', marginBottom: 32 },
  logoIcon:  { background: '#1e3a8a', color: '#fbbf24', fontWeight: 'bold', fontSize: 24, width: 56, height: 56, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoTitle: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc' },
  logoSub:   { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  error:     { background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16, border: '1px solid #fee2e2' },
  input:     { display: 'block', width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', marginBottom: 12, fontSize: 14, boxSizing: 'border-box' },
  btn:       { display: 'block', width: '100%', padding: '11px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', marginBottom: 16 },
  note:      { textAlign: 'center', fontSize: 11, color: '#64748b' },
};