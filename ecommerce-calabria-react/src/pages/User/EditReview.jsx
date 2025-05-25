import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import './EditReview.scss';

const EditReview = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/reviews/${reviewId}`);
      const reviewData = response.data.review;
      
      setReview(reviewData);
      setFormData({
        rating: reviewData.rating,
        title: reviewData.title || '',
        comment: reviewData.comment || ''
      });
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento della recensione:', err);
      setError('Impossibile caricare la recensione. Verifica che sia tua e riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      alert('Il commento è obbligatorio.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/reviews/${reviewId}`, formData);
      
      alert('Recensione aggiornata con successo!');
      navigate('/dashboard/reviews');
    } catch (err) {
      console.error('Errore nell\'aggiornamento della recensione:', err);
      alert('Errore nell\'aggiornamento. Riprova più tardi.');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'star--filled' : ''} ${interactive ? 'star--interactive' : ''}`}
        onClick={interactive ? () => handleRatingClick(index + 1) : undefined}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="edit-review">
        <div className="edit-review__loading">
          <div className="spinner"></div>
          <p>Caricamento recensione...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-review">
        <div className="edit-review__error">
          <h2>Errore</h2>
          <p>{error}</p>
          <div className="edit-review__error-actions">
            <button onClick={fetchReview} className="btn btn--primary">
              Riprova
            </button>
            <Link to="/dashboard/reviews" className="btn btn--outline">
              Torna alle recensioni
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="edit-review">
        <div className="edit-review__not-found">
          <h2>Recensione non trovata</h2>
          <p>La recensione che stai cercando di modificare non esiste o non ti appartiene.</p>
          <Link to="/dashboard/reviews" className="btn btn--primary">
            Torna alle recensioni
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-review">
      <div className="edit-review__header">
        <Link to="/dashboard/reviews" className="edit-review__back">
          ← Torna alle recensioni
        </Link>
        <h1>Modifica Recensione</h1>
      </div>

      <div className="edit-review__product-info">
        <div className="product-card">
          {review.product?.image && (
            <img 
              src={review.product.image} 
              alt={review.product.name}
              className="product-image"
            />
          )}
          <div className="product-details">
            <h3>{review.product?.name}</h3>
            <Link 
              to={`/products/${review.product?.slug}`}
              className="product-link"
            >
              Vedi prodotto →
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-review__form">
        <div className="form-group">
          <label className="form-label">
            Valutazione *
          </label>
          <div className="rating-input">
            {renderStars(formData.rating, true)}
            <span className="rating-text">
              ({formData.rating}/5)
            </span>
          </div>
          <p className="form-help">Clicca sulle stelle per cambiare la valutazione</p>
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Titolo recensione
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            placeholder="es. Prodotto eccellente!"
            maxLength="100"
          />
          <p className="form-help">Facoltativo - Massimo 100 caratteri</p>
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Il tuo commento *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Condividi la tua esperienza con questo prodotto..."
            rows="6"
            maxLength="1000"
            required
          />
          <p className="form-help">
            Obbligatorio - {formData.comment.length}/1000 caratteri
          </p>
        </div>

        <div className="edit-review__actions">
          <Link 
            to="/dashboard/reviews" 
            className="btn btn--outline"
          >
            Annulla
          </Link>
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salva modifiche'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReview; 