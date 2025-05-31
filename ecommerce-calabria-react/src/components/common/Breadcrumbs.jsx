import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumbs.scss';

const Breadcrumbs = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Percorso di navigazione">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumbs__item">
            {index < items.length - 1 ? (
              <>
                <Link 
                  to={item.url} 
                  className="breadcrumbs__link"
                  aria-label={`Vai a ${item.name}`}
                >
                  {item.name}
                </Link>
                <span className="breadcrumbs__separator" aria-hidden="true">
                  <i className="fas fa-chevron-right"></i>
                </span>
              </>
            ) : (
              <span className="breadcrumbs__current" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 