import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ToastProvider } from './components/Toast/Toast';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import Categories from './pages/Categories/Categories';
import Cart from './pages/Cart/Cart';
import Favorites from './pages/User/Favorites';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserDashboard from './pages/User/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import { isAuthenticated } from './utils/auth';
import api from './utils/api';
import './App.scss';
import ProductDetail from './pages/Products/ProductDetail';
import Checkout from './pages/Checkout/Checkout';

// Global auth state
const AuthContext = React.createContext({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  emailVerified: false,
  loading: true,
  setAuthState: () => {},
});

// Hook per usare AuthContext
export const useAuth = () => React.useContext(AuthContext);

// Componente wrapper per gestire visibilità di Navbar e Footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="app">
      {!isAdminRoute && <Navbar />}
      <main className={`app__content ${isAdminRoute ? 'app__content--admin' : ''}`}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

// Componente per proteggere rotte che richiedono autenticazione
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <div className="app__loading">Verifica autenticazione...</div>;
  }
  
  if (!isLoggedIn) {
    // Redirect a login se non autenticato
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente per proteggere rotte admin
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se l'utente è autenticato e admin
    if (!loading) {
      if (!isLoggedIn) {
        // Reindirizza al login se non autenticato
        navigate('/login', { replace: true });
      } else if (isAdmin !== true) {
        // Reindirizza alla home se non è admin
        navigate('/', { 
          replace: true,
          state: { message: 'Non hai i permessi necessari per accedere all\'area amministrativa.' }
        });
      }
    }
  }, [isLoggedIn, isAdmin, loading, navigate]);

  if (loading) {
    return <div className="app__loading">Verifica permessi in corso...</div>;
  }

  if (!isLoggedIn || !isAdmin) {
    return null; // Il reindirizzamento è gestito nell'useEffect
  }

  return children;
};

// Componente per utenti con email verificata
const VerifiedRoute = ({ children }) => {
  const { isLoggedIn, emailVerified, loading } = useAuth();
  
  if (loading) {
    return <div className="app__loading">Verifica stato email...</div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (!emailVerified) {
    return <div className="app__verification-required">
      <h2>Verifica Email Richiesta</h2>
      <p>Per accedere a questa sezione devi prima verificare la tua email.</p>
      <p>Controlla la tua casella di posta e clicca sul link di conferma.</p>
      <button 
        className="app__resend-btn"
        onClick={() => {
          api.post('/email/verification-notification')
            .then(() => alert('Email di verifica inviata con successo!'))
            .catch(() => alert('Errore durante l\'invio dell\'email.'));
        }}
      >
        Invia nuovamente email di verifica
      </button>
      <button 
        className="app__back-btn"
        onClick={() => window.history.back()}
      >
        Torna indietro
      </button>
    </div>;
  }
  
  return children;
};

function App() {
  const [authState, setAuthState] = useState({
    isLoggedIn: isAuthenticated(),
    isAdmin: false,
    user: null,
    emailVerified: false,
    loading: true,
  });

  useEffect(() => {
    // Verifica lo stato di autenticazione dell'utente all'avvio
    const checkAuthStatus = async () => {
      if (!isAuthenticated()) {
        setAuthState({
          isLoggedIn: false,
          isAdmin: false,
          user: null,
          emailVerified: false,
          loading: false,
        });
        return;
      }
      
      try {
        // Aggiunge log per debug
        // console.log("Verificando stato autenticazione...");
        const response = await api.get('/auth/check');
        // console.log("Risposta check auth:", response.data);
        
        // Verifica esplicitamente lo stato admin
        const isAdminUser = response.data.user && response.data.user.is_admin === true;
        // console.log("Utente è admin:", isAdminUser);
        
        // Aggiorna lo stato con enfasi sull'attributo isAdmin
        setAuthState({
          isLoggedIn: true,
          isAdmin: isAdminUser,
          user: response.data.user,
          emailVerified: response.data.user.email_verified,
          loading: false,
        });
        
        // Salva in localStorage come backup
        localStorage.setItem('auth_data', JSON.stringify({
          isAdmin: isAdminUser,
          emailVerified: response.data.user.email_verified
        }));
      } catch (error) {
        // Se c'è un errore, probabilmente il token non è valido
        console.error('Errore verifica autenticazione:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('auth_data');
        setAuthState({
          isLoggedIn: false,
          isAdmin: false,
          user: null,
          emailVerified: false,
          loading: false,
        });
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const authContextValue = {
    ...authState,
    setAuthState: (newState) => setAuthState(prev => ({ ...prev, ...newState })),
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ToastProvider>
        <CartProvider>
          <Router>
            <AppLayout>
              <Routes>
                {/* Rotte pubbliche */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotte protette per utenti autenticati */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <VerifiedRoute>
                    <Checkout />
                  </VerifiedRoute>
                } />
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/*" element={
                  <VerifiedRoute>
                    <UserDashboard />
                  </VerifiedRoute>
                } />
                
                {/* Rotte protette per admin */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
              </Routes>
            </AppLayout>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );
}

export default App;
