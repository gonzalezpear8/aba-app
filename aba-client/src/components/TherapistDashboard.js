import React, { useState, useEffect } from 'react';
import GoalBank from './GoalBank';
import PatientProfile from './PatientProfile';
import GoalRunner from './GoalRunner';
import CreateGoalModal from './CreateGoalModal';
import AssignGoalModal from './AssignGoalModal';
import logo from '../logo.svg';

function TherapistDashboard({ user, message, setMessage, logout, nav, setNav }) {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [runningGoal, setRunningGoal] = useState(null);
  const [goalImages, setGoalImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [goalFeedback, setGoalFeedback] = useState('');

  // Goal creation modal state
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  // Assign goal modal state
  const [showAssignGoal, setShowAssignGoal] = useState(false);
  const [availableGoals, setAvailableGoals] = useState([]);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewingGoals, setViewingGoals] = useState([]);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/therapist/patients', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        setAssignedPatients(data.patients || []);
      } catch (err) {
        setMessage('Error fetching assigned patients');
      }
    };
    fetchAssigned();
  }, [setMessage]);

  useEffect(() => {
    if (showAssignGoal) {
      const fetchGoals = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/therapist/goals', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const data = await res.json();
          setAvailableGoals(data.goals || []);
        } catch (err) {
          setAvailableGoals([]);
        }
      };
      fetchGoals();
    }
  }, [showAssignGoal]);

  const handleViewProfile = async (patientId) => {
    setMessage('');
    setViewingPatient(null);
    setViewingGoals([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/therapist/patient/${patientId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) {
        setViewingPatient(data.patient);
        setViewingGoals(data.goals || []);
      } else {
        setMessage(data.error || 'Error loading profile');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleBackToList = () => {
    setViewingPatient(null);
    setViewingGoals([]);
  };

  const handleRunGoal = async (goal) => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/therapist/goal/${goal.id}/images`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) {
        setRunningGoal(goal);
        setGoalImages(data.images || []);
        setSelectedImageId(null);
        setGoalFeedback('');
      } else {
        setMessage(data.error || 'Error loading goal images');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleExitGoalRunner = () => {
    setRunningGoal(null);
    setGoalImages([]);
    setSelectedImageId(null);
    setGoalFeedback('');
  };

  const handleSelectImage = (img) => {
    setSelectedImageId(img.id);
    const isCorrect = img.is_correct;
    setGoalFeedback(isCorrect ? 'Correct! 🎉' : 'Incorrect. Try again!');
    setTimeout(() => {
      setGoalFeedback('');
      setSelectedImageId(null);
    }, 2000);
  };

  const showMyGoals = () => {
    if (nav === 'mygoals') {
      setNav('dashboard');
    } else {
      setNav('mygoals');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'sans-serif' }}>
      {console.log('showAssignGoal:', showAssignGoal, 'showCreateGoal:', showCreateGoal)}
      {message && <div style={{ color: message.startsWith('Error') ? 'red' : 'green', marginBottom: 16 }}>{message}</div>}
      
      {/* Main Content */}
      {nav === 'dashboard' && !viewingPatient && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
          <div style={{ background: '#18181b', borderRadius: 20, boxShadow: '0 4px 32px rgba(99,102,241,0.13)', padding: '40px 36px', minWidth: 340, maxWidth: 700, width: '100%', color: '#fff', border: '1.5px solid #27272a', marginBottom: 24 }}>
            <img src={logo} alt="Logo" style={{ width: 48, height: 48, marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 18, letterSpacing: 1, color: '#a5b4fc' }}>👋 Welcome, <span style={{ color: '#f472b6' }}>{user.username}</span>!</div>
            <div style={{ fontWeight: 700, marginBottom: 18, fontSize: 20, color: '#fff' }}>Patients Assigned to You:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {assignedPatients.map(p => (
                <div key={p.id} style={{
                  background: '#232336',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
                  padding: '14px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  border: '1.5px solid #27272a',
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#fff',
                  transition: 'box-shadow 0.2s, border 0.2s',
                }}
                >
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <button
                    className="btn"
                    style={{
                      marginLeft: 8,
                      padding: '8px 18px',
                      background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 16,
                      boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s, background 0.2s',
                    }}
                    onClick={() => handleViewProfile(p.id)}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
                    onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
                  >
                    View Profile
                  </button>
                </div>
              ))}
              {assignedPatients.length === 0 && <div style={{ color: '#a1a1aa', fontStyle: 'italic' }}>No patients assigned yet.</div>}
            </div>
          </div>
        </div>
      )}

      {nav === 'dashboard' && viewingPatient && (
        <PatientProfile
          patient={viewingPatient}
          goals={viewingGoals}
          onBack={() => setViewingPatient(null)}
          onRunGoal={() => {}}
          onOpenAssignGoal={() => { console.log('Assign Goal Clicked'); setShowAssignGoal(true); }}
          onOpenCreateGoal={() => { console.log('Create Custom Goal Clicked'); setShowCreateGoal(true); }}
          onRefreshProfile={() => handleViewProfile(viewingPatient.id)}
          setMessage={setMessage}
        />
      )}

      {nav === 'mygoals' && (
        <GoalBank
          user={user}
          message={message}
          setMessage={setMessage}
          onBack={() => setNav('dashboard')}
        />
      )}

      {/* Modals */}
      {showCreateGoal && (console.log('Rendering CreateGoalModal'),
        <CreateGoalModal
          onClose={() => setShowCreateGoal(false)}
          setMessage={setMessage}
          onGoalCreated={() => {
            setShowCreateGoal(false);
            if (viewingPatient) {
              handleViewProfile(viewingPatient.id);
            }
          }}
        />
      )}

      {showAssignGoal && (console.log('Rendering AssignGoalModal'),
        <AssignGoalModal
          patient={viewingPatient}
          availableGoals={availableGoals}
          onClose={() => setShowAssignGoal(false)}
          setMessage={setMessage}
          onGoalAssigned={() => {
            setShowAssignGoal(false);
            handleViewProfile(viewingPatient.id);
          }}
        />
      )}

      {/* Goal Runner */}
      {runningGoal && (
        <GoalRunner
          goal={runningGoal}
          images={goalImages}
          selectedImageId={selectedImageId}
          feedback={goalFeedback}
          onSelectImage={handleSelectImage}
          onExit={handleExitGoalRunner}
        />
      )}
    </div>
  );
}

export default TherapistDashboard; 