import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './UserReviews.scss';

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUserReviews();
    }, [currentPage]);

    const fetchUserReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/user/reviews?page=${currentPage}`);
            
            setReviews(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setError(null);
        } catch (err) {
            console.error('Errore nel caricamento delle recensioni:', err);
            setError('Impossibile caricare le tue recensioni. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa recensione?')) {
            return;
        }

        try {
            await api.delete(`/reviews/${reviewId}`);
            // Ricarica le recensioni dopo l'eliminazione
            fetchUserReviews();
            
            // Mostra messaggio di successo
            alert('Recensione eliminata con successo!');
        } catch (err) {
            console.error('Errore nell\'eliminazione della recensione:', err);
            alert('Errore nell\'eliminazione della recensione. Riprova più tardi.');
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`star ${index < rating ? 'star--filled' : ''}`}
            >
                ★
            </span>
        ));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="user-reviews">
                <div className="user-reviews__loading">
                    <div className="spinner"></div>
                    <p>Caricamento delle tue recensioni...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-reviews">
                <div className="user-reviews__error">
                    <h2>Errore</h2>
                    <p>{error}</p>
                    <button 
                        onClick={fetchUserReviews}
                        className="btn btn--primary"
                    >
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-reviews">
            <div className="user-reviews__header">
                <h1>Le Mie Recensioni</h1>
                <p>Gestisci tutte le recensioni che hai scritto sui prodotti</p>
            </div>

            {reviews.length === 0 ? (
                <div className="user-reviews__empty">
                    <div className="empty-state">
                        <h3>Nessuna recensione scritta</h3>
                        <p>Non hai ancora scritto nessuna recensione sui prodotti.</p>
                        <Link to="/products" className="btn btn--primary">
                            Scopri i nostri prodotti
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="user-reviews__stats">
                        <div className="stats-card">
                            <h3>Statistiche delle tue recensioni</h3>
                            <div className="stats-grid">
                                <div className="stat">
                                    <span className="stat__number">{reviews.length}</span>
                                    <span className="stat__label">Recensioni scritte</span>
                                </div>
                                <div className="stat">
                                    <span className="stat__number">
                                        {reviews.length > 0 
                                            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                                            : '0'
                                        }
                                    </span>
                                    <span className="stat__label">Rating medio</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="user-reviews__list">
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-card__header">
                                    <div className="product-info">
                                        {review.product.image && (
                                            <img 
                                                src={review.product.image} 
                                                alt={review.product.name}
                                                className="product-image"
                                            />
                                        )}
                                        <div className="product-details">
                                            <h3>
                                                <Link to={`/products/${review.product.slug}`}>
                                                    {review.product.name}
                                                </Link>
                                            </h3>
                                            <div className="review-rating">
                                                {renderStars(review.rating)}
                                                <span className="rating-text">({review.rating}/5)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-meta">
                                        <span className="review-date">
                                            {formatDate(review.created_at)}
                                        </span>
                                        {review.verified_purchase && (
                                            <span className="verified-badge">
                                                ✓ Acquisto verificato
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="review-card__content">
                                    {review.title && (
                                        <h4 className="review-title">{review.title}</h4>
                                    )}
                                    {review.comment && (
                                        <p className="review-comment">{review.comment}</p>
                                    )}
                                </div>

                                <div className="review-card__footer">
                                    <div className="review-stats">
                                        <span className="helpful-count">
                                            👍 {review.helpful_count} persone hanno trovato utile questa recensione
                                        </span>
                                    </div>
                                    <div className="review-actions">
                                        <Link 
                                            to={`/products/${review.product.slug}#reviews`}
                                            className="btn btn--outline btn--small"
                                        >
                                            Vedi sul prodotto
                                        </Link>
                                        <Link 
                                            to={`/dashboard/reviews/${review.id}/edit`}
                                            className="btn btn--primary btn--small"
                                        >
                                            Modifica
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteReview(review.id)}
                                            className="btn btn--danger btn--small"
                                        >
                                            Elimina
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginazione */}
                    {totalPages > 1 && (
                        <div className="user-reviews__pagination">
                            <div className="pagination">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="pagination__btn"
                                >
                                    ← Precedente
                                </button>
                                
                                <span className="pagination__info">
                                    Pagina {currentPage} di {totalPages}
                                </span>
                                
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="pagination__btn"
                                >
                                    Successiva →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserReviews; 