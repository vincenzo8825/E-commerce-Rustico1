import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isInFavorites, setIsInFavorites] = useState(false);

  useEffect(() => {
    // Reset lo stato quando cambia lo slug
    setLoading(true);
    setError(null);
    setProduct(null);
    setRelatedProducts([]);
    setQuantity(1);
    setActiveImage(0);
    setIsInFavorites(false);
    
    fetchProductDetail();
  }, [slug]);

  const fetchProductDetail = async () => {
    try {
      const response = await api.get(`/products/${slug}`);
      setProduct(response.data.product);
      
      // Carica prodotti correlati
      if (response.data.product && response.data.product.category_id) {
        fetchRelatedProducts(response.data.product.id, response.data.product.category_id);
      }
      
      // Verifica se il prodotto è nei preferiti (solo se l'utente è autenticato)
      if (isAuthenticated()) {
        checkIfInFavorites(response.data.product.id);
      }
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento del prodotto:', err);
      setError('Impossibile caricare i dettagli del prodotto. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (productId, categoryId) => {
    try {
      const response = await api.get(`/products/related/${productId}?category_id=${categoryId}`);
      setRelatedProducts(response.data.products || []);
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti correlati:', err);
    }
  };

  const checkIfInFavorites = async (productId) => {
    try {
      const response = await api.get('/favorites');
      const favorites = response.data.favorites || [];
      setIsInFavorites(favorites.some(fav => fav.product.id === productId));
    } catch (err) {
      console.error('Errore nel controllo dei preferiti:', err);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      // Reindirizza alla pagina di login se non autenticato
      window.location.href = `/login?redirect=/products/${slug}`;
      return;
    }

    // Verifica se l'email è stata verificata
    const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
    if (!authData.emailVerified) {
      alert('È necessario verificare l\'email prima di aggiungere prodotti al carrello. Controlla la tua casella di posta.');
      return;
    }

    try {
      await api.post('/cart/add', {
        product_id: product.id,
        quantity: quantity
      });
      alert('Prodotto aggiunto al carrello!');
    } catch (err) {
      console.error('Errore nell\'aggiunta al carrello:', err);
      // Mostra il messaggio di errore dal server se disponibile
      const errorMessage = err.response?.data?.message || 'Impossibile aggiungere il prodotto al carrello. Riprova più tardi.';
      alert(errorMessage);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated()) {
      // Reindirizza alla pagina di login se non autenticato
      window.location.href = `/login?redirect=/products/${slug}`;
      return;
    }

    // Verifica se l'email è stata verificata
    const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
    if (!authData.emailVerified) {
      alert('È necessario verificare l\'email prima di aggiungere prodotti ai preferiti. Controlla la tua casella di posta.');
      return;
    }

    try {
      if (isInFavorites) {
        // Rimuovi dai preferiti
        await api.delete(`/favorites/${product.id}`);
        setIsInFavorites(false);
        alert('Prodotto rimosso dai preferiti!');
      } else {
        // Aggiungi ai preferiti
        await api.post('/favorites/add', {
          product_id: product.id
        });
        setIsInFavorites(true);
        alert('Prodotto aggiunto ai preferiti!');
      }
    } catch (err) {
      console.error('Errore nella gestione dei preferiti:', err);
      alert('Impossibile gestire i preferiti. Riprova più tardi.');
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__loading">
            Caricamento dettagli prodotto...
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__error">
            <p>{error || 'Prodotto non trovato'}</p>
            <Link to="/products" className="product-detail__button">
              Torna ai prodotti
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        <div className="product-detail__breadcrumb">
          <Link to="/" className="product-detail__breadcrumb-link">Home</Link>
          <span className="product-detail__breadcrumb-separator">›</span>
          <Link to="/products" className="product-detail__breadcrumb-link">Prodotti</Link>
          {product.category && (
            <>
              <span className="product-detail__breadcrumb-separator">›</span>
              <Link 
                to={`/products?category=${product.category.id}`} 
                className="product-detail__breadcrumb-link"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="product-detail__breadcrumb-separator">›</span>
          <span className="product-detail__breadcrumb-current">{product.name}</span>
        </div>

        <div className="product-detail__content">
          <div className="product-detail__gallery">
            {/* Immagine principale */}
            <div className="product-detail__main-image-container">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.name}
                  className="product-detail__main-image"
                />
              ) : (
                <div className="product-detail__no-image">
                  Immagine non disponibile
                </div>
              )}
              
              {product.discount_price && (
                <span className="product-detail__discount-badge">
                  Offerta
                </span>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="product-detail__thumbnails">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`product-detail__thumbnail-container ${
                      index === activeImage ? 'product-detail__thumbnail-container--active' : ''
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - Immagine ${index + 1}`}
                      className="product-detail__thumbnail"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="product-detail__info">
            <h1 className="product-detail__title">{product.name}</h1>
            
            <div className="product-detail__category">
              Categoria: {product.category?.name || 'Non specificata'}
            </div>
            
            <div className="product-detail__price-container">
              {product.discount_price ? (
                <>
                  <span className="product-detail__price product-detail__price--discounted">
                    €{parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="product-detail__price">
                    €{parseFloat(product.discount_price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="product-detail__price">
                  €{parseFloat(product.price).toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="product-detail__stock">
              {product.stock > 10 ? (
                <span className="product-detail__stock-status product-detail__stock-status--in">
                  Disponibile
                </span>
              ) : product.stock > 0 ? (
                <span className="product-detail__stock-status product-detail__stock-status--low">
                  Solo {product.stock} {product.stock === 1 ? 'pezzo disponibile' : 'pezzi disponibili'}
                </span>
              ) : (
                <span className="product-detail__stock-status product-detail__stock-status--out">
                  Esaurito
                </span>
              )}
            </div>
            
            <div className="product-detail__short-description">
              {product.short_description || product.description.substring(0, 150) + '...'}
            </div>
            
            {product.stock > 0 && (
              <div className="product-detail__actions">
                <div className="product-detail__quantity">
                  <label htmlFor="quantity" className="product-detail__quantity-label">
                    Quantità:
                  </label>
                  <div className="product-detail__quantity-controls">
                    <button
                      type="button"
                      className="product-detail__quantity-btn"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="product-detail__quantity-input"
                    />
                    <button
                      type="button"
                      className="product-detail__quantity-btn"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="product-detail__buttons">
                  <button
                    type="button"
                    className="product-detail__button product-detail__button--cart"
                    onClick={handleAddToCart}
                  >
                    Aggiungi al Carrello
                  </button>
                  <button
                    type="button"
                    className="product-detail__button product-detail__button--favorite"
                    onClick={handleAddToFavorites}
                  >
                    {isInFavorites ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="product-detail__meta">
              {product.sku && (
                <div className="product-detail__meta-item">
                  <span className="product-detail__meta-label">SKU:</span>
                  <span className="product-detail__meta-value">{product.sku}</span>
                </div>
              )}
              
              {product.weight && (
                <div className="product-detail__meta-item">
                  <span className="product-detail__meta-label">Peso:</span>
                  <span className="product-detail__meta-value">{product.weight} g</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="product-detail__tabs">
          <div className="product-detail__tab product-detail__tab--active">
            <h2 className="product-detail__tab-title">Descrizione</h2>
            <div className="product-detail__tab-content">
              <div className="product-detail__description" dangerouslySetInnerHTML={{ __html: product.description }}></div>
            </div>
          </div>
        </div>
        
        {/* Prodotti correlati */}
        {relatedProducts.length > 0 && (
          <div className="product-detail__related">
            <h2 className="product-detail__related-title">Prodotti Correlati</h2>
            <div className="product-detail__related-grid">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="product-card">
                  <Link to={`/products/${relatedProduct.slug}`} className="product-card__link">
                    <div className="product-card__image-container">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <img 
                          src={relatedProduct.images[0].url} 
                          alt={relatedProduct.name} 
                          className="product-card__image"
                        />
                      ) : (
                        <div className="product-card__no-image">
                          Immagine non disponibile
                        </div>
                      )}
                      
                      {relatedProduct.discount_price && (
                        <span className="product-card__discount-badge">
                          Offerta
                        </span>
                      )}
                    </div>
                    
                    <div className="product-card__content">
                      <h3 className="product-card__title">{relatedProduct.name}</h3>
                      
                      <div className="product-card__price-container">
                        {relatedProduct.discount_price ? (
                          <>
                            <span className="product-card__price product-card__price--discounted">
                              €{parseFloat(relatedProduct.price).toFixed(2)}
                            </span>
                            <span className="product-card__price product-card__price--current">
                              €{parseFloat(relatedProduct.discount_price).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="product-card__price">
                            €{parseFloat(relatedProduct.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="product-card__actions">
                    <button 
                      className="product-card__action-btn product-card__action-btn--cart"
                      onClick={() => {
                        if (!isAuthenticated()) {
                          window.location.href = `/login?redirect=/products/${slug}`;
                          return;
                        }

                        // Verifica se l'email è stata verificata
                        const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
                        if (!authData.emailVerified) {
                          alert('È necessario verificare l\'email prima di aggiungere prodotti al carrello. Controlla la tua casella di posta.');
                          return;
                        }

                        api.post('/cart/add', {
                          product_id: relatedProduct.id,
                          quantity: 1
                        })
                        .then(() => alert('Prodotto aggiunto al carrello!'))
                        .catch(err => {
                          console.error('Errore nell\'aggiunta al carrello:', err);
                          const errorMessage = err.response?.data?.message || 'Impossibile aggiungere il prodotto al carrello.';
                          alert(errorMessage);
                        });
                      }}
                    >
                      Aggiungi al Carrello
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 