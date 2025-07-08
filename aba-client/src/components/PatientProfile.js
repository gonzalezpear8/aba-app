import React, { useState } from 'react';
import SessionRunnerModal from './SessionRunnerModal';
import SessionHistory from './SessionHistory';
import logo from '../logo.svg';

function PatientProfile(props) {
  console.log('PatientProfile props:', props);
  const [showSessionRunner, setShowSessionRunner] = useState(false);
  const [showSessionHistory, setShowSessionHistory] = useState(false);

  // Helper to calculate age from dob (YYYY-MM-DD)
  function getAge(dob) {
    if (!dob) return '?';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Helper to get avatar based on gender
  function getAvatar(gender) {
    if (gender === 'male') {
      return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f468.png'; // male emoji
    } else {
      return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f469.png'; // female emoji
    }
  }

  // Fallbacks for navigation
  const handleMyGoals = props.onMyGoals || (() => alert('My Goals not implemented'));
  const handleLogout = props.onLogout || props.onBack;

  const handleRemoveGoal = async (goalId) => {
    props.setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/therapist/unassign-goal', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ patient_id: props.patient.id, goal_id: goalId })
      });
      const data = await res.json();
      if (res.ok) {
        props.setMessage('Goal removed.');
        props.onRefreshProfile(); // Refresh goals
      } else {
        props.setMessage(data.error || 'Error removing goal');
      }
    } catch (err) {
      props.setMessage('Network error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 600, margin: '32px auto 0 auto', color: '#6366f1', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, cursor: 'pointer' }} onClick={props.onBack}>←</span>
        <span style={{ cursor: 'pointer' }} onClick={props.onBack}>Back to Patients</span>
      </div>
      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 28, boxShadow: '0 8px 40px rgba(99,102,241,0.13)', padding: '3rem 2.5rem 2.5rem 2.5rem', margin: '32px auto 0 auto', maxWidth: 600, minHeight: 340, border: '2.5px solid #e0e7ff', position: 'relative' }}>
        <img src={logo} alt="Logo" style={{ width: 44, height: 44, position: 'absolute', top: -28, left: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(99,102,241,0.10)' }} />
        {/* Patient Header */}
        <div style={{ fontSize: 26, fontWeight: 900, color: '#18181b', marginBottom: 18, letterSpacing: 1 }}>Patient Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 18 }}>
          <img src={getAvatar(props.patient.gender)} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', background: '#f3f4f6', border: '3px solid #6366f1', boxShadow: '0 2px 12px rgba(99,102,241,0.10)' }} />
          <div style={{ fontSize: 32, fontWeight: 900, color: '#6366f1', letterSpacing: 1, textShadow: '0 2px 8px #e0e7ff' }}>{props.patient.name}</div>
          <div style={{ fontSize: 22, color: '#374151', fontWeight: 700, marginLeft: 12, background: '#e0e7ff', borderRadius: 8, padding: '4px 16px' }}>Age: {getAge(props.patient.dob)}</div>
        </div>
        {/* Goals */}
        <div style={{ fontSize: 19, color: '#18181b', fontWeight: 800, marginBottom: 8 }}>Assigned Goals:</div>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 18, marginLeft: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {props.goals.length === 0 && <li style={{ color: '#6b7280', fontWeight: 500, fontSize: 16 }}>No goals assigned yet.</li>}
          {props.goals.map(g => (
            <li key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f3f4f6', borderRadius: 8, padding: '8px 14px', boxShadow: '0 1px 4px rgba(99,102,241,0.06)' }}>
              <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 16 }}>{g.name}</span>
              <button className="btn" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '0.4em 1.1em', borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', transition: 'transform 0.1s, background 0.2s', cursor: 'pointer' }} onClick={() => props.onRunGoal(g)} title="Run Goal"
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
              >Run</button>
              <button className="btn" style={{ background: '#fff', color: '#f43f5e', fontWeight: 700, fontSize: 15, padding: '0.4em 1.1em', border: '1.5px solid #f43f5e', borderRadius: 8, transition: 'transform 0.1s, background 0.2s', cursor: 'pointer' }} onClick={() => handleRemoveGoal(g.id)} title="Remove Goal"
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseOver={e => e.currentTarget.style.background = '#ffe4e6'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >Remove</button>
            </li>
          ))}
        </ul>
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <button
            className="btn"
            onClick={() => { console.log('Assign New Goal button clicked'); props.onOpenAssignGoal(); }}
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              borderRadius: 10,
              flex: 1,
              boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
              border: 'none',
              transition: 'transform 0.1s, background 0.2s',
              cursor: 'pointer'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)'}
          >
            + Assign New Goal
          </button>
          <button
            className="btn"
            onClick={props.onOpenCreateGoal}
            style={{
              background: '#fff',
              color: '#374151',
              border: '2px solid #d1d5db',
              fontWeight: 700,
              fontSize: 17,
              borderRadius: 10,
              flex: 1,
              boxShadow: 'none',
              transition: 'transform 0.1s, background 0.2s',
              cursor: 'pointer'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            ✏️ Create Custom Goal
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn" onClick={() => setShowSessionRunner(true)} style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', borderRadius: 10, flex: 1, boxShadow: '0 2px 8px rgba(251,191,36,0.10)', transition: 'transform 0.1s, background 0.2s', cursor: 'pointer' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)'}
          >🚀 Run Batch Session</button>
          <button className="btn" onClick={() => setShowSessionHistory(true)} style={{ background: '#fff', color: '#374151', border: '2px solid #d1d5db', fontWeight: 700, fontSize: 17, borderRadius: 10, flex: 1, boxShadow: 'none', transition: 'transform 0.1s, background 0.2s', cursor: 'pointer' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >📜 View Session History</button>
        </div>
        {showSessionRunner && (
          <SessionRunnerModal
            patient={props.patient}
            goals={props.goals}
            onClose={() => setShowSessionRunner(false)}
            onSessionComplete={props.onRefreshProfile}
            setMessage={props.setMessage}
          />
        )}
        {showSessionHistory && (
          <SessionHistory
            patient={props.patient}
            onClose={() => setShowSessionHistory(false)}
          />
        )}
      </div>
    </div>
  );
}

export default PatientProfile; 