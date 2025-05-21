import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import './ReviewSection.scss';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });
  const [userReview, setUserReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}/reviews`);
      
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      });
      
      // Verifica se l'utente ha già recensito questo prodotto
      if (isAuthenticated() && response.data.userReview) {
        setUserReview(response.data.userReview);
      }
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle recensioni:', err);
      setError('Impossibile caricare le recensioni. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (userReview) {
        // Aggiornamento recensione esistente
        await api.put(`/reviews/${userReview.id}`, reviewData);
      } else {
        // Nuova recensione
        await api.post(`/products/${productId}/reviews`, reviewData);
      }
      
      // Ricarica le recensioni per aggiornare la lista
      fetchReviews();
      setShowForm(false);
    } catch (err) {
      console.error('Errore nel salvataggio della recensione:', err);
      alert(err.response?.data?.message || 'Impossibile salvare la recensione. Riprova più tardi.');
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (window.confirm('Sei sicuro di voler eliminare la tua recensione?')) {
      try {
        await api.delete(`/reviews/${userReview.id}`);
        setUserReview(null);
        fetchReviews();
      } catch (err) {
        console.error('Errore nell\'eliminazione della recensione:', err);
        alert('Impossibile eliminare la recensione. Riprova più tardi.');
      }
    }
  };

  const getRatingPercentage = (rating) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingCounts[rating] / stats.totalReviews) * 100);
  };

  if (loading) {
    return (
      <div className="review-section">
        <div className="review-section__loading">
          Caricamento recensioni...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-section">
        <div className="review-section__error">
          <p>{error}</p>
          <button
            className="review-section__button"
            onClick={fetchReviews}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-section">
      <h2 className="review-section__title">Recensioni e valutazioni</h2>
      
      {/* Sommario recensioni */}
      <div className="review-section__summary">
        <div className="review-section__average">
          <div className="review-section__average-score">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="review-section__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`review-section__star ${
                  star <= Math.round(stats.averageRating) ? 'review-section__star--active' : ''
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="review-section__total">
            {stats.totalReviews} {stats.totalReviews === 1 ? 'recensione' : 'recensioni'}
          </div>
        </div>
        
        <div className="review-section__stats">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="review-section__stat-row">
              <div className="review-section__stat-label">{rating} stelle</div>
              <div className="review-section__stat-bar">
                <div
                  className="review-section__stat-fill"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                ></div>
              </div>
              <div className="review-section__stat-count">
                {stats.ratingCounts[rating]}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Azioni utente */}
      <div className="review-section__actions">
        {isAuthenticated() ? (
          userReview ? (
            <div className="review-section__user-review-actions">
              <p>Hai già recensito questo prodotto.</p>
              <div className="review-section__buttons">
                <button
                  className="review-section__button review-section__button--primary"
                  onClick={() => setShowForm(true)}
                >
                  Modifica recensione
                </button>
                <button
                  className="review-section__button review-section__button--secondary"
                  onClick={handleDeleteReview}
                >
                  Elimina recensione
                </button>
              </div>
            </div>
          ) : (
            <button
              className="review-section__button review-section__button--primary"
              onClick={() => setShowForm(true)}
            >
              Scrivi una recensione
            </button>
          )
        ) : (
          <div className="review-section__login-prompt">
            <p>Accedi per lasciare una recensione.</p>
            <a
              href="/login?redirect=back"
              className="review-section__button review-section__button--primary"
            >
              Accedi
            </a>
          </div>
        )}
      </div>
      
      {/* Form recensione */}
      {showForm && (
        <div className="review-section__form-container">
          <ReviewForm
            initialData={userReview}
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      {/* Lista recensioni */}
      <div className="review-section__list-container">
        <ReviewList 
          reviews={reviews} 
          currentUserReview={userReview}
        />
      </div>
    </div>
  );
};

export default ReviewSection; 