import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: 80, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
      <p style={{ color: '#64748b' }}>Page not found</p>
      <Link to="/dashboard" style={{ color: '#1b3a6b' }}>← Back to Dashboard</Link>
    </div>
  );
}
