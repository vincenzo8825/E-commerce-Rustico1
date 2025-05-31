import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.scss';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__content">
          <div className="not-found__number">404</div>
          <h1 className="not-found__title">Pagina Non Trovata</h1>
          <p className="not-found__description">
            Ci dispiace, la pagina che stai cercando non esiste o è stata spostata.
          </p>
          <div className="not-found__actions">
            <Link to="/" className="not-found__btn not-found__btn--primary">
              Torna alla Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="not-found__btn not-found__btn--secondary"
            >
              Torna Indietro
            </button>
          </div>
          <div className="not-found__links">
            <p className="not-found__help-text">Oppure prova a visitare:</p>
            <ul className="not-found__link-list">
              <li><Link to="/products" className="not-found__link">I Nostri Prodotti</Link></li>
              <li><Link to="/categories" className="not-found__link">Categorie</Link></li>
              <li><Link to="/reviews" className="not-found__link">Recensioni</Link></li>
              <li><Link to="/search" className="not-found__link">Ricerca</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="not-found__illustration">
          <div className="not-found__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                fill="currentColor"
              />
            </svg>
          </div>
          <p className="not-found__icon-text">
            Non preoccuparti, i nostri prodotti calabresi ti aspettano!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 