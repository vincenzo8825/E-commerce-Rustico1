import React from 'react';
import { Helmet } from 'react-helmet-async';
import './ShippingReturns.scss';

const ShippingReturns = () => {
  return (
    <div className="shipping-returns">
      <Helmet>
        <title>Spedizioni e Resi - Rustico Calabria</title>
        <meta name="description" content="Informazioni complete su spedizioni, consegne e resi per Rustico Calabria. Tempi, costi e modalità di spedizione." />
        <meta name="keywords" content="spedizioni, resi, consegna, tempi spedizione, costi spedizione, rustico calabria" />
        <link rel="canonical" href="https://rusticocalabria.it/shipping-returns" />
      </Helmet>

      <div className="shipping-returns__container">
        <header className="shipping-returns__header">
          <div className="shipping-returns__badge">
            <i className="fas fa-truck"></i>
            <span>Spedizioni e Resi</span>
          </div>
          <h1 className="shipping-returns__title">Spedizioni e Resi</h1>
          <p className="shipping-returns__subtitle">
            Tutto quello che devi sapere su spedizioni, consegne e procedure di reso. 
            Consegniamo i sapori della Calabria direttamente a casa tua
          </p>
          <div className="shipping-returns__meta">
            <span className="shipping-returns__date">
              <i className="fas fa-calendar-alt"></i>
              Ultimo aggiornamento: 15 Gennaio 2024
            </span>
          </div>
        </header>

        <div className="shipping-returns__content">
          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-shipping-fast"></i>
              Modalità di Spedizione
            </h2>
            <div className="shipping-returns__shipping-options">
              <div className="shipping-returns__shipping-option">
                <div className="shipping-returns__option-header">
                  <div className="shipping-returns__option-icon">🚚</div>
                  <h3>Spedizione Standard</h3>
                  <span className="shipping-returns__option-price">€4.90</span>
                </div>
                <div className="shipping-returns__option-details">
                  <p><strong>Tempi:</strong> 3-5 giorni lavorativi</p>
                  <p><strong>Corriere:</strong> BRT, SDA, GLS</p>
                  <p><strong>Tracciamento:</strong> Incluso</p>
                  <p><strong>Assicurazione:</strong> Fino a €100</p>
                </div>
              </div>
              
              <div className="shipping-returns__shipping-option shipping-returns__shipping-option--featured">
                <div className="shipping-returns__option-header">
                  <div className="shipping-returns__option-icon">⚡</div>
                  <h3>Spedizione Express</h3>
                  <span className="shipping-returns__option-price">€9.90</span>
                </div>
                <div className="shipping-returns__option-details">
                  <p><strong>Tempi:</strong> 1-2 giorni lavorativi</p>
                  <p><strong>Corriere:</strong> DHL, TNT</p>
                  <p><strong>Tracciamento:</strong> In tempo reale</p>
                  <p><strong>Assicurazione:</strong> Fino a €500</p>
                </div>
                <div className="shipping-returns__option-badge">Più Veloce</div>
              </div>
              
              <div className="shipping-returns__shipping-option">
                <div className="shipping-returns__option-header">
                  <div className="shipping-returns__option-icon">🆓</div>
                  <h3>Spedizione Gratuita</h3>
                  <span className="shipping-returns__option-price">Gratis</span>
                </div>
                <div className="shipping-returns__option-details">
                  <p><strong>Tempi:</strong> 3-5 giorni lavorativi</p>
                  <p><strong>Soglia minima:</strong> €50</p>
                  <p><strong>Corriere:</strong> BRT, SDA</p>
                  <p><strong>Tracciamento:</strong> Incluso</p>
                </div>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-globe-europe"></i>
              Zone di Consegna
            </h2>
            <div className="shipping-returns__zones">
              <div className="shipping-returns__zone">
                <div className="shipping-returns__zone-header">
                  <h3>🇮🇹 Italia</h3>
                  <span className="shipping-returns__zone-status">Disponibile</span>
                </div>
                <div className="shipping-returns__zone-details">
                  <div className="shipping-returns__zone-info">
                    <strong>Tempi di consegna:</strong>
                    <ul>
                      <li>Nord Italia: 1-2 giorni</li>
                      <li>Centro Italia: 2-3 giorni</li>
                      <li>Sud Italia e Isole: 3-4 giorni</li>
                    </ul>
                  </div>
                  <div className="shipping-returns__zone-info">
                    <strong>Costi:</strong>
                    <ul>
                      <li>Standard: €4.90</li>
                      <li>Express: €9.90</li>
                      <li>Gratuita da €50</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="shipping-returns__zone">
                <div className="shipping-returns__zone-header">
                  <h3>🇪🇺 Unione Europea</h3>
                  <span className="shipping-returns__zone-status">Disponibile</span>
                </div>
                <div className="shipping-returns__zone-details">
                  <div className="shipping-returns__zone-info">
                    <strong>Paesi serviti:</strong>
                    <p>Francia, Germania, Spagna, Austria, Belgio, Olanda, Portogallo, Grecia</p>
                  </div>
                  <div className="shipping-returns__zone-info">
                    <strong>Tempi e costi:</strong>
                    <ul>
                      <li>Standard: 5-7 giorni - €12.90</li>
                      <li>Express: 3-4 giorni - €19.90</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="shipping-returns__zone">
                <div className="shipping-returns__zone-header">
                  <h3>🌍 Resto del Mondo</h3>
                  <span className="shipping-returns__zone-status shipping-returns__zone-status--limited">Su Richiesta</span>
                </div>
                <div className="shipping-returns__zone-details">
                  <div className="shipping-returns__zone-info">
                    <strong>Paesi disponibili:</strong>
                    <p>USA, Canada, Australia, Svizzera, Regno Unito</p>
                  </div>
                  <div className="shipping-returns__zone-info">
                    <strong>Modalità:</strong>
                    <p>Contattaci per un preventivo personalizzato</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-snowflake"></i>
              Prodotti Freschi e Deperibili
            </h2>
            <div className="shipping-returns__fresh-products">
              <div className="shipping-returns__fresh-info">
                <h3>Spedizione Refrigerata</h3>
                <p>
                  Per garantire la freschezza dei nostri prodotti deperibili (formaggi freschi, salumi, 
                  prodotti da forno), utilizziamo imballaggi termici speciali e spedizioni refrigerate.
                </p>
                <div className="shipping-returns__fresh-features">
                  <div className="shipping-returns__fresh-feature">
                    <i className="fas fa-thermometer-quarter"></i>
                    <span>Temperatura controllata 2-8°C</span>
                  </div>
                  <div className="shipping-returns__fresh-feature">
                    <i className="fas fa-box"></i>
                    <span>Imballaggio isotermico</span>
                  </div>
                  <div className="shipping-returns__fresh-feature">
                    <i className="fas fa-clock"></i>
                    <span>Consegna entro 48h</span>
                  </div>
                </div>
              </div>
              
              <div className="shipping-returns__fresh-schedule">
                <h3>Calendario Spedizioni</h3>
                <div className="shipping-returns__schedule-grid">
                  <div className="shipping-returns__schedule-item">
                    <strong>Lunedì - Mercoledì</strong>
                    <span>Spedizione prodotti freschi</span>
                  </div>
                  <div className="shipping-returns__schedule-item">
                    <strong>Giovedì - Venerdì</strong>
                    <span>Solo prodotti non deperibili</span>
                  </div>
                  <div className="shipping-returns__schedule-item">
                    <strong>Weekend</strong>
                    <span>Nessuna spedizione</span>
                  </div>
                </div>
                <p className="shipping-returns__schedule-note">
                  <i className="fas fa-info-circle"></i>
                  I prodotti freschi non vengono spediti il venerdì per evitare giacenze nel weekend
                </p>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-box-open"></i>
              Imballaggio e Protezione
            </h2>
            <div className="shipping-returns__packaging">
              <div className="shipping-returns__packaging-types">
                <div className="shipping-returns__packaging-type">
                  <div className="shipping-returns__packaging-icon">📦</div>
                  <h3>Prodotti Secchi</h3>
                  <p>Scatole di cartone riciclabile con protezioni interne per evitare rotture</p>
                  <ul>
                    <li>Pluriball per prodotti fragili</li>
                    <li>Separatori per bottiglie</li>
                    <li>Riempimento con materiale ecologico</li>
                  </ul>
                </div>
                
                <div className="shipping-returns__packaging-type">
                  <div className="shipping-returns__packaging-icon">🧊</div>
                  <h3>Prodotti Freschi</h3>
                  <p>Contenitori isotermici con ghiaccio secco per mantenere la catena del freddo</p>
                  <ul>
                    <li>Polistirolo alimentare</li>
                    <li>Ghiaccio secco certificato</li>
                    <li>Termometro di controllo</li>
                  </ul>
                </div>
                
                <div className="shipping-returns__packaging-type">
                  <div className="shipping-returns__packaging-icon">🍷</div>
                  <h3>Bottiglie e Liquidi</h3>
                  <p>Protezioni speciali per bottiglie di olio, vino e liquori</p>
                  <ul>
                    <li>Separatori in cartone</li>
                    <li>Protezione antiurto</li>
                    <li>Etichette "Fragile"</li>
                  </ul>
                </div>
              </div>
              
              <div className="shipping-returns__sustainability">
                <h3>🌱 Sostenibilità</h3>
                <p>
                  Ci impegniamo per un packaging sostenibile utilizzando materiali riciclabili 
                  e riducendo al minimo l'impatto ambientale.
                </p>
                <div className="shipping-returns__eco-features">
                  <span>♻️ Cartone riciclato</span>
                  <span>🌿 Materiali biodegradabili</span>
                  <span>📦 Riutilizzo imballaggi</span>
                </div>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-undo"></i>
              Procedure di Reso
            </h2>
            <div className="shipping-returns__returns">
              <div className="shipping-returns__return-process">
                <h3>Come Effettuare un Reso</h3>
                <div className="shipping-returns__return-steps">
                  <div className="shipping-returns__return-step">
                    <div className="shipping-returns__return-step-number">1</div>
                    <div className="shipping-returns__return-step-content">
                      <h4>Richiesta Reso</h4>
                      <p>Contattaci entro 14 giorni dalla consegna</p>
                      <ul>
                        <li>Email: resi@rusticocalabria.it</li>
                        <li>Telefono: +39 0984 123456</li>
                        <li>Modulo online sul sito</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="shipping-returns__return-step">
                    <div className="shipping-returns__return-step-number">2</div>
                    <div className="shipping-returns__return-step-content">
                      <h4>Autorizzazione</h4>
                      <p>Riceverai un numero RMA (Return Merchandise Authorization)</p>
                      <ul>
                        <li>Etichetta di reso prepagata</li>
                        <li>Istruzioni per l'imballaggio</li>
                        <li>Modulo di reso compilato</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="shipping-returns__return-step">
                    <div className="shipping-returns__return-step-number">3</div>
                    <div className="shipping-returns__return-step-content">
                      <h4>Spedizione</h4>
                      <p>Spedisci il pacco utilizzando l'etichetta fornita</p>
                      <ul>
                        <li>Imballaggio originale preferito</li>
                        <li>Prodotti in condizioni originali</li>
                        <li>Numero RMA ben visibile</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="shipping-returns__return-step">
                    <div className="shipping-returns__return-step-number">4</div>
                    <div className="shipping-returns__return-step-content">
                      <h4>Rimborso</h4>
                      <p>Elaborazione entro 5-7 giorni dal ricevimento</p>
                      <ul>
                        <li>Stesso metodo di pagamento</li>
                        <li>Notifica via email</li>
                        <li>Tempi bancari: 3-5 giorni</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="shipping-returns__return-conditions">
                <h3>Condizioni per il Reso</h3>
                <div className="shipping-returns__return-rules">
                  <div className="shipping-returns__return-rule shipping-returns__return-rule--allowed">
                    <h4><i className="fas fa-check-circle"></i> Prodotti Restituibili</h4>
                    <ul>
                      <li>Prodotti non deperibili sigillati</li>
                      <li>Confezioni integre e non aperte</li>
                      <li>Prodotti non personalizzati</li>
                      <li>Articoli da regalo con etichette</li>
                    </ul>
                  </div>
                  
                  <div className="shipping-returns__return-rule shipping-returns__return-rule--excluded">
                    <h4><i className="fas fa-times-circle"></i> Prodotti Non Restituibili</h4>
                    <ul>
                      <li>Prodotti freschi e deperibili</li>
                      <li>Confezioni aperte o danneggiate</li>
                      <li>Prodotti personalizzati</li>
                      <li>Articoli igienico-sanitari</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-euro-sign"></i>
              Costi e Rimborsi
            </h2>
            <div className="shipping-returns__costs">
              <div className="shipping-returns__cost-table">
                <h3>Tabella Costi Spedizione</h3>
                <div className="shipping-returns__table">
                  <div className="shipping-returns__table-header">
                    <span>Destinazione</span>
                    <span>Standard</span>
                    <span>Express</span>
                    <span>Gratuita da</span>
                  </div>
                  <div className="shipping-returns__table-row">
                    <span>🇮🇹 Italia</span>
                    <span>€4.90</span>
                    <span>€9.90</span>
                    <span>€50</span>
                  </div>
                  <div className="shipping-returns__table-row">
                    <span>🇪🇺 UE</span>
                    <span>€12.90</span>
                    <span>€19.90</span>
                    <span>€100</span>
                  </div>
                  <div className="shipping-returns__table-row">
                    <span>🌍 Extra UE</span>
                    <span>Su richiesta</span>
                    <span>Su richiesta</span>
                    <span>€200</span>
                  </div>
                </div>
              </div>
              
              <div className="shipping-returns__refund-info">
                <h3>Politica Rimborsi</h3>
                <div className="shipping-returns__refund-details">
                  <div className="shipping-returns__refund-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <div>
                      <h4>Rimborso Prodotti</h4>
                      <p>100% del valore dei prodotti restituiti in condizioni originali</p>
                    </div>
                  </div>
                  
                  <div className="shipping-returns__refund-item">
                    <i className="fas fa-shipping-fast"></i>
                    <div>
                      <h4>Spese di Spedizione</h4>
                      <p>Rimborsate solo in caso di errore da parte nostra o prodotto difettoso</p>
                    </div>
                  </div>
                  
                  <div className="shipping-returns__refund-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <h4>Tempi di Rimborso</h4>
                      <p>5-7 giorni lavorativi dalla ricezione del reso + tempi bancari</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-question-circle"></i>
              Domande Frequenti
            </h2>
            <div className="shipping-returns__faq">
              <div className="shipping-returns__faq-item">
                <h3>Posso modificare l'indirizzo di consegna dopo aver effettuato l'ordine?</h3>
                <p>
                  Sì, puoi modificare l'indirizzo entro 2 ore dall'ordine contattandoci immediatamente. 
                  Dopo questo termine, l'ordine potrebbe essere già in preparazione.
                </p>
              </div>
              
              <div className="shipping-returns__faq-item">
                <h3>Cosa succede se non sono presente alla consegna?</h3>
                <p>
                  Il corriere lascerà un avviso di giacenza. Avrai 5 giorni per ritirare il pacco 
                  presso il punto di ritiro indicato, altrimenti verrà rispedito al mittente.
                </p>
              </div>
              
              <div className="shipping-returns__faq-item">
                <h3>Posso restituire prodotti acquistati in offerta?</h3>
                <p>
                  Sì, tutti i prodotti possono essere restituiti secondo le nostre condizioni standard, 
                  indipendentemente dal prezzo di acquisto o dalle promozioni applicate.
                </p>
              </div>
              
              <div className="shipping-returns__faq-item">
                <h3>Come posso tracciare il mio ordine?</h3>
                <p>
                  Riceverai un'email con il codice di tracciamento entro 24h dalla spedizione. 
                  Puoi seguire il pacco sul sito del corriere o nella tua area personale.
                </p>
              </div>
            </div>
          </section>

          <section className="shipping-returns__section">
            <h2 className="shipping-returns__section-title">
              <i className="fas fa-headset"></i>
              Assistenza Spedizioni
            </h2>
            <div className="shipping-returns__support">
              <p>Per qualsiasi problema con spedizioni o resi, il nostro team è a tua disposizione:</p>
              <div className="shipping-returns__support-methods">
                <div className="shipping-returns__support-method">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>Email Spedizioni</strong>
                    <span>spedizioni@rusticocalabria.it</span>
                    <small>Risposta entro 4h</small>
                  </div>
                </div>
                
                <div className="shipping-returns__support-method">
                  <i className="fas fa-undo-alt"></i>
                  <div>
                    <strong>Email Resi</strong>
                    <span>resi@rusticocalabria.it</span>
                    <small>Risposta entro 2h</small>
                  </div>
                </div>
                
                <div className="shipping-returns__support-method">
                  <i className="fas fa-phone"></i>
                  <div>
                    <strong>Telefono</strong>
                    <span>+39 0984 123456</span>
                    <small>Lun-Ven: 9:00-18:00</small>
                  </div>
                </div>
                
                <div className="shipping-returns__support-method">
                  <i className="fas fa-comments"></i>
                  <div>
                    <strong>Chat Live</strong>
                    <span>Disponibile sul sito</span>
                    <small>Lun-Ven: 9:00-18:00</small>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="shipping-returns__footer">
          <div className="shipping-returns__footer-content">
            <p>
              <i className="fas fa-info-circle"></i>
              Le nostre politiche di spedizione e reso sono conformi alle normative europee 
              e al Codice del Consumo italiano.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ShippingReturns; 