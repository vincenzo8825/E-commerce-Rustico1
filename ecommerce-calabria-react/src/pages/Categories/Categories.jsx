import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Categories.scss';
import api from '../../utils/api';

// Immagini placeholder - in produzione sarebbero sostituite da immagini reali dal backend
const placeholderImages = {
  'olio': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Olio+d%27oliva+Calabrese',
  'formaggi': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Formaggi+Calabresi',
  'salumi': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Salumi+Calabresi',
  'conserve': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Conserve+Calabresi',
  'pasta': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Pasta+Calabrese',
  'vini': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Vini+Calabresi',
  'dolci': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Dolci+Calabresi',
  'liquori': 'https://via.placeholder.com/400x300/e9ecef/495057?text=Liquori+Calabresi'
};

const getPlaceholderImage = (categoryName) => {
  const key = categoryName.toLowerCase().split(' ')[0];
  return placeholderImages[key] || 'https://via.placeholder.com/400x300/e9ecef/495057?text=Prodotti+Calabresi';
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      
      const allCategories = response.data.categories || [];
      setCategories(allCategories);
      
      // Seleziona alcune categorie in evidenza (es. le prime 4 o categorie con flag is_featured)
      const featured = allCategories.filter(cat => cat.is_featured).slice(0, 4);
      setFeaturedCategories(featured.length ? featured : allCategories.slice(0, 4));
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
      setError('Impossibile caricare le categorie. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categories">
      <div className="categories__container">
        <h1 className="categories__title">Categorie</h1>
        <p className="categories__description">
          Esplora le nostre categorie di prodotti tipici calabresi, selezionati con cura per preservare 
          i sapori autentici della tradizione calabrese.
        </p>

        {error ? (
          <div className="categories__error">
            <p>{error}</p>
            <button 
              className="categories__button"
              onClick={fetchCategories}
            >
              Riprova
            </button>
          </div>
        ) : loading ? (
          <div className="categories__loading">
            Caricamento categorie...
          </div>
        ) : (
          <>
            {/* Categorie in evidenza */}
            {featuredCategories.length > 0 && (
              <div className="categories__featured">
                <h2 className="categories__section-title">Categorie in Evidenza</h2>
                <div className="categories__featured-grid">
                  {featuredCategories.map(category => (
                    <Link 
                      to={`/products?category=${category.slug}`} 
                      key={category.id}
                      className="category-card category-card--featured"
                    >
                      <div className="category-card__image-container">
                        <img 
                          src={category.image_url || getPlaceholderImage(category.name)}
                          alt={category.name}
                          className="category-card__image"
                        />
                        <div className="category-card__overlay">
                          <h3 className="category-card__title">{category.name}</h3>
                          <span className="category-card__products-count">
                            {category.products_count || 0} prodotti
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tutte le categorie */}
            <div className="categories__all">
              <h2 className="categories__section-title">Tutte le Categorie</h2>
              <div className="categories__grid">
                {categories.map(category => (
                  <Link 
                    to={`/products?category=${category.slug}`} 
                    key={category.id}
                    className="category-card"
                  >
                    <div className="category-card__image-container">
                      <img 
                        src={category.image_url || getPlaceholderImage(category.name)}
                        alt={category.name}
                        className="category-card__image"
                      />
                      <div className="category-card__overlay">
                        <h3 className="category-card__title">{category.name}</h3>
                        <span className="category-card__products-count">
                          {category.products_count || 0} prodotti
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;