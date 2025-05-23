import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../App';
import NotificationCenter from '../Notifications/NotificationCenter';
import './Navbar.scss';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cartCount, favoritesCount } = useCart();
  const { isLoggedIn, isAdmin, loading, setAuthState } = useAuth();
  const navigate = useNavigate();

  // Debug: log dello stato di autenticazione
  console.log("Navbar - Stato autenticazione:", { isLoggedIn, isAdmin, loading });

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    // Aggiorna lo stato globale
    setAuthState({
      isLoggedIn: false,
      isAdmin: false,
      user: null,
      emailVerified: false,
      loading: false
    });
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Se il context sta ancora caricando, mostra lo stato precedente
  if (loading) {
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
            <div className="navbar__dropdown">
              <button className="navbar__dropdown-toggle">
                Caricamento...
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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
          <Link to="/cart" className="navbar__menu-item navbar__menu-item--with-badge">
            Carrello
            {cartCount > 0 && (
              <span className="navbar__badge navbar__badge--cart">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/favorites" className="navbar__menu-item navbar__menu-item--with-badge">
            Preferiti
            {favoritesCount > 0 && (
              <span className="navbar__badge navbar__badge--favorites">
                {favoritesCount}
              </span>
            )}
          </Link>
          
          {isLoggedIn && (
            <div className="navbar__notifications">
              <NotificationCenter />
            </div>
          )}
          
          <div className="navbar__dropdown">
            <button 
              className="navbar__dropdown-toggle" 
              onClick={toggleDropdown}
            >
              {isLoggedIn ? 'Il mio account' : 'Account'}
            </button>
            {isDropdownOpen && (
              <div className="navbar__dropdown-menu">
                {isLoggedIn ? (
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
                    <Link to="/dashboard/support" className="navbar__dropdown-item">
                      Supporto
                    </Link>
                    {isAdmin && (
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