import React, { useState } from 'react';
import './ReviewForm.scss';

const ReviewForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: initialData ? initialData.rating : 5,
    title: initialData ? initialData.title : '',
    content: initialData ? initialData.content : '',
    recommend: initialData ? initialData.recommend : true,
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Rimuovi errore quando l'utente modifica il campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleRatingChange = (newRating) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Il titolo deve contenere almeno 3 caratteri';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'La recensione è obbligatoria';
    } else if (formData.content.length < 10) {
      newErrors.content = 'La recensione deve contenere almeno 10 caratteri';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Errore durante il salvataggio della recensione:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="review-form">
      <h3 className="review-form__title">
        {initialData ? 'Modifica la tua recensione' : 'Scrivi una recensione'}
      </h3>
      
      <form onSubmit={handleSubmit} className="review-form__form">
        {/* Rating */}
        <div className="review-form__group">
          <label className="review-form__label">Valutazione</label>
          <div className="review-form__rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`review-form__star ${
                  star <= formData.rating ? 'review-form__star--active' : ''
                }`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </span>
            ))}
          </div>
          {errors.rating && <div className="review-form__error">{errors.rating}</div>}
        </div>
        
        {/* Titolo */}
        <div className="review-form__group">
          <label htmlFor="title" className="review-form__label">
            Titolo recensione
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Riassumi la tua esperienza in una frase"
            className={`review-form__input ${errors.title ? 'review-form__input--error' : ''}`}
            maxLength="100"
          />
          {errors.title && <div className="review-form__error">{errors.title}</div>}
        </div>
        
        {/* Contenuto */}
        <div className="review-form__group">
          <label htmlFor="content" className="review-form__label">
            La tua recensione
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Racconta la tua esperienza con questo prodotto"
            className={`review-form__textarea ${errors.content ? 'review-form__textarea--error' : ''}`}
            rows="5"
            maxLength="1000"
          ></textarea>
          {errors.content && <div className="review-form__error">{errors.content}</div>}
          <div className="review-form__char-count">
            {formData.content.length}/1000 caratteri
          </div>
        </div>
        
        {/* Consigliato */}
        <div className="review-form__group review-form__group--checkbox">
          <input
            type="checkbox"
            id="recommend"
            name="recommend"
            checked={formData.recommend}
            onChange={handleChange}
            className="review-form__checkbox"
          />
          <label htmlFor="recommend" className="review-form__checkbox-label">
            Consiglieresti questo prodotto?
          </label>
        </div>
        
        {/* Pulsanti */}
        <div className="review-form__buttons">
          <button
            type="button"
            className="review-form__button review-form__button--secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="review-form__button review-form__button--primary"
            disabled={submitting}
          >
            {submitting
              ? 'Salvataggio in corso...'
              : initialData
              ? 'Aggiorna recensione'
              : 'Pubblica recensione'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 