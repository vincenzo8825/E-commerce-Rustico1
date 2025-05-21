import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Search.scss';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: searchQuery,
    category: queryParams.get('category') || '',
    priceMin: queryParams.get('price_min') || '',
    priceMax: queryParams.get('price_max') || '',
    sort: queryParams.get('sort') || 'relevance'
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
  }, []);

  useEffect(() => {
    // Aggiorna il termine di ricerca quando cambia l'URL
    const searchFromUrl = queryParams.get('q') || '';
    setFilters(prev => ({ ...prev, search: searchFromUrl }));
    
    if (searchFromUrl) {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [location.search]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      
      // Costruisce i parametri di query
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.category) params.append('category_id', filters.category);
      if (filters.priceMin) params.append('price_min', filters.priceMin);
      if (filters.priceMax) params.append('price_max', filters.priceMax);
      params.append('sort', filters.sort);
      params.append('page', currentPage);
      
      const response = await api.get(`/products/search?${params.toString()}`);
      setSearchResults(response.data.products.data || []);
      setTotalPages(response.data.products.last_page || 1);
      setError(null);
    } catch (err) {
      console.error('Errore nella ricerca prodotti:', err);
      setError('Impossibile completare la ricerca. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // Aggiorna l'URL con i parametri di ricerca
    const params = new URLSearchParams();
    if (filters.search) params.append('q', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.priceMin) params.append('price_min', filters.priceMin);
    if (filters.priceMax) params.append('price_max', filters.priceMax);
    if (filters.sort !== 'relevance') params.append('sort', filters.sort);
    
    navigate(`/search?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchSearchResults();
  };

  return (
    <div className="search">
      <div className="search__container">
        <h1 className="search__title">
          {filters.search 
            ? `Risultati per: "${filters.search}"`
            : 'Cerca Prodotti'
          }
        </h1>

        {/* Form di ricerca */}
        <div className="search__form-container">
          <form onSubmit={handleSearch} className="search__form">
            <div className="search__form-main">
              <input
                type="text"
                name="search"
                className="search__input"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Cosa stai cercando?"
                aria-label="Cerca prodotti"
              />
              <button type="submit" className="search__button">
                Cerca
              </button>
            </div>

            <div className="search__filters">
              <div className="search__filter-group">
                <label htmlFor="category" className="search__filter-label">Categoria</label>
                <select
                  id="category"
                  name="category"
                  className="search__filter-select"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Tutte le categorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="search__filter-group search__filter-group--price">
                <label className="search__filter-label">Prezzo</label>
                <div className="search__filter-price-inputs">
                  <input
                    type="number"
                    id="priceMin"
                    name="priceMin"
                    className="search__filter-input search__filter-input--price"
                    value={filters.priceMin}
                    onChange={handleFilterChange}
                    placeholder="Min €"
                    min="0"
                    step="0.01"
                  />
                  <span className="search__filter-price-separator">-</span>
                  <input
                    type="number"
                    id="priceMax"
                    name="priceMax"
                    className="search__filter-input search__filter-input--price"
                    value={filters.priceMax}
                    onChange={handleFilterChange}
                    placeholder="Max €"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="search__filter-group">
                <label htmlFor="sort" className="search__filter-label">Ordina per</label>
                <select
                  id="sort"
                  name="sort"
                  className="search__filter-select"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="relevance">Rilevanza</option>
                  <option value="name">Nome (A-Z)</option>
                  <option value="-name">Nome (Z-A)</option>
                  <option value="price">Prezzo (crescente)</option>
                  <option value="-price">Prezzo (decrescente)</option>
                  <option value="-created_at">Più recenti</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Risultati di ricerca */}
        <div className="search__results">
          {error ? (
            <div className="search__error">
              <p>{error}</p>
              <button
                className="search__retry-button"
                onClick={fetchSearchResults}
              >
                Riprova
              </button>
            </div>
          ) : loading ? (
            <div className="search__loading">
              Ricerca in corso...
            </div>
          ) : filters.search && searchResults.length === 0 ? (
            <div className="search__no-results">
              <p>Nessun prodotto trovato per "{filters.search}".</p>
              <p>Prova con termini di ricerca diversi o modifica i filtri.</p>
            </div>
          ) : filters.search ? (
            <>
              <div className="search__results-count">
                Trovati {searchResults.length} prodotti
              </div>
              
              <div className="search__results-grid">
                {searchResults.map(product => (
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
                      <button className="product-card__action-btn product-card__action-btn--cart">
                        Aggiungi al Carrello
                      </button>
                      <button className="product-card__action-btn product-card__action-btn--favorite">
                        ♡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="search__pagination">
                  <button
                    className="search__pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Precedente
                  </button>
                  
                  <div className="search__pagination-numbers">
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
                            className={`search__pagination-number ${
                              pageNumber === currentPage ? 'search__pagination-number--active' : ''
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
                        return <span key={pageNumber} className="search__pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    className="search__pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Successiva
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="search__empty">
              <p>Inserisci un termine di ricerca per trovare i prodotti tipici calabresi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search; 