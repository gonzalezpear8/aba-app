import React, { useState, useEffect } from 'react';
import GoalBank from './GoalBank';
import PatientProfile from './PatientProfile';
import GoalRunner from './GoalRunner';
import CreateGoalModal from './CreateGoalModal';
import AssignGoalModal from './AssignGoalModal';

function TherapistDashboard({ user, message, setMessage, logout }) {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewingGoals, setViewingGoals] = useState([]);
  const [nav, setNav] = useState('dashboard');
  const [runningGoal, setRunningGoal] = useState(null);
  const [goalImages, setGoalImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [goalFeedback, setGoalFeedback] = useState('');

  // Goal creation modal state
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalImages, setNewGoalImages] = useState([
    { url: '', label: '', isCorrect: false },
    { url: '', label: '', isCorrect: false }
  ]);

  // Assign goal modal state
  const [showAssignGoal, setShowAssignGoal] = useState(false);
  const [availableGoals, setAvailableGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');

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
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
          {'<Logo>'} ABA App {'<Name>'}
        </div>
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <button onClick={showMyGoals}>My Goals</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      {message && <div style={{ color: message.startsWith('Error') ? 'red' : 'green', marginBottom: 16 }}>{message}</div>}
      
      {/* Main Content */}
      {nav === 'dashboard' && !viewingPatient && (
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 24, background: '#222', color: '#fff' }}>
          <div style={{ fontSize: 22, marginBottom: 16 }}>👋 Welcome, <span style={{ color: '#f36' }}>{user.username}</span>!</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Patients Assigned to You:</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {assignedPatients.map(p => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                {p.name} <button style={{ marginLeft: 16 }} onClick={() => handleViewProfile(p.id)}>[View Profile]</button>
              </li>
            ))}
            {assignedPatients.length === 0 && <li>No patients assigned yet.</li>}
          </ul>
        </div>
      )}

      {nav === 'dashboard' && viewingPatient && (
        <PatientProfile
          patient={viewingPatient}
          goals={viewingGoals}
          onBack={handleBackToList}
          onRunGoal={handleRunGoal}
          onOpenAssignGoal={() => setShowAssignGoal(true)}
          onOpenCreateGoal={() => setShowCreateGoal(true)}
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
      {showCreateGoal && (
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

      {showAssignGoal && (
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