import React, { useState } from 'react';

function EditGoalModal({ goal, onClose, onGoalUpdated, setMessage }) {
  const [editGoalName, setEditGoalName] = useState(goal?.name || '');
  const [editGoalDesc, setEditGoalDesc] = useState(goal?.description || '');
  const [editGoalImages, setEditGoalImages] = useState(
    goal?.images?.map(img => ({
      id: img.id,
      url: img.image_url,
      label: img.label,
      isCorrect: img.is_correct
    })) || []
  );

  const handleEditImageChange = (idx, field, value) => {
    const newImages = [...editGoalImages];
    newImages[idx] = { ...newImages[idx], [field]: value };
    setEditGoalImages(newImages);
  };

  const handleEditImageFile = async (idx, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/therapist/upload-image', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const newImages = [...editGoalImages];
        newImages[idx] = { ...newImages[idx], url: data.image_url };
        setEditGoalImages(newImages);
      } else {
        setMessage(data.error || 'Error uploading image');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleAddEditImage = () => {
    setEditGoalImages([...editGoalImages, { url: '', label: '', isCorrect: false }]);
  };

  const handleRemoveEditImage = (idx) => {
    if (editGoalImages.length > 2) {
      const newImages = editGoalImages.filter((_, i) => i !== idx);
      setEditGoalImages(newImages);
    }
  };

  const handleSetEditCorrect = (idx) => {
    const newImages = editGoalImages.map((img, i) => ({
      ...img,
      isCorrect: i === idx
    }));
    setEditGoalImages(newImages);
  };

  const handleSaveEditGoal = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!editGoalName || editGoalImages.length < 2) {
      setMessage('Name and at least 2 images are required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/therapist/goal/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: editGoalName,
          description: editGoalDesc,
          images: editGoalImages
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Goal updated successfully!');
        onClose();
        onGoalUpdated();
      } else {
        setMessage(data.error || 'Error updating goal');
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
        maxWidth: 600, 
        maxHeight: '80vh', 
        overflow: 'auto' 
      }}>
        <h3>Edit Goal: {goal?.name}</h3>
        <form onSubmit={handleSaveEditGoal}>
          <div style={{ marginBottom: 16 }}>
            <label>Goal Name:</label><br />
            <input 
              type="text" 
              value={editGoalName} 
              onChange={e => setEditGoalName(e.target.value)} 
              required 
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Description:</label><br />
            <textarea 
              value={editGoalDesc} 
              onChange={e => setEditGoalDesc(e.target.value)} 
              style={{ width: '100%', padding: 8, minHeight: 60 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Images (2+):</label>
            {editGoalImages.map((img, idx) => (
              <div key={idx} style={{ marginBottom: 8, border: '1px solid #ccc', padding: 8, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {img.url && (
                    <img 
                      src={img.url.startsWith('http') ? img.url : `${img.url}`} 
                      alt="preview" 
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} 
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) handleEditImageFile(idx, e.target.files[0]);
                    }}
                    style={{ fontSize: 12 }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img.url}
                  onChange={e => handleEditImageChange(idx, 'url', e.target.value)}
                  style={{ flex: 1, padding: 4 }}
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={img.label}
                  onChange={e => handleEditImageChange(idx, 'label', e.target.value)}
                  required
                  style={{ flex: 1, padding: 4 }}
                />
                <label style={{ marginLeft: 8 }}>
                  <input
                    type="radio"
                    checked={img.isCorrect}
                    onChange={() => handleSetEditCorrect(idx)}
                  /> Correct
                </label>
                {editGoalImages.length > 2 && (
                  <button type="button" onClick={() => handleRemoveEditImage(idx)} style={{ marginLeft: 8, padding: '2px 6px' }}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddEditImage} style={{ marginTop: 4 }}>+ Add Image</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGoalModal; 