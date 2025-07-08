import React from 'react';

function GoalRunner({ goal, images, selectedImageId, feedback, onSelectImage, onExit }) {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      background: '#f6fff6', 
      zIndex: 1000, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <button onClick={onExit} style={{ marginBottom: 32, fontSize: 18, padding: '8px 16px' }}>&larr; Back to Profile</button>
      <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginBottom: 32 }}>
        {images.map(img => (
          <div 
            key={img.id} 
            style={{ 
              cursor: 'pointer', 
              border: selectedImageId === img.id ? '4px solid #36c' : '2px solid #ccc', 
              borderRadius: 16, 
              padding: 8, 
              background: selectedImageId === img.id ? '#e0eaff' : '#fff', 
              transition: 'border 0.2s' 
            }}
            onClick={() => onSelectImage(img)}
          >
            <img 
              src={img.image_url.startsWith('http') ? img.image_url : `${img.image_url}`} 
              alt="" 
              style={{ width: 240, height: 240, objectFit: 'cover', borderRadius: 16 }} 
            />
          </div>
        ))}
      </div>
      {feedback && (
        <div style={{ 
          fontWeight: 'bold', 
          color: feedback.startsWith('Correct') ? 'green' : 'red', 
          fontSize: 32 
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}

export default GoalRunner; 