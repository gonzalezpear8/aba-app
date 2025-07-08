import React, { useState } from 'react';
import Login from './Login';
import AdminDashboard from './components/AdminDashboard';
import TherapistDashboard from './components/TherapistDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div>
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
        />
      )}
    </div>
  );
}

export default App;
