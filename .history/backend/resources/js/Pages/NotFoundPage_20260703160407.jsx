import React from 'react';
import { Link, Head } from '@inertiajs/react';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: 80, color: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      <Head title="Page Not Found" />
      <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 16, color: '#f87171' }}>404</div>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>The page you are looking for does not exist.</p>
      <Link href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}