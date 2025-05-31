import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// Hook per metriche Core Web Vitals
export const useCoreWebVitals = () => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  });

  useEffect(() => {
    // Importa web-vitals dinamicamente per evitare bundle size
    const loadWebVitals = async () => {
      try {
        // Verifica se web-vitals è disponibile
        const webVitals = await import('web-vitals');
        
        // Controllo esistenza delle funzioni prima di chiamarle
        if (webVitals.getCLS && typeof webVitals.getCLS === 'function') {
          webVitals.getCLS(metric => setMetrics(prev => ({ ...prev, cls: metric.value })));
        }
        if (webVitals.getFID && typeof webVitals.getFID === 'function') {
          webVitals.getFID(metric => setMetrics(prev => ({ ...prev, fid: metric.value })));
        }
        if (webVitals.getFCP && typeof webVitals.getFCP === 'function') {
          webVitals.getFCP(metric => setMetrics(prev => ({ ...prev, fcp: metric.value })));
        }
        if (webVitals.getLCP && typeof webVitals.getLCP === 'function') {
          webVitals.getLCP(metric => setMetrics(prev => ({ ...prev, lcp: metric.value })));
        }
        if (webVitals.getTTFB && typeof webVitals.getTTFB === 'function') {
          webVitals.getTTFB(metric => setMetrics(prev => ({ ...prev, ttfb: metric.value })));
        }
      } catch (error) {
        console.warn('Web Vitals non disponibili:', error);
        // Imposta metriche di fallback
        setMetrics({
          cls: 0,
          fid: 0,
          fcp: 0,
          lcp: 0,
          ttfb: 0
        });
      }
    };

    loadWebVitals();
  }, []);

  return metrics;
};

// Hook per preload di risorse critiche
export const useResourceHints = () => {
  const [criticalResources, setCriticalResources] = useState([]);

  useEffect(() => {
    // Identifica immagini critiche above-the-fold
    const observeCriticalImages = () => {
      const images = document.querySelectorAll('img[data-critical="true"]');
      const criticalImageUrls = Array.from(images).map(img => img.src);
      setCriticalResources(prev => [...prev, ...criticalImageUrls]);
    };

    // Observer per lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, { threshold: 0.1 });

    // Osserva immagini lazy
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });

    observeCriticalImages();

    return () => observer.disconnect();
  }, []);

  return criticalResources;
};

// Componente per meta tags avanzati
export const AdvancedMetaTags = ({ 
  page = 'generic',
  data = {},
  structuredData = null,
  criticalCSS = null 
}) => {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rusticocalabria.it';
  const currentUrl = `${baseUrl}${location.pathname}${location.search}`;

  // Genera structured data specifici per tipo pagina
  const generatePageStructuredData = () => {
    const baseOrganization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Rustico Calabria",
      "url": baseUrl,
      "logo": `${baseUrl}/images/logo.png`,
      "description": "E-commerce di prodotti tipici calabresi autentici",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IT",
        "addressRegion": "Calabria",
        "addressLocality": "Cosenza"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+39-000-000-0000",
        "contactType": "customer service",
        "availableLanguage": "Italian"
      },
      "sameAs": [
        "https://www.facebook.com/rusticocalabria",
        "https://www.instagram.com/rusticocalabria"
      ]
    };

    let schemas = [baseOrganization];

    switch (page) {
      case 'product':
        if (data.product) {
          schemas.push({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": data.product.name,
            "description": data.product.description,
            "image": data.product.main_image,
            "brand": {
              "@type": "Brand",
              "name": "Rustico Calabria"
            },
            "category": data.product.category?.name,
            "offers": {
              "@type": "Offer",
              "price": data.product.price,
              "priceCurrency": "EUR",
              "availability": data.product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "url": currentUrl,
              "seller": {
                "@type": "Organization",
                "name": "Rustico Calabria"
              }
            }
          });

          // Aggiungi recensioni se disponibili
          if (data.product.reviews?.length > 0) {
            const lastSchema = schemas[schemas.length - 1];
            lastSchema.aggregateRating = {
              "@type": "AggregateRating",
              "ratingValue": data.product.average_rating,
              "reviewCount": data.product.reviews.length,
              "bestRating": 5,
              "worstRating": 1
            };
          }
        }
        break;

      case 'category':
        if (data.category) {
          schemas.push({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": data.category.name,
            "description": data.category.description,
            "url": currentUrl,
            "mainEntity": {
              "@type": "ItemList",
              "name": `Prodotti ${data.category.name}`,
              "numberOfItems": data.category.products_count || 0
            }
          });
        }
        break;

      case 'homepage':
        schemas.push({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Rustico Calabria",
          "url": baseUrl,
          "description": "E-commerce di prodotti tipici calabresi autentici",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        });
        break;

      case 'search':
        if (data.searchQuery && data.results) {
          schemas.push({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": `Risultati ricerca per "${data.searchQuery}"`,
            "url": currentUrl,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": data.results.length,
              "itemListElement": data.results.slice(0, 10).map((product, index) => ({
                "@type": "Product",
                "position": index + 1,
                "name": product.name,
                "url": `${baseUrl}/products/${product.slug}`
              }))
            }
          });
        }
        break;
    }

    // Aggiungi structured data custom se forniti
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        schemas.push(...structuredData);
      } else {
        schemas.push(structuredData);
      }
    }

    return schemas;
  };

  const schemas = generatePageStructuredData();

  return (
    <Helmet>
      {/* Preload risorse critiche */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//api.rusticocalabria.it" />
      
      {/* CSS critico inline se fornito */}
      {criticalCSS && (
        <style type="text/css">{criticalCSS}</style>
      )}

      {/* Meta viewport ottimizzato */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      
      {/* Meta performance */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* PWA meta tags */}
      <meta name="theme-color" content="#d2691e" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Rustico Calabria" />
      
      {/* Security headers */}
      <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      
      {/* Schema.org structured data */}
      {schemas.map((schema, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </Helmet>
  );
};

// Componente per ottimizzazione immagini
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height,
  critical = false,
  lazy = true,
  className = '',
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Genera srcset per responsive images
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    const sizes = [320, 640, 768, 1024, 1280, 1536];
    return sizes.map(size => {
      const optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, `_${size}w.$1`);
      return `${optimizedSrc} ${size}w`;
    }).join(', ');
  };

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  // WebP fallback
  const webpSrc = src ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp') : null;

  if (error) {
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={{ width, height, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <i className="fas fa-image" style={{ color: '#9ca3af', fontSize: '2rem' }}></i>
      </div>
    );
  }

  return (
    <picture className={className}>
      {/* WebP version per browser supportati */}
      {webpSrc && (
        <source
          srcSet={generateSrcSet(webpSrc)}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          type="image/webp"
        />
      )}
      
      {/* Fallback formato originale */}
      <img
        src={critical ? src : undefined}
        data-src={!critical && lazy ? src : undefined}
        data-critical={critical ? "true" : "false"}
        srcSet={critical ? generateSrcSet(src) : undefined}
        sizes={critical ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={critical ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          ...props.style
        }}
        {...props}
      />
    </picture>
  );
};

// Hook per gestione breadcrumbs SEO
export const useBreadcrumbs = (items = []) => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rusticocalabria.it"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": item.url ? `https://rusticocalabria.it${item.url}` : undefined
      }))
    ]
  };

  return breadcrumbSchema;
};

// Componente per monitoraggio performance
export const PerformanceMonitor = ({ enabled = true }) => {
  const metrics = useCoreWebVitals();

  useEffect(() => {
    if (!enabled || !window.gtag) return;

    // Invia metriche a Google Analytics 4
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value !== null) {
        window.gtag('event', metric, {
          event_category: 'Core Web Vitals',
          value: Math.round(metric === 'cls' ? value * 1000 : value),
          non_interaction: true
        });
      }
    });
  }, [metrics, enabled]);

  // Log performance in sviluppo
  useEffect(() => {
    if (import.meta.env.DEV && enabled) {
      console.group('🚀 Core Web Vitals');
      console.log('LCP (Largest Contentful Paint):', metrics.lcp?.toFixed(2), 'ms');
      console.log('FID (First Input Delay):', metrics.fid?.toFixed(2), 'ms');
      console.log('CLS (Cumulative Layout Shift):', metrics.cls?.toFixed(4));
      console.log('FCP (First Contentful Paint):', metrics.fcp?.toFixed(2), 'ms');
      console.log('TTFB (Time to First Byte):', metrics.ttfb?.toFixed(2), 'ms');
      console.groupEnd();
    }
  }, [metrics, enabled]);

  return null; // Componente invisibile
};

// Hook per gestione meta tags dinamici
export const useDynamicMeta = (metaData) => {
  useEffect(() => {
    // Aggiorna meta tags dinamicamente per SPA
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    if (metaData.title) {
      document.title = metaData.title;
    }

    if (metaData.description) {
      updateMetaTag('description', metaData.description);
      updateMetaTag('og:description', metaData.description, true);
    }

    if (metaData.keywords) {
      updateMetaTag('keywords', metaData.keywords);
    }

    if (metaData.image) {
      updateMetaTag('og:image', metaData.image, true);
      updateMetaTag('twitter:image', metaData.image);
    }

    if (metaData.url) {
      updateMetaTag('og:url', metaData.url, true);
      updateMetaTag('twitter:url', metaData.url);
    }
  }, [metaData]);
};

// Componente per lazy loading ottimizzato
export const LazySection = ({ 
  children, 
  fallback = null, 
  threshold = 0.1,
  rootMargin = '50px' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default {
  AdvancedMetaTags,
  OptimizedImage,
  PerformanceMonitor,
  LazySection,
  useCoreWebVitals,
  useResourceHints,
  useBreadcrumbs,
  useDynamicMeta
}; 