import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../Toast/Toast';
import api from '../../utils/api';
import './AdvancedSearch.scss';

const AdvancedSearch = ({ 
  onSearchResults = null,
  showFilters = true,
  inline = false,
  placeholder = "Cerca prodotti tipici calabresi...",
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Stati principali
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    price_range: { min: 0, max: 500 },
    rating: 0,
    availability: 'all', // all, in_stock, out_of_stock
    origin: [],
    certifications: [],
    ingredients: []
  });
  
  // Stati UI
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance'); // relevance, price_asc, price_desc, rating, newest
  
  // Debounce per ricerca
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Carica filtri disponibili all'avvio
  useEffect(() => {
    loadAvailableFilters();
    
    // Analizza URL per parametri di ricerca esistenti
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, []);

  // Gestisce suggerimenti durante la digitazione
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchQuery.length >= 2) {
      const timeout = setTimeout(() => {
        loadSuggestions(searchQuery);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchQuery]);

  // Gestisce click fuori dal campo ricerca
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carica filtri disponibili dal backend
  const loadAvailableFilters = async () => {
    try {
      const response = await api.get('/search/filters');
      if (response.data.success) {
        setAvailableFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Errore caricamento filtri:', error);
    }
  };

  // Carica suggerimenti di ricerca
  const loadSuggestions = async (query) => {
    try {
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Errore caricamento suggerimenti:', error);
    }
  };

  // Esegue la ricerca principale
  const performSearch = async (query = searchQuery, filters = activeFilters) => {
    if (!query.trim() && Object.keys(filters).every(key => 
      !filters[key] || 
      (Array.isArray(filters[key]) && filters[key].length === 0) ||
      (key === 'price_range' && filters[key].min === 0 && filters[key].max === 500) ||
      (key === 'rating' && filters[key] === 0) ||
      (key === 'availability' && filters[key] === 'all')
    )) {
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const searchParams = {
        q: query,
        sort: sortBy,
        ...filters,
        page: 1,
        per_page: 20
      };

      const response = await api.get('/search', { params: searchParams });
      
      if (response.data.success) {
        const results = response.data.results || [];
        setSearchResults(results);
        
        // Callback per componente padre
        if (onSearchResults) {
          onSearchResults(results, response.data.pagination);
        }
        
        // Aggiorna URL se non inline
        if (!inline) {
          const urlParams = new URLSearchParams();
          if (query) urlParams.set('q', query);
          navigate(`/search?${urlParams.toString()}`);
        }
        
        // Analytics/tracking della ricerca
        trackSearch(query, results.length);
      }
    } catch (error) {
      console.error('Errore ricerca:', error);
      addToast('Errore durante la ricerca', 'error');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Gestisce invio ricerca
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Gestisce selezione suggerimento
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    if (suggestion.type === 'product') {
      navigate(`/products/${suggestion.slug}`);
    } else {
      performSearch(suggestion.text);
    }
  };

  // Gestisce cambio filtri
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters };
    
    if (filterType === 'categories' || filterType === 'origin' || 
        filterType === 'certifications' || filterType === 'ingredients') {
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
    } else {
      newFilters[filterType] = value;
    }
    
    setActiveFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };

  // Rimuove singolo filtro
  const removeFilter = (filterType, value = null) => {
    const newFilters = { ...activeFilters };
    
    if (value && Array.isArray(newFilters[filterType])) {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    } else if (filterType === 'price_range') {
      newFilters[filterType] = { min: 0, max: 500 };
    } else if (filterType === 'rating') {
      newFilters[filterType] = 0;
    } else if (filterType === 'availability') {
      newFilters[filterType] = 'all';
    }
    
    setActiveFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };

  // Pulisce tutti i filtri
  const clearAllFilters = () => {
    const cleanFilters = {
      categories: [],
      price_range: { min: 0, max: 500 },
      rating: 0,
      availability: 'all',
      origin: [],
      certifications: [],
      ingredients: []
    };
    
    setActiveFilters(cleanFilters);
    performSearch(searchQuery, cleanFilters);
  };

  // Traccia ricerca per analytics
  const trackSearch = async (query, resultsCount) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/recommendations/track', {
          action: 'search',
          metadata: {
            query,
            results_count: resultsCount,
            filters: activeFilters,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Errore tracking ricerca:', error);
    }
  };

  // Conta filtri attivi
  const getActiveFiltersCount = () => {
    let count = 0;
    Object.keys(activeFilters).forEach(key => {
      const value = activeFilters[key];
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (key === 'rating' && value > 0) count++;
      else if (key === 'availability' && value !== 'all') count++;
      else if (key === 'price_range' && (value.min > 0 || value.max < 500)) count++;
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`advanced-search ${inline ? 'inline' : 'standalone'} ${className}`}>
      {/* Campo di ricerca principale */}
      <div className="advanced-search__main">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container" ref={suggestionsRef}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="search-input"
              autoComplete="off"
            />
            
            <div className="search-actions">
              {isSearching && (
                <div className="search-loading">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
              )}
              
              <button type="submit" className="search-btn" disabled={isSearching}>
                <i className="fas fa-search"></i>
              </button>
              
              {showFilters && (
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
                >
                  <i className="fas fa-filter"></i>
                  {activeFiltersCount > 0 && (
                    <span className="filter-count">{activeFiltersCount}</span>
                  )}
                </button>
              )}
            </div>

            {/* Suggerimenti */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${suggestion.type}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <i className={`fas ${
                      suggestion.type === 'product' ? 'fa-cube' :
                      suggestion.type === 'category' ? 'fa-folder' :
                      suggestion.type === 'ingredient' ? 'fa-leaf' :
                      'fa-search'
                    }`}></i>
                    <span className="suggestion-text">{suggestion.text}</span>
                    {suggestion.count && (
                      <span className="suggestion-count">({suggestion.count})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Ordinamento risultati */}
        {searchResults.length > 0 && (
          <div className="search-sorting">
            <label>Ordina per:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                performSearch();
              }}
              className="sort-select"
            >
              <option value="relevance">Rilevanza</option>
              <option value="price_asc">Prezzo crescente</option>
              <option value="price_desc">Prezzo decrescente</option>
              <option value="rating">Migliori recensioni</option>
              <option value="newest">Più recenti</option>
            </select>
          </div>
        )}
      </div>

      {/* Filtri avanzati */}
      {showFilters && showAdvancedFilters && (
        <div className="advanced-search__filters">
          <div className="filters-header">
            <h3>
              <i className="fas fa-sliders-h"></i>
              Filtri Avanzati
            </h3>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="clear-filters-btn">
                <i className="fas fa-times"></i>
                Pulisci tutto
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Filtro categorie */}
            {availableFilters.categories && (
              <div className="filter-group">
                <h4>Categorie</h4>
                <div className="filter-options">
                  {availableFilters.categories.map(category => (
                    <label key={category.id} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.categories.includes(category.id)}
                        onChange={() => handleFilterChange('categories', category.id)}
                      />
                      <span>{category.name} ({category.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filtro prezzo */}
            <div className="filter-group">
              <h4>Fascia di Prezzo</h4>
              <div className="price-range">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={activeFilters.price_range.max}
                  onChange={(e) => handleFilterChange('price_range', {
                    ...activeFilters.price_range,
                    max: parseInt(e.target.value)
                  })}
                  className="price-slider"
                />
                <div className="price-display">
                  €{activeFilters.price_range.min} - €{activeFilters.price_range.max}
                </div>
              </div>
            </div>

            {/* Filtro rating */}
            <div className="filter-group">
              <h4>Valutazione minima</h4>
              <div className="rating-filter">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('rating', rating)}
                    className={`rating-btn ${activeFilters.rating >= rating ? 'active' : ''}`}
                  >
                    {[...Array(rating)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                    <span>+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro disponibilità */}
            <div className="filter-group">
              <h4>Disponibilità</h4>
              <div className="filter-options">
                <label className="filter-radio">
                  <input
                    type="radio"
                    name="availability"
                    checked={activeFilters.availability === 'all'}
                    onChange={() => handleFilterChange('availability', 'all')}
                  />
                  <span>Tutti i prodotti</span>
                </label>
                <label className="filter-radio">
                  <input
                    type="radio"
                    name="availability"
                    checked={activeFilters.availability === 'in_stock'}
                    onChange={() => handleFilterChange('availability', 'in_stock')}
                  />
                  <span>Solo disponibili</span>
                </label>
              </div>
            </div>

            {/* Filtro origine */}
            {availableFilters.origins && (
              <div className="filter-group">
                <h4>Origine</h4>
                <div className="filter-options">
                  {availableFilters.origins.map(origin => (
                    <label key={origin.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.origin.includes(origin.value)}
                        onChange={() => handleFilterChange('origin', origin.value)}
                      />
                      <span>{origin.label} ({origin.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filtro certificazioni */}
            {availableFilters.certifications && (
              <div className="filter-group">
                <h4>Certificazioni</h4>
                <div className="filter-options">
                  {availableFilters.certifications.map(cert => (
                    <label key={cert.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.certifications.includes(cert.value)}
                        onChange={() => handleFilterChange('certifications', cert.value)}
                      />
                      <span>{cert.label} ({cert.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtri attivi */}
      {activeFiltersCount > 0 && (
        <div className="active-filters">
          <div className="active-filters-list">
            {/* Mostra filtri attivi come tag */}
            {Object.entries(activeFilters).map(([filterType, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                return value.map(item => (
                  <span key={`${filterType}-${item}`} className="active-filter-tag">
                    {availableFilters[filterType]?.find(f => f.id === item || f.value === item)?.name || 
                     availableFilters[filterType]?.find(f => f.id === item || f.value === item)?.label || 
                     item}
                    <button onClick={() => removeFilter(filterType, item)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ));
              } else if (filterType === 'rating' && value > 0) {
                return (
                  <span key={filterType} className="active-filter-tag">
                    {value}+ stelle
                    <button onClick={() => removeFilter(filterType)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                );
              } else if (filterType === 'availability' && value !== 'all') {
                return (
                  <span key={filterType} className="active-filter-tag">
                    {value === 'in_stock' ? 'Solo disponibili' : value}
                    <button onClick={() => removeFilter(filterType)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 