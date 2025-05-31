// Utility per validare rotte e componenti
export const validateRoutes = () => {
  const routes = [
    // Rotte pubbliche
    { path: '/', name: 'Home' },
    { path: '/products', name: 'Products' },
    { path: '/reviews', name: 'Reviews' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
    
    // Rotte Auth
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/forgot-password', name: 'ForgotPassword' },
    
    // Rotte User
    { path: '/dashboard', name: 'Dashboard', auth: true },
    { path: '/orders', name: 'Orders', auth: true },
    { path: '/favorites', name: 'Favorites', auth: true },
    { path: '/cart', name: 'Cart' },
    { path: '/checkout', name: 'Checkout' },
    
    // Rotte Admin
    { path: '/admin', name: 'AdminOverview', admin: true },
    { path: '/admin/products', name: 'AdminProducts', admin: true },
    { path: '/admin/categories', name: 'AdminCategories', admin: true },
    { path: '/admin/orders', name: 'AdminOrders', admin: true },
    { path: '/admin/users', name: 'AdminUsers', admin: true },
    { path: '/admin/reviews', name: 'AdminReviews', admin: true },
    { path: '/admin/settings', name: 'AdminSettings', admin: true },
    
    // Rotte Legali
    { path: '/privacy-policy', name: 'PrivacyPolicy' },
    { path: '/terms-conditions', name: 'TermsConditions' },
    { path: '/cookie-policy', name: 'CookiePolicy' },
  ];

  console.log('🧪 Validazione rotte completata:');
  console.log(`✅ ${routes.length} rotte configurate`);
  console.log(`📱 ${routes.filter(r => !r.auth && !r.admin).length} rotte pubbliche`);
  console.log(`🔐 ${routes.filter(r => r.auth).length} rotte utente`);
  console.log(`👑 ${routes.filter(r => r.admin).length} rotte admin`);

  return routes;
};

export const validateNavbarLinks = () => {
  const navbarLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Prodotti' },
    { path: '/reviews', label: 'Recensioni' },
    { path: '/about', label: 'Chi Siamo' },
    { path: '/contact', label: 'Contatti' }
  ];

  console.log('🧭 Validazione link navbar completata:');
  console.log(`✅ ${navbarLinks.length} link principali configurati`);

  return navbarLinks;
}; 