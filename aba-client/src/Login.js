import React, { useState } from 'react';
import logo from './logo.svg';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.user); // Pass user info up
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 32px rgba(99,102,241,0.10)', padding: '48px 36px', minWidth: 350, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <img src={logo} alt="ABA Therapy Hub Logo" style={{ width: 64, height: 64, marginBottom: 12 }} />
        <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 24, letterSpacing: 1, color: '#6366f1', fontFamily: 'inherit' }}>ABA Therapy Hub</div>
        <h2 style={{ fontWeight: 700, marginBottom: 24, color: '#22223b' }}>Login</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: 16, fontWeight: 600 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              marginBottom: 16,
              borderRadius: 12,
              border: '1.5px solid #c7d2fe',
              fontSize: 18,
              outline: 'none',
              transition: 'border 0.2s',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              marginBottom: 24,
              borderRadius: 12,
              border: '1.5px solid #c7d2fe',
              fontSize: 18,
              outline: 'none',
              transition: 'border 0.2s',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 0',
              background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
              cursor: 'pointer',
              transition: 'transform 0.1s, background 0.2s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
