import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './AllReviews.scss';

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    rating: '',
    product_id: '',
    sort_by: 'newest',
    verified_only: false
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Costruisci i parametri per la query
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('per_page', 12);
      
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.product_id) params.append('product_id', filters.product_id);
      if (filters.verified_only) params.append('verified_only', 'true');
      params.append('sort_by', filters.sort_by);

      const response = await api.get(`/reviews?${params.toString()}`);
      
      setReviews(response.data.reviews);
      setCurrentPage(response.data.pagination.current_page);
      setTotalPages(response.data.pagination.total_pages);
      setTotalItems(response.data.pagination.total_items);
      setError(null);
      
    } catch (err) {
      console.error('Errore nel caricamento delle recensioni:', err);
      setError('Impossibile caricare le recensioni. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      
      if (response.data.products && response.data.products.data) {
        setProducts(response.data.products.data);
      }
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFilters(prev => ({ ...prev, [name]: newValue }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      rating: '',
      product_id: '',
      sort_by: 'newest',
      verified_only: false
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Eccellente';
      case 4: return 'Molto Buono';
      case 3: return 'Buono';
      case 2: return 'Discreto';
      case 1: return 'Scarso';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="all-reviews">
        <div className="all-reviews__container">
          <div className="all-reviews__loading">
            <div className="spinner"></div>
            <p>Caricamento recensioni...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-reviews">
        <div className="all-reviews__container">
          <div className="all-reviews__error">
            <h2>Errore nel caricamento</h2>
            <p>{error}</p>
            <button 
              onClick={fetchReviews}
              className="all-reviews__button all-reviews__button--primary"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-reviews">
      <div className="all-reviews__container">
        <div className="all-reviews__header">
          <h1>Tutte le Recensioni</h1>
          <p>Scopri cosa pensano i nostri clienti dei prodotti Sapori di Calabria</p>
        </div>

        {/* Filtri */}
        <div className="all-reviews__filters">
          <div className="filters-card">
            <h3>Filtra le recensioni</h3>
            <div className="filters-row">
              <div className="filter-group">
                <label htmlFor="rating">Valutazione</label>
                <select
                  id="rating"
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Tutte le valutazioni</option>
                  <option value="5">5 stelle - Eccellente</option>
                  <option value="4">4 stelle - Molto Buono</option>
                  <option value="3">3 stelle - Buono</option>
                  <option value="2">2 stelle - Discreto</option>
                  <option value="1">1 stella - Scarso</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="product_id">Prodotto</label>
                <select
                  id="product_id"
                  name="product_id"
                  value={filters.product_id}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Tutti i prodotti</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="sort_by">Ordina per</label>
                <select
                  id="sort_by"
                  name="sort_by"
                  value={filters.sort_by}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="newest">Più recenti</option>
                  <option value="oldest">Più vecchie</option>
                  <option value="rating_high">Valutazione più alta</option>
                  <option value="rating_low">Valutazione più bassa</option>
                  <option value="helpful">Più utili</option>
                </select>
              </div>

              <div className="filter-group filter-group--checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="verified_only"
                    checked={filters.verified_only}
                    onChange={handleFilterChange}
                    className="filter-checkbox"
                  />
                  <span>Solo acquisti verificati</span>
                </label>
              </div>

              <div className="filter-group">
                <button
                  onClick={resetFilters}
                  className="filter-reset-btn"
                  type="button"
                >
                  Resetta filtri
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista recensioni */}
        <div className="all-reviews__content">
          {reviews.length === 0 ? (
            <div className="all-reviews__empty">
              <h3>Nessuna recensione trovata</h3>
              <p>Non ci sono recensioni che corrispondono ai filtri selezionati.</p>
              <Link to="/products" className="all-reviews__button all-reviews__button--primary">
                Scopri i nostri prodotti
              </Link>
            </div>
          ) : (
            <>
              <div className="all-reviews__count">
                <p>Mostrando {reviews.length} di {totalItems} recensioni</p>
              </div>

              <div className="all-reviews__list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-card__header">
                      <div className="product-info">
                        {review.product?.image && (
                          <img 
                            src={review.product.image} 
                            alt={review.product.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="product-details">
                          <h3>
                            <Link to={`/products/${review.product?.slug}`}>
                              {review.product?.name}
                            </Link>
                          </h3>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                            <span className="rating-text">
                              ({review.rating}/5) - {getRatingText(review.rating)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="review-meta">
                        <div className="reviewer-info">
                          <span className="reviewer-name">
                            {review.user?.name || 'Utente anonimo'}
                          </span>
                          <span className="review-date">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
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
                          👍 {review.helpful_count || 0} persone hanno trovato utile questa recensione
                        </span>
                      </div>
                      
                      {review.admin_reply && (
                        <div className="admin-reply">
                          <h5>Risposta del venditore:</h5>
                          <p>{review.admin_reply.message}</p>
                          <span className="reply-author">
                            - {review.admin_reply.admin_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="all-reviews__pagination">
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Precedente
                  </button>
                  
                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          className={`pagination-page ${page === currentPage ? 'pagination-page--active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Successiva →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllReviews; 