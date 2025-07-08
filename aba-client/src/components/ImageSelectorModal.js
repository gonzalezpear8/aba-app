import React from 'react';

function ImageSelectorModal({ images, selectedImages, onSelectImage, onUseSelected, onClose }) {
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
        maxWidth: 800, 
        maxHeight: '80vh', 
        overflow: 'auto' 
      }}>
        <h3>Select Images from Your Image Bank</h3>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span>Selected: {selectedImages.length} images</span>
            <div>
              <button 
                onClick={onUseSelected} 
                disabled={selectedImages.length < 2} 
                style={{ marginRight: 8, padding: '4px 8px' }}
              >
                Use Selected ({selectedImages.length})
              </button>
              <button onClick={onClose} style={{ padding: '4px 8px' }}>Cancel</button>
            </div>
          </div>
          {selectedImages.length < 2 && (
            <div style={{ color: '#ff4444', fontSize: 12 }}>Please select at least 2 images</div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {images.map(img => {
            const isSelected = selectedImages.some(selected => selected.id === img.id);
            return (
              <div key={img.id} style={{ textAlign: 'center' }}>
                <div 
                  style={{ 
                    position: 'relative', 
                    display: 'inline-block',
                    cursor: 'pointer',
                    border: isSelected ? '3px solid #4CAF50' : '1px solid #ddd',
                    borderRadius: 8,
                    padding: 4
                  }}
                  onClick={() => onSelectImage(img)}
                >
                  <img 
                    src={img.image_url.startsWith('http') ? img.image_url : `${img.image_url}`} 
                    alt={img.label} 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      borderRadius: 4
                    }} 
                  />
                  {isSelected && (
                    <div style={{ 
                      position: 'absolute', 
                      top: -4, 
                      right: -4, 
                      background: '#4CAF50', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 20, 
                      height: 20, 
                      fontSize: 12, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>✓</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{img.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ImageSelectorModal; 