import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stock: 'low', // Default mostra prodotti con scorte basse
    sort: 'stock'
  });
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bulkUpdateItems, setBulkUpdateItems] = useState([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  useEffect(() => {
    // Carica le categorie per il filtro
    const fetchCategories = async () => {
      try {
        const response = await api.get('/admin/categories');
        setCategories(response.data.categories);
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
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category_id', filters.category);
      if (filters.stock) params.append('stock', filters.stock);
      params.append('sort', filters.sort);
      params.append('page', currentPage);
      
      const response = await api.get(`/admin/products?${params.toString()}`);
      setProducts(response.data.products.data || []);
      setTotalPages(response.data.products.last_page || 1);
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
  };

  const updateStock = async (productId, newStock) => {
    try {
      await api.put(`/admin/products/${productId}/stock`, { stock: newStock });
      
      // Aggiorna lo stato dei prodotti
      setProducts(products.map(product => {
        if (product.id === productId) {
          return { ...product, stock: newStock };
        }
        return product;
      }));
      
    } catch (err) {
      console.error('Errore nell\'aggiornamento delle scorte:', err);
      alert('Errore nell\'aggiornamento delle scorte. Riprova più tardi.');
    }
  };

  const addToBulkUpdate = (product) => {
    // Verifica se il prodotto è già presente nell'array di aggiornamento
    const existingItem = bulkUpdateItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Se già presente, rimuovilo
      setBulkUpdateItems(bulkUpdateItems.filter(item => item.id !== product.id));
    } else {
      // Altrimenti, aggiungilo
      setBulkUpdateItems([...bulkUpdateItems, {
        id: product.id,
        name: product.name,
        current_stock: product.stock,
        new_stock: product.stock
      }]);
    }
  };

  const handleBulkUpdateChange = (id, value) => {
    setBulkUpdateItems(bulkUpdateItems.map(item => {
      if (item.id === id) {
        return { ...item, new_stock: parseInt(value) || 0 };
      }
      return item;
    }));
  };

  const submitBulkUpdate = async () => {
    try {
      // Preparazione dei dati per l'aggiornamento
      const updates = bulkUpdateItems.map(item => ({
        id: item.id,
        stock: item.new_stock
      }));
      
      await api.post('/admin/products/bulk-update-stock', { updates });
      
      // Aggiorna la lista prodotti
      setProducts(products.map(product => {
        const updatedItem = bulkUpdateItems.find(item => item.id === product.id);
        if (updatedItem) {
          return { ...product, stock: updatedItem.new_stock };
        }
        return product;
      }));
      
      // Pulizia
      setBulkUpdateItems([]);
      setShowBulkUpdate(false);
      
      alert('Scorte aggiornate con successo!');
    } catch (err) {
      console.error('Errore nell\'aggiornamento delle scorte:', err);
      alert('Errore nell\'aggiornamento delle scorte. Riprova più tardi.');
    }
  };

  const getStockStatusClass = (stock) => {
    if (stock <= 0) return 'admin__stock-status--out';
    if (stock < 5) return 'admin__stock-status--low';
    if (stock < 10) return 'admin__stock-status--medium';
    return 'admin__stock-status--good';
  };

  const getStockStatusText = (stock) => {
    if (stock <= 0) return 'Esaurito';
    if (stock < 5) return 'Scorte basse';
    if (stock < 10) return 'Medio';
    return 'Buono';
  };

  return (
    <>
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Filtri Magazzino</h2>
        </div>
        <div className="admin__card-body">
          <form onSubmit={handleSearch} className="admin__filters">
            <div className="admin__filters-row">
              <div className="admin__form-group">
                <label htmlFor="search" className="admin__form-group-label">Cerca</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="admin__form-group-input"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Nome o SKU"
                />
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="category" className="admin__form-group-label">Categoria</label>
                <select
                  id="category"
                  name="category"
                  className="admin__form-group-select"
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
              
              <div className="admin__form-group">
                <label htmlFor="stock" className="admin__form-group-label">Stato scorte</label>
                <select
                  id="stock"
                  name="stock"
                  className="admin__form-group-select"
                  value={filters.stock}
                  onChange={handleFilterChange}
                >
                  <option value="">Tutte le scorte</option>
                  <option value="out">Esauriti</option>
                  <option value="low">Scorte basse</option>
                  <option value="medium">Scorte medie</option>
                  <option value="good">Scorte buone</option>
                </select>
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="sort" className="admin__form-group-label">Ordina per</label>
                <select
                  id="sort"
                  name="sort"
                  className="admin__form-group-select"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="stock">Scorte (asc)</option>
                  <option value="-stock">Scorte (desc)</option>
                  <option value="name">Nome (A-Z)</option>
                  <option value="-name">Nome (Z-A)</option>
                </select>
              </div>
              
              <div className="admin__form-group">
                <button type="submit" className="admin__button admin__button--primary">
                  Filtra
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Gestione Magazzino ({products.length} prodotti)</h2>
          <div className="admin__header-actions">
            <button
              className="admin__button admin__button--primary"
              onClick={() => setShowBulkUpdate(!showBulkUpdate)}
              disabled={bulkUpdateItems.length === 0}
            >
              {showBulkUpdate ? 'Annulla' : `Modifica in blocco (${bulkUpdateItems.length})`}
            </button>
          </div>
        </div>
        
        <div className="admin__card-body">
          {error ? (
            <div className="admin__error">
              <p>{error}</p>
              <button
                className="admin__button admin__button--primary"
                onClick={fetchProducts}
              >
                Riprova
              </button>
            </div>
          ) : loading ? (
            <div className="admin__loading-spinner">
              Caricamento prodotti...
            </div>
          ) : (
            <>
              {showBulkUpdate && bulkUpdateItems.length > 0 ? (
                <div className="admin__bulk-update">
                  <h3>Aggiornamento Scorte in Blocco</h3>
                  <div className="admin__bulk-update-list">
                    {bulkUpdateItems.map(item => (
                      <div key={item.id} className="admin__bulk-update-item">
                        <span className="admin__bulk-update-name">{item.name}</span>
                        <div className="admin__bulk-update-stock">
                          <span className="admin__bulk-update-current">
                            Attuale: {item.current_stock}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={item.new_stock}
                            onChange={(e) => handleBulkUpdateChange(item.id, e.target.value)}
                            className="admin__bulk-update-input"
                          />
                        </div>
                        <button
                          className="admin__button admin__button--danger"
                          onClick={() => setBulkUpdateItems(bulkUpdateItems.filter(i => i.id !== item.id))}
                        >
                          Rimuovi
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="admin__bulk-update-actions">
                    <button
                      className="admin__button admin__button--secondary"
                      onClick={() => setShowBulkUpdate(false)}
                    >
                      Annulla
                    </button>
                    <button
                      className="admin__button admin__button--success"
                      onClick={submitBulkUpdate}
                    >
                      Salva Modifiche
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {products.length === 0 ? (
                    <p>Nessun prodotto trovato con i filtri selezionati.</p>
                  ) : (
                    <div className="admin__table-container">
                      <table className="admin__table">
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                onChange={() => {
                                  if (bulkUpdateItems.length === products.length) {
                                    // Se tutti i prodotti sono selezionati, deseleziona tutti
                                    setBulkUpdateItems([]);
                                  } else {
                                    // Altrimenti, seleziona tutti
                                    setBulkUpdateItems(products.map(product => ({
                                      id: product.id,
                                      name: product.name,
                                      current_stock: product.stock,
                                      new_stock: product.stock
                                    })));
                                  }
                                }}
                                checked={bulkUpdateItems.length === products.length && products.length > 0}
                              />
                            </th>
                            <th>ID</th>
                            <th>Immagine</th>
                            <th>Nome</th>
                            <th>SKU</th>
                            <th>Categoria</th>
                            <th>Prezzo</th>
                            <th>Scorte</th>
                            <th>Stato</th>
                            <th>Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={bulkUpdateItems.some(item => item.id === product.id)}
                                  onChange={() => addToBulkUpdate(product)}
                                />
                              </td>
                              <td>{product.id}</td>
                              <td>
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="admin__product-image"
                                    width="50"
                                    height="50"
                                  />
                                ) : (
                                  <div className="admin__product-no-image">No img</div>
                                )}
                              </td>
                              <td>{product.name}</td>
                              <td>{product.sku || '-'}</td>
                              <td>{product.category?.name || '-'}</td>
                              <td>
                                {product.discount_price ? (
                                  <>
                                    <span className="admin__product-discount-price">
                                      €{product.discount_price.toFixed(2)}
                                    </span>
                                    <span className="admin__product-original-price">
                                      €{product.price.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>€{product.price.toFixed(2)}</span>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={product.stock}
                                  onChange={(e) => {
                                    const newStock = parseInt(e.target.value) || 0;
                                    // Aggiorna temporaneamente nella UI
                                    setProducts(products.map(p => {
                                      if (p.id === product.id) {
                                        return { ...p, stock: newStock };
                                      }
                                      return p;
                                    }));
                                  }}
                                  onBlur={(e) => {
                                    const newStock = parseInt(e.target.value) || 0;
                                    if (newStock !== product.original_stock) {
                                      updateStock(product.id, newStock);
                                    }
                                  }}
                                  className="admin__stock-input"
                                />
                              </td>
                              <td>
                                <span className={`admin__stock-status ${getStockStatusClass(product.stock)}`}>
                                  {getStockStatusText(product.stock)}
                                </span>
                              </td>
                              <td>
                                <div className="admin__table-actions">
                                  <Link
                                    to={`/admin/products/${product.id}`}
                                    className="admin__button admin__button--secondary"
                                  >
                                    Modifica
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              
              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="admin__pagination">
                  <button
                    className="admin__pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Precedente
                  </button>
                  
                  <div className="admin__pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`admin__pagination-page ${page === currentPage ? 'admin__pagination-page--active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="admin__pagination-button"
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
    </>
  );
};

export default Inventory; 