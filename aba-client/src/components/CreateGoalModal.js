import React, { useState, useEffect } from 'react';
import ImageSelectorModal from './ImageSelectorModal';

function CreateGoalModal({ onClose, setMessage, onGoalCreated }) {
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalImages, setNewGoalImages] = useState([
    { url: '', label: '', isCorrect: false },
    { url: '', label: '', isCorrect: false }
  ]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [myImages, setMyImages] = useState([]);

  useEffect(() => {
    // Fetch available images for selection
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/therapist/my-images', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        setMyImages(data.images || []);
      } catch (err) {
        setMyImages([]);
      }
    };
    fetchImages();
  }, []);

  const handleImageChange = (idx, field, value) => {
    setNewGoalImages(imgs => imgs.map((img, i) =>
      i === idx ? { ...img, [field]: value } : img
    ));
  };

  const handleImageFile = async (idx, file) => {
    if (!file) return;
    setMessage('Uploading image...');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/therapist/upload-image', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.image_url) {
        setNewGoalImages(imgs => imgs.map((img, i) =>
          i === idx ? { ...img, url: data.image_url } : img
        ));
        setMessage('');
      } else {
        setMessage(data.error || 'Image upload failed');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleAddImage = () => {
    setNewGoalImages(imgs => [...imgs, { url: '', label: '', isCorrect: false }]);
  };

  const handleRemoveImage = (idx) => {
    setNewGoalImages(imgs => imgs.length > 2 ? imgs.filter((_, i) => i !== idx) : imgs);
  };

  const handleSetCorrect = (idx) => {
    setNewGoalImages(imgs => imgs.map((img, i) => ({ ...img, isCorrect: i === idx })));
  };

  const handleOpenImageSelector = () => {
    setShowImageSelector(true);
    setSelectedImages([]);
  };

  const handleCloseImageSelector = () => {
    setShowImageSelector(false);
    setSelectedImages([]);
  };

  const handleSelectImageFromBank = (img) => {
    const isSelected = selectedImages.some(selected => selected.id === img.id);
    if (isSelected) {
      setSelectedImages(selectedImages.filter(selected => selected.id !== img.id));
    } else {
      setSelectedImages([...selectedImages, {
        id: img.id,
        url: img.image_url,
        label: img.label,
        isCorrect: false
      }]);
    }
  };

  const handleUseSelectedImages = () => {
    if (selectedImages.length < 2) {
      setMessage('Please select at least 2 images.');
      return;
    }
    // Set one image as correct if none are selected
    const imagesWithCorrect = selectedImages.map((img, idx) => ({
      ...img,
      isCorrect: idx === 0 // First image is correct by default
    }));
    setNewGoalImages(imagesWithCorrect);
    setShowImageSelector(false);
    setSelectedImages([]);
    setMessage('Images selected! You can now edit labels and correct answer.');
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newGoalName || newGoalImages.length < 2) {
      setMessage('Goal name and at least 2 images are required.');
      return;
    }
    if (!newGoalImages.some(img => img.isCorrect)) {
      setMessage('Please mark one image as correct.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/therapist/create-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: newGoalName,
          description: newGoalDesc,
          images: newGoalImages
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Goal created!');
        onGoalCreated();
      } else {
        setMessage(data.error || 'Error creating goal');
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
        <h3>Create New Goal</h3>
        <form onSubmit={handleCreateGoal}>
          <div style={{ marginBottom: 16 }}>
            <label>Goal Name:</label><br />
            <input 
              type="text" 
              value={newGoalName} 
              onChange={e => setNewGoalName(e.target.value)} 
              required 
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Description:</label><br />
            <textarea 
              value={newGoalDesc} 
              onChange={e => setNewGoalDesc(e.target.value)} 
              style={{ width: '100%', padding: 8, minHeight: 60 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Images (2+):</label>
            <div style={{ marginBottom: 8 }}>
              <button type="button" onClick={handleOpenImageSelector} style={{ marginRight: 8, padding: '4px 8px' }}>Select from Image Bank</button>
              <span style={{ fontSize: 12, color: '#666' }}>or add manually below</span>
            </div>
            {newGoalImages.map((img, idx) => (
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
                      if (e.target.files && e.target.files[0]) handleImageFile(idx, e.target.files[0]);
                    }}
                    style={{ fontSize: 12 }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img.url}
                  onChange={e => handleImageChange(idx, 'url', e.target.value)}
                  style={{ flex: 1, padding: 4 }}
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={img.label}
                  onChange={e => handleImageChange(idx, 'label', e.target.value)}
                  required
                  style={{ flex: 1, padding: 4 }}
                />
                <label style={{ marginLeft: 8 }}>
                  <input
                    type="radio"
                    checked={img.isCorrect}
                    onChange={() => handleSetCorrect(idx)}
                  /> Correct
                </label>
                {newGoalImages.length > 2 && (
                  <button type="button" onClick={() => handleRemoveImage(idx)} style={{ marginLeft: 8, padding: '2px 6px' }}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddImage} style={{ marginTop: 4 }}>+ Add Image</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Create Goal</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>

        {/* Image Selector Modal */}
        {showImageSelector && (
          <ImageSelectorModal
            images={myImages}
            selectedImages={selectedImages}
            onSelectImage={handleSelectImageFromBank}
            onUseSelected={handleUseSelectedImages}
            onClose={handleCloseImageSelector}
          />
        )}
      </div>
    </div>
  );
}

export default CreateGoalModal; 