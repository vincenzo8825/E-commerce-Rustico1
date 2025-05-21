import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../common/LazyImage';
import './CategoryCard.scss';

const CategoryCard = ({ category }) => {
  const { name, image, slug, productCount } = category;
  
  // Immagine placeholder se non disponibile
  const placeholderImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`;
  
  return (
    <Link to={`/products?category=${slug}`} className="category-card">
      <div className="category-card__image-container">
        <LazyImage 
          src={image || placeholderImage} 
          alt={name} 
          className="category-card__image" 
        />
        <div className="category-card__overlay">
          <h3 className="category-card__title">{name}</h3>
          <p className="category-card__count">{productCount} prodotti</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;