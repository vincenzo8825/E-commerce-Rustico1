import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isAdmin: false,
    user: null,
    emailVerified: false,
    loading: true,
  });

  // Verifica lo stato di autenticazione al caricamento
  useEffect(() => {
    const token = localStorage.getItem('token');
    const authData = localStorage.getItem('auth_data');
    
    if (token && authData) {
      try {
        const parsedAuthData = JSON.parse(authData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthState(prevState => ({
          ...prevState,
          isLoggedIn: true,
          isAdmin: parsedAuthData.isAdmin || false,
          emailVerified: parsedAuthData.emailVerified || false,
          loading: false,
        }));
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('auth_data');
        setAuthState(prevState => ({ ...prevState, loading: false }));
      }
    } else {
      setAuthState(prevState => ({ ...prevState, loading: false }));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_data');
    delete api.defaults.headers.common['Authorization'];
    setAuthState({
      isLoggedIn: false,
      isAdmin: false,
      user: null,
      emailVerified: false,
      loading: false,
    });
  };

  const value = {
    ...authState,
    setAuthState,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 