import React from 'react';
import { Link } from 'react-router-dom';
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
        </div>
        
        <div className="footer__section">
          <h3 className="footer__title">Link Utili</h3>
          <ul className="footer__links">
            <li><Link to="/" className="footer__link">Home</Link></li>
            <li><Link to="/products" className="footer__link">Prodotti</Link></li>
            <li><Link to="/categories" className="footer__link">Categorie</Link></li>
            <li><Link to="/reviews" className="footer__link">Recensioni</Link></li>
            <li><Link to="/about" className="footer__link">Chi Siamo</Link></li>
            <li><Link to="/contact" className="footer__link">Contatti</Link></li>
          </ul>
        </div>
        
        <div className="footer__section">
          <h3 className="footer__title">Contatti</h3>
          <address className="footer__contact">
            <p>Via Calabria, 123</p>
            <p>88100 Catanzaro (CZ)</p>
            <p>Email: info@saporidicalabria.it</p>
            <p>Tel: +39 0961 123456</p>
          </address>
        </div>
      </div>
      
      <div className="footer__bottom">
        <p className="footer__copyright">
          &copy; {new Date().getFullYear()} Sapori di Calabria. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
};

export default Footer;