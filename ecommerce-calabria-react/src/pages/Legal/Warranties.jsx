import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Warranties.scss';

const Warranties = () => {
  return (
    <div className="warranties">
      <Helmet>
        <title>Garanzie - Rustico Calabria</title>
        <meta name="description" content="Informazioni sulle garanzie dei prodotti Rustico Calabria. Garanzia di qualità, conformità e soddisfazione del cliente." />
        <meta name="keywords" content="garanzie, qualità prodotti, conformità, soddisfazione cliente, rustico calabria" />
        <link rel="canonical" href="https://rusticocalabria.it/warranties" />
      </Helmet>

      <div className="warranties__container">
        <header className="warranties__header">
          <div className="warranties__badge">
            <i className="fas fa-shield-alt"></i>
            <span>Garanzie</span>
          </div>
          <h1 className="warranties__title">Le Nostre Garanzie</h1>
          <p className="warranties__subtitle">
            La tua soddisfazione è la nostra priorità. Scopri tutte le garanzie che offriamo 
            per assicurarti la migliore esperienza di acquisto
          </p>
          <div className="warranties__meta">
            <span className="warranties__date">
              <i className="fas fa-calendar-alt"></i>
              Ultimo aggiornamento: 15 Gennaio 2024
            </span>
          </div>
        </header>

        <div className="warranties__content">
          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-award"></i>
              Garanzia di Qualità
            </h2>
            <div className="warranties__text">
              <p>
                Tutti i nostri prodotti sono selezionati con cura dai migliori produttori calabresi 
                e sottoposti a rigorosi controlli di qualità. Garantiamo che ogni prodotto rispetti 
                i più alti standard qualitativi e le tradizioni autentiche della Calabria.
              </p>
              <div className="warranties__quality-features">
                <div className="warranties__quality-feature">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h3>Selezione Rigorosa</h3>
                    <p>Ogni produttore viene accuratamente selezionato e verificato</p>
                  </div>
                </div>
                <div className="warranties__quality-feature">
                  <i className="fas fa-microscope"></i>
                  <div>
                    <h3>Controlli di Qualità</h3>
                    <p>Test e verifiche costanti su tutti i prodotti</p>
                  </div>
                </div>
                <div className="warranties__quality-feature">
                  <i className="fas fa-certificate"></i>
                  <div>
                    <h3>Certificazioni</h3>
                    <p>Prodotti con certificazioni DOP, IGP e biologiche</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-handshake"></i>
              Garanzia di Conformità
            </h2>
            <div className="warranties__conformity-grid">
              <div className="warranties__conformity-item">
                <div className="warranties__conformity-icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <h3>Conformità Legale</h3>
                <p>
                  Tutti i prodotti sono conformi alle normative europee e italiane 
                  in materia di sicurezza alimentare e etichettatura.
                </p>
                <ul>
                  <li>Regolamento CE 178/2002</li>
                  <li>Decreto Legislativo 109/1992</li>
                  <li>Normative HACCP</li>
                </ul>
              </div>
              
              <div className="warranties__conformity-item">
                <div className="warranties__conformity-icon">
                  <i className="fas fa-leaf"></i>
                </div>
                <h3>Tracciabilità</h3>
                <p>
                  Garantiamo la completa tracciabilità di ogni prodotto, 
                  dalla produzione alla consegna.
                </p>
                <ul>
                  <li>Origine delle materie prime</li>
                  <li>Processo di produzione</li>
                  <li>Catena di distribuzione</li>
                </ul>
              </div>
              
              <div className="warranties__conformity-item">
                <div className="warranties__conformity-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <h3>Conservazione</h3>
                <p>
                  Rispettiamo rigorosamente la catena del freddo e le condizioni 
                  di conservazione ottimali per ogni prodotto.
                </p>
                <ul>
                  <li>Temperature controllate</li>
                  <li>Imballaggi protettivi</li>
                  <li>Tempi di consegna ottimizzati</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-smile"></i>
              Garanzia di Soddisfazione
            </h2>
            <div className="warranties__satisfaction">
              <div className="warranties__satisfaction-promise">
                <h3>La Nostra Promessa</h3>
                <p>
                  Se non sei completamente soddisfatto del tuo acquisto, 
                  ci impegniamo a trovare una soluzione che ti soddisfi al 100%.
                </p>
              </div>
              
              <div className="warranties__satisfaction-benefits">
                <div className="warranties__benefit">
                  <div className="warranties__benefit-icon">💯</div>
                  <h4>Soddisfazione Garantita</h4>
                  <p>30 giorni per valutare i tuoi acquisti</p>
                </div>
                
                <div className="warranties__benefit">
                  <div className="warranties__benefit-icon">🔄</div>
                  <h4>Cambio Gratuito</h4>
                  <p>Cambio prodotto senza costi aggiuntivi</p>
                </div>
                
                <div className="warranties__benefit">
                  <div className="warranties__benefit-icon">💰</div>
                  <h4>Rimborso Completo</h4>
                  <p>Rimborso del 100% se non soddisfatto</p>
                </div>
                
                <div className="warranties__benefit">
                  <div className="warranties__benefit-icon">📞</div>
                  <h4>Supporto Dedicato</h4>
                  <p>Assistenza personalizzata per ogni problema</p>
                </div>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-shipping-fast"></i>
              Garanzia di Consegna
            </h2>
            <div className="warranties__delivery">
              <div className="warranties__delivery-promises">
                <div className="warranties__delivery-promise">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h3>Tempi Garantiti</h3>
                    <p>Consegna entro i tempi indicati o rimborso delle spese di spedizione</p>
                  </div>
                </div>
                
                <div className="warranties__delivery-promise">
                  <i className="fas fa-box"></i>
                  <div>
                    <h3>Imballaggio Sicuro</h3>
                    <p>Prodotti protetti con materiali specifici per ogni tipologia</p>
                  </div>
                </div>
                
                <div className="warranties__delivery-promise">
                  <i className="fas fa-snowflake"></i>
                  <div>
                    <h3>Catena del Freddo</h3>
                    <p>Mantenimento delle temperature per prodotti freschi e deperibili</p>
                  </div>
                </div>
              </div>
              
              <div className="warranties__delivery-coverage">
                <h3>Copertura Geografica</h3>
                <div className="warranties__coverage-grid">
                  <div className="warranties__coverage-item">
                    <strong>🇮🇹 Italia</strong>
                    <span>Consegna in 24-48h</span>
                  </div>
                  <div className="warranties__coverage-item">
                    <strong>🇪🇺 Europa</strong>
                    <span>Consegna in 3-5 giorni</span>
                  </div>
                  <div className="warranties__coverage-item">
                    <strong>🌍 Mondo</strong>
                    <span>Consegna in 7-14 giorni</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-exclamation-triangle"></i>
              Limitazioni e Esclusioni
            </h2>
            <div className="warranties__limitations">
              <div className="warranties__limitation-category">
                <h3>Prodotti Deperibili</h3>
                <p>
                  Per i prodotti freschi e deperibili, la garanzia è limitata alla data di scadenza 
                  e alle condizioni di conservazione indicate.
                </p>
                <ul>
                  <li>Formaggi freschi: 3-7 giorni dalla consegna</li>
                  <li>Salumi affettati: 5-10 giorni dalla consegna</li>
                  <li>Prodotti da forno: 2-5 giorni dalla consegna</li>
                </ul>
              </div>
              
              <div className="warranties__limitation-category">
                <h3>Uso Improprio</h3>
                <p>
                  La garanzia non copre danni derivanti da uso improprio, 
                  conservazione inadeguata o manomissione del prodotto.
                </p>
              </div>
              
              <div className="warranties__limitation-category">
                <h3>Forza Maggiore</h3>
                <p>
                  Eventi eccezionali come calamità naturali, scioperi o emergenze sanitarie 
                  possono influire sui tempi di consegna senza compromettere la garanzia.
                </p>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-tools"></i>
              Come Richiedere l'Assistenza
            </h2>
            <div className="warranties__support-process">
              <div className="warranties__support-step">
                <div className="warranties__support-step-number">1</div>
                <div className="warranties__support-step-content">
                  <h3>Contattaci</h3>
                  <p>Invia una richiesta di assistenza tramite:</p>
                  <ul>
                    <li>Email: <strong>assistenza@rusticocalabria.it</strong></li>
                    <li>Telefono: <strong>+39 0984 123456</strong></li>
                    <li>Chat online sul nostro sito</li>
                  </ul>
                </div>
              </div>
              
              <div className="warranties__support-step">
                <div className="warranties__support-step-number">2</div>
                <div className="warranties__support-step-content">
                  <h3>Fornisci i Dettagli</h3>
                  <p>Comunica le seguenti informazioni:</p>
                  <ul>
                    <li>Numero d'ordine</li>
                    <li>Descrizione del problema</li>
                    <li>Foto del prodotto (se necessario)</li>
                    <li>Data di consegna</li>
                  </ul>
                </div>
              </div>
              
              <div className="warranties__support-step">
                <div className="warranties__support-step-number">3</div>
                <div className="warranties__support-step-content">
                  <h3>Ricevi la Soluzione</h3>
                  <p>Il nostro team ti proporrà la migliore soluzione:</p>
                  <ul>
                    <li>Sostituzione del prodotto</li>
                    <li>Rimborso completo</li>
                    <li>Credito per acquisti futuri</li>
                    <li>Assistenza tecnica specializzata</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-star"></i>
              Certificazioni e Riconoscimenti
            </h2>
            <div className="warranties__certifications">
              <div className="warranties__cert-grid">
                <div className="warranties__cert-item">
                  <div className="warranties__cert-badge">🏆</div>
                  <h3>ISO 9001:2015</h3>
                  <p>Sistema di gestione qualità certificato</p>
                </div>
                
                <div className="warranties__cert-item">
                  <div className="warranties__cert-badge">🌱</div>
                  <h3>Biologico Certificato</h3>
                  <p>Prodotti biologici certificati da enti accreditati</p>
                </div>
                
                <div className="warranties__cert-item">
                  <div className="warranties__cert-badge">🛡️</div>
                  <h3>HACCP</h3>
                  <p>Sistema di autocontrollo igienico-sanitario</p>
                </div>
                
                <div className="warranties__cert-item">
                  <div className="warranties__cert-badge">⭐</div>
                  <h3>Eccellenza Calabrese</h3>
                  <p>Riconoscimento regionale per la qualità</p>
                </div>
              </div>
            </div>
          </section>

          <section className="warranties__section">
            <h2 className="warranties__section-title">
              <i className="fas fa-headset"></i>
              Contatti per l'Assistenza
            </h2>
            <div className="warranties__contact">
              <p>Il nostro team di assistenza è sempre a tua disposizione:</p>
              <div className="warranties__contact-methods">
                <div className="warranties__contact-method">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>Email</strong>
                    <span>assistenza@rusticocalabria.it</span>
                    <small>Risposta entro 24h</small>
                  </div>
                </div>
                
                <div className="warranties__contact-method">
                  <i className="fas fa-phone"></i>
                  <div>
                    <strong>Telefono</strong>
                    <span>+39 0984 123456</span>
                    <small>Lun-Ven: 9:00-18:00</small>
                  </div>
                </div>
                
                <div className="warranties__contact-method">
                  <i className="fas fa-comments"></i>
                  <div>
                    <strong>Chat Online</strong>
                    <span>Disponibile sul sito</span>
                    <small>Lun-Ven: 9:00-18:00</small>
                  </div>
                </div>
                
                <div className="warranties__contact-method">
                  <i className="fas fa-whatsapp"></i>
                  <div>
                    <strong>WhatsApp</strong>
                    <span>+39 333 123 4567</span>
                    <small>Lun-Ven: 9:00-18:00</small>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="warranties__footer">
          <div className="warranties__footer-content">
            <p>
              <i className="fas fa-info-circle"></i>
              Le nostre garanzie sono conformi al Codice del Consumo (D.Lgs. 206/2005) 
              e alle normative europee sulla vendita di beni di consumo.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Warranties; 