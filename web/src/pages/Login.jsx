import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const [isDoctor, setIsDoctor] = useState(false); // Toggle between Doctor/Patient login view
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Redirect based on role (Mock logic for now, real app would check DB)
      navigate(isDoctor ? '/doctor' : '/patient');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Sign in to your {isDoctor ? 'Doctor' : 'Patient'} account
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', marginBottom: '2rem' }}>
            <button 
              onClick={() => setIsDoctor(false)}
              style={{ 
                flex: 1, 
                padding: '8px', 
                border: 'none', 
                background: !isDoctor ? 'var(--color-primary)' : 'transparent', 
                color: !isDoctor ? 'white' : 'var(--color-text-muted)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Patient
            </button>
            <button 
              onClick={() => setIsDoctor(true)}
              style={{ 
                flex: 1, 
                padding: '8px', 
                border: 'none', 
                background: isDoctor ? 'var(--color-primary)' : 'transparent', 
                color: isDoctor ? 'white' : 'var(--color-text-muted)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Doctor
            </button>
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--color-glass-border)', 
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="you@example.com"
              />
            </div>
            
            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--color-glass-border)', 
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Don't have an account? <a href="#" style={{ color: 'var(--color-primary)' }}>Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
