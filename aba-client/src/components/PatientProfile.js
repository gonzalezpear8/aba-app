import React from 'react';

function PatientProfile({ patient, goals, onBack, onRunGoal, onOpenAssignGoal, onOpenCreateGoal, onRefreshProfile, setMessage }) {
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

  const handleRemoveGoal = async (goalId) => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/therapist/unassign-goal', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ patient_id: patient.id, goal_id: goalId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Goal removed.');
        onRefreshProfile(); // Refresh goals
      } else {
        setMessage(data.error || 'Error removing goal');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 24, background: '#fff', color: '#222' }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to Patients</button>
      <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        Patient: {patient.name} &nbsp; Age: <span style={{ color: '#f36' }}>{getAge(patient.dob)}</span>
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Assigned Goals:</div>
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
        {goals.length === 0 && <li>No goals assigned yet.</li>}
        {goals.map(g => (
          <li key={g.id}>
            - {g.name} <button style={{ marginLeft: 8 }} onClick={() => onRunGoal(g)}>Run</button>
            <button style={{ marginLeft: 8 }} onClick={() => handleRemoveGoal(g.id)} title="Remove Goal">🗑️</button>
          </li>
        ))}
      </ul>
      <button onClick={onOpenAssignGoal}>[ + Assign New Goal ]</button>
      <button onClick={onOpenCreateGoal} style={{ marginLeft: 8 }}>[ + Create New Goal ]</button>
    </div>
  );
}

export default PatientProfile; 