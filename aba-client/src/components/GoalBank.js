import React, { useState, useEffect } from 'react';
import EditGoalModal from './EditGoalModal';
import ImageSelectorModal from './ImageSelectorModal';

function GoalBank({ user, message, setMessage, onBack }) {
  const [myGoals, setMyGoals] = useState([]);
  const [myImages, setMyImages] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const fetchGoalBank = async () => {
      try {
        const token = localStorage.getItem('token');
        const [goalsRes, imagesRes] = await Promise.all([
          fetch('/api/therapist/my-goals', {
            headers: { 'Authorization': 'Bearer ' + token }
          }),
          fetch('/api/therapist/my-images', {
            headers: { 'Authorization': 'Bearer ' + token }
          })
        ]);
        const goalsData = await goalsRes.json();
        const imagesData = await imagesRes.json();
        setMyGoals(goalsData.goals || []);
        setMyImages(imagesData.images || []);
      } catch (err) {
        setMessage('Error fetching goals and images');
      }
    };
    fetchGoalBank();
  }, [setMessage]);

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/therapist/goal/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Goal deleted successfully!');
        // Refresh goals list
        const goalsRes = await fetch('/api/therapist/my-goals', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const goalsData = await goalsRes.json();
        setMyGoals(goalsData.goals || []);
      } else {
        setMessage(data.error || 'Error deleting goal');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowEditGoal(true);
  };

  const handleCloseEditGoal = () => {
    setShowEditGoal(false);
    setEditingGoal(null);
  };

  const handleGoalUpdated = async () => {
    // Refresh goals list
    const token = localStorage.getItem('token');
    const goalsRes = await fetch('/api/therapist/my-goals', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const goalsData = await goalsRes.json();
    setMyGoals(goalsData.goals || []);
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 24, background: '#fff', color: '#222' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>🎯 Goal Bank</div>
        <button onClick={onBack} style={{ padding: '8px 16px', background: '#666', color: 'white', border: 'none', borderRadius: 4 }}>&larr; Back to Dashboard</button>
      </div>
      
      {/* Goals Section */}
      <div style={{ marginBottom: 32 }}>
        <h3>My Goals ({myGoals.length})</h3>
        {myGoals.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No goals created yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {myGoals.map(goal => (
              <div key={goal.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, background: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>{goal.name}</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleOpenEditGoal(goal)} style={{ padding: '4px 8px' }}>Edit</button>
                    <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '4px 8px', background: '#ff4444', color: 'white', border: 'none' }}>Delete</button>
                  </div>
                </div>
                {goal.description && (
                  <div style={{ color: '#666', marginBottom: 8 }}>{goal.description}</div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {goal.images.map(img => (
                    <div key={img.id} style={{ position: 'relative' }}>
                      <img 
                        src={img.image_url.startsWith('http') ? img.image_url : `${img.image_url}`} 
                        alt={img.label} 
                        style={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'cover', 
                          borderRadius: 4,
                          border: img.is_correct ? '2px solid #4CAF50' : '1px solid #ddd'
                        }} 
                      />
                      {img.is_correct && (
                        <div style={{ 
                          position: 'absolute', 
                          top: -4, 
                          right: -4, 
                          background: '#4CAF50', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 16, 
                          height: 16, 
                          fontSize: 10, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images Section */}
      <div>
        <h3>My Images ({myImages.length})</h3>
        {myImages.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No images uploaded yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
            {myImages.map(img => (
              <div key={img.id} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={img.image_url.startsWith('http') ? img.image_url : `${img.image_url}`} 
                    alt={img.label} 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      borderRadius: 8,
                      border: img.is_correct ? '2px solid #4CAF50' : '1px solid #ddd'
                    }} 
                  />
                  {img.is_correct && (
                    <div style={{ 
                      position: 'absolute', 
                      top: -4, 
                      right: -4, 
                      background: '#4CAF50', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 16, 
                      height: 16, 
                      fontSize: 10, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>✓</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{img.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <EditGoalModal
          goal={editingGoal}
          onClose={handleCloseEditGoal}
          onGoalUpdated={handleGoalUpdated}
          setMessage={setMessage}
        />
      )}
    </div>
  );
}

export default GoalBank; 