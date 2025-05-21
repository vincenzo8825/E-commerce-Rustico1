import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated as checkAuth, logout, isAdmin as checkIsAdmin } from '../../utils/auth';
import NotificationCenter from '../Notifications/NotificationCenter';
import './Navbar.scss';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Controlla se l'utente è autenticato e/o admin
    const checkAuthentication = () => {
      const isAuth = checkAuth();
      setIsUserAuthenticated(isAuth);
      
      if (isAuth) {
        setIsUserAdmin(checkIsAdmin());
      } else {
        setIsUserAdmin(false);
      }
    };

    // Esegui il controllo all'inizio
    checkAuthentication();

    // Ascolta gli eventi di storage per rilevare login/logout in altre schede
    const handleStorageChange = () => {
      checkAuthentication();
    };

    window.addEventListener('storage', handleStorageChange);

    // Esegui la pulizia alla rimozione del componente
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserAuthenticated(false);
    setIsUserAdmin(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          Sapori di Calabria
        </Link>
        
        <div className="navbar__menu">
          <Link to="/products" className="navbar__menu-item">
            Prodotti
          </Link>
          <Link to="/categories" className="navbar__menu-item">
            Categorie
          </Link>
          <Link to="/cart" className="navbar__menu-item">
            Carrello
          </Link>
          <Link to="/favorites" className="navbar__menu-item">
            Preferiti
          </Link>
          
          {isUserAuthenticated && (
            <div className="navbar__notifications">
              <NotificationCenter />
            </div>
          )}
          
          <div className="navbar__dropdown">
            <button 
              className="navbar__dropdown-toggle" 
              onClick={toggleDropdown}
            >
              {isUserAuthenticated ? 'Il mio account' : 'Account'}
            </button>
            {isDropdownOpen && (
              <div className="navbar__dropdown-menu">
                {isUserAuthenticated ? (
                  <>
                    <Link to="/dashboard/profile" className="navbar__dropdown-item">
                      Profilo
                    </Link>
                    <Link to="/dashboard/orders" className="navbar__dropdown-item">
                      I miei ordini
                    </Link>
                    <Link to="/dashboard/notifications" className="navbar__dropdown-item">
                      Notifiche
                    </Link>
                    {isUserAdmin && (
                      <Link to="/admin" className="navbar__dropdown-item navbar__dropdown-item--admin">
                        Dashboard Admin
                      </Link>
                    )}
                    <button 
                      className="navbar__dropdown-item navbar__dropdown-item--button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="navbar__dropdown-item">
                      Accedi
                    </Link>
                    <Link to="/register" className="navbar__dropdown-item">
                      Registrati
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;