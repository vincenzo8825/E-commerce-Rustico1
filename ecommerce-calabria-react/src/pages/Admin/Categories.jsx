import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    is_active: true
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      setCategories(response.data.categories || []);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
      setError('Impossibile caricare le categorie. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingCategory) {
        // Aggiornamento categoria esistente
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
      } else {
        // Creazione nuova categoria
        await api.post('/admin/categories', formData);
      }
      
      // Aggiorna l'elenco delle categorie
      fetchCategories();
      
      // Reset form e stato di editing
      resetForm();
      
    } catch (err) {
      console.error('Errore nel salvataggio della categoria:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Errore: ${err.response.data.message}`);
      } else {
        setError('Errore nel salvataggio della categoria. Riprova più tardi.');
      }
      
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      is_active: category.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la categoria "${name}"?`)) return;
    
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(categories.filter(category => category.id !== id));
      alert('Categoria eliminata con successo');
    } catch (err) {
      console.error('Errore nell\'eliminazione della categoria:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'eliminazione della categoria. Riprova più tardi.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      is_active: true
    });
    setEditingCategory(null);
    setShowForm(false);
    setError(null);
  };

  const toggleForm = () => {
    if (showForm && editingCategory) {
      resetForm();
    } else {
      setShowForm(!showForm);
    }
  };

  if (loading && !categories.length) {
    return (
      <div className="admin__loading-spinner">
        Caricamento categorie...
      </div>
    );
  }

  return (
    <>
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Gestione Categorie</h2>
          <button 
            className="admin__button admin__button--primary"
            onClick={toggleForm}
          >
            {showForm ? 'Annulla' : 'Nuova Categoria'}
          </button>
        </div>
        <div className="admin__card-body">
          {error && (
            <div className="admin__error">
              <p>{error}</p>
            </div>
          )}
          
          {showForm && (
            <form onSubmit={handleSubmit} className="admin__form">
              <h3 className="admin__form-title">
                {editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}
              </h3>
              
              <div className="admin__form-group">
                <label htmlFor="name" className="admin__form-group-label">Nome *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="admin__form-group-input"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="slug" className="admin__form-group-label">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  className="admin__form-group-input"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
                <small className="admin__form-group-help">
                  Identificativo URL della categoria (generato automaticamente)
                </small>
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="description" className="admin__form-group-label">Descrizione</label>
                <textarea
                  id="description"
                  name="description"
                  className="admin__form-group-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              
              <div className="admin__form-group">
                <div className="admin__form-group-checkbox">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_active">Categoria attiva</label>
                </div>
              </div>
              
              <div className="admin__form-actions">
                <button
                  type="button"
                  className="admin__button admin__button--secondary"
                  onClick={resetForm}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="admin__button admin__button--primary"
                  disabled={loading}
                >
                  {loading ? 'Salvataggio...' : 'Salva Categoria'}
                </button>
              </div>
            </form>
          )}
          
          {!showForm && (
            <>
              {categories.length === 0 ? (
                <p>Nessuna categoria disponibile. Crea la tua prima categoria!</p>
              ) : (
                <div className="admin__table-container">
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Slug</th>
                        <th>Prodotti</th>
                        <th>Stato</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td>{category.name}</td>
                          <td>{category.slug}</td>
                          <td>{category.products_count || 0}</td>
                          <td>
                            <span className={`admin__status-badge ${category.is_active ? 'admin__status-badge--success' : 'admin__status-badge--danger'}`}>
                              {category.is_active ? 'Attiva' : 'Inattiva'}
                            </span>
                          </td>
                          <td>
                            <div className="admin__table-actions">
                              <button
                                onClick={() => handleEdit(category)}
                                className="admin__button admin__button--secondary"
                              >
                                Modifica
                              </button>
                              <button
                                onClick={() => handleDelete(category.id, category.name)}
                                className="admin__button admin__button--danger"
                                disabled={category.products_count > 0}
                                title={category.products_count > 0 ? "Non puoi eliminare una categoria con prodotti" : ""}
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
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Categories; 