import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import './Home.scss';
import api, { testConnection } from '../../utils/api';

const Home = () => {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    success: false,
    message: '',
    error: null
  });
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailVerifiedMessage, setShowEmailVerifiedMessage] = useState(false);

  useEffect(() => {
    // Controlla se l'utente è stato reindirizzato dalla verifica email
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('email_verified') === 'true') {
      setShowEmailVerifiedMessage(true);
      // Nascondi il messaggio dopo 5 secondi
      setTimeout(() => {
        setShowEmailVerifiedMessage(false);
      }, 5000);
    }
  }, [location]);

  const testApiConnection = async () => {
    setApiStatus({
      loading: true,
      success: false,
      message: 'Verifica connessione in corso...',
      error: null
    });
    
    try {
      const response = await testConnection();
      console.log('Test di connessione completato:', response);
      
      setApiStatus({
        loading: false,
        success: true,
        message: 'Connessione al backend riuscita!',
        data: response,
        error: null
      });
    } catch (error) {
      console.error('Errore di connessione:', error);
      
      setApiStatus({
        loading: false,
        success: false,
        message: 'Impossibile connettersi al backend. Verifica che il server sia in esecuzione.',
        error: error
      });
    }
  };

  const fetchFeaturedData = async () => {
    setLoading(true);
    try {
      // Carica prodotti in evidenza usando l'API configurata
      const productsResponse = await api.get('/products/featured');
      setFeaturedProducts(productsResponse.data.featured_products || []);
      
      // Carica categorie in evidenza usando l'API configurata
      const categoriesResponse = await api.get('/categories/featured');
      const featuredCategories = categoriesResponse.data.featured_categories || [];
      setFeaturedCategories(featuredCategories);
      
      console.log('Categorie in evidenza caricate:', featuredCategories);
    } catch (error) {
      console.error('Errore nel caricamento dei dati in evidenza:', error);
      // Se l'API delle categorie fallisce, proviamo con l'endpoint generale
      try {
        const categoriesResponse = await api.get('/categories');
        const allCategories = categoriesResponse.data.categories || [];
        
        // Filtra le categorie in evidenza o prendi le prime 4
        const featured = allCategories.filter(cat => cat.is_featured).slice(0, 4);
        setFeaturedCategories(featured.length ? featured : allCategories.slice(0, 4));
        
        console.log('Categorie caricate (fallback):', featured);
      } catch (fallbackError) {
        console.error('Errore anche nel fallback delle categorie:', fallbackError);
        setFeaturedCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
    fetchFeaturedData();
  }, []);

  return (
    <div className="home">
      {/* Messaggio di verifica email */}
      {showEmailVerifiedMessage && (
        <div className="home__email-verified-message">
          <div className="home__email-verified-content">
            <span className="home__email-verified-icon">✓</span>
            <div className="home__email-verified-text">
              <h3>Email verificata con successo!</h3>
              <p>Ora puoi procedere con il login.</p>
            </div>
            <Link to="/login" className="home__email-verified-button">
              Accedi
            </Link>
            <button 
              className="home__email-verified-close" 
              onClick={() => setShowEmailVerifiedMessage(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Sezione di test API */}
      <div className={`home__api-test ${apiStatus.success ? 'home__api-test--success' : 'home__api-test--error'}`}>
        {apiStatus.loading ? (
          <p>Verifica connessione al backend...</p>
        ) : (
          <>
            <p>{apiStatus.message}</p>
            <button 
              className="home__api-test-retry" 
              onClick={testApiConnection}
            >
              Riprova connessione
            </button>
          </>
        )}
      </div>

      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__hero-title">Sapori Autentici della Calabria</h1>
          <p className="home__hero-subtitle">
            Scopri i migliori prodotti tipici calabresi, selezionati con cura dai migliori produttori locali.
          </p>
          <Link to="/products" className="home__hero-button">
            Esplora i Prodotti
          </Link>
        </div>
      </section>
      
      {loading ? (
        <div className="home__loading">Caricamento contenuti...</div>
      ) : (
        <>
          {/* Categorie in evidenza */}
          {featuredCategories.length > 0 && (
            <section className="home__section">
              <div className="home__container">
                <h2 className="home__section-title">Categorie in Evidenza</h2>
                <div className="home__categories">
                  {featuredCategories.map(category => (
                    <div key={category.id} className="home__category-item">
                      <CategoryCard category={category} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {/* Prodotti in evidenza */}
          {featuredProducts.length > 0 && (
            <section className="home__section home__section--alt">
              <div className="home__container">
                <h2 className="home__section-title">Prodotti in Evidenza</h2>
                <div className="home__products">
                  {featuredProducts.map(product => (
                    <div key={product.id} className="home__product-item">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <div className="home__more">
                  <Link to="/products" className="home__more-link">
                    Vedi tutti i prodotti
                  </Link>
                </div>
              </div>
            </section>
          )}
        </>
      )}
      
      <section className="home__section">
        <div className="home__container">
          <div className="home__about">
            <div className="home__about-content">
              <h2 className="home__section-title">La Nostra Storia</h2>
              <p className="home__about-text">
                Sapori di Calabria nasce dalla passione per la tradizione enogastronomica calabrese. 
                La nostra missione è portare sulle tavole di tutta Italia i sapori autentici della 
                Calabria, selezionando con cura i migliori prodotti dai piccoli produttori locali.
              </p>
              <Link to="/about" className="home__about-link">
                Scopri di più
              </Link>
            </div>
            <div className="home__about-image">
              <img 
                src="https://via.placeholder.com/500x300?text=Tradizione+Calabrese" 
                alt="Tradizione Calabrese" 
                className="home__about-img"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;