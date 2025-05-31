import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import AdvancedSearch from '../components/Search/AdvancedSearch';
// import ProductRecommendations from '../components/Recommendations/ProductRecommendations';
import ProductCard from '../components/ProductCard/ProductCard';
import SEOHead from '../components/common/SEOHead';
import { 
  LoadingSpinner, 
  SkeletonCard, 
  ErrorDisplay, 
  EmptySearch,
  LoadingWrapper 
} from '../components/common/LoadingStates';
import api from '../utils/api';
import './SearchPage.scss';

// Componente Breadcrumbs inline dato che non esiste
const Breadcrumbs = ({ items }) => (
  <nav className="breadcrumbs">
    <ol className="breadcrumbs__list">
      {items.map((item, index) => (
        <li key={index} className="breadcrumbs__item">
          {index < items.length - 1 ? (
            <a href={item.path} className="breadcrumbs__link">
              {item.label}
            </a>
          ) : (
            <span className="breadcrumbs__current">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="breadcrumbs__separator">/</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchResults, setSearchResults] = useState([]);
  // const [pagination, setPagination] = useState(null); // Temporaneamente disabilitato
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filtri semplici
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'name'
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Estrai query dall'URL all'avvio
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    const category = urlParams.get('category');
    const sort = urlParams.get('sort');
    
    if (query) {
      setSearchQuery(query);
      setSearchInput(query);
      setHasSearched(true);
    }
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
    if (sort) {
      setFilters(prev => ({ ...prev, sortBy: sort }));
    }
    
    if (query || category) {
      performSearch(query, { category, sortBy: sort || 'name' });
    }
    
    // Carica categorie disponibili
    loadCategories();
  }, [location.search]);

  // Carica categorie per i filtri
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/categories');
      setAvailableCategories(response.data || []);
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Funzione commentata temporaneamente - era per AdvancedSearch
  // const handleSearchResults = (results, paginationData) => {
  //   setSearchResults(results);
  //   setPagination(paginationData);
  //   setTotalResults(paginationData?.total || results.length);
  //   setIsLoading(false);
  // };

  // Esegue una ricerca semplice usando l'endpoint esistente
  const performSearch = async (query, searchFilters = filters) => {
    if (!query || query.trim().length < 3) {
      if (query && query.trim().length > 0) {
        setError('Inserisci almeno 3 caratteri per la ricerca');
      }
      setSearchResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Costruisco i parametri per la ricerca
      const params = new URLSearchParams({
        q: query.trim(),
        limit: '20'
      });

      // Aggiungo filtri supportati dal backend
      if (searchFilters.category) {
        params.set('category', searchFilters.category);
      }
      if (searchFilters.sortBy) {
        params.set('sort_by', searchFilters.sortBy);
      }
      if (searchFilters.priceRange) {
        const [min, max] = searchFilters.priceRange.split('-');
        if (min) params.set('price_min', min);
        if (max && max !== '999') params.set('price_max', max);
      }

      const response = await api.get(`/products/search?${params.toString()}`);
      const results = response.data.products?.data || response.data.products || [];
      
      setSearchResults(results);
      setTotalResults(results.length);
      
      // Aggiorna URL con i filtri
      const urlParams = new URLSearchParams();
      urlParams.set('q', query.trim());
      if (searchFilters.category) urlParams.set('category', searchFilters.category);
      if (searchFilters.sortBy !== 'name') urlParams.set('sort', searchFilters.sortBy);
      if (searchFilters.priceRange) urlParams.set('price', searchFilters.priceRange);
      
      navigate(`/search?${urlParams.toString()}`, { replace: true });
      
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      
      // Gestione errori più specifica
      if (error.response?.status === 400) {
        setError('Parametri di ricerca non validi. Verifica la tua query.');
      } else if (error.response?.status === 500) {
        setError('Errore del server. Riprova più tardi.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Problemi di connessione. Verifica la tua connessione internet.');
      } else {
        setError('Errore durante la ricerca. Riprova più tardi.');
      }
      
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce il submit della form di ricerca
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    performSearch(searchInput, filters);
  };

  // Gestisce il cambio dei filtri
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    if (hasSearched && searchQuery) {
      performSearch(searchQuery, newFilters);
    }
  };

  // Cancella la ricerca
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setSearchResults([]);
    setTotalResults(0);
    setError(null);
    setHasSearched(false);
    setFilters({ category: '', priceRange: '', sortBy: 'name' });
    navigate('/search', { replace: true });
  };

  // Vai alle categorie
  const handleBrowseCategories = () => {
    navigate('/products');
  };

  // Retry search
  const handleRetry = () => {
    if (searchQuery) {
      performSearch(searchQuery, filters);
    }
  };

  // Breadcrumbs per la pagina di ricerca
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { 
      label: searchQuery ? `Ricerca: "${searchQuery}"` : 'Ricerca Prodotti', 
      path: location.pathname + location.search 
    }
  ];

  // Renderizza skeleton per loading
  const renderSkeletonCards = () => (
    <div className="search-page__products-grid">
      {Array.from({ length: 8 }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );

  return (
    <div className="search-page">
      {/* Meta tags SEO dinamici */}
      <SEOHead
        title={searchQuery 
          ? `Risultati ricerca "${searchQuery}" - Prodotti Calabresi | Rustico Calabria`
          : 'Ricerca Prodotti Tipici Calabresi | Rustico Calabria'
        }
        description={searchQuery
          ? `Scopri ${totalResults} prodotti calabresi per "${searchQuery}". Trova i migliori sapori autentici della Calabria.`
          : 'Cerca tra i migliori prodotti tipici calabresi. Nduja, peperoncino, olio, conserve e specialità autentiche dal Sud Italia.'
        }
        keywords={searchQuery
          ? `${searchQuery}, prodotti calabresi, ricerca, ${searchQuery} calabrese, specialità calabresi`
          : 'ricerca prodotti calabresi, nduja, peperoncino calabrese, olio calabrese, specialità del sud'
        }
        url={location.pathname + location.search}
        type="website"
        breadcrumbs={breadcrumbItems.map(item => ({
          name: item.label,
          url: item.path
        }))}
        structuredData={searchResults.length > 0 ? {
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          "name": `Risultati ricerca per "${searchQuery}"`,
          "description": `${totalResults} prodotti trovati per la ricerca "${searchQuery}"`,
          "url": `${window.location.origin}${location.pathname}${location.search}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalResults,
            "itemListElement": searchResults.slice(0, 10).map((product, index) => ({
              "@type": "Product",
              "position": index + 1,
              "name": product.name,
              "description": product.description,
              "image": product.main_image,
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "EUR"
              }
            }))
          }
        } : null}
      />
      
      <div className="search-page__container">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header della pagina */}
        <div className="search-page__header">
          <h1 className="search-page__title">
            <i className="fas fa-search"></i>
            {searchQuery ? `Risultati per "${searchQuery}"` : 'Ricerca Prodotti'}
          </h1>
          {totalResults > 0 && (
            <p className="search-page__subtitle">
              {totalResults} {totalResults === 1 ? 'prodotto trovato' : 'prodotti trovati'}
            </p>
          )}
        </div>

        {/* Barra di ricerca e filtri */}
        <div className="search-page__controls">
          <form onSubmit={handleSearchSubmit} className="search-page__search-form">
            <div className="search-page__search-input-group">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cerca prodotti calabresi..."
                className="search-page__search-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="search-page__search-button"
                disabled={isLoading || !searchInput.trim()}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-search"></i>
                )}
              </button>
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-page__clear-button"
                  title="Cancella ricerca"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </form>

          {/* Filtri semplici */}
          <div className="simple-filters">
            <div className="simple-filters__group">
              <label htmlFor="category-filter">Categoria:</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                disabled={isLoading || categoriesLoading}
                className="simple-filters__select"
              >
                <option value="">Tutte le categorie</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="simple-filters__group">
              <label htmlFor="price-filter">Fascia di prezzo:</label>
              <select
                id="price-filter"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                disabled={isLoading}
                className="simple-filters__select"
              >
                <option value="">Qualsiasi prezzo</option>
                <option value="0-10">€0 - €10</option>
                <option value="10-25">€10 - €25</option>
                <option value="25-50">€25 - €50</option>
                <option value="50-999">€50+</option>
              </select>
            </div>

            <div className="simple-filters__group">
              <label htmlFor="sort-filter">Ordina per:</label>
              <select
                id="sort-filter"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                disabled={isLoading}
                className="simple-filters__select"
              >
                <option value="name">Nome A-Z</option>
                <option value="price_asc">Prezzo crescente</option>
                <option value="price_desc">Prezzo decrescente</option>
                <option value="rating">Valutazione</option>
                <option value="newest">Più recenti</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenuto principale */}
        <div className="search-page__content">
          <LoadingWrapper
            loading={isLoading}
            error={error}
            empty={hasSearched && !isLoading && searchResults.length === 0}
            loadingComponent={renderSkeletonCards()}
            errorComponent={
              <ErrorDisplay
                title="Errore durante la ricerca"
                message={error}
                onRetry={handleRetry}
                type={error?.includes('connessione') ? 'network' : 'error'}
              />
            }
            emptyComponent={
              <EmptySearch
                searchTerm={searchQuery}
                onClearSearch={searchQuery ? handleClearSearch : null}
                onBrowseCategories={handleBrowseCategories}
              />
            }
            className="search-page__results"
          >
            {/* Risultati della ricerca */}
            <div className="search-page__products-grid">
              {searchResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="grid"
                />
              ))}
            </div>
          </LoadingWrapper>

          {/* Stato iniziale quando non è stata effettuata alcuna ricerca */}
          {!hasSearched && !isLoading && (
            <div className="search-page__initial">
              <div className="search-initial">
                <div className="search-initial__icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="search-initial__title">
                  Scopri i sapori autentici della Calabria
                </h3>
                <p className="search-initial__description">
                  Utilizza la ricerca per trovare i prodotti tipici che stai cercando.
                  Puoi filtrare per categoria, prezzo e molto altro.
                </p>
                
                <div className="search-initial__features">
                  <div className="search-initial__feature">
                    <i className="fas fa-filter"></i>
                    <span>Filtri avanzati</span>
                  </div>
                  <div className="search-initial__feature">
                    <i className="fas fa-leaf"></i>
                    <span>Prodotti naturali</span>
                  </div>
                  <div className="search-initial__feature">
                    <i className="fas fa-certificate"></i>
                    <span>Certificazioni DOP/IGP</span>
                  </div>
                  <div className="search-initial__feature">
                    <i className="fas fa-shipping-fast"></i>
                    <span>Spedizione veloce</span>
                  </div>
                </div>

                <div className="search-initial__suggestions">
                  <h4>Cerca per esempio:</h4>
                  <div className="search-initial__tags">
                    <button onClick={() => { setSearchInput('nduja'); performSearch('nduja'); }}>
                      Nduja
                    </button>
                    <button onClick={() => { setSearchInput('peperoncino'); performSearch('peperoncino'); }}>
                      Peperoncino
                    </button>
                    <button onClick={() => { setSearchInput('olio'); performSearch('olio'); }}>
                      Olio d'oliva
                    </button>
                    <button onClick={() => { setSearchInput('conserve'); performSearch('conserve'); }}>
                      Conserve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 