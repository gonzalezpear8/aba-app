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
        padding: '36px 32px 28px 32px',
        borderRadius: 18,
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 8px 40px rgba(99,102,241,0.13)',
        fontFamily: 'inherit',
        textAlign: 'center',
      }}>
        <div style={{ fontWeight: 800, fontSize: 26, marginBottom: 24, color: '#6366f1', letterSpacing: 1 }}>Assign Goal to {patient?.name}</div>
        <form onSubmit={handleAssignGoal}>
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 17, color: '#22223b', marginBottom: 8, display: 'block' }}>Choose Goal:</label>
            <select
              value={selectedGoalId}
              onChange={e => setSelectedGoalId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1.5px solid #c7d2fe',
                fontSize: 17,
                outline: 'none',
                marginTop: 6,
                marginBottom: 0,
                background: '#f3f4f6',
                fontWeight: 600,
                color: '#374151',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Select a goal</option>
              {availableGoals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, justifyContent: 'center' }}>
            <button
              type="submit"
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                cursor: 'pointer',
                transition: 'transform 0.1s, background 0.2s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
            >
              Assign Goal
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 28px',
                background: '#fff',
                color: '#374151',
                border: '2px solid #d1d5db',
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 10,
                boxShadow: 'none',
                transition: 'transform 0.1s, background 0.2s',
                cursor: 'pointer',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignGoalModal; 