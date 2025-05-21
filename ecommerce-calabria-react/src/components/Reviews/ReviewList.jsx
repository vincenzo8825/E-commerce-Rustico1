import React, { useState } from 'react';
import './ReviewList.scss';

const ReviewList = ({ reviews, currentUserReview }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  
  // Filtra le recensioni in base ai criteri selezionati
  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    // Se c'è una recensione dell'utente corrente, rimuovila dall'elenco
    // perché verrà mostrata separatamente
    if (currentUserReview) {
      filtered = filtered.filter(review => review.id !== currentUserReview.id);
    }
    
    // Filtra per rating se necessario
    if (filterBy !== 'all') {
      const rating = parseInt(filterBy);
      filtered = filtered.filter(review => review.rating === rating);
    }
    
    // Ordina le recensioni
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  const filteredReviews = getFilteredReviews();
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };
  
  return (
    <div className="review-list">
      {/* Filtri e ordinamento */}
      <div className="review-list__filters">
        <div className="review-list__filter-group">
          <label htmlFor="filter" className="review-list__filter-label">Filtra:</label>
          <select
            id="filter"
            className="review-list__select"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">Tutte le recensioni</option>
            <option value="5">Solo 5 stelle</option>
            <option value="4">Solo 4 stelle</option>
            <option value="3">Solo 3 stelle</option>
            <option value="2">Solo 2 stelle</option>
            <option value="1">Solo 1 stella</option>
          </select>
        </div>
        
        <div className="review-list__filter-group">
          <label htmlFor="sort" className="review-list__filter-label">Ordina per:</label>
          <select
            id="sort"
            className="review-list__select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Più recenti</option>
            <option value="oldest">Meno recenti</option>
            <option value="highest">Valutazione più alta</option>
            <option value="lowest">Valutazione più bassa</option>
          </select>
        </div>
      </div>
      
      {/* Recensione dell'utente corrente */}
      {currentUserReview && (
        <div className="review-list__user-review">
          <div className="review-item review-item--highlighted">
            <div className="review-item__header">
              <div className="review-item__user">
                <div className="review-item__avatar">{currentUserReview.user.name.charAt(0)}</div>
                <div className="review-item__user-info">
                  <div className="review-item__user-name">{currentUserReview.user.name}</div>
                  <div className="review-item__date">{formatDate(currentUserReview.created_at)}</div>
                </div>
              </div>
              <div className="review-item__rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`review-item__star ${
                      star <= currentUserReview.rating ? 'review-item__star--active' : ''
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            <div className="review-item__body">
              <h4 className="review-item__title">{currentUserReview.title}</h4>
              <p className="review-item__content">{currentUserReview.content}</p>
            </div>
            
            <div className="review-item__footer">
              {currentUserReview.recommend && (
                <div className="review-item__recommend">
                  <span className="review-item__recommend-icon">👍</span>
                  Consigliato
                </div>
              )}
              <div className="review-item__your-review">La tua recensione</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista recensioni */}
      {filteredReviews.length === 0 ? (
        <div className="review-list__empty">
          {filterBy !== 'all'
            ? `Nessuna recensione con ${filterBy} ${filterBy === '1' ? 'stella' : 'stelle'}`
            : reviews.length > 0
              ? 'Nessuna recensione da mostrare'
              : 'Questo prodotto non ha ancora recensioni. Sii il primo a recensirlo!'}
        </div>
      ) : (
        <div className="review-list__items">
          {filteredReviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-item__header">
                <div className="review-item__user">
                  <div className="review-item__avatar">{review.user.name.charAt(0)}</div>
                  <div className="review-item__user-info">
                    <div className="review-item__user-name">{review.user.name}</div>
                    <div className="review-item__date">{formatDate(review.created_at)}</div>
                  </div>
                </div>
                <div className="review-item__rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`review-item__star ${
                        star <= review.rating ? 'review-item__star--active' : ''
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="review-item__body">
                <h4 className="review-item__title">{review.title}</h4>
                <p className="review-item__content">{review.content}</p>
              </div>
              
              <div className="review-item__footer">
                {review.recommend && (
                  <div className="review-item__recommend">
                    <span className="review-item__recommend-icon">👍</span>
                    Consigliato
                  </div>
                )}
                {review.verified_purchase && (
                  <div className="review-item__verified">
                    <span className="review-item__verified-icon">✓</span>
                    Acquisto verificato
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList; 