import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import api from '../../utils/api';

const COLORS = {
  healthy: '#22C55E',
  warning: '#F59E0B', 
  error: '#EF4444',
  info: '#3B82F6'
};

const STATUS_COLORS = ['#22C55E', '#F59E0B', '#EF4444'];

const SystemMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch health data
  const fetchHealthData = useCallback(async () => {
    try {
      const [healthRes, statsRes] = await Promise.all([
        api.get('/health/check'),
        api.get('/health/stats')
      ]);

      setHealthData(healthRes.data);
      setStats(statsRes.data.stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Errore nel caricamento dati sistema:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto refresh
  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // 30 secondi
      return () => clearInterval(interval);
    }
  }, [fetchHealthData, autoRefresh]);

  // Ottimizza cache
  const optimizeCache = async () => {
    try {
      await api.post('/cache/optimize');
      alert('Cache ottimizzata con successo!');
      fetchHealthData();
    } catch {
      alert('Errore nell\'ottimizzazione cache');
    }
  };

  // Pulisci cache
  const clearCache = async () => {
    try {
      await api.post('/cache/clear');
      alert('Cache pulita con successo!');
      fetchHealthData();
    } catch {
      alert('Errore nella pulizia cache');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return COLORS.healthy;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.info;
    }
  };

  const getSystemStatus = () => {
    if (!healthData) return 'unknown';
    return healthData.status;
  };

  if (isLoading) {
    return (
      <div className="system-monitor loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Caricamento monitoraggio sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-monitor">
      {/* Header */}
      <div className="monitor-header">
        <div className="status-indicator">
          <div className={`status-dot ${getSystemStatus()}`}></div>
          <h2>Sistema {getSystemStatus() === 'healthy' ? 'Funzionante' : 'Con Problemi'}</h2>
          <span className="last-update">
            Ultimo aggiornamento: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>

        <div className="monitor-controls">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn ${autoRefresh ? 'btn-success' : 'btn-secondary'}`}
          >
            {autoRefresh ? '⏸️ Pausa' : '▶️ Auto'}
          </button>
          <button onClick={fetchHealthData} className="btn btn-primary">
            🔄 Aggiorna
          </button>
          <button onClick={optimizeCache} className="btn btn-warning">
            ⚡ Ottimizza Cache
          </button>
          <button onClick={clearCache} className="btn btn-danger">
            🗑️ Pulisci Cache
          </button>
        </div>
      </div>

      {/* Checks Grid */}
      <div className="health-checks-grid">
        {healthData?.checks && Object.entries(healthData.checks).map(([key, check]) => (
          <div key={key} className={`health-check ${check.status}`}>
            <div className="check-header">
              <div 
                className="check-status" 
                style={{ backgroundColor: getStatusColor(check.status) }}
              ></div>
              <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
            </div>
            <p className="check-message">{check.message}</p>
            {check.data && (
              <div className="check-data">
                {Object.entries(check.data).map(([dataKey, value]) => (
                  <span key={dataKey} className="data-item">
                    {dataKey}: <strong>{value}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sistema Info */}
      {healthData?.system_info && (
        <div className="system-info">
          <h3>Informazioni Sistema</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>PHP Version:</span>
              <strong>{healthData.system_info.php_version}</strong>
            </div>
            <div className="info-item">
              <span>Laravel Version:</span>
              <strong>{healthData.system_info.laravel_version}</strong>
            </div>
            <div className="info-item">
              <span>Server Time:</span>
              <strong>{healthData.system_info.server_time}</strong>
            </div>
            <div className="info-item">
              <span>Timezone:</span>
              <strong>{healthData.system_info.timezone}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Statistiche Database */}
      {stats?.database && (
        <div className="database-stats">
          <h3>Statistiche Database</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>👥 Utenti</h4>
              <div className="stat-number">{stats.database.users_total}</div>
              <div className="stat-details">
                <span>Verificati: {stats.database.users_verified}</span>
                <span>Admin: {stats.database.users_admin}</span>
              </div>
            </div>

            <div className="stat-card">
              <h4>📦 Prodotti</h4>
              <div className="stat-number">{stats.database.products_total}</div>
              <div className="stat-details">
                <span>Attivi: {stats.database.products_active}</span>
                <span>Stock Basso: {stats.database.products_low_stock}</span>
              </div>
            </div>

            <div className="stat-card">
              <h4>🛒 Ordini</h4>
              <div className="stat-number">{stats.database.orders_total}</div>
              <div className="stat-details">
                <span>In Sospeso: {stats.database.orders_pending}</span>
                <span>Completati: {stats.database.orders_completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Charts */}
      {stats?.performance && (
        <div className="performance-section">
          <h3>Performance Sistema</h3>
          <div className="performance-grid">
            <div className="performance-card">
              <h5>Utilizzo Memoria</h5>
              <div className="memory-info">
                <div className="memory-item">
                  <span>Attuale:</span>
                  <strong>{stats.performance.memory_usage.current}</strong>
                </div>
                <div className="memory-item">
                  <span>Picco:</span>
                  <strong>{stats.performance.memory_usage.peak}</strong>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <h5>Tempo Risposta</h5>
              <div className="response-time">
                <strong>{stats.performance.response_time_avg}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Stats */}
      {stats?.cache && (
        <div className="cache-stats">
          <h3>Statistiche Cache</h3>
          <div className="cache-grid">
            <div className="cache-item">
              <span>Cache Hits:</span>
              <strong>{stats.cache.cache_hits}</strong>
            </div>
            <div className="cache-item">
              <span>Cache Misses:</span>
              <strong>{stats.cache.cache_misses}</strong>
            </div>
            <div className="cache-item">
              <span>Hit Rate:</span>
              <strong>
                {stats.cache.cache_hits + stats.cache.cache_misses > 0
                  ? Math.round((stats.cache.cache_hits / (stats.cache.cache_hits + stats.cache.cache_misses)) * 100)
                  : 0}%
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor; 