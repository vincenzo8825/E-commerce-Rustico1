import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../Toast/Toast';
import api from '../../utils/api';
import './ProductRecommendations.scss';

const ProductRecommendations = ({ 
  productId = null, 
  categoryId = null, 
  type = 'homepage', // homepage, product, category
  limit = 8,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, [productId, categoryId, type]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let endpoint = '/recommendations/homepage';
      
      if (type === 'product' && productId) {
        endpoint = `/recommendations/product/${productId}`;
      } else if (type === 'category' && categoryId) {
        endpoint = `/recommendations/category/${categoryId}`;
      }

      const response = await api.get(`${endpoint}?limit=${limit}`);
      
      if (response.data.success) {
        setRecommendations(response.data.recommendations || {});
      } else {
        setError('Errore nel caricamento delle raccomandazioni');
      }
    } catch (err) {
      console.error('Errore raccomandazioni:', err);
      setError('Errore nel caricamento delle raccomandazioni');
      addToast('Errore nel caricamento delle raccomandazioni', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = async (productId, sectionType) => {
    // Traccia l'interazione per migliorare le raccomandazioni future
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/recommendations/track', {
          action: 'recommendation_click',
          product_id: productId,
          metadata: {
            section: sectionType,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Errore tracking click:', error);
    }
  };

  const renderProductCard = (product, sectionType) => (
    <div 
      key={product.id} 
      className="recommendation-card"
      onClick={() => handleProductClick(product.id, sectionType)}
    >
      <Link to={`/products/${product.slug || product.id}`} className="recommendation-card__link">
        <div className="recommendation-card__image">
          <img 
            src={product.image_url || product.main_image || '/images/placeholder-product.jpg'} 
            alt={product.name}
            loading="lazy"
          />
          {product.is_new && (
            <div className="recommendation-card__badge new">Nuovo</div>
          )}
          {product.discount_percentage > 0 && (
            <div className="recommendation-card__badge discount">
              -{product.discount_percentage}%
            </div>
          )}
        </div>
        
        <div className="recommendation-card__content">
          <h4 className="recommendation-card__title">{product.name}</h4>
          
          <div className="recommendation-card__rating">
            {product.reviews_avg_rating ? (
              <>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star ${i < Math.round(product.reviews_avg_rating) ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {product.reviews_avg_rating.toFixed(1)} ({product.reviews_count || 0})
                </span>
              </>
            ) : (
              <span className="no-rating">Nessuna recensione</span>
            )}
          </div>

          <div className="recommendation-card__price">
            {product.discount_price ? (
              <>
                <span className="current-price">€{product.discount_price.toFixed(2)}</span>
                <span className="original-price">€{product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="current-price">€{product.price.toFixed(2)}</span>
            )}
          </div>

          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="recommendation-card__stock-warning">
              Solo {product.stock_quantity} disponibili
            </div>
          )}

          {product.stock_quantity === 0 && (
            <div className="recommendation-card__out-of-stock">
              Esaurito
            </div>
          )}
        </div>
      </Link>
    </div>
  );

  const renderRecommendationSection = (sectionKey, sectionData, title, icon) => {
    if (!sectionData || sectionData.length === 0) return null;

    return (
      <div key={sectionKey} className="recommendation-section">
        <div className="recommendation-section__header">
          <h3>
            <i className={`fas ${icon}`}></i>
            {title}
          </h3>
          <span className="recommendation-section__count">
            {sectionData.length} prodotti
          </span>
        </div>
        
        <div className="recommendation-section__grid">
          {sectionData.map(product => renderProductCard(product, sectionKey))}
        </div>
      </div>
    );
  };

  const getSectionConfig = () => {
    const configs = {
      homepage: {
        trending: { title: 'Tendenze del Momento', icon: 'fa-fire' },
        best_rated: { title: 'Migliori Recensioni', icon: 'fa-star' },
        new_arrivals: { title: 'Nuovi Arrivi', icon: 'fa-sparkles' },
        for_you: { title: 'Per Te', icon: 'fa-heart' },
        based_on_history: { title: 'Basato sulla tua Cronologia', icon: 'fa-history' },
        favorite_category: { title: 'Dalla tua Categoria Preferita', icon: 'fa-thumbs-up' },
        popular: { title: 'Più Popolari', icon: 'fa-crown' }
      },
      product: {
        related: { title: 'Prodotti Correlati', icon: 'fa-sitemap' },
        frequently_bought: { title: 'Spesso Acquistati Insieme', icon: 'fa-shopping-basket' },
        similar: { title: 'Prodotti Simili', icon: 'fa-clone' },
        personalized: { title: 'Raccomandati per Te', icon: 'fa-user-check' }
      },
      category: {
        bestsellers: { title: 'I Più Venduti', icon: 'fa-trophy' },
        top_rated: { title: 'Meglio Valutati', icon: 'fa-medal' },
        newest: { title: 'Ultimi Arrivi', icon: 'fa-clock' },
        personalized: { title: 'Personalizzati', icon: 'fa-user-cog' }
      }
    };

    return configs[type] || configs.homepage;
  };

  if (isLoading) {
    return (
      <div className={`product-recommendations loading ${className}`}>
        <div className="recommendation-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-rating"></div>
                <div className="skeleton-price"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`product-recommendations error ${className}`}>
        <div className="recommendation-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={loadRecommendations} className="retry-btn">
            <i className="fas fa-redo"></i>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const sectionConfig = getSectionConfig();
  const hasRecommendations = Object.keys(recommendations).some(key => 
    recommendations[key] && recommendations[key].length > 0
  );

  if (!hasRecommendations) {
    return (
      <div className={`product-recommendations empty ${className}`}>
        <div className="recommendation-empty">
          <i className="fas fa-search"></i>
          <p>Nessuna raccomandazione disponibile al momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-recommendations ${className}`}>
      <div className="product-recommendations__container">
        {Object.entries(recommendations).map(([sectionKey, sectionData]) => {
          const config = sectionConfig[sectionKey];
          if (!config || !sectionData || sectionData.length === 0) return null;
          
          return renderRecommendationSection(
            sectionKey, 
            sectionData, 
            config.title, 
            config.icon
          );
        })}
      </div>

      {/* Footer statistiche */}
      <div className="product-recommendations__footer">
        <div className="recommendation-stats">
          <span>
            <i className="fas fa-chart-line"></i>
            Raccomandazioni intelligenti basate su AI
          </span>
          <span>
            <i className="fas fa-users"></i>
            Aggiornate in tempo reale
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations; 