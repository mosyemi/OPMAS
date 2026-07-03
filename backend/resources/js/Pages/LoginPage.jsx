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
  shell:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: 'Montserrat, sans-serif' }, // Soft slate background
  card:      { background: '#ffffff', borderRadius: 14, padding: '40px 36px', width: 360, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }, // White card
  logoBox:   { textAlign: 'center', marginBottom: 32 },
  logoIcon:  { background: '#159ed5', color: '#ffffff', fontWeight: 'bold', fontSize: 24, width: 56, height: 56, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoTitle: { fontSize: 20, fontWeight: 'bold', color: '#102a43' }, // Kijabe Navy text
  logoSub:   { fontSize: 12, color: '#486581', marginTop: 4 },
  error:     { background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16, border: '1px solid #fee2e2' },
  input:     { display: 'block', width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #bcccdc', background: '#ffffff', color: '#102a43', marginBottom: 12, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Montserrat, sans-serif' },
  btn:       { display: 'block', width: '100%', padding: '11px', background: '#159ed5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', marginBottom: 16, transition: 'background 0.2s', fontFamily: 'Montserrat, sans-serif' },
  note:      { textAlign: 'center', fontSize: 11, color: '#627d98' },
};