import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '../Toast/Toast';
import './ImageUploadManager.scss';

const ImageUploadManager = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  maxSizePerImage = 2 * 1024 * 1024 // 2MB
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  // Validazione file
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      addToast('Formato file non supportato. Usa JPEG, PNG o WebP.', 'error');
      return false;
    }
    
    if (file.size > maxSizePerImage) {
      addToast(`Immagine troppo grande. Massimo ${Math.round(maxSizePerImage / 1024 / 1024)}MB.`, 'error');
      return false;
    }
    
    return true;
  };

  // Gestione upload multipli
  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      addToast(`Puoi caricare massimo ${remainingSlots} immagini aggiuntive.`, 'warning');
      return;
    }

    const newImages = [];

    for (const file of fileArray) {
      if (!validateFile(file)) continue;

      try {
        // Crea preview immediato
        const previewUrl = URL.createObjectURL(file);
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          url: previewUrl,
          alt: file.name,
          isUploading: true,
          isNew: true
        };
        
        newImages.push(newImage);
      } catch (error) {
        console.error('Errore nella creazione preview:', error);
        addToast('Errore nel caricamento dell\'immagine', 'error');
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
      addToast(`${newImages.length} immagine/i caricate con successo!`, 'success');
    }
  }, [images, maxImages, maxSizePerImage, onImagesChange, addToast]);

  // Drag & Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Click handler per input file
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Rimozione immagine
  const removeImage = (imageId) => {
    const filteredImages = images.filter(img => img.id !== imageId);
    onImagesChange(filteredImages);
    addToast('Immagine rimossa', 'info');
  };

  // Imposta immagine principale
  const setPrimaryImage = (imageId) => {
    const newImages = [...images];
    const imageIndex = newImages.findIndex(img => img.id === imageId);
    
    if (imageIndex > 0) {
      const [primaryImage] = newImages.splice(imageIndex, 1);
      newImages.unshift(primaryImage);
      onImagesChange(newImages);
      addToast('Immagine principale aggiornata', 'success');
    }
  };

  return (
    <div className="image-upload-manager">
      <div className="image-upload-manager__header">
        <h3>Gestione Immagini</h3>
        <span className="image-upload-manager__counter">
          {images.length}/{maxImages} immagini
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={`image-upload-manager__dropzone ${dragActive ? 'image-upload-manager__dropzone--active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        <div className="image-upload-manager__dropzone-content">
          <i className="fas fa-cloud-upload-alt"></i>
          <h4>Trascina le immagini qui o clicca per selezionare</h4>
          <p>
            Formati supportati: JPEG, PNG, WebP<br />
            Dimensione massima: {Math.round(maxSizePerImage / 1024 / 1024)}MB per immagine
          </p>
        </div>
      </div>

      {/* Preview Immagini */}
      {images.length > 0 && (
        <div className="image-upload-manager__preview">
          <h4>Immagini Caricate</h4>
          <div className="image-upload-manager__grid">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className={`image-upload-manager__item ${index === 0 ? 'image-upload-manager__item--primary' : ''}`}
              >
                <div className="image-upload-manager__image-wrapper">
                  <img 
                    src={image.url} 
                    alt={image.alt || `Immagine ${index + 1}`}
                    className="image-upload-manager__image"
                    loading="lazy"
                  />
                  
                  {/* Overlay con azioni */}
                  <div className="image-upload-manager__overlay">
                    <div className="image-upload-manager__actions">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="image-upload-manager__action image-upload-manager__action--primary"
                          title="Imposta come principale"
                        >
                          <i className="fas fa-star"></i>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="image-upload-manager__action image-upload-manager__action--remove"
                        title="Rimuovi immagine"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Badge immagine principale */}
                  {index === 0 && (
                    <div className="image-upload-manager__primary-badge">
                      <i className="fas fa-star"></i>
                      Principale
                    </div>
                  )}

                  {/* Loading overlay */}
                  {image.isUploading && (
                    <div className="image-upload-manager__loading">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                  )}
                </div>

                <div className="image-upload-manager__info">
                  <span className="image-upload-manager__filename">
                    {image.alt || image.file?.name || `Immagine ${index + 1}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info e limiti */}
      <div className="image-upload-manager__info-box">
        <p>
          <strong>Suggerimenti:</strong>
        </p>
        <ul>
          <li>La prima immagine sarà usata come immagine principale del prodotto</li>
          <li>Usa immagini di alta qualità per migliorare l'esperienza utente</li>
          <li>Le immagini vengono automaticamente ottimizzate per il web</li>
          <li>Riordina le immagini trascinandole nella posizione desiderata</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadManager; 