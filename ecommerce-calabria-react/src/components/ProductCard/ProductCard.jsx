import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../common/LazyImage';
import './ProductCard.scss';

const ProductCard = ({ product }) => {
  const { id, name, image, slug, price, description } = product;
  
  // Immagine placeholder se non disponibile
  const placeholderImage = 'https://via.placeholder.com/300x200?text=Prodotto';
  
  return (
    <div className="product-card">
      <div className="product-card__image-container">
        <LazyImage 
          src={image || placeholderImage} 
          alt={name} 
          className="product-card__image" 
        />
      </div>
      <div className="product-card__content">
        <h3 className="product-card__title">{name}</h3>
        <p className="product-card__description">{description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{parseFloat(price).toFixed(2)} €</span>
          <Link to={`/products/${slug || id}`} className="product-card__button">
            Dettagli
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;