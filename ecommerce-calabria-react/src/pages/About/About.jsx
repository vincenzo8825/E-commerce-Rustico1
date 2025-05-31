import React from 'react';
import { Helmet } from 'react-helmet-async';
import './About.scss';

const About = () => {
  return (
    <>
      <Helmet>
        <title>Chi Siamo - Rustico Calabria</title>
        <meta name="description" content="Scopri la storia di Rustico Calabria, la nostra passione per i prodotti tipici calabresi autentici e la tradizione culinaria del Sud Italia." />
        <meta name="keywords" content="chi siamo, rustico calabria, prodotti tipici, calabria, tradizione, qualità" />
      </Helmet>

      <div className="about-page">
        <div className="about-hero">
          <div className="container">
            <h1>Chi Siamo</h1>
            <p className="about-hero__subtitle">
              La passione per la tradizione calabrese
            </p>
          </div>
        </div>

        <div className="container">
          <section className="about-content">
            <div className="about-section">
              <h2>La Nostra Storia</h2>
              <p>
                Rustico Calabria nasce dalla passione per i sapori autentici della tradizione calabrese. 
                Siamo una famiglia che da generazioni si dedica alla produzione e alla selezione dei 
                migliori prodotti tipici della nostra terra.
              </p>
              <p>
                La Calabria è una regione ricca di tradizioni culinarie uniche, dove ogni prodotto 
                racconta una storia di amore per la terra e rispetto per le antiche ricette trammandate 
                di padre in figlio.
              </p>
            </div>

            <div className="about-section">
              <h2>La Nostra Missione</h2>
              <p>
                Vogliamo portare nelle vostre case i veri sapori della Calabria, selezionando 
                esclusivamente prodotti di alta qualità da piccoli produttori locali che condividono 
                con noi la passione per l'eccellenza.
              </p>
              <ul className="about-values">
                <li>🌶️ <strong>Autenticità:</strong> Solo prodotti tipici calabresi originali</li>
                <li>🏔️ <strong>Territorio:</strong> Valorizzazione delle tradizioni locali</li>
                <li>👨‍🌾 <strong>Produttori:</strong> Supporto ai piccoli artigiani calabresi</li>
                <li>✨ <strong>Qualità:</strong> Selezione rigorosa dei migliori prodotti</li>
              </ul>
            </div>

            <div className="about-section">
              <h2>I Nostri Prodotti</h2>
              <p>
                Dal piccante peperoncino calabrese all'olio extravergine d'oliva, dalla 'nduja 
                alle conserve tradizionali, ogni prodotto nel nostro catalogo è scelto con cura 
                per garantirvi un'esperienza gastronomica autentica.
              </p>
              <div className="about-products-grid">
                <div className="about-product-card">
                  <h3>🌶️ Peperoncini</h3>
                  <p>Le varietà più piccanti e saporite della tradizione calabrese</p>
                </div>
                <div className="about-product-card">
                  <h3>🫒 Olio d'Oliva</h3>
                  <p>Extravergine di prima spremitura dai nostri uliveti secolari</p>
                </div>
                <div className="about-product-card">
                  <h3>🧄 'Nduja</h3>
                  <p>Il salume piccante simbolo della gastronomia calabrese</p>
                </div>
                <div className="about-product-card">
                  <h3>🍯 Conserve</h3>
                  <p>Marmellate, sottolio e specialità preparate con ricette antiche</p>
                </div>
              </div>
            </div>

            <div className="about-section">
              <h2>Il Nostro Impegno</h2>
              <p>
                Crediamo nel rispetto dell'ambiente e delle tradizioni. Lavoriamo solo con 
                produttori che utilizzano metodi sostenibili e che mantengono vive le antiche 
                tecniche di lavorazione calabresi.
              </p>
              <p>
                Ogni ordine viene preparato con cura e spedito con packaging eco-sostenibile 
                per preservare la freschezza e la qualità dei nostri prodotti.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About; 