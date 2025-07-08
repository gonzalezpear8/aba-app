import React, { useState } from 'react';

function AssignGoalModal({ patient, availableGoals, onClose, setMessage, onGoalAssigned }) {
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const handleAssignGoal = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!selectedGoalId) {
      setMessage('Please select a goal.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/therapist/assign-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          patient_id: patient.id,
          goal_id: selectedGoalId,
          image_ids: [] // Placeholder for now
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Goal assigned!');
        onGoalAssigned();
      } else {
        setMessage(data.error || 'Error assigning goal');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      background: 'rgba(0,0,0,0.5)', 
      zIndex: 1000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        background: '#fff', 
        padding: 24, 
        borderRadius: 8, 
        maxWidth: 500, 
        maxHeight: '80vh', 
        overflow: 'auto' 
      }}>
        <h3>Assign Goal to {patient?.name}</h3>
        <form onSubmit={handleAssignGoal}>
          <div style={{ marginBottom: 16 }}>
            <label>Choose Goal:</label><br />
            <select 
              value={selectedGoalId} 
              onChange={e => setSelectedGoalId(e.target.value)} 
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            >
              <option value="">Select a goal</option>
              {availableGoals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          {/* Placeholder for image upload/select */}
          <div style={{ marginBottom: 16 }}>
            <label>Upload or Select Images (3-10):</label><br />
            <em>Image upload/select coming soon...</em>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Assign Goal to Patient</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignGoalModal; 