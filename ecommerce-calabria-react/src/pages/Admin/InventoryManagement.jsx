import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../../utils/api';
import './InventoryManagement.scss';

const COLORS = ['#8B4513', '#DEB887', '#CD853F', '#D2691E', '#A0522D', '#F4A460', '#BC8F8F', '#8FBC8F'];

const InventoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkUpdateStock, setBulkUpdateStock] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    if (overview) {
      fetchProducts();
    }
  }, [filters, sortBy, sortOrder, overview]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/inventory/dashboard/overview');
      
      if (response.data.success) {
        const data = response.data.data;
        setOverview(data.overview);
        setCategories(data.products_by_category);
        setAlerts(data.active_alerts);
      }
    } catch (error) {
      console.error('Errore nel caricamento dati inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {
        ...filters,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await api.get('/admin/inventory/dashboard/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.data.data);
      }
    } catch (error) {
      console.error('Errore nel caricamento prodotti:', error);
    }
  };

  const updateProductStock = async (productId, newStock, reason = '') => {
    try {
      const response = await api.put(`/admin/inventory/dashboard/products/${productId}/stock`, {
        stock: newStock,
        reason: reason
      });

      if (response.data.success) {
        await fetchInventoryData();
        await fetchProducts();
        alert('Stock aggiornato con successo!');
      }
    } catch (error) {
      console.error('Errore aggiornamento stock:', error);
      alert('Errore nell\'aggiornamento dello stock');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0 || !bulkUpdateStock) {
      alert('Seleziona prodotti e inserisci un valore di stock');
      return;
    }

    try {
      const updates = selectedProducts.map(productId => ({
        product_id: productId,
        stock: parseInt(bulkUpdateStock)
      }));

      const response = await api.post('/admin/inventory/dashboard/bulk-update', {
        updates: updates,
        reason: 'Aggiornamento multiplo manuale'
      });

      if (response.data.success) {
        await fetchInventoryData();
        await fetchProducts();
        setSelectedProducts([]);
        setBulkUpdateStock('');
        alert(`${response.data.data.updated.length} prodotti aggiornati con successo!`);
      }
    } catch (error) {
      console.error('Errore aggiornamento multiplo:', error);
      alert('Errore nell\'aggiornamento multiplo');
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out_of_stock': return '#DC3545';
      case 'low_stock': return '#FFC107';
      case 'medium_stock': return '#17A2B8';
      case 'high_stock': return '#28A745';
      default: return '#6C757D';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out_of_stock': return 'Esaurito';
      case 'low_stock': return 'Stock Basso';
      case 'medium_stock': return 'Stock Medio';
      case 'high_stock': return 'Stock Alto';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="inventory-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Caricamento inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management">
      {/* Header */}
      <div className="inventory-header">
        <h1>🏪 Gestione Inventario</h1>
        <p>Prodotti Tipici Calabresi - Dashboard Completa</p>
      </div>

      {/* Panoramica */}
      {overview && (
        <div className="inventory-overview">
          <div className="overview-cards">
            <div className="overview-card total">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Prodotti Totali</h3>
                <div className="number">{overview.total_products}</div>
                <small>{overview.active_products} attivi</small>
              </div>
            </div>
            
            <div className="overview-card value">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Valore Inventario</h3>
                <div className="number">€{overview.total_inventory_value}</div>
                <small>Totale stock</small>
              </div>
            </div>
            
            <div className="overview-card warning">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h3>Stock Basso</h3>
                <div className="number">{overview.low_stock_products}</div>
                <small>Richiede attenzione</small>
              </div>
            </div>
            
            <div className="overview-card danger">
              <div className="card-icon">🚫</div>
              <div className="card-content">
                <h3>Esauriti</h3>
                <div className="number">{overview.out_of_stock_products}</div>
                <small>Da riordinare</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grafici */}
      <div className="inventory-charts">
        <div className="chart-container">
          <h3>Prodotti per Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="products_count" fill="#8B4513" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Valore per Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: €${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_value"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`€${value}`, 'Valore']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert Attivi */}
      {alerts.length > 0 && (
        <div className="inventory-alerts">
          <h3>🚨 Alert Inventario Attivi</h3>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.alert_type}`}>
                <div className="alert-product">{alert.product_name}</div>
                <div className="alert-type">{alert.alert_type}</div>
                <div className="alert-stock">Stock: {alert.current_stock}</div>
                <div className="alert-threshold">Soglia: {alert.threshold}</div>
                <div className="alert-date">{alert.created_at}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtri e Controlli */}
      <div className="inventory-controls">
        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Cerca prodotti..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
          
          <select
            value={filters.stockStatus}
            onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
          >
            <option value="">Tutti gli stock</option>
            <option value="high">Stock Alto</option>
            <option value="medium">Stock Medio</option>
            <option value="low">Stock Basso</option>
            <option value="out">Esaurito</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Ordina per Nome</option>
            <option value="stock">Ordina per Stock</option>
            <option value="price">Ordina per Prezzo</option>
            <option value="created_at">Ordina per Data</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Aggiornamento Multiplo */}
        {selectedProducts.length > 0 && (
          <div className="bulk-update">
            <span>{selectedProducts.length} prodotti selezionati</span>
            <input
              type="number"
              placeholder="Nuovo stock"
              value={bulkUpdateStock}
              onChange={(e) => setBulkUpdateStock(e.target.value)}
            />
            <button onClick={handleBulkUpdate} className="btn-primary">
              Aggiorna Stock
            </button>
          </div>
        )}
      </div>

      {/* Lista Prodotti */}
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(products.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                  checked={selectedProducts.length === products.length}
                />
              </th>
              <th>Prodotto</th>
              <th>Categoria</th>
              <th>SKU</th>
              <th>Prezzo</th>
              <th>Stock</th>
              <th>Valore Stock</th>
              <th>Status</th>
              <th>Origine</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={product.stock_status}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="product-info">
                    <strong>{product.name}</strong>
                    <small>{product.weight}</small>
                    {product.is_featured && <span className="featured-badge">⭐ In evidenza</span>}
                  </div>
                </td>
                <td>{product.category}</td>
                <td><code>{product.sku}</code></td>
                <td>€{product.price}</td>
                <td>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateProductStock(product.id, parseInt(e.target.value), 'Aggiornamento manuale')}
                    className="stock-input"
                    min="0"
                  />
                </td>
                <td>€{product.stock_value}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStockStatusColor(product.stock_status) }}
                  >
                    {getStockStatusText(product.stock_status)}
                  </span>
                </td>
                <td>{product.origin}</td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => {
                        const newStock = prompt('Nuovo stock:', product.stock);
                        if (newStock !== null) {
                          updateProductStock(product.id, parseInt(newStock), 'Aggiornamento rapido');
                        }
                      }}
                      className="btn-sm btn-primary"
                    >
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement; 