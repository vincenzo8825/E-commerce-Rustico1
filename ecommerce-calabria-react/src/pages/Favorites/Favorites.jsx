import React from 'react';
import { Link } from 'react-router-dom';
import './Favorites.scss';

const Favorites = () => {
  // Esempio di preferiti vuoti per ora
  const isFavoritesEmpty = true;

  return (
    <div className="favorites">
      <div className="favorites__container">
        <h1 className="favorites__title">I Tuoi Preferiti</h1>
        
        {isFavoritesEmpty ? (
          <div className="favorites__empty">
            <p className="favorites__empty-message">Non hai ancora aggiunto prodotti ai preferiti.</p>
            <p className="favorites__empty-suggestion">
              Esplora i nostri prodotti e aggiungi quelli che ti piacciono ai preferiti!
            </p>
            <Link to="/products" className="favorites__empty-button">
              Vai ai Prodotti
            </Link>
          </div>
        ) : (
          <div className="favorites__content">
            {/* Qui andrà il contenuto dei preferiti quando implementeremo la logica */}
            <p>Contenuto dei preferiti in fase di sviluppo...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;