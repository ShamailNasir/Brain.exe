'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('quantum_token');
    const isAuthRoute = pathname === '/login' || pathname === '/register';

    if (!token) {
      if (!isAuthRoute) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    } else {
      if (isAuthRoute) {
        router.push('/');
      } else {
        setLoading(false);
      }
    }
  }, [pathname, router]);

  if (!mounted || loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0b1326',
        color: '#dae2fd',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(139, 92, 246, 0.15)',
          borderTop: '4px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <p style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontWeight: '600',
          color: '#94a3b8'
        }}>
          Loading Cognitive Matrix...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
