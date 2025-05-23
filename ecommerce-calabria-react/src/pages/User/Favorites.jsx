import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import { SafeImage, getFirstValidImageUrl } from '../../utils/imageUtils.jsx';
import { useToast } from '../../components/Toast/Toast';
import { useCart } from '../../contexts/CartContext';
import './Favorites.scss';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const { incrementCart, decrementFavorites } = useCart();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/favorites');
      setFavorites(response.data.favorites || []);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei preferiti:', err);
      setError('Impossibile caricare i preferiti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      // Rimuove il prodotto dalla lista locale senza ricaricare tutti i preferiti
      const removedProduct = favorites.find(fav => fav.product.id === productId);
      setFavorites(favorites.filter(fav => fav.product.id !== productId));
      
      // Aggiorna il contatore dei preferiti
      decrementFavorites();
      
      addToast(
        `"${removedProduct?.product?.name || 'Prodotto'}" rimosso dai preferiti`, 
        'info', 
        3000
      );
    } catch (err) {
      console.error('Errore nella rimozione del preferito:', err);
      addToast(
        'Impossibile rimuovere il prodotto dai preferiti. Riprova più tardi.', 
        'error', 
        4000
      );
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      // Reindirizza alla pagina di login se non autenticato
      window.location.href = '/login?redirect=/favorites';
      return;
    }

    try {
      await api.post('/cart/add', {
        product_id: productId,
        quantity
      });
      
      // Aggiorna il contatore del carrello
      incrementCart(quantity);
      
      const addedProduct = favorites.find(fav => fav.product.id === productId);
      addToast(
        `🛒 "${addedProduct?.product?.name || 'Prodotto'}" aggiunto al carrello!`, 
        'success', 
        3500
      );
    } catch (err) {
      console.error('Errore nell\'aggiunta al carrello:', err);
      addToast(
        'Impossibile aggiungere il prodotto al carrello. Riprova più tardi.', 
        'error', 
        4000
      );
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="favorites">
        <div className="favorites__container">
          <div className="favorites__login-required">
            <h2>Accedi per visualizzare i tuoi preferiti</h2>
            <p>Devi effettuare l'accesso per poter salvare e visualizzare i tuoi prodotti preferiti.</p>
            <Link to="/login?redirect=/favorites" className="favorites__login-button">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites__container">
        <h1 className="favorites__title">I Miei Preferiti</h1>

        {error ? (
          <div className="favorites__error">
            <p>{error}</p>
            <button 
              className="favorites__button" 
              onClick={fetchFavorites}
            >
              Riprova
            </button>
          </div>
        ) : loading ? (
          <div className="favorites__loading">
            Caricamento preferiti...
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites__empty">
            <p>Non hai ancora prodotti nei preferiti.</p>
            <Link to="/products" className="favorites__button">
              Esplora i nostri prodotti
            </Link>
          </div>
        ) : (
          <div className="favorites__grid">
            {favorites.map(favorite => (
              <div key={favorite.id} className="favorite-card">
                <Link to={`/products/${favorite.product.slug}`} className="favorite-card__link">
                  <div className="favorite-card__image-container">
                    <SafeImage 
                      src={getFirstValidImageUrl(favorite.product.images)} 
                      alt={favorite.product.name} 
                      className="favorite-card__image"
                      fallback={
                        <div className="favorite-card__no-image">
                          Immagine non disponibile
                        </div>
                      }
                    />
                    
                    {favorite.product.discount_price && (
                      <span className="favorite-card__discount-badge">
                        Offerta
                      </span>
                    )}
                  </div>
                  
                  <div className="favorite-card__content">
                    <h3 className="favorite-card__title">{favorite.product.name}</h3>
                    
                    <div className="favorite-card__category">
                      {favorite.product.category?.name || ''}
                    </div>
                    
                    <div className="favorite-card__price-container">
                      {favorite.product.discount_price ? (
                        <>
                          <span className="favorite-card__price favorite-card__price--discounted">
                            €{parseFloat(favorite.product.price).toFixed(2)}
                          </span>
                          <span className="favorite-card__price favorite-card__price--current">
                            €{parseFloat(favorite.product.discount_price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="favorite-card__price">
                          €{parseFloat(favorite.product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="favorite-card__actions">
                  <button 
                    className="favorite-card__action-btn favorite-card__action-btn--cart"
                    onClick={() => addToCart(favorite.product.id)}
                  >
                    Aggiungi al Carrello
                  </button>
                  <button 
                    className="favorite-card__action-btn favorite-card__action-btn--remove"
                    onClick={() => removeFavorite(favorite.product.id)}
                  >
                    Rimuovi
                  </button>
                </div>
                
                <div className="favorite-card__added-date">
                  Aggiunto il: {new Date(favorite.created_at).toLocaleDateString('it-IT')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 