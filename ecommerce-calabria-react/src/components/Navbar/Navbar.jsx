import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import api from '../../utils/api';
import './Navbar.scss';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, user, logout: authLogout } = useAuth();
  const { cartCount, clearCart } = useCart();
  
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fetch favorites count quando user è logged
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (isLoggedIn) {
        try {
          const response = await api.get('/favorites/count');
          if (response.data.success) {
            setFavoritesCount(response.data.count || 0);
          }
        } catch (error) {
          console.warn('Error fetching favorites count:', error);
          setFavoritesCount(0);
        }
      } else {
        setFavoritesCount(0);
      }
    };

    fetchFavoritesCount();
  }, [isLoggedIn, user]);

  // Scroll effect ottimizzato con throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Previeni doppi click
    
    try {
      setIsLoggingOut(true);
      await authLogout();
      clearCart();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // TODO: Mostrare toast di errore
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && trimmedQuery.length >= 2) {
      setSearchQuery('');
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else if (trimmedQuery.length > 0 && trimmedQuery.length < 2) {
      // Feedback per query troppo corta
      console.warn('Query di ricerca troppo corta. Minimo 2 caratteri.');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/products', label: 'Prodotti', icon: 'fas fa-shopping-bag' },
    { path: '/reviews', label: 'Recensioni', icon: 'fas fa-star' },
    { path: '/about', label: 'Chi Siamo', icon: 'fas fa-info-circle' },
    { path: '/contact', label: 'Contatti', icon: 'fas fa-envelope' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} role="navigation">
      <div className="navbar__container">
        {/* Brand */}
        <Link to="/" className="navbar__brand" aria-label="Rustico Calabria - Homepage">
          <div className="navbar__logo">
            <span className="navbar__logo-icon">🌶️</span>
            <span className="navbar__logo-text">
              <span className="navbar__logo-primary">Rustico</span>
              <span className="navbar__logo-secondary">Calabria</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar__nav">
          <ul className="navbar__menu">
            {navLinks.map((link) => (
              <li key={link.path} className="navbar__menu-item">
                <Link
                  to={link.path}
                  className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
                  aria-current={location.pathname === link.path ? 'page' : undefined}
                >
                  <i className={link.icon} aria-hidden="true"></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Bar */}
        <div className="navbar__search">
          <form onSubmit={handleSearch} className="navbar__search-form">
            <div className="navbar__search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotti calabresi..."
                className="navbar__search-input"
                aria-label="Cerca prodotti"
              />
              <button
                type="submit"
                className="navbar__search-btn"
                disabled={!searchQuery.trim()}
                aria-label="Avvia ricerca"
              >
                <i className="fas fa-search" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </div>

        {/* Desktop Actions */}
        <div className="navbar__actions">
          {isLoggedIn ? (
            <>
              {/* Favorites */}
              <Link to="/favorites" className="navbar__action" aria-label={`Preferiti (${favoritesCount} elementi)`}>
                <i className="fas fa-heart" aria-hidden="true"></i>
                {favoritesCount > 0 && (
                  <span className="navbar__badge">{favoritesCount > 99 ? '99+' : favoritesCount}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="navbar__action" aria-label={`Carrello (${cartCount} elementi)`}>
                <i className="fas fa-shopping-cart" aria-hidden="true"></i>
                {cartCount > 0 && (
                  <span className="navbar__badge">{cartCount > 99 ? '99+' : cartCount}</span>
                )}
              </Link>

              {/* User Menu */}
              <div className="navbar__user-menu" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="navbar__user-toggle"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu utente"
                >
                  <div className="navbar__user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || <i className="fas fa-user"></i>}
                  </div>
                  <span className="navbar__user-name">{user?.name || 'Utente'}</span>
                  <i className={`fas fa-chevron-down navbar__dropdown-arrow ${isUserMenuOpen ? 'rotated' : ''}`}></i>
                </button>

                {isUserMenuOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__dropdown-user">
                        <strong>{user?.name} {user?.surname}</strong>
                        <small>{user?.email}</small>
                      </div>
                    </div>
                    
                    <div className="navbar__dropdown-body">
                      <Link to="/dashboard" className="navbar__dropdown-item">
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/orders" className="navbar__dropdown-item">
                        <i className="fas fa-box"></i>
                        <span>I Miei Ordini</span>
                      </Link>
                      <Link to="/favorites" className="navbar__dropdown-item">
                        <i className="fas fa-heart"></i>
                        <span>Preferiti</span>
                      </Link>
                      
                      {isAdmin && (
                        <>
                          <div className="navbar__dropdown-divider"></div>
                          <Link to="/admin" className="navbar__dropdown-item navbar__dropdown-item--admin">
                            <i className="fas fa-crown"></i>
                            <span>Pannello Admin</span>
                          </Link>
                        </>
                      )}
                    </div>
                    
                    <div className="navbar__dropdown-footer">
                      <button 
                        onClick={handleLogout} 
                        disabled={isLoggingOut}
                        className="navbar__dropdown-item navbar__dropdown-item--logout"
                      >
                        <i className={isLoggingOut ? "fas fa-spinner fa-spin" : "fas fa-sign-out-alt"}></i>
                        <span>{isLoggingOut ? 'Disconnessione...' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__action navbar__action--login">
                <i className="fas fa-sign-in-alt"></i>
                <span>Accedi</span>
              </Link>
              <Link to="/register" className="navbar__action navbar__action--register">
                <i className="fas fa-user-plus"></i>
                <span>Registrati</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className={`navbar__mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar__hamburger"></span>
          <span className="navbar__hamburger"></span>
          <span className="navbar__hamburger"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`navbar__mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
        ref={mobileMenuRef}
      >
        <div className="navbar__mobile-content">
          {/* Mobile Search */}
          <div className="navbar__mobile-search">
            <form onSubmit={handleSearch} className="navbar__search-form">
              <div className="navbar__search-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca prodotti..."
                  className="navbar__search-input"
                />
                <button
                  type="submit"
                  className="navbar__search-btn"
                  disabled={!searchQuery.trim()}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Navigation */}
          <ul className="navbar__mobile-nav">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar__mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={link.icon}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Actions */}
          <div className="navbar__mobile-actions">
            {isLoggedIn ? (
              <>
                <Link to="/favorites" className="navbar__mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-heart"></i>
                  <span>Preferiti</span>
                  {favoritesCount > 0 && <span className="navbar__badge">{favoritesCount}</span>}
                </Link>
                
                <Link to="/cart" className="navbar__mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-shopping-cart"></i>
                  <span>Carrello</span>
                  {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
                </Link>
                
                <Link to="/dashboard" className="navbar__mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </Link>
                
                <Link to="/orders" className="navbar__mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-box"></i>
                  <span>I Miei Ordini</span>
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="navbar__mobile-action navbar__mobile-action--admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-crown"></i>
                    <span>Pannello Admin</span>
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="navbar__mobile-action navbar__mobile-action--logout"
                >
                  <i className={isLoggingOut ? "fas fa-spinner fa-spin" : "fas fa-sign-out-alt"}></i>
                  <span>{isLoggingOut ? 'Disconnessione...' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Accedi</span>
                </Link>
                
                <Link to="/register" className="navbar__mobile-action" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-user-plus"></i>
                  <span>Registrati</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile User Info */}
          {isLoggedIn && user && (
            <div className="navbar__mobile-user">
              <div className="navbar__mobile-user-info">
                <div className="navbar__user-avatar">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <strong>{user.name} {user.surname}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="navbar__overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;