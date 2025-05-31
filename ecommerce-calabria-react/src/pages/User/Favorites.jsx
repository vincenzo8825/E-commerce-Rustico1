import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import { SafeImage, getFirstValidImageUrl } from '../../utils/imageUtils.jsx';
import { useToast } from '../../components/Toast/Toast';
import { useCart } from '../../contexts/CartContext';
import SEOHead from '../../components/common/SEOHead';
import { 
  LoadingSpinner, 
  SkeletonCard, 
  ErrorDisplay, 
  EmptyFavorites,
  LoadingWrapper 
} from '../../components/common/LoadingStates';
import './Favorites.scss';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [wishlistCollections, setWishlistCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, price_asc, price_desc, name_asc, name_desc
  const [filterBy, setFilterBy] = useState({
    category: '',
    priceRange: '',
    discount: false,
    inStock: false
  });
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedForShare, setSelectedForShare] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const { addToast } = useToast();
  const { incrementCart, decrementFavorites } = useCart();
  const shareInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchFavorites();
      fetchWishlistCollections();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [favorites, selectedCollection, sortBy, filterBy]);

  const fetchFavorites = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/favorites');
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Errore nel caricamento dei preferiti:', error);
      
      // Gestione errori più specifica
      if (error.response?.status === 401) {
        setError('Devi effettuare il login per visualizzare i tuoi preferiti');
      } else if (error.response?.status === 500) {
        setError('Errore del server. Riprova più tardi.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Problemi di connessione. Verifica la tua connessione internet.');
      } else {
        setError('Errore nel caricamento dei preferiti. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistCollections = async () => {
    try {
      // TODO: Implementare endpoint /wishlist-collections nel backend
      // const response = await api.get('/wishlist-collections');
      // setWishlistCollections(response.data.collections || []);
      setWishlistCollections([]); // Temporaneamente vuoto fino all'implementazione backend
    } catch (err) {
      console.error('Errore nel caricamento delle collezioni:', err);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...favorites];

    // Filtra per collezione
    if (selectedCollection !== 'all') {
      const collection = wishlistCollections.find(c => c.id === parseInt(selectedCollection));
      if (collection) {
        const collectionProductIds = collection.items.map(item => item.product_id);
        filtered = filtered.filter(fav => collectionProductIds.includes(fav.product.id));
      }
    }

    // Filtra per categoria
    if (filterBy.category) {
      filtered = filtered.filter(fav => 
        fav.product.category?.slug === filterBy.category
      );
    }

    // Filtra per sconto
    if (filterBy.discount) {
      filtered = filtered.filter(fav => fav.product.discount_price);
    }

    // Filtra per disponibilità
    if (filterBy.inStock) {
      filtered = filtered.filter(fav => fav.product.stock > 0);
    }

    // Filtra per range di prezzo
    if (filterBy.priceRange) {
      const [min, max] = filterBy.priceRange.split('-').map(Number);
      filtered = filtered.filter(fav => {
        const price = fav.product.discount_price || fav.product.price;
        return price >= min && price <= max;
      });
    }

    // Ordina
    switch (sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_asc':
        filtered.sort((a, b) => {
          const priceA = a.product.discount_price || a.product.price;
          const priceB = b.product.discount_price || b.product.price;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const priceA = a.product.discount_price || a.product.price;
          const priceB = b.product.discount_price || b.product.price;
          return priceB - priceA;
        });
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.product.name.localeCompare(b.product.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.product.name.localeCompare(a.product.name));
        break;
      default:
        break;
    }

    setFilteredFavorites(filtered);
  };

  const createWishlistCollection = async () => {
    if (!newCollectionName.trim()) {
      addToast('Il nome della collezione non può essere vuoto', 'error');
      return;
    }

    try {
      // TODO: Implementare endpoint per creare collezioni nel backend
      // const response = await api.post('/wishlist-collections', {
      //   name: newCollectionName.trim(),
      //   description: `Collezione personalizzata: ${newCollectionName.trim()}`
      // });

      // setWishlistCollections([...wishlistCollections, response.data.collection]);
      setNewCollectionName('');
      setShowCollectionModal(false);
      addToast('Funzionalità collezioni in sviluppo', 'info');
    } catch (err) {
      console.error('Errore nella creazione della collezione:', err);
      addToast('Errore nella creazione della collezione', 'error');
    }
  };

  const addToCollection = async (productId, collectionId) => {
    try {
      // TODO: Implementare endpoint per aggiungere a collezioni nel backend
      // await api.post(`/wishlist-collections/${collectionId}/items`, {
      //   product_id: productId
      // });

      // fetchWishlistCollections();
      addToast('Funzionalità collezioni in sviluppo', 'info');
      
      // Evita linter warning per parametri non utilizzati temporaneamente
      console.log('Collezione temp disabled:', { productId, collectionId });
    } catch (err) {
      console.error('Errore nell\'aggiunta alla collezione:', err);
      addToast('Errore nell\'aggiunta alla collezione', 'error');
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      
      const removedProduct = favorites.find(fav => fav.product.id === productId);
      setFavorites(favorites.filter(fav => fav.product.id !== productId));
      
      decrementFavorites();
      
      addToast(
        `"${removedProduct?.product?.name || 'Prodotto'}" rimosso dai preferiti`, 
        'info', 
        3000
      );
    } catch (err) {
      console.error('Errore nella rimozione del preferito:', err);
      addToast('Impossibile rimuovere il prodotto dai preferiti', 'error');
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      window.location.href = '/login?redirect=/favorites';
      return;
    }

    try {
      await api.post('/cart/add', {
        product_id: productId,
        quantity
      });
      
      incrementCart(quantity);
      
      const addedProduct = favorites.find(fav => fav.product.id === productId);
      addToast(
        `🛒 "${addedProduct?.product?.name || 'Prodotto'}" aggiunto al carrello!`, 
        'success', 
        3500
      );
    } catch (error) {
      console.error('Errore aggiunta prodotto al carrello:', error);
      addToast('Errore nell\'aggiunta al carrello', 'error');
    }
  };

  // Funzione per aggiungere tutti i prodotti disponibili al carrello
  const addAllToCart = async () => {
    if (!isAuthenticated()) {
      window.location.href = '/login?redirect=/favorites';
      return;
    }

    const availableProducts = filteredFavorites.filter(fav => fav.product.stock > 0);
    
    if (availableProducts.length === 0) {
      addToast('Nessun prodotto disponibile da aggiungere al carrello', 'warning');
      return;
    }

    try {
      let addedCount = 0;
      const errors = [];

      for (const favorite of availableProducts) {
        try {
          await api.post('/cart/add', {
            product_id: favorite.product.id,
            quantity: 1
          });
          addedCount++;
        } catch (error) {
          console.error('Errore aggiunta prodotto al carrello:', error);
          errors.push(favorite.product.name);
        }
      }

      if (addedCount > 0) {
        incrementCart(addedCount);
        addToast(
          `🛒 ${addedCount} prodotti aggiunti al carrello!`, 
          'success', 
          4000
        );
      }

      if (errors.length > 0) {
        addToast(
          `Alcuni prodotti non sono stati aggiunti: ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? '...' : ''}`, 
          'warning', 
          4000
        );
      }
    } catch (err) {
      console.error('Errore nell\'aggiunta multipla al carrello:', err);
      addToast('Errore nell\'aggiunta multipla al carrello', 'error');
    }
  };

  const togglePriceAlert = async (productId) => {
    try {
      const favorite = favorites.find(fav => fav.product.id === productId);
      const action = favorite.price_alert_enabled ? 'disable' : 'enable';
      
      await api.post(`/favorites/${productId}/price-alert`, {
        action: action
      });

      // Aggiorna lo stato locale
      setFavorites(favorites.map(fav => 
        fav.product.id === productId 
          ? { ...fav, price_alert_enabled: !fav.price_alert_enabled }
          : fav
      ));

      addToast(
        action === 'enable' 
          ? 'Notifica prezzi attivata!' 
          : 'Notifica prezzi disattivata',
        'success'
      );
    } catch (err) {
      console.error('Errore nella gestione notifica prezzi:', err);
      addToast('Errore nella gestione notifica prezzi', 'error');
    }
  };

  const shareWishlist = async () => {
    try {
      const productIds = selectedForShare.length > 0 
        ? selectedForShare 
        : filteredFavorites.map(fav => fav.product.id);

      const response = await api.post('/wishlist/share', {
        product_ids: productIds,
        collection_id: selectedCollection !== 'all' ? selectedCollection : null
      });

      const shareUrl = response.data.share_url;
      
      // Copia negli appunti
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        addToast('Link copiato negli appunti!', 'success');
      } else {
        // Fallback per browser più vecchi
        if (shareInputRef.current) {
          shareInputRef.current.value = shareUrl;
          shareInputRef.current.select();
          document.execCommand('copy');
          addToast('Link copiato negli appunti!', 'success');
        }
      }

      setShowShareModal(false);
      setSelectedForShare([]);
      setSelectMode(false);
    } catch (err) {
      console.error('Errore nella condivisione:', err);
      addToast('Errore nella condivisione della wishlist', 'error');
    }
  };

  const toggleSelectProduct = (productId) => {
    setSelectedForShare(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getUniqueCategories = () => {
    const categories = favorites.map(fav => fav.product.category).filter(Boolean);
    return [...new Set(categories.map(cat => cat.slug))].map(slug => 
      categories.find(cat => cat.slug === slug)
    );
  };

  const getPriceRanges = () => [
    { label: 'Fino a 10€', value: '0-10' },
    { label: '10€ - 25€', value: '10-25' },
    { label: '25€ - 50€', value: '25-50' },
    { label: '50€ - 100€', value: '50-100' },
    { label: 'Oltre 100€', value: '100-999999' }
  ];

  const handleGoToProducts = () => {
    window.location.href = '/products';
  };

  const handleRetry = () => {
    fetchFavorites();
  };

  // Renderizza skeleton per loading
  const renderSkeletonCards = () => (
    <div className={`favorites__grid favorites__grid--${viewMode}`}>
      {Array.from({ length: 6 }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );

  if (!isAuthenticated()) {
    return (
      <div className="favorites">
        <SEOHead
          title="Accedi per Vedere i Preferiti | Rustico Calabria"
          description="Accedi al tuo account per visualizzare e gestire i tuoi prodotti preferiti calabresi."
          robots="noindex"
        />
        <div className="favorites__container">
          <div className="favorites__login-required">
            <div className="favorites__login-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h2>Accedi per vedere i tuoi preferiti</h2>
            <p>
              Effettua il login per salvare i tuoi prodotti preferiti e accedervi
              facilmente da qualsiasi dispositivo.
            </p>
            <Link to="/login" className="favorites__login-button">
              <i className="fas fa-sign-in-alt"></i>
              Accedi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites">
      <SEOHead
        title={`I Miei Preferiti${filteredFavorites.length > 0 ? ` (${filteredFavorites.length})` : ''} | Rustico Calabria`}
        description="Gestisci i tuoi prodotti calabresi preferiti: crea collezioni, attiva notifiche prezzi e condividi le tue liste."
        keywords="preferiti, wishlist, prodotti calabresi, liste personalizzate, notifiche prezzi"
        robots="noindex"
      />
      
      <div className="favorites__container">
        <div className="favorites__header">
          <div className="favorites__title-section">
            <h1 className="favorites__title">
              <i className="fas fa-heart"></i>
              I Miei Preferiti
              {filteredFavorites.length > 0 && (
                <span className="favorites__count">({filteredFavorites.length})</span>
              )}
            </h1>
            {favorites.length > 0 && (
              <p className="favorites__subtitle">
                I tuoi prodotti calabresi del cuore, sempre a portata di mano
              </p>
            )}
          </div>

          {favorites.length > 0 && (
            <div className="favorites__actions">
              <button 
                className="favorites__action-btn favorites__action-btn--primary"
                onClick={addAllToCart}
                title="Aggiungi tutti i prodotti disponibili al carrello"
              >
                <i className="fas fa-shopping-cart"></i>
                Aggiungi tutto al carrello
              </button>
              
              <button 
                className="favorites__action-btn"
                onClick={() => setSelectMode(!selectMode)}
              >
                <i className={`fas ${selectMode ? 'fa-times' : 'fa-check-square'}`}></i>
                {selectMode ? 'Annulla' : 'Seleziona'}
              </button>
              
              <button 
                className="favorites__action-btn"
                onClick={() => setShowShareModal(true)}
              >
                <i className="fas fa-share-alt"></i>
                Condividi
              </button>
              
              <button 
                className="favorites__action-btn"
                onClick={() => setShowCollectionModal(true)}
              >
                <i className="fas fa-plus"></i>
                Nuova Collezione
              </button>
            </div>
          )}
        </div>

        {/* Controlli e filtri */}
        {favorites.length > 0 && (
          <div className="favorites__controls">
            <div className="favorites__filters">
              {/* Collezioni */}
              <div className="filter-group">
                <label htmlFor="collection-select">Collezione:</label>
                <select 
                  id="collection-select"
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tutti i preferiti</option>
                  {wishlistCollections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({collection.items?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div className="filter-group">
                <label htmlFor="category-select">Categoria:</label>
                <select 
                  id="category-select"
                  value={filterBy.category}
                  onChange={(e) => setFilterBy(prev => ({ ...prev, category: e.target.value }))}
                  className="filter-select"
                >
                  <option value="">Tutte le categorie</option>
                  {getUniqueCategories().map(category => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Range prezzi */}
              <div className="filter-group">
                <label htmlFor="price-select">Prezzo:</label>
                <select 
                  id="price-select"
                  value={filterBy.priceRange}
                  onChange={(e) => setFilterBy(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="filter-select"
                >
                  <option value="">Tutti i prezzi</option>
                  {getPriceRanges().map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtri checkbox */}
              <div className="filter-group filter-group--checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox"
                    checked={filterBy.discount}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, discount: e.target.checked }))}
                  />
                  <span className="filter-checkbox__label">Solo sconti</span>
                </label>
                
                <label className="filter-checkbox">
                  <input 
                    type="checkbox"
                    checked={filterBy.inStock}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, inStock: e.target.checked }))}
                  />
                  <span className="filter-checkbox__label">Disponibili</span>
                </label>
              </div>
            </div>

            <div className="favorites__view-controls">
              {/* Ordinamento */}
              <div className="filter-group">
                <label htmlFor="sort-select">Ordina per:</label>
                <select 
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="date_desc">Più recenti</option>
                  <option value="date_asc">Più vecchi</option>
                  <option value="price_asc">Prezzo crescente</option>
                  <option value="price_desc">Prezzo decrescente</option>
                  <option value="name_asc">Nome A-Z</option>
                  <option value="name_desc">Nome Z-A</option>
                </select>
              </div>

              {/* Vista */}
              <div className="view-toggle">
                <button 
                  className={`view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button 
                  className={`view-toggle__btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selezione multipla */}
        {selectMode && favorites.length > 0 && (
          <div className="favorites__bulk-actions">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedForShare.length === favorites.length}
                onChange={() => {
                  setSelectedForShare(favorites.map(fav => fav.product.id));
                  setSelectMode(false);
                }}
              />
              <span className="filter-checkbox__label">Seleziona tutti</span>
            </label>
            
            {selectedForShare.length > 0 && (
              <button
                onClick={() => {
                  setSelectedForShare([]);
                  setSelectMode(false);
                }}
                className="favorites__action-btn"
              >
                <i className="fas fa-times"></i>
                Rimuovi selezionati ({selectedForShare.length})
              </button>
            )}
          </div>
        )}

        {/* Contenuto principale */}
        <LoadingWrapper
          loading={loading}
          error={error}
          empty={!loading && favorites.length === 0}
          loadingComponent={renderSkeletonCards()}
          errorComponent={
            <ErrorDisplay
              title="Errore nel caricamento dei preferiti"
              message={error}
              onRetry={handleRetry}
              type={error?.includes('connessione') ? 'network' : 'error'}
            />
          }
          emptyComponent={
            <EmptyFavorites
              onBrowseProducts={handleGoToProducts}
            />
          }
        >
          {/* Lista preferiti */}
          <div className={`favorites__grid favorites__grid--${viewMode}`}>
            {filteredFavorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                isSelectMode={selectMode}
                isSelected={selectedForShare.includes(favorite.product.id)}
                onSelect={() => toggleSelectProduct(favorite.product.id)}
                onRemove={() => removeFavorite(favorite.product.id)}
                onAddToCart={() => addToCart(favorite.product.id)}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Nessun risultato per i filtri */}
          {filteredFavorites.length === 0 && favorites.length > 0 && (
            <div className="favorites__no-filter-results">
              <div className="no-filter-results">
                <i className="fas fa-filter"></i>
                <h3>Nessun prodotto corrisponde ai filtri</h3>
                <p>Prova a modificare i criteri di ricerca o rimuovi alcuni filtri.</p>
                <button
                  onClick={() => {
                    setFilterBy({
                      category: '',
                      priceRange: '',
                      discount: false,
                      inStock: false
                    });
                    setSelectedCollection('all');
                  }}
                  className="favorites__button"
                >
                  <i className="fas fa-times"></i>
                  Rimuovi filtri
                </button>
              </div>
            </div>
          )}
        </LoadingWrapper>

        {/* Modal Nuova Collezione */}
        {showCollectionModal && (
          <div className="modal-overlay" onClick={() => setShowCollectionModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3>
                  <i className="fas fa-folder-plus"></i>
                  Crea Nuova Collezione
                </h3>
                <button 
                  className="modal__close"
                  onClick={() => setShowCollectionModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal__body">
                <div className="form-group">
                  <label htmlFor="collection-name">Nome della collezione:</label>
                  <input
                    id="collection-name"
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="es. Prodotti per le feste, Regalo per mamma..."
                    className="form-input"
                    maxLength={50}
                  />
                  <small className="form-help">
                    Scegli un nome che ti aiuti a identificare facilmente questa collezione
                  </small>
                </div>
              </div>
              
              <div className="modal__footer">
                <button 
                  className="btn btn--secondary"
                  onClick={() => setShowCollectionModal(false)}
                >
                  Annulla
                </button>
                <button 
                  className="btn btn--primary"
                  onClick={createWishlistCollection}
                  disabled={!newCollectionName.trim()}
                >
                  <i className="fas fa-plus"></i>
                  Crea Collezione
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Condivisione */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3>
                  <i className="fas fa-share-alt"></i>
                  Condividi Wishlist
                </h3>
                <button 
                  className="modal__close"
                  onClick={() => setShowShareModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal__body">
                <p>
                  {selectedForShare.length > 0 
                    ? `Condividi ${selectedForShare.length} prodotti selezionati`
                    : `Condividi tutti i ${filteredFavorites.length} prodotti ${selectedCollection !== 'all' ? 'della collezione' : 'nei preferiti'}`
                  }
                </p>
                
                <div className="share-options">
                  <button 
                    className="share-option"
                    onClick={shareWishlist}
                  >
                    <i className="fas fa-link"></i>
                    <span>Copia Link</span>
                  </button>
                  
                  <button 
                    className="share-option"
                    onClick={() => {
                      const shareData = {
                        title: 'I miei prodotti preferiti - Rustico Calabria',
                        text: 'Guarda i prodotti calabresi che ho selezionato!',
                        url: window.location.href
                      };
                      
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        shareWishlist();
                      }
                    }}
                  >
                    <i className="fas fa-share"></i>
                    <span>Condividi</span>
                  </button>
                </div>

                {/* Input nascosto per fallback copia */}
                <input 
                  ref={shareInputRef}
                  type="text"
                  style={{ position: 'absolute', left: '-9999px' }}
                  readOnly
                />
              </div>
              
              <div className="modal__footer">
                <button 
                  className="btn btn--secondary"
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedForShare([]);
                    setSelectMode(false);
                  }}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente per singola card preferito
const FavoriteCard = ({ 
  favorite, 
  isSelectMode, 
  isSelected, 
  onSelect, 
  onRemove, 
  onAddToCart,
  viewMode 
}) => {
  const product = favorite.product || {};
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`favorite-card ${isSelectMode ? 'favorite-card--selectable' : ''} ${isSelected ? 'favorite-card--selected' : ''}`}>
      {isSelectMode && (
        <div className="favorite-card__checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </div>
      )}

      <Link to={`/products/${product.slug || product.id}`} className="favorite-card__link">
        <div className="favorite-card__image-container">
          {!imageError && product.main_image ? (
            <img
              src={product.main_image}
              alt={product.name}
              className="favorite-card__image"
              onError={handleImageError}
            />
          ) : (
            <div className="favorite-card__no-image">
              <i className="fas fa-image"></i>
              <span>Nessuna immagine</span>
            </div>
          )}
        </div>

        <div className="favorite-card__content">
          <h3 className="favorite-card__title">{product.name}</h3>
          
          {product.category && (
            <div className="favorite-card__category">
              <i className="fas fa-tag"></i>
              {product.category.name}
            </div>
          )}

          <div className="favorite-card__price-container">
            <span className="favorite-card__price favorite-card__price--current">
              €{formatPrice(product.price)}
            </span>
          </div>

          {product.rating && (
            <div className="favorite-card__rating">
              <div className="stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star ${i < Math.floor(product.rating) ? 'active' : ''}`}
                  ></i>
                ))}
              </div>
              <span className="rating-text">({product.rating})</span>
            </div>
          )}
        </div>
      </Link>

      <div className="favorite-card__actions">
        <button
          onClick={onAddToCart}
          className="favorite-card__action-btn"
          disabled={product.stock <= 0}
        >
          <i className="fas fa-cart-plus"></i>
          {product.stock <= 0 ? 'Non disponibile' : 'Aggiungi al carrello'}
        </button>
        
        <button
          onClick={onRemove}
          className="favorite-card__action-btn favorite-card__action-btn--secondary"
        >
          <i className="fas fa-heart-broken"></i>
          Rimuovi
        </button>
      </div>

      <div className="favorite-card__meta">
        <div className="favorite-card__added-date">
          <i className="fas fa-clock"></i>
          Aggiunto il {formatDate(favorite.created_at)}
        </div>
      </div>
    </div>
  );
};

export default Favorites; 