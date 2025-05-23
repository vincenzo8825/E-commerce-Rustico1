import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { isAuthenticated } from '../utils/auth';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve essere usato all\'interno di CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Funzione per aggiornare il contatore del carrello
  const updateCartCount = async () => {
    if (!isAuthenticated()) {
      setCartCount(0);
      return;
    }

    try {
      const response = await api.get('/cart');
      const cart = response.data.cart;
      if (cart && cart.items) {
        const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Errore nel caricamento del carrello:', error);
      setCartCount(0);
    }
  };

  // Funzione per aggiornare il contatore dei preferiti
  const updateFavoritesCount = async () => {
    if (!isAuthenticated()) {
      setFavoritesCount(0);
      return;
    }

    try {
      const response = await api.get('/favorites');
      const favorites = response.data.favorites || [];
      setFavoritesCount(favorites.length);
    } catch (error) {
      console.error('Errore nel caricamento dei preferiti:', error);
      setFavoritesCount(0);
    }
  };

  // Funzione per incrementare il carrello
  const incrementCart = (quantity = 1) => {
    setCartCount(prev => prev + quantity);
  };

  // Funzione per decrementare il carrello
  const decrementCart = (quantity = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  };

  // Funzione per incrementare i preferiti
  const incrementFavorites = () => {
    setFavoritesCount(prev => prev + 1);
  };

  // Funzione per decrementare i preferiti
  const decrementFavorites = () => {
    setFavoritesCount(prev => Math.max(0, prev - 1));
  };

  // Carica i contatori iniziali
  useEffect(() => {
    const loadCounts = async () => {
      setLoading(true);
      await Promise.all([
        updateCartCount(),
        updateFavoritesCount()
      ]);
      setLoading(false);
    };

    if (isAuthenticated()) {
      loadCounts();
    } else {
      setCartCount(0);
      setFavoritesCount(0);
      setLoading(false);
    }

    // Listener per gli eventi di storage (login/logout in altre tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Utente ha fatto login
          loadCounts();
        } else {
          // Utente ha fatto logout
          setCartCount(0);
          setFavoritesCount(0);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    cartCount,
    favoritesCount,
    loading,
    updateCartCount,
    updateFavoritesCount,
    incrementCart,
    decrementCart,
    incrementFavorites,
    decrementFavorites
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 