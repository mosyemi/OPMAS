/**
 * OPMAS-001 | Login Page
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('opmas_token', data.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <div style={styles.logoIcon}>O₂</div>
          <div style={styles.logoTitle}>OPMAS-001</div>
          <div style={styles.logoSub}>Oxygen Plant Monitoring System</div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <input type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)}    style={styles.input} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        <button onClick={handleLogin} disabled={loading} style={styles.btn}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={styles.note}>CONFIDENTIAL — Authorised personnel only</p>
      </div>
    </div>
  );
}

const styles = {
  shell:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: 'Arial, sans-serif' },
  card:      { background: '#fff', borderRadius: 14, padding: '40px 36px', width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  logoBox:   { textAlign: 'center', marginBottom: 32 },
  logoIcon:  { background: '#1b3a6b', color: '#c9a84c', fontWeight: 'bold', fontSize: 24, width: 56, height: 56, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b3a6b' },
  logoSub:   { fontSize: 12, color: '#64748b', marginTop: 4 },
  error:     { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 },
  input:     { display: 'block', width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 12, fontSize: 14, boxSizing: 'border-box' },
  btn:       { display: 'block', width: '100%', padding: '11px', background: '#1b3a6b', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', marginBottom: 16 },
  note:      { textAlign: 'center', fontSize: 11, color: '#94a3b8' },
};
