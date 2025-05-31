import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { LoadingSpinner, ErrorDisplay } from '../../components/common/LoadingStates';
import './Admin.scss';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    shipping_cost: 0,
    free_shipping_threshold: 0,
    tax_rate: 0,
    currency: 'EUR',
    maintenance_mode: false,
    newsletter_enabled: true,
    reviews_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      
      if (response.data.success) {
        setSettings({ ...settings, ...response.data.data });
      }
    } catch (err) {
      setError('Errore nel caricamento delle impostazioni');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', settings);
      
      if (response.data.success) {
        alert('Impostazioni salvate con successo!');
      }
    } catch (err) {
      alert('Errore nel salvataggio delle impostazioni');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Caricamento impostazioni..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchSettings} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__content">
          <h1 className="admin-title">Impostazioni Sistema</h1>
          <p className="admin-subtitle">
            Configura le impostazioni generali della piattaforma
          </p>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'general' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Generali
          </button>
          <button
            className={`admin-tab ${activeTab === 'ecommerce' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('ecommerce')}
          >
            E-commerce
          </button>
          <button
            className={`admin-tab ${activeTab === 'features' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Funzionalità
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'general' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2>Impostazioni Generali</h2>
              </div>
              <div className="admin-card__content">
                <div className="admin-form-grid admin-form-grid--1">
                  <div className="admin-form-group">
                    <label className="admin-label">Nome Sito</label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => handleChange('site_name', e.target.value)}
                      className="admin-input"
                      placeholder="Rustico Calabria"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Descrizione Sito</label>
                    <textarea
                      value={settings.site_description}
                      onChange={(e) => handleChange('site_description', e.target.value)}
                      className="admin-textarea"
                      rows="3"
                      placeholder="Descrizione del sito web..."
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Email di Contatto</label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => handleChange('contact_email', e.target.value)}
                      className="admin-input"
                      placeholder="info@rusticocalabria.it"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Telefono di Contatto</label>
                    <input
                      type="tel"
                      value={settings.contact_phone}
                      onChange={(e) => handleChange('contact_phone', e.target.value)}
                      className="admin-input"
                      placeholder="+39 0984 123456"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.maintenance_mode}
                        onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                        className="admin-checkbox"
                      />
                      Modalità Manutenzione
                    </label>
                    <small className="admin-help-text">
                      Attiva per mettere il sito in manutenzione
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ecommerce' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2>Impostazioni E-commerce</h2>
              </div>
              <div className="admin-card__content">
                <div className="admin-form-grid admin-form-grid--2">
                  <div className="admin-form-group">
                    <label className="admin-label">Valuta</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="admin-select"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollaro ($)</option>
                      <option value="GBP">Sterlina (£)</option>
                    </select>
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Tasso IVA (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.tax_rate}
                      onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
                      className="admin-input"
                      placeholder="22.00"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Costo Spedizione (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.shipping_cost}
                      onChange={(e) => handleChange('shipping_cost', parseFloat(e.target.value) || 0)}
                      className="admin-input"
                      placeholder="5.00"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Soglia Spedizione Gratuita (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => handleChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                      className="admin-input"
                      placeholder="50.00"
                    />
                    <small className="admin-help-text">
                      Importo minimo per spedizione gratuita
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2>Funzionalità Attive</h2>
              </div>
              <div className="admin-card__content">
                <div className="admin-form-grid admin-form-grid--1">
                  <div className="admin-form-group">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.newsletter_enabled}
                        onChange={(e) => handleChange('newsletter_enabled', e.target.checked)}
                        className="admin-checkbox"
                      />
                      Newsletter
                    </label>
                    <small className="admin-help-text">
                      Permetti agli utenti di iscriversi alla newsletter
                    </small>
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.reviews_enabled}
                        onChange={(e) => handleChange('reviews_enabled', e.target.checked)}
                        className="admin-checkbox"
                      />
                      Recensioni Prodotti
                    </label>
                    <small className="admin-help-text">
                      Permetti agli utenti di lasciare recensioni sui prodotti
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="admin-form-actions">
            <button
              type="submit"
              disabled={saving}
              className="admin-button admin-button--primary"
            >
              {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings; 