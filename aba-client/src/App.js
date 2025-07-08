import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './components/AdminDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [therapistNav, setTherapistNav] = useState('dashboard');

  // Persistent login: check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          localStorage.removeItem('token');
        } else {
          setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Handler for My Goals (for therapists)
  const handleMyGoals = () => {
    if (user.role === 'therapist') {
      setTherapistNav('mygoals');
    }
  };

  // Modern header
  const header = (
    <div style={{
      width: '100%',
      background: '#fff',
      boxShadow: '0 2px 12px rgba(44,62,80,0.04)',
      padding: '24px 0 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ position: 'absolute', left: 32, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>LOGO</div>
      <div style={{ fontWeight: 800, fontSize: 32, color: '#111827', letterSpacing: 1 }}>ABA Therapy Hub</div>
      <div style={{ position: 'absolute', right: 32, display: 'flex', gap: 12 }}>
        {user.role === 'therapist' && (
          <button className="btn" onClick={handleMyGoals} style={{ background: '#fff', color: '#6366f1', border: '2px solid #6366f1', fontWeight: 700, fontSize: 16, borderRadius: 8, boxShadow: 'none' }}>My Goals</button>
        )}
        <button className="btn" onClick={logout} style={{ background: '#fff', color: '#f43f5e', border: '2px solid #f43f5e', fontWeight: 700, fontSize: 16, borderRadius: 8, boxShadow: 'none' }}>Logout</button>
      </div>
    </div>
  );

  return (
    <div>
      {header}
      {user.role === 'admin' ? (
        <AdminDashboard 
          user={user} 
          message={message} 
          setMessage={setMessage} 
          logout={logout}
        />
      ) : (
        <TherapistDashboard 
          user={user} 
          message={message} 
          setMessage={setMessage} 
          logout={logout}
          nav={therapistNav}
          setNav={setTherapistNav}
        />
      )}
    </div>
  );
}

export default App;
