import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast/Toast';
import { AccessibilityProvider, SkipNavigation } from './components/common/AccessibilityEnhancements';
import { PerformanceMonitor } from './components/common/SEOEnhancements';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { LoadingSpinner } from './components/common/LoadingStates';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load delle pagine per ottimizzare performance
const Home = lazy(() => import('./pages/Home/Home'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetail = lazy(() => import('./pages/Products/ProductDetail'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/User/Dashboard'));
const Orders = lazy(() => import('./pages/User/Orders'));
const OrderDetail = lazy(() => import('./pages/User/OrderDetail'));
const OrderConfirmation = lazy(() => import('./pages/User/OrderConfirmation'));
const Favorites = lazy(() => import('./pages/User/Favorites'));
const CreateTicket = lazy(() => import('./pages/User/CreateTicket'));
const TicketDetail = lazy(() => import('./pages/User/TicketDetail'));
const Reviews = lazy(() => import('./pages/Reviews/Reviews'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/Legal/TermsConditions'));
const CookiePolicy = lazy(() => import('./pages/Legal/CookiePolicy'));
const RightOfWithdrawal = lazy(() => import('./pages/Legal/RightOfWithdrawal'));
const ShippingReturns = lazy(() => import('./pages/Legal/ShippingReturns'));
const Warranties = lazy(() => import('./pages/Legal/Warranties'));

// Admin Dashboard Layout - questo contiene la sidebar e gestisce tutte le rotte admin
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));

// Componente per il fallback loading
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh' 
  }}>
    <LoadingSpinner size="large" message="Caricamento pagina..." />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <ErrorBoundary>
                  <div className="App">
                    {/* Skip Navigation per accessibilità */}
                    <SkipNavigation />
                    
                    {/* Performance Monitor per Core Web Vitals */}
                    <PerformanceMonitor enabled={import.meta.env.PROD} />

                    {/* Header con navigazione principale */}
                    <header role="banner">
                      <Navbar />
                    </header>

                    {/* Contenuto principale */}
                    <main id="main-content" role="main">
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Rotte pubbliche */}
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:slug" element={<ProductDetail />} />
                          <Route path="/search" element={<SearchPage />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/reviews" element={<Reviews />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />

                          {/* Rotte autenticazione */}
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password/:token" element={<ResetPassword />} />

                          {/* Rotte utente */}
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/orders/:id" element={<OrderDetail />} />
                          <Route path="/orders/confirmation/:id" element={<OrderConfirmation />} />
                          <Route path="/favorites" element={<Favorites />} />
                          <Route path="/support/create" element={<CreateTicket />} />
                          <Route path="/support/:id" element={<TicketDetail />} />

                          {/* Rotte legali */}
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-conditions" element={<TermsConditions />} />
                          <Route path="/cookie-policy" element={<CookiePolicy />} />
                          <Route path="/right-of-withdrawal" element={<RightOfWithdrawal />} />
                          <Route path="/shipping-returns" element={<ShippingReturns />} />
                          <Route path="/warranties" element={<Warranties />} />

                          {/* Rotte Admin */}
                          <Route path="/admin/*" element={<AdminDashboard />} />

                          {/* 404 Fallback */}
                          <Route path="*" element={
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '4rem 2rem',
                              minHeight: '60vh',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <h1>404 - Pagina non trovata</h1>
                              <p>La pagina che stai cercando non esiste.</p>
                              <a href="/" style={{ 
                                color: 'var(--calabria-primary)',
                                textDecoration: 'underline',
                                marginTop: '1rem'
                              }}>
                                Torna alla homepage
                              </a>
                            </div>
                          } />
                        </Routes>
                      </Suspense>
                    </main>

                    {/* Footer */}
                    <footer id="footer" role="contentinfo">
                      <Footer />
                    </footer>
                  </div>
                </ErrorBoundary>
              </Router>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </HelmetProvider>
  );
}

export default App;
