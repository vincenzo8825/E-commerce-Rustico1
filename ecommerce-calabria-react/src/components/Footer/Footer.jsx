import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterSubscription from '../Newsletter/NewsletterSubscription';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__section">
          <h3 className="footer__title">Sapori di Calabria</h3>
          <p className="footer__description">
            La tua destinazione online per i migliori prodotti tipici calabresi, 
            selezionati con cura dai migliori produttori locali.
          </p>
          <address className="footer__contact">
            <p><i className="fas fa-map-marker-alt"></i> Via Calabria, 123 - 88100 Catanzaro (CZ)</p>
            <p><i className="fas fa-envelope"></i> info@saporidicalabria.it</p>
            <p><i className="fas fa-phone"></i> +39 0961 123456</p>
          </address>
        </div>
        
        <div className="footer__section">
          <h3 className="footer__title">Link Utili</h3>
          <ul className="footer__links">
            <li><Link to="/" className="footer__link">Home</Link></li>
            <li><Link to="/products" className="footer__link">Prodotti</Link></li>
            <li><Link to="/categories" className="footer__link">Categorie</Link></li>
            <li><Link to="/reviews" className="footer__link">Recensioni</Link></li>
            <li><Link to="/search" className="footer__link">Ricerca</Link></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3 className="footer__title">Informazioni Legali</h3>
          <ul className="footer__links">
            <li><Link to="/privacy-policy" className="footer__link">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="footer__link">Termini e Condizioni</Link></li>
            <li><Link to="/cookie-policy" className="footer__link">Cookie Policy</Link></li>
            <li><Link to="/shipping-returns" className="footer__link">Spedizioni e Resi</Link></li>
            <li><Link to="/warranties" className="footer__link">Garanzie</Link></li>
            <li><Link to="/right-of-withdrawal" className="footer__link">Diritto di Recesso</Link></li>
          </ul>
        </div>
        
        <div className="footer__section footer__newsletter">
          <div className="newsletter-compact">
            <NewsletterSubscription
              inline={true}
              showPreferences={false}
              title="Newsletter"
              description="Ricevi offerte esclusive e novità sui prodotti calabresi."
            />
          </div>
        </div>
      </div>
      
      <div className="footer__bottom">
        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} Sapori di Calabria. Tutti i diritti riservati.
        </p>
        <div className="footer__social">
          <a href="#" className="footer__social-link" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="footer__social-link" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="footer__social-link" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;