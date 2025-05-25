import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './Reviews.scss';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, approved, pending
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage] = useState(1);
    const [replyForm, setReplyForm] = useState({ reviewId: null, message: '' });
    const [showReplyModal, setShowReplyModal] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [filterStatus, sortBy, currentPage]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reviews', {
                params: {
                    status: filterStatus,
                    sort_by: sortBy,
                    page: currentPage
                }
            });
            
            setReviews(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Errore nel caricamento delle recensioni:', err);
            setError('Impossibile caricare le recensioni. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReview = async (reviewId) => {
        try {
            await api.patch(`/admin/reviews/${reviewId}/approve`);
            fetchReviews();
            alert('Recensione approvata con successo!');
        } catch (err) {
            console.error('Errore nell\'approvazione:', err);
            alert('Errore nell\'approvazione della recensione.');
        }
    };

    const handleRejectReview = async (reviewId) => {
        if (!window.confirm('Sei sicuro di voler rifiutare questa recensione?')) {
            return;
        }

        try {
            await api.patch(`/admin/reviews/${reviewId}/reject`);
            fetchReviews();
            alert('Recensione rifiutata.');
        } catch (err) {
            console.error('Errore nel rifiuto:', err);
            alert('Errore nel rifiuto della recensione.');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa recensione? Questa azione non può essere annullata.')) {
            return;
        }

        try {
            await api.delete(`/admin/reviews/${reviewId}`);
            fetchReviews();
            alert('Recensione eliminata con successo.');
        } catch (err) {
            console.error('Errore nell\'eliminazione:', err);
            alert('Errore nell\'eliminazione della recensione.');
        }
    };

    const handleSendReply = async () => {
        if (!replyForm.message.trim()) {
            alert('Inserisci un messaggio di risposta.');
            return;
        }

        try {
            await api.post(`/admin/reviews/${replyForm.reviewId}/reply`, {
                message: replyForm.message
            });
            
            setReplyForm({ reviewId: null, message: '' });
            setShowReplyModal(false);
            fetchReviews();
            alert('Risposta inviata con successo!');
        } catch (err) {
            console.error('Errore nell\'invio della risposta:', err);
            alert('Errore nell\'invio della risposta.');
        }
    };

    const openReplyModal = (reviewId) => {
        setReplyForm({ reviewId, message: '' });
        setShowReplyModal(true);
    };

    const closeReplyModal = () => {
        setReplyForm({ reviewId: null, message: '' });
        setShowReplyModal(false);
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (review) => {
        if (review.is_approved) {
            return <span className="status-badge status-badge--approved">✓ Approvata</span>;
        } else {
            return <span className="status-badge status-badge--pending">⏳ In attesa</span>;
        }
    };

    if (loading) {
        return (
            <div className="admin-reviews">
                <div className="admin-reviews__loading">
                    <div className="spinner"></div>
                    <p>Caricamento recensioni...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-reviews">
                <div className="admin-reviews__error">
                    <h2>Errore</h2>
                    <p>{error}</p>
                    <button onClick={fetchReviews} className="btn btn--primary">
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-reviews">
            <div className="admin-reviews__header">
                <h1>Gestione Recensioni</h1>
                <p>Monitora e gestisci tutte le recensioni dei prodotti</p>
            </div>

            <div className="admin-reviews__filters">
                <div className="filters-row">
                    <div className="filter-group">
                        <label>Stato:</label>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Tutte</option>
                            <option value="approved">Approvate</option>
                            <option value="pending">In attesa</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Ordina per:</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="newest">Più recenti</option>
                            <option value="oldest">Più vecchie</option>
                            <option value="rating_high">Rating alto</option>
                            <option value="rating_low">Rating basso</option>
                            <option value="helpful">Più utili</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="admin-reviews__stats">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Totale Recensioni</h3>
                        <div className="stat-number">{reviews.length}</div>
                    </div>
                    <div className="stat-card">
                        <h3>In Attesa</h3>
                        <div className="stat-number pending">
                            {reviews.filter(r => !r.is_approved).length}
                        </div>
                    </div>
                    <div className="stat-card">
                        <h3>Approvate</h3>
                        <div className="stat-number approved">
                            {reviews.filter(r => r.is_approved).length}
                        </div>
                    </div>
                    <div className="stat-card">
                        <h3>Rating Medio</h3>
                        <div className="stat-number">
                            {reviews.length > 0 
                                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                                : '0'
                            }
                        </div>
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="admin-reviews__empty">
                    <h3>Nessuna recensione trovata</h3>
                    <p>Non ci sono recensioni che corrispondono ai filtri selezionati.</p>
                </div>
            ) : (
                <div className="admin-reviews__list">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-item__header">
                                <div className="product-info">
                                    <h3>
                                        <Link to={`/admin/products/${review.product.id}`}>
                                            {review.product.name}
                                        </Link>
                                    </h3>
                                    <div className="review-rating">
                                        {renderStars(review.rating)}
                                        <span className="rating-text">({review.rating}/5)</span>
                                    </div>
                                </div>
                                <div className="review-status">
                                    {getStatusBadge(review)}
                                </div>
                            </div>

                            <div className="review-item__content">
                                <div className="review-meta">
                                    <span className="reviewer">
                                        👤 {review.user.name} {review.user.surname}
                                    </span>
                                    <span className="review-date">
                                        📅 {formatDate(review.created_at)}
                                    </span>
                                    {review.verified_purchase && (
                                        <span className="verified-badge">
                                            ✓ Acquisto verificato
                                        </span>
                                    )}
                                    <span className="helpful-count">
                                        👍 {review.helpful_count} utili
                                    </span>
                                </div>

                                {review.title && (
                                    <h4 className="review-title">{review.title}</h4>
                                )}
                                
                                {review.comment && (
                                    <p className="review-comment">{review.comment}</p>
                                )}

                                {review.admin_reply && (
                                    <div className="admin-reply">
                                        <h5>Risposta dell'Admin:</h5>
                                        <p>{review.admin_reply.message}</p>
                                        <span className="reply-date">
                                            {formatDate(review.admin_reply.created_at)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="review-item__actions">
                                {!review.is_approved && (
                                    <button 
                                        onClick={() => handleApproveReview(review.id)}
                                        className="btn btn--success btn--small"
                                    >
                                        ✓ Approva
                                    </button>
                                )}
                                
                                {review.is_approved && (
                                    <button 
                                        onClick={() => handleRejectReview(review.id)}
                                        className="btn btn--warning btn--small"
                                    >
                                        ✗ Rifiuta
                                    </button>
                                )}

                                <button 
                                    onClick={() => openReplyModal(review.id)}
                                    className="btn btn--outline btn--small"
                                >
                                    💬 Rispondi
                                </button>

                                <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="btn btn--danger btn--small"
                                >
                                    🗑️ Elimina
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal per risposta */}
            {showReplyModal && (
                <div className="modal-overlay" onClick={closeReplyModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3>Rispondi alla Recensione</h3>
                            <button onClick={closeReplyModal} className="modal__close">✕</button>
                        </div>
                        <div className="modal__body">
                            <div className="form-group">
                                <label>La tua risposta:</label>
                                <textarea
                                    value={replyForm.message}
                                    onChange={(e) => setReplyForm({...replyForm, message: e.target.value})}
                                    placeholder="Scrivi una risposta professionale e cortese..."
                                    rows="5"
                                    className="form-textarea"
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button onClick={closeReplyModal} className="btn btn--outline">
                                Annulla
                            </button>
                            <button onClick={handleSendReply} className="btn btn--primary">
                                Invia Risposta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviews; 