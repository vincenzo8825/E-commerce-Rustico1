import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    sku: '',
    stock: '',
    weight: '',
    is_featured: false,
    is_active: true,
    images: []
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    fetchCategories();
    
    if (isEditMode) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
      setError('Impossibile caricare le categorie. Riprova più tardi.');
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/products/${id}`);
      
      // Formatta i dati per il form
      const product = response.data.product;
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discount_price: product.discount_price || '',
        category_id: product.category_id,
        sku: product.sku,
        stock: product.stock,
        weight: product.weight || '',
        is_featured: product.is_featured,
        is_active: product.is_active
      });
      
      if (product.images && product.images.length > 0) {
        setUploadedImages(product.images);
      }
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei dettagli del prodotto:', err);
      setError('Impossibile caricare i dettagli del prodotto. Riprova più tardi.');
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
    
    // Pulisci l'errore di validazione quando l'utente modifica il campo
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validazione tipo file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationErrors({
        ...validationErrors,
        image: 'Il file deve essere un\'immagine (JPEG, PNG, WebP)'
      });
      return;
    }
    
    // Validazione dimensione (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setValidationErrors({
        ...validationErrors,
        image: 'L\'immagine non può superare i 2MB'
      });
      return;
    }
    
    // Crea URL per anteprima
    const previewUrl = URL.createObjectURL(file);
    setImagePreview({
      file,
      url: previewUrl
    });
    
    // Rimuovi errore di validazione
    if (validationErrors.image) {
      setValidationErrors({
        ...validationErrors,
        image: null
      });
    }
  };

  const handleImageUpload = async () => {
    if (!imagePreview) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', imagePreview.file);
      
      const response = await api.post('/admin/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadedImages([...uploadedImages, response.data.image]);
      setImagePreview(null);
      return response.data.image.id;
    } catch (err) {
      console.error('Errore nel caricamento dell\'immagine:', err);
      setError('Errore nel caricamento dell\'immagine. Riprova più tardi.');
      return null;
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleRemovePreview = () => {
    setImagePreview(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Il nome del prodotto è obbligatorio';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descrizione del prodotto è obbligatoria';
    }
    
    if (!formData.price) {
      errors.price = 'Il prezzo è obbligatorio';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Il prezzo deve essere maggiore di 0';
    }
    
    if (formData.discount_price && parseFloat(formData.discount_price) >= parseFloat(formData.price)) {
      errors.discount_price = 'Il prezzo scontato deve essere inferiore al prezzo originale';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'La categoria è obbligatoria';
    }
    
    if (!formData.sku.trim()) {
      errors.sku = 'Il codice SKU è obbligatorio';
    }
    
    if (!formData.stock) {
      errors.stock = 'La quantità in magazzino è obbligatoria';
    } else if (parseInt(formData.stock) < 0) {
      errors.stock = 'La quantità in magazzino non può essere negativa';
    }
    
    if (!isEditMode && uploadedImages.length === 0 && !imagePreview) {
      errors.image = 'Almeno un\'immagine è obbligatoria';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Se c'è un'immagine in anteprima, caricala prima
      let uploadedImageId = null;
      if (imagePreview) {
        uploadedImageId = await handleImageUpload();
      }
      
      // Prepara i dati per l'invio
      const productData = { ...formData };
      
      // Aggiungi gli ID delle immagini caricate
      productData.image_ids = uploadedImages.map(img => img.id);
      if (uploadedImageId) {
        productData.image_ids.push(uploadedImageId);
      }
      
      if (isEditMode) {
        await api.put(`/admin/products/${id}`, productData);
      } else {
        await api.post('/admin/products', productData);
      }
      
      navigate('/admin/products', { 
        state: { 
          message: `Prodotto ${isEditMode ? 'modificato' : 'creato'} con successo` 
        } 
      });
    } catch (err) {
      console.error(`Errore nel ${isEditMode ? 'aggiornamento' : 'salvataggio'} del prodotto:`, err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Gestisci gli errori di validazione dal server
        const serverErrors = {};
        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          serverErrors[key] = messages[0];
        });
        setValidationErrors(serverErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(`Errore nel ${isEditMode ? 'aggiornamento' : 'salvataggio'} del prodotto. Riprova più tardi.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin__loading-spinner">
        Caricamento dati prodotto...
      </div>
    );
  }

  return (
    <div className="admin__card">
      <div className="admin__card-header">
        <h2 className="admin__card-title">
          {isEditMode ? `Modifica Prodotto: ${formData.name}` : 'Nuovo Prodotto'}
        </h2>
        <Link to="/admin/products" className="admin__button admin__button--secondary">
          Torna ai prodotti
        </Link>
      </div>
      <div className="admin__card-body">
        {error && (
          <div className="admin__error">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin__form">
          <div className="admin__form-row">
            <div className="admin__form-group">
              <label htmlFor="name" className="admin__form-group-label">Nome Prodotto *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`admin__form-group-input ${validationErrors.name ? 'admin__form-group-input--error' : ''}`}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Es. Olio Extravergine d'Oliva Biologico Calabrese"
                required
              />
              {validationErrors.name && (
                <div className="admin__form-group-error">{validationErrors.name}</div>
              )}
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="category_id" className="admin__form-group-label">Categoria *</label>
              <select
                id="category_id"
                name="category_id"
                className={`admin__form-group-select ${validationErrors.category_id ? 'admin__form-group-input--error' : ''}`}
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleziona categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.category_id && (
                <div className="admin__form-group-error">{validationErrors.category_id}</div>
              )}
            </div>
          </div>
          
          <div className="admin__form-group">
            <label htmlFor="description" className="admin__form-group-label">Descrizione *</label>
            <textarea
              id="description"
              name="description"
              className={`admin__form-group-textarea ${validationErrors.description ? 'admin__form-group-textarea--error' : ''}`}
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              placeholder="Descrizione dettagliata del prodotto..."
              required
            ></textarea>
            {validationErrors.description && (
              <div className="admin__form-group-error">{validationErrors.description}</div>
            )}
          </div>
          
          <div className="admin__form-row">
            <div className="admin__form-group">
              <label htmlFor="price" className="admin__form-group-label">Prezzo (€) *</label>
              <input
                type="number"
                id="price"
                name="price"
                className={`admin__form-group-input ${validationErrors.price ? 'admin__form-group-input--error' : ''}`}
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
              />
              {validationErrors.price && (
                <div className="admin__form-group-error">{validationErrors.price}</div>
              )}
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="discount_price" className="admin__form-group-label">Prezzo Scontato (€)</label>
              <input
                type="number"
                id="discount_price"
                name="discount_price"
                className={`admin__form-group-input ${validationErrors.discount_price ? 'admin__form-group-input--error' : ''}`}
                value={formData.discount_price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
              />
              {validationErrors.discount_price && (
                <div className="admin__form-group-error">{validationErrors.discount_price}</div>
              )}
              <small className="admin__form-group-help">
                Lascia vuoto se non in offerta
              </small>
            </div>
          </div>
          
          <div className="admin__form-row">
            <div className="admin__form-group">
              <label htmlFor="sku" className="admin__form-group-label">Codice SKU *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                className={`admin__form-group-input ${validationErrors.sku ? 'admin__form-group-input--error' : ''}`}
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Es. OLIO-BIO-500"
                required
              />
              {validationErrors.sku && (
                <div className="admin__form-group-error">{validationErrors.sku}</div>
              )}
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="stock" className="admin__form-group-label">Quantità in Magazzino *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                className={`admin__form-group-input ${validationErrors.stock ? 'admin__form-group-input--error' : ''}`}
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                step="1"
                required
              />
              {validationErrors.stock && (
                <div className="admin__form-group-error">{validationErrors.stock}</div>
              )}
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="weight" className="admin__form-group-label">Peso (g)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                className="admin__form-group-input"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="Es. 500"
              />
              <small className="admin__form-group-help">
                Peso in grammi
              </small>
            </div>
          </div>
          
          <div className="admin__form-row">
            <div className="admin__form-group">
              <div className="admin__form-group-checkbox">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_featured">Prodotto in evidenza</label>
              </div>
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
                <label htmlFor="is_active">Prodotto attivo</label>
              </div>
            </div>
          </div>
          
          <div className="admin__form-group">
            <label htmlFor="image" className="admin__form-group-label">Immagini Prodotto</label>
            
            <div className="admin__images-container">
              {uploadedImages.length > 0 && (
                <div className="admin__images-preview">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="admin__image-preview-item">
                      <img src={image.url} alt={`Immagine ${index + 1}`} className="admin__image-preview" />
                      <button 
                        type="button" 
                        className="admin__image-remove-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {imagePreview && (
                <div className="admin__image-preview-item">
                  <img src={imagePreview.url} alt="Anteprima" className="admin__image-preview" />
                  <button 
                    type="button" 
                    className="admin__image-remove-btn"
                    onClick={handleRemovePreview}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {(!isEditMode && uploadedImages.length === 0 && !imagePreview) && (
                <div className={`admin__image-upload-placeholder ${validationErrors.image ? 'admin__image-upload-placeholder--error' : ''}`}>
                  <span>Seleziona un'immagine</span>
                </div>
              )}
            </div>
            
            <input
              type="file"
              id="image"
              name="image"
              className="admin__form-group-file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange}
            />
            
            {validationErrors.image && (
              <div className="admin__form-group-error">{validationErrors.image}</div>
            )}
            
            <small className="admin__form-group-help">
              Formati supportati: JPEG, PNG, WebP. Max 2MB.
            </small>
          </div>
          
          <div className="admin__form-actions">
            <Link to="/admin/products" className="admin__button admin__button--secondary">
              Annulla
            </Link>
            <button
              type="submit"
              className="admin__button admin__button--primary"
              disabled={submitting}
            >
              {submitting ? 'Salvataggio in corso...' : isEditMode ? 'Aggiorna Prodotto' : 'Crea Prodotto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 