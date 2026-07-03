import React from 'react';
import { Link, Head } from '@inertiajs/react';

export default function NotFoundPage() {
  return (
  <div style={{ textAlign: 'center', padding: 80, color: '#102a43', fontFamily: 'Montserrat, sans-serif' }}>
    <Head title="Page Not Found" />
    <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 16, color: '#ef4444' }}>404</div>
    <p style={{ color: '#486581', marginBottom: 24 }}>The page you are looking for does not exist.</p>
    <Link href="/dashboard" style={{ color: '#159ed5', textDecoration: 'none', fontWeight: 'bold' }}>
      ← Back to Dashboard
    </Link>
  </div>
);
}