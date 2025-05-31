import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../Toast/Toast';
import { LoadingSpinner, ErrorDisplay } from '../common/LoadingStates';
import './InventoryManager.scss';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all', // all, low_stock, out_of_stock, in_stock
    category: '',
    search: ''
  });
  const [categories, setCategories] = useState([]);
  const lowStockThreshold = 10;
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    total_products: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    total_value: 0
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchInventoryStats()
      ]);
    } catch (err) {
      setError('Errore nel caricamento dei dati inventario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/inventory/products');
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        // Dati mock per test
        setProducts([
          {
            id: 1,
            name: 'Nduja di Spilinga',
            sku: 'SAL001',
            stock: 5,
            min_stock: 10,
            price: 12.50,
            category: { name: 'Salumi' },
            status: 'low_stock'
          },
          {
            id: 2,
            name: 'Olio Extra Vergine',
            sku: 'OLI001',
            stock: 0,
            min_stock: 15,
            price: 18.90,
            category: { name: 'Oli' },
            status: 'out_of_stock'
          },
          {
            id: 3,
            name: 'Pecorino Crotonese',
            sku: 'FOR001',
            stock: 25,
            min_stock: 8,
            price: 9.75,
            category: { name: 'Formaggi' },
            status: 'in_stock'
          }
        ]);
      }
    } catch (err) {
      console.error('Errore nel caricamento prodotti:', err);
      throw err;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.categories || [
        { id: 1, name: 'Salumi' },
        { id: 2, name: 'Oli' },
        { id: 3, name: 'Formaggi' }
      ]);
    } catch (err) {
      console.error('Errore nel caricamento categorie:', err);
      setCategories([]);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get('/admin/inventory/stats');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        // Stats mock
        setStats({
          total_products: 156,
          in_stock: 98,
          low_stock: 12,
          out_of_stock: 8,
          total_value: 15420.75
        });
      }
    } catch (err) {
      console.error('Errore nel caricamento statistiche:', err);
      setStats({
        total_products: 0,
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
        total_value: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtra per status
    if (filters.status !== 'all') {
      filtered = filtered.filter(product => {
        if (filters.status === 'out_of_stock') {
          return product.stock === 0;
        } else if (filters.status === 'low_stock') {
          return product.stock > 0 && product.stock <= (product.min_stock || lowStockThreshold);
        } else if (filters.status === 'in_stock') {
          return product.stock > (product.min_stock || lowStockThreshold);
        }
        return true;
      });
    }

    // Filtra per categoria
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category?.id?.toString() === filters.category.toString()
      );
    }

    // Filtra per ricerca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const response = await api.patch(`/admin/inventory/products/${productId}/stock`, {
        stock: newStock
      });

      if (response.data.success) {
        setProducts(products.map(product =>
          product.id === productId ? { ...product, stock: newStock } : product
        ));
        addToast('Stock aggiornato con successo', 'success');
        
        // Ricarica le statistiche
        fetchInventoryStats();
      }
    } catch (err) {
      console.error('Errore nell\'aggiornamento stock:', err);
      addToast('Errore nell\'aggiornamento dello stock', 'error');
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock <= (product.min_stock || lowStockThreshold)) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusBadge = (status) => {
    const statusMap = {
      in_stock: { label: 'Disponibile', class: 'inventory-badge--success' },
      low_stock: { label: 'Scorte Basse', class: 'inventory-badge--warning' },
      out_of_stock: { label: 'Esaurito', class: 'inventory-badge--danger' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'inventory-badge--default' };
    
    return (
      <span className={`inventory-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const exportInventoryReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,SKU,Stock,Stock Minimo,Prezzo,Categoria,Stato\n"
      + products.map(product => 
          `"${product.name}","${product.sku}",${product.stock},${product.min_stock || lowStockThreshold},${product.price},"${product.category?.name || 'N/A'}","${getStockStatus(product)}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Report inventario esportato', 'success');
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Caricamento inventario..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchInitialData} />;
  }

  const filteredProducts = filterProducts();

  return (
    <div className="inventory-manager">
      <div className="inventory-manager__header">
        <div className="inventory-manager__title">
          <h1>Gestione Inventario</h1>
          <p>Monitora e gestisci le scorte dei prodotti</p>
        </div>
        
        <div className="inventory-manager__actions">
          <button
            onClick={exportInventoryReport}
            className="inventory-btn inventory-btn--secondary"
          >
            <i className="fas fa-download"></i>
            Esporta Report
          </button>
          <Link
            to="/admin/products/new"
            className="inventory-btn inventory-btn--primary"
          >
            <i className="fas fa-plus"></i>
            Aggiungi Prodotto
          </Link>
        </div>
      </div>

      {/* Statistiche */}
      <div className="inventory-stats">
        {statsLoading ? (
          <div className="inventory-stats__loading">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <>
            <div className="inventory-stat-card">
              <div className="inventory-stat-card__icon inventory-stat-card__icon--blue">
                <i className="fas fa-boxes"></i>
              </div>
              <div className="inventory-stat-card__content">
                <h3>Totale Prodotti</h3>
                <span className="inventory-stat-card__value">{stats.total_products}</span>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-card__icon inventory-stat-card__icon--green">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="inventory-stat-card__content">
                <h3>Disponibili</h3>
                <span className="inventory-stat-card__value">{stats.in_stock}</span>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-card__icon inventory-stat-card__icon--orange">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="inventory-stat-card__content">
                <h3>Scorte Basse</h3>
                <span className="inventory-stat-card__value">{stats.low_stock}</span>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-card__icon inventory-stat-card__icon--red">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="inventory-stat-card__content">
                <h3>Esauriti</h3>
                <span className="inventory-stat-card__value">{stats.out_of_stock}</span>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-card__icon inventory-stat-card__icon--purple">
                <i className="fas fa-euro-sign"></i>
              </div>
              <div className="inventory-stat-card__content">
                <h3>Valore Totale</h3>
                <span className="inventory-stat-card__value">€{stats.total_value.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filtri */}
      <div className="inventory-filters">
        <div className="inventory-filters__group">
          <input
            type="text"
            placeholder="Cerca per nome o SKU..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="inventory-input"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="inventory-select"
          >
            <option value="all">Tutti gli stati</option>
            <option value="in_stock">Disponibili</option>
            <option value="low_stock">Scorte Basse</option>
            <option value="out_of_stock">Esauriti</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="inventory-select"
          >
            <option value="">Tutte le categorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-filters__info">
          Visualizzando {filteredProducts.length} di {products.length} prodotti
        </div>
      </div>

      {/* Tabella Prodotti */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Prodotto</th>
              <th>SKU</th>
              <th>Stock Attuale</th>
              <th>Stock Minimo</th>
              <th>Prezzo</th>
              <th>Categoria</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className={`inventory-row inventory-row--${getStockStatus(product)}`}>
                  <td>
                    <div className="inventory-product">
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>
                    <code className="inventory-sku">{product.sku}</code>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => handleStockUpdate(product.id, parseInt(e.target.value) || 0)}
                      className="inventory-stock-input"
                      min="0"
                    />
                  </td>
                  <td>{product.min_stock || lowStockThreshold}</td>
                  <td>€{product.price.toFixed(2)}</td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>{getStockStatusBadge(getStockStatus(product))}</td>
                  <td>
                    <div className="inventory-actions">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="inventory-btn inventory-btn--small inventory-btn--primary"
                        title="Modifica prodotto"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="inventory-btn inventory-btn--small inventory-btn--secondary"
                        title="Visualizza dettagli"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="inventory-empty">
                  Nessun prodotto trovato con i filtri selezionati
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager; 