import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import { useToast } from '../../components/Toast/Toast';
import './Cart.scss';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      console.log("Dati carrello ricevuti:", response.data);
      setCart(response.data.cart);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento del carrello:', err);
      setError('Impossibile caricare il carrello. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.put('/cart/update', {
        cart_item_id: cartItemId,
        quantity
      });
      fetchCart();
    } catch (err) {
      console.error('Errore nell\'aggiornamento della quantità:', err);
      addToast(
        'Impossibile aggiornare la quantità. Riprova più tardi.',
        'error',
        4000
      );
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const itemToRemove = cart.items.find(item => item.id === cartItemId);
      await api.delete(`/cart/item/${cartItemId}`);
      
      addToast(
        `"${itemToRemove?.product?.name || 'Prodotto'}" rimosso dal carrello`,
        'info',
        3000
      );
      
      fetchCart();
    } catch (err) {
      console.error('Errore nella rimozione del prodotto:', err);
      addToast(
        'Impossibile rimuovere il prodotto dal carrello.',
        'error',
        4000
      );
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="cart">
        <div className="cart__container">
          <div className="cart__login-required">
            <h2>Accedi per visualizzare il tuo carrello</h2>
            <p>Devi effettuare l'accesso per poter aggiungere prodotti al carrello.</p>
            <Link to="/login?redirect=/cart" className="cart__login-button">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart">
        <div className="cart__container">
          <h1 className="cart__title">Il Tuo Carrello</h1>
          <div className="cart__loading">
            Caricamento carrello...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart">
        <div className="cart__container">
          <h1 className="cart__title">Il Tuo Carrello</h1>
          <div className="cart__error">
            <p>{error}</p>
            <button className="cart__button" onClick={fetchCart}>
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart">
        <div className="cart__container">
          <h1 className="cart__title">Il Tuo Carrello</h1>
          <div className="cart__empty">
            <p>Il tuo carrello è vuoto.</p>
            <Link to="/products" className="cart__button">
              Esplora i nostri prodotti
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart__container">
        <h1 className="cart__title">Il Tuo Carrello</h1>
        
        <div className="cart__content">
          <div className="cart__items">
            {cart.items.map(item => (
              <div key={item.id} className="cart__item">
                <div className="cart__item-product">
                  <div className="cart__item-image-container">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name} 
                        className="cart__item-image"
                      />
                    ) : (
                      <div className="cart__item-no-image">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="cart__item-details">
                    <Link to={`/products/${item.product.slug}`} className="cart__item-name">
                      {item.product.name}
                    </Link>
                  </div>
                </div>
                
                <div className="cart__item-price">
                  €{parseFloat(item.price).toFixed(2)}
                </div>
                
                <div className="cart__item-quantity">
                  <div className="cart__quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="cart__item-total">
                  €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
                
                <div className="cart__item-actions">
                  <button 
                    onClick={() => removeItem(item.id)}
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart__summary">
            <div className="cart__summary-row">
              <div className="cart__summary-label">Totale:</div>
              <div className="cart__summary-value">€{parseFloat(cart.total).toFixed(2)}</div>
            </div>
          </div>
          
          <div className="cart__actions">
            <Link 
              to="/checkout" 
              className="cart__action-btn cart__action-btn--checkout"
            >
              Procedi al Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;