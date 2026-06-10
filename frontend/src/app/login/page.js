'use client';
import { useState } from 'react';
import useAuth from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const success = await login(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Connection failed. Please check if backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 10,
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '40px',
        borderRadius: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 0 30px rgba(255,255,255,0.02)',
        width: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo and Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'var(--color-accent-subtle)',
            borderRadius: '16px',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid rgba(var(--color-accent), 0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 20px var(--color-glow)',
          }}>
            <Brain size={32} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--color-text-primary) 30%, var(--color-accent-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
            textAlign: 'center'
          }}>
            Brain.exe
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Login to access your cognitive workspace
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--color-danger-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-danger)',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.boxShadow = '0 0 10px var(--color-glow)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.boxShadow = '0 0 10px var(--color-glow)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #a78bfa 100%)',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '12px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.3s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onMouseOver={e => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px var(--color-glow-strong)';
              }
            }}
            onMouseOut={e => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 6px 20px var(--color-accent-glow)';
              }
            }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '28px',
          fontSize: '14px',
          color: 'var(--color-text-secondary)'
        }}>
          Don't have an account?{' '}
          <Link href="/register" style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontWeight: '700',
            transition: 'color 0.2s',
          }}
          onMouseOver={e => e.target.style.color = 'var(--color-accent-hover)'}
          onMouseOut={e => e.target.style.color = 'var(--color-accent)'}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
