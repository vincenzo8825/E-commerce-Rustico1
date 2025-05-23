import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import { useToast } from '../../components/Toast/Toast';
import { useCart } from '../../contexts/CartContext';
import './Products.scss';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { addToast } = useToast();
  const { incrementCart, incrementFavorites } = useCart();
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceMin: '',
    priceMax: '',
    sort: 'name'
  });

  useEffect(() => {
    // Carica le categorie per i filtri
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Errore nel caricamento delle categorie:', err);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [currentPage, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Costruisce i parametri di query
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.priceMin) params.append('price_min', filters.priceMin);
      if (filters.priceMax) params.append('price_max', filters.priceMax);
      if (filters.sort) params.append('sort_by', filters.sort);
      params.append('page', currentPage);
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products.data || []);
      setTotalPages(response.data.products.last_page || 1);
      setTotalCount(response.data.products.total || 0);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err);
      setError('Impossibile caricare i prodotti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset alla prima pagina quando cambia un filtro
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Funzione per aggiungere al carrello
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      // Reindirizza alla pagina di login se non autenticato
      window.location.href = `/login?redirect=/products?page=${currentPage}`;
      return;
    }

    // Verifica se l'email è stata verificata
    const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
    if (!authData.emailVerified) {
      addToast(
        'È necessario verificare l\'email prima di aggiungere prodotti al carrello. Controlla la tua casella di posta.',
        'warning',
        4000
      );
      return;
    }

    try {
      await api.post('/cart/add', {
        product_id: productId,
        quantity
      });
      
      const addedProduct = products.find(p => p.id === productId);
      addToast(
        `🛒 "${addedProduct?.name || 'Prodotto'}" aggiunto al carrello!`,
        'success',
        3500
      );
      
      // Aggiorna il contatore del carrello
      incrementCart(quantity);
    } catch (err) {
      console.error('Errore nell\'aggiunta al carrello:', err);
      // Mostra il messaggio di errore dal server se disponibile
      const errorMessage = err.response?.data?.message || 'Impossibile aggiungere il prodotto al carrello. Riprova più tardi.';
      addToast(errorMessage, 'error', 4000);
    }
  };

  // Funzione per aggiungere ai preferiti
  const addToFavorites = async (productId) => {
    if (!isAuthenticated()) {
      // Reindirizza alla pagina di login se non autenticato
      window.location.href = `/login?redirect=/products?page=${currentPage}`;
      return;
    }

    // Verifica se l'email è stata verificata
    const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
    if (!authData.emailVerified) {
      addToast(
        'È necessario verificare l\'email prima di aggiungere prodotti ai preferiti. Controlla la tua casella di posta.',
        'warning',
        4000
      );
      return;
    }

    try {
      await api.post('/favorites/add', {
        product_id: productId
      });
      
      const addedProduct = products.find(p => p.id === productId);
      addToast(
        `❤️ "${addedProduct?.name || 'Prodotto'}" aggiunto ai preferiti!`,
        'success',
        3500
      );
      
      // Aggiorna il contatore dei preferiti
      incrementFavorites();
    } catch (err) {
      console.error('Errore nell\'aggiunta ai preferiti:', err);
      addToast(
        'Impossibile aggiungere il prodotto ai preferiti. Riprova più tardi.',
        'error',
        4000
      );
    }
  };

  return (
    <div className="products">
      <div className="products__container">
        <h1 className="products__title">I Nostri Prodotti</h1>
        <p className="products__description">
          Esplora la nostra selezione di prodotti tipici calabresi, realizzati con ingredienti di alta qualità e secondo le tradizioni della nostra regione.
        </p>

        {/* Filtri */}
        <div className="products__filters">
          <form onSubmit={handleSearch} className="products__filter-form">
            <div className="products__filter-row">
              <div className="products__filter-group">
                <label htmlFor="search" className="products__filter-label">Cerca</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="products__filter-input"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Nome o descrizione"
                />
              </div>
              
              <div className="products__filter-group">
                <label htmlFor="category" className="products__filter-label">Categoria</label>
                <select
                  id="category"
                  name="category"
                  className="products__filter-select"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Tutte le categorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="products__filter-group products__filter-group--price">
                <label className="products__filter-label">Prezzo</label>
                <div className="products__filter-price-inputs">
                  <input
                    type="number"
                    id="priceMin"
                    name="priceMin"
                    className="products__filter-input products__filter-input--price"
                    value={filters.priceMin}
                    onChange={handleFilterChange}
                    placeholder="Min €"
                    min="0"
                    step="0.01"
                  />
                  <span className="products__filter-price-separator">-</span>
                  <input
                    type="number"
                    id="priceMax"
                    name="priceMax"
                    className="products__filter-input products__filter-input--price"
                    value={filters.priceMax}
                    onChange={handleFilterChange}
                    placeholder="Max €"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="products__filter-group">
                <label htmlFor="sort" className="products__filter-label">Ordina per</label>
                <select
                  id="sort"
                  name="sort"
                  className="products__filter-select"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="name">Nome (A-Z)</option>
                  <option value="-name">Nome (Z-A)</option>
                  <option value="price">Prezzo (crescente)</option>
                  <option value="-price">Prezzo (decrescente)</option>
                  <option value="-created_at">Più recenti</option>
                </select>
              </div>
              
              <div className="products__filter-group products__filter-group--submit">
                <button type="submit" className="products__filter-button">
                  Filtra
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Contenuto Principale */}
        <div className="products__content">
          {error ? (
            <div className="products__error">
              <p>{error}</p>
              <button
                className="products__button"
                onClick={fetchProducts}
              >
                Riprova
              </button>
            </div>
          ) : loading && products.length === 0 ? (
            <div className="products__loading">
              Caricamento prodotti...
            </div>
          ) : products.length === 0 ? (
            <div className="products__empty">
              <p>Nessun prodotto trovato con i filtri selezionati.</p>
              <button
                className="products__button"
                onClick={() => {
                  setFilters({
                    search: '',
                    category: '',
                    priceMin: '',
                    priceMax: '',
                    sort: 'name'
                  });
                  setCurrentPage(1);
                }}
              >
                Reimposta filtri
              </button>
            </div>
          ) : (
            <>
              <div className="products__results-count">
                {totalCount === 0 
                  ? 'Nessun prodotto trovato'
                  : totalCount === 1 
                    ? 'Trovato 1 prodotto'
                    : `Trovati ${totalCount} prodotti`
                }
                {totalPages > 1 && (
                  <span className="products__results-page-info">
                    {' '}(pagina {currentPage} di {totalPages})
                  </span>
                )}
              </div>
              
              <div className="products__grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <Link to={`/products/${product.slug}`} className="product-card__link">
                      <div className="product-card__image-container">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name} 
                            className="product-card__image"
                          />
                        ) : (
                          <div className="product-card__no-image">
                            Immagine non disponibile
                          </div>
                        )}
                        
                        {product.discount_price && (
                          <span className="product-card__discount-badge">
                            Offerta
                          </span>
                        )}
                      </div>
                      
                      <div className="product-card__content">
                        <h3 className="product-card__title">{product.name}</h3>
                        
                        <div className="product-card__category">
                          {product.category?.name || ''}
                        </div>
                        
                        <div className="product-card__price-container">
                          {product.discount_price ? (
                            <>
                              <span className="product-card__price product-card__price--discounted">
                                €{parseFloat(product.price).toFixed(2)}
                              </span>
                              <span className="product-card__price product-card__price--current">
                                €{parseFloat(product.discount_price).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="product-card__price">
                              €{parseFloat(product.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    
                    <div className="product-card__actions">
                      <button 
                        className="product-card__action-btn product-card__action-btn--cart"
                        onClick={() => addToCart(product.id)}
                      >
                        Aggiungi al Carrello
                      </button>
                      <button 
                        className="product-card__action-btn product-card__action-btn--favorite"
                        onClick={() => addToFavorites(product.id)}
                      >
                        ♡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="products__pagination">
                  <button
                    className="products__pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Precedente
                  </button>
                  
                  <div className="products__pagination-numbers">
                    {[...Array(totalPages).keys()].map(index => {
                      const pageNumber = index + 1;
                      // Mostra solo le pagine intorno a quella corrente
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            className={`products__pagination-number ${
                              pageNumber === currentPage ? 'products__pagination-number--active' : ''
                            }`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="products__pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    className="products__pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Successiva
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;