import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stock: '',
    sort: 'name'
  });
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dataSource, setDataSource] = useState('server');

  useEffect(() => {
    // Carica le categorie per il filtro
    const fetchCategories = async () => {
      try {
        const response = await api.get('/admin/categories');
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Errore nel caricamento delle categorie:', err);
        // Se fallisce il caricamento categorie, usa dati di esempio
        setMockCategories();
      }
    };

    fetchCategories();
    fetchProducts();
  }, [currentPage, filters]);

  // Imposta categorie mock
  const setMockCategories = () => {
    setCategories([
      { id: 1, name: 'Salumi' },
      { id: 2, name: 'Oli' },
      { id: 3, name: 'Formaggi' },
      { id: 4, name: 'Vini' },
      { id: 5, name: 'Ortaggi' },
      { id: 6, name: 'Dolci' },
      { id: 7, name: 'Conserve' }
    ]);
  };

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
      setDataSource('server');
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err);
      setError('Impossibile caricare i prodotti. Riprova più tardi.');
      
      // Prova a caricare dati dal localStorage o usa dati demo
      if (!loadFromLocalStorage()) {
        setMockProducts();
        setDataSource('demo');
      }
    } finally {
      setLoading(false);
    }
  };

  // Carica prodotti da localStorage se disponibili
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('admin_products_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.products && parsedData.products.length > 0) {
          setProducts(parsedData.products);
          setTotalPages(parsedData.totalPages || 1);
          setDataSource('localStorage');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Errore nel caricamento dei dati da localStorage:', err);
      return false;
    }
  };

  // Imposta prodotti mock
  const setMockProducts = () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Nduja di Spilinga',
        slug: 'nduja-di-spilinga',
        description: 'Insaccato piccante spalmabile tipico della Calabria',
        price: 12.50,
        stock: 25,
        sku: 'SAL001',
        category: { id: 1, name: 'Salumi' },
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 2,
        name: 'Olio Extra Vergine Biologico',
        slug: 'olio-extra-vergine-biologico',
        description: 'Olio di oliva biologico spremuto a freddo',
        price: 18.90,
        stock: 45,
        sku: 'OLI001',
        category: { id: 2, name: 'Oli' },
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 3,
        name: 'Pecorino Crotonese DOP',
        slug: 'pecorino-crotonese-dop',
        description: 'Formaggio pecorino stagionato di Crotone',
        price: 9.75,
        stock: 15,
        sku: 'FOR001',
        category: { id: 3, name: 'Formaggi' },
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 4,
        name: 'Vino Cirò DOC',
        slug: 'vino-ciro-doc',
        description: 'Vino rosso calabrese DOC della zona di Cirò',
        price: 14.50,
        stock: 30,
        sku: 'VIN001',
        category: { id: 4, name: 'Vini' },
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 5,
        name: 'Cipolla Rossa di Tropea',
        slug: 'cipolla-rossa-di-tropea',
        description: 'Cipolle rosse IGP di Tropea',
        price: 4.90,
        stock: 50,
        sku: 'ORT001',
        category: { id: 5, name: 'Ortaggi' },
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 6,
        name: 'Torrone al Bergamotto',
        slug: 'torrone-al-bergamotto',
        description: 'Torrone artigianale con bergamotto di Reggio Calabria',
        price: 7.50,
        stock: 0,
        sku: 'DOL001',
        category: { id: 6, name: 'Dolci' },
        image: 'https://via.placeholder.com/150'
      }
    ];
    
    setProducts(mockProducts);
    setTotalPages(1);
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

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il prodotto "${name}"?`)) return;
    
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
      alert('Prodotto eliminato con successo');
    } catch (err) {
      console.error('Errore nell\'eliminazione del prodotto:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'eliminazione del prodotto. Riprova più tardi.');
      }
    }
  };

  if (loading && !products.length) {
    return (
      <div className="admin__loading-spinner">
        Caricamento prodotti...
      </div>
    );
  }

  return (
    <>
      {dataSource === 'localStorage' && (
        <div className="admin__alert admin__alert--warning" style={{marginBottom: '20px', padding: '10px 15px', borderRadius: '4px', backgroundColor: '#fff3cd', color: '#856404'}}>
          <strong>Nota:</strong> Visualizzazione dati dalla cache locale. Aggiorna la pagina per ottenere dati in tempo reale.
          <button 
            className="admin__button admin__button--sm admin__button--warning" 
            style={{marginLeft: '10px'}}
            onClick={fetchProducts}
          >
            Aggiorna
          </button>
        </div>
      )}
      
      {dataSource === 'demo' && (
        <div className="admin__alert admin__alert--info" style={{marginBottom: '20px', padding: '10px 15px', borderRadius: '4px', backgroundColor: '#d1ecf1', color: '#0c5460'}}>
          <strong>Nota:</strong> Visualizzazione dati dimostrativi. Questi dati sono di esempio e non riflettono lo stato reale del sistema.
          <button 
            className="admin__button admin__button--sm admin__button--info" 
            style={{marginLeft: '10px'}}
            onClick={fetchProducts}
          >
            Riprova connessione
          </button>
        </div>
      )}

      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Filtri</h2>
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
                <label htmlFor="stock" className="admin__form-group-label">Disponibilità</label>
                <select
                  id="stock"
                  name="stock"
                  className="admin__form-group-select"
                  value={filters.stock}
                  onChange={handleFilterChange}
                >
                  <option value="">Tutti</option>
                  <option value="in_stock">Disponibili</option>
                  <option value="low">Stock basso</option>
                  <option value="out_of_stock">Esauriti</option>
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
                  <option value="name">Nome (A-Z)</option>
                  <option value="-name">Nome (Z-A)</option>
                  <option value="price">Prezzo (crescente)</option>
                  <option value="-price">Prezzo (decrescente)</option>
                  <option value="-created_at">Più recenti</option>
                  <option value="stock">Stock (crescente)</option>
                  <option value="-stock">Stock (decrescente)</option>
                </select>
              </div>
              
              <div className="admin__form-group admin__form-group--submit">
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
          <h2 className="admin__card-title">Prodotti ({products.length} visualizzati)</h2>
          <Link to="/admin/products/new" className="admin__button admin__button--primary">
            Nuovo Prodotto
          </Link>
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
          ) : (
            <>
              <div className="admin__table-container">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Immagine</th>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Prezzo</th>
                      <th>Stock</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="admin__product-image"
                              width="50"
                              height="50"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="admin__product-no-image">No img</div>
                          )}
                          <div className="admin__product-no-image" style={{display: 'none'}}>
                            No img
                          </div>
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category?.name || '-'}</td>
                        <td>
                          {product.discount_price ? (
                            <>
                              <span className="admin__product-discount-price">
                                €{formatPrice(product.discount_price)}
                              </span>
                              <span className="admin__product-original-price">
                                €{formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span>€{formatPrice(product.price)}</span>
                          )}
                        </td>
                        <td>
                          <span className={`admin__stock-badge ${
                            product.stock <= 0 ? 'admin__stock-badge--out' :
                            product.stock < 10 ? 'admin__stock-badge--low' :
                            'admin__stock-badge--in'
                          }`}>
                            {product.stock <= 0 ? 'Esaurito' :
                             product.stock < 10 ? 'Basso' : 'Disponibile'} 
                            ({product.stock})
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
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="admin__button admin__button--danger"
                            >
                              Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="admin__pagination">
                  <button
                    className="admin__pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Precedente
                  </button>
                  
                  <div className="admin__pagination-pages">
                    Pagina {currentPage} di {totalPages}
                  </div>
                  
                  <button
                    className="admin__pagination-btn"
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

export default Products; 