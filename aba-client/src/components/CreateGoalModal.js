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
        padding: '36px 32px 28px 32px',
        borderRadius: 18,
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 8px 40px rgba(99,102,241,0.13)',
        fontFamily: 'inherit',
        textAlign: 'center',
        overflow: 'auto',
        maxHeight: '90vh',
      }}>
        <div style={{ fontWeight: 800, fontSize: 26, marginBottom: 24, color: '#6366f1', letterSpacing: 1 }}>Create New Goal</div>
        <form onSubmit={handleCreateGoal}>
          <div style={{ marginBottom: 22, textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 17, color: '#22223b', marginBottom: 8, display: 'block' }}>Goal Name:</label>
            <input
              type="text"
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
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
            />
          </div>
          <div style={{ marginBottom: 22, textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 17, color: '#22223b', marginBottom: 8, display: 'block' }}>Description:</label>
            <textarea
              value={newGoalDesc}
              onChange={e => setNewGoalDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1.5px solid #c7d2fe',
                fontSize: 17,
                outline: 'none',
                marginTop: 6,
                minHeight: 60,
                background: '#f3f4f6',
                fontWeight: 500,
                color: '#374151',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: 22, textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 17, color: '#22223b', marginBottom: 8, display: 'block' }}>Images (2+):</label>
            <div style={{ marginBottom: 10 }}>
              <button type="button" onClick={handleOpenImageSelector} style={{
                marginRight: 8,
                padding: '8px 16px',
                background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                cursor: 'pointer',
                transition: 'transform 0.1s, background 0.2s',
              }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
              >Select from Image Bank</button>
              <span style={{ fontSize: 13, color: '#666' }}>or add manually below</span>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            {/* Image input header row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              marginBottom: 6,
              fontWeight: 600,
              color: '#6366f1',
              fontSize: 15,
            }}>
              <span style={{ flex: 2, minWidth: 120 }}>File</span>
              <span style={{ flex: 3, minWidth: 100 }}>Image URL</span>
              <span style={{ flex: 2, minWidth: 80 }}>Label</span>
              <span style={{ width: 60, textAlign: 'center' }}>Correct?</span>
              <span style={{ width: 30 }}></span>
            </div>
            {newGoalImages.map((img, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 14,
                  background: '#f3f4f6',
                  border: '1.5px solid #e0e7ff',
                  borderRadius: 12,
                  padding: '16px 14px',
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 1px 4px rgba(99,102,241,0.06)',
                  maxWidth: '100%',
                }}
              >
                <div style={{ flex: '0 0 90px', position: 'relative' }}>
                  <input
                    id={`file-input-${idx}`}
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFile(idx, e.target.files[0])}
                    style={{
                      opacity: 0,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  />
                  <label
                    htmlFor={`file-input-${idx}`}
                    style={{
                      display: 'block',
                      width: 90,
                      padding: '8px 0',
                      background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                      color: '#fff',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 15,
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {(img.url && !img.url.startsWith('http')) ? 'File Selected' : 'Choose File'}
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img.url}
                  onChange={e => handleImageChange(idx, 'url', e.target.value)}
                  style={{
                    flex: '2 1 0',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 15,
                    background: '#fff',
                    marginBottom: 0,
                    width: '100%',
                  }}
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={img.label}
                  onChange={e => handleImageChange(idx, 'label', e.target.value)}
                  style={{
                    flex: '1 1 0',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 15,
                    background: '#fff',
                    marginBottom: 0,
                    width: '100%',
                  }}
                />
                <div style={{ flex: '0 0 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <input
                    type="radio"
                    checked={img.isCorrect}
                    onChange={() => handleSetCorrect(idx)}
                    title="Mark as correct"
                    style={{ accentColor: '#6366f1', width: 20, height: 20 }}
                  />
                </div>
                <div style={{ flex: '0 0 32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      color: '#f43f5e',
                      fontWeight: 700,
                      border: 'none',
                      background: 'none',
                      fontSize: 22,
                      cursor: 'pointer',
                      padding: 0,
                      margin: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      transition: 'background 0.15s',
                    }}
                    title="Remove image"
                    onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddImage}
              style={{
                marginTop: 4,
                padding: '10px 22px',
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
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
            >
              + Add Image
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 22, justifyContent: 'center' }}>
            <button
              type="submit"
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                cursor: 'pointer',
                transition: 'transform 0.1s, background 0.2s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #059669 0%, #34d399 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)'}
            >
              Create Goal
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