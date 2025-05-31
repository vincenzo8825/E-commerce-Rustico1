import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title = 'Rustico Calabria - Prodotti Tipici Calabresi Autentici',
  description = 'Scopri i sapori autentici della Calabria. Prodotti tipici calabresi di qualità, spediti direttamente dal cuore del Sud Italia.',
  keywords = 'prodotti calabresi, nduja, peperoncino calabrese, olio calabrese, conserve, salumi calabresi, specialità calabresi, ecommerce alimentare',
  image = '/images/og-default.jpg',
  url = '',
  type = 'website',
  productData = null,
  categoryData = null,
  breadcrumbs = [],
  canonicalUrl = null,
  noindex = false,
  structuredData = null
}) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rusticocalabria.it';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const canonical = canonicalUrl || fullUrl;

  // Genera Schema.org structured data
  const generateStructuredData = () => {
    let schemas = [];

    // Schema base per il sito
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Rustico Calabria",
      "description": "E-commerce di prodotti tipici calabresi autentici",
      "url": baseUrl,
      "logo": `${baseUrl}/images/logo.png`,
      "sameAs": [
        "https://www.facebook.com/rusticocalabria",
        "https://www.instagram.com/rusticocalabria",
        "https://www.twitter.com/rusticocalabria"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IT",
        "addressRegion": "Calabria"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+39-000-000-0000",
        "contactType": "customer service",
        "availableLanguage": "Italian"
      }
    };

    schemas.push(organizationSchema);

    // Schema per prodotti
    if (productData) {
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productData.name,
        "description": productData.description,
        "image": productData.image ? `${baseUrl}${productData.image}` : fullImageUrl,
        "brand": {
          "@type": "Brand",
          "name": "Rustico Calabria"
        },
        "offers": {
          "@type": "Offer",
          "price": productData.price,
          "priceCurrency": "EUR",
          "availability": productData.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Rustico Calabria"
          }
        }
      };

      // Aggiungi recensioni se disponibili
      if (productData.reviews && productData.reviews.length > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": productData.averageRating,
          "reviewCount": productData.reviews.length,
          "bestRating": 5,
          "worstRating": 1
        };

        productSchema.review = productData.reviews.map(review => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": review.user_name
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.rating,
            "bestRating": 5,
            "worstRating": 1
          },
          "reviewBody": review.comment,
          "datePublished": review.created_at
        }));
      }

      schemas.push(productSchema);
    }

    // Schema per categorie
    if (categoryData) {
      const categorySchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": categoryData.name,
        "description": categoryData.description,
        "url": fullUrl,
        "mainEntity": {
          "@type": "ItemList",
          "name": `Prodotti ${categoryData.name}`,
          "numberOfItems": categoryData.products_count
        }
      };

      schemas.push(categorySchema);
    }

    // Breadcrumbs Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `${baseUrl}${item.url}`
        }))
      };

      schemas.push(breadcrumbSchema);
    }

    // Schema personalizzato se fornito
    if (structuredData) {
      schemas.push(structuredData);
    }

    return schemas;
  };

  const schemas = generateStructuredData();

  return (
    <Helmet>
      {/* Meta tags base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Meta robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="Rustico Calabria" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@rusticocalabria" />
      
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
      
      {/* Meta specifici per prodotti */}
      {productData && (
        <>
          <meta property="product:price:amount" content={productData.price} />
          <meta property="product:price:currency" content="EUR" />
          <meta property="product:availability" content={productData.stock > 0 ? "in stock" : "out of stock"} />
          <meta property="product:brand" content="Rustico Calabria" />
          <meta property="product:category" content={productData.category_name} />
        </>
      )}
      
      {/* Meta aggiuntivi per e-commerce */}
      <meta name="theme-color" content="#D32F2F" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Rustico Calabria" />
      
      {/* Preconnect per performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
    </Helmet>
  );
};

// Funzioni helper per generare meta tags specifici
export const generateProductSEO = (product) => ({
  title: `${product.name} - Rustico Calabria | Prodotti Tipici Calabresi`,
  description: `${product.description} Acquista online su Rustico Calabria, e-commerce di prodotti tipici calabresi autentici. Spedizione gratuita sopra €50.`,
  keywords: `${product.name}, prodotti calabresi, ${product.category_name}, acquista online, calabria`,
  image: product.image,
  url: `/products/${product.slug}`,
  type: 'product',
  productData: product
});

export const generateCategorySEO = (category) => ({
  title: `${category.name} - Prodotti Tipici Calabresi | Rustico Calabria`,
  description: `Scopri la selezione di ${category.name} calabresi autentici. Qualità garantita e spedizione gratuita sopra €50. Acquista online su Rustico Calabria.`,
  keywords: `${category.name}, prodotti calabresi, specialità calabresi, acquista online`,
  url: `/categories/${category.slug}`,
  categoryData: category
});

export const generateBreadcrumbs = (items) => {
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  return breadcrumbs.concat(items);
};

export default SEOHead; 