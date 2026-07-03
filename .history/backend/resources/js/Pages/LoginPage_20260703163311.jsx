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
