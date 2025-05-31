import React from 'react';
import { Helmet } from 'react-helmet-async';
import './CookiePolicy.scss';

const CookiePolicy = () => {
  return (
    <div className="cookie-policy">
      <Helmet>
        <title>Cookie Policy - Rustico Calabria</title>
        <meta name="description" content="Informativa sui cookie utilizzati da Rustico Calabria" />
      </Helmet>

      <div className="cookie-policy__container">
        <div className="cookie-policy__header">
          <h1>Cookie Policy</h1>
          <p className="cookie-policy__subtitle">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        <div className="cookie-policy__content">
          <section className="cookie-section">
            <h2>1. Cosa sono i Cookie</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo 
              quando visiti un sito web. Vengono utilizzati per migliorare la tua esperienza 
              di navigazione e per fornire funzionalità personalizzate.
            </p>
            
            <div className="info-highlight">
              <h4>🍪 Definizione Tecnica</h4>
              <p>
                Un cookie è un file di testo di piccole dimensioni che un sito web salva 
                sul computer o dispositivo mobile dell'utente quando lo visita. Grazie ai cookie, 
                il sito ricorda le azioni e preferenze dell'utente per un certo periodo di tempo.
              </p>
            </div>
          </section>

          <section className="cookie-section">
            <h2>2. Tipologie di Cookie Utilizzati</h2>
            
            <div className="cookie-types">
              <div className="cookie-type">
                <div className="cookie-type__header">
                  <span className="cookie-type__icon">🔧</span>
                  <h3>Cookie Tecnici Necessari</h3>
                  <span className="cookie-status cookie-status--required">Sempre Attivi</span>
                </div>
                <p>
                  Questi cookie sono essenziali per il corretto funzionamento del sito web 
                  e non possono essere disabilitati nei nostri sistemi.
                </p>
                <div className="cookie-details">
                  <h4>Finalità:</h4>
                  <ul>
                    <li>Gestione della sessione utente</li>
                    <li>Mantenimento del carrello della spesa</li>
                    <li>Sicurezza e prevenzione frodi</li>
                    <li>Funzionalità di base del sito</li>
                  </ul>
                  <div className="cookie-examples">
                    <h4>Esempi di Cookie:</h4>
                    <div className="cookie-list">
                      <div className="cookie-item">
                        <strong>PHPSESSID</strong>
                        <span>Gestione sessione PHP</span>
                        <span>Sessione</span>
                      </div>
                      <div className="cookie-item">
                        <strong>cart_token</strong>
                        <span>Identificativo carrello</span>
                        <span>30 giorni</span>
                      </div>
                      <div className="cookie-item">
                        <strong>csrf_token</strong>
                        <span>Protezione CSRF</span>
                        <span>Sessione</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cookie-type">
                <div className="cookie-type__header">
                  <span className="cookie-type__icon">📊</span>
                  <h3>Cookie Analitici</h3>
                  <span className="cookie-status cookie-status--optional">Opzionali</span>
                </div>
                <p>
                  Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito web 
                  raccogliendo e riportando informazioni in forma anonima.
                </p>
                <div className="cookie-details">
                  <h4>Finalità:</h4>
                  <ul>
                    <li>Analisi del traffico del sito</li>
                    <li>Misurazione delle prestazioni</li>
                    <li>Comprensione del comportamento degli utenti</li>
                    <li>Miglioramento dell'esperienza utente</li>
                  </ul>
                  <div className="cookie-examples">
                    <h4>Servizi Utilizzati:</h4>
                    <div className="service-item">
                      <h5>Google Analytics</h5>
                      <p>
                        Servizio di analisi web fornito da Google Inc. che utilizza cookie 
                        per raccogliere informazioni anonime su come i visitatori utilizzano il sito.
                      </p>
                      <div className="cookie-list">
                        <div className="cookie-item">
                          <strong>_ga</strong>
                          <span>Identificativo utente unico</span>
                          <span>2 anni</span>
                        </div>
                        <div className="cookie-item">
                          <strong>_ga_*</strong>
                          <span>Stato della sessione</span>
                          <span>2 anni</span>
                        </div>
                        <div className="cookie-item">
                          <strong>_gid</strong>
                          <span>Identificativo sessione</span>
                          <span>24 ore</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cookie-type">
                <div className="cookie-type__header">
                  <span className="cookie-type__icon">🎯</span>
                  <h3>Cookie di Marketing</h3>
                  <span className="cookie-status cookie-status--optional">Opzionali</span>
                </div>
                <p>
                  Questi cookie vengono utilizzati per tracciare i visitatori sui siti web 
                  per mostrare annunci pertinenti e coinvolgenti.
                </p>
                <div className="cookie-details">
                  <h4>Finalità:</h4>
                  <ul>
                    <li>Pubblicità personalizzata</li>
                    <li>Retargeting e remarketing</li>
                    <li>Misurazione efficacia campagne</li>
                    <li>Profilazione comportamentale</li>
                  </ul>
                  <div className="cookie-examples">
                    <h4>Servizi Utilizzati:</h4>
                    <div className="service-item">
                      <h5>Facebook Pixel</h5>
                      <p>
                        Strumento di analisi che consente di misurare l'efficacia della pubblicità 
                        comprendendo le azioni che le persone compiono sul nostro sito web.
                      </p>
                      <div className="cookie-list">
                        <div className="cookie-item">
                          <strong>_fbp</strong>
                          <span>Pixel di Facebook</span>
                          <span>3 mesi</span>
                        </div>
                        <div className="cookie-item">
                          <strong>fr</strong>
                          <span>Pubblicità Facebook</span>
                          <span>3 mesi</span>
                        </div>
                      </div>
                    </div>
                    <div className="service-item">
                      <h5>Google Ads</h5>
                      <p>
                        Servizio pubblicitario di Google che utilizza cookie per mostrare 
                        annunci pertinenti e misurare l'efficacia delle campagne.
                      </p>
                      <div className="cookie-list">
                        <div className="cookie-item">
                          <strong>_gcl_au</strong>
                          <span>Conversioni Google Ads</span>
                          <span>3 mesi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cookie-type">
                <div className="cookie-type__header">
                  <span className="cookie-type__icon">⚙️</span>
                  <h3>Cookie Funzionali</h3>
                  <span className="cookie-status cookie-status--optional">Opzionali</span>
                </div>
                <p>
                  Questi cookie abilitano funzionalità avanzate e personalizzazione, 
                  come video e chat dal vivo.
                </p>
                <div className="cookie-details">
                  <h4>Finalità:</h4>
                  <ul>
                    <li>Personalizzazione dell'interfaccia</li>
                    <li>Preferenze linguistiche</li>
                    <li>Funzionalità social media</li>
                    <li>Chat di supporto</li>
                  </ul>
                  <div className="cookie-examples">
                    <h4>Servizi Utilizzati:</h4>
                    <div className="service-item">
                      <h5>YouTube</h5>
                      <p>
                        Per la visualizzazione di video incorporati nelle pagine del sito.
                      </p>
                    </div>
                    <div className="service-item">
                      <h5>Zendesk Chat</h5>
                      <p>
                        Per fornire supporto clienti tramite chat dal vivo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>3. Base Giuridica del Trattamento</h2>
            <div className="legal-basis">
              <div className="basis-item">
                <h4>Cookie Tecnici Necessari</h4>
                <p>
                  <strong>Base giuridica:</strong> Legittimo interesse (Art. 6(1)(f) GDPR)<br />
                  <strong>Motivazione:</strong> Essenziali per il funzionamento del sito e l'erogazione del servizio richiesto dall'utente.
                </p>
              </div>
              <div className="basis-item">
                <h4>Cookie Analitici, Marketing e Funzionali</h4>
                <p>
                  <strong>Base giuridica:</strong> Consenso (Art. 6(1)(a) GDPR)<br />
                  <strong>Motivazione:</strong> Richiedono il consenso esplicito dell'utente prima dell'installazione.
                </p>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>4. Durata dei Cookie</h2>
            <div className="duration-table">
              <div className="duration-row duration-header">
                <div>Tipologia</div>
                <div>Durata</div>
                <div>Descrizione</div>
              </div>
              <div className="duration-row">
                <div>Cookie di Sessione</div>
                <div>Fino alla chiusura del browser</div>
                <div>Vengono eliminati automaticamente quando chiudi il browser</div>
              </div>
              <div className="duration-row">
                <div>Cookie Persistenti</div>
                <div>Variabile (da 24 ore a 2 anni)</div>
                <div>Rimangono sul dispositivo per il periodo specificato</div>
              </div>
              <div className="duration-row">
                <div>Cookie di Terze Parti</div>
                <div>Secondo le policy del fornitore</div>
                <div>Gestiti da servizi esterni secondo le loro politiche</div>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>5. Gestione delle Preferenze Cookie</h2>
            <p>
              Puoi gestire le tue preferenze sui cookie in diversi modi:
            </p>
            
            <div className="management-options">
              <div className="management-option">
                <h4>🎛️ Banner Cookie del Sito</h4>
                <p>
                  Utilizza il banner che appare alla prima visita per scegliere quali 
                  categorie di cookie accettare. Puoi modificare le tue preferenze 
                  in qualsiasi momento.
                </p>
                <button className="cookie-settings-btn" onClick={() => window.location.reload()}>
                  Gestisci Preferenze Cookie
                </button>
              </div>

              <div className="management-option">
                <h4>🌐 Impostazioni del Browser</h4>
                <p>
                  Tutti i browser moderni permettono di gestire i cookie attraverso 
                  le impostazioni di privacy e sicurezza.
                </p>
                <div className="browser-links">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                    Chrome
                  </a>
                  <a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer">
                    Firefox
                  </a>
                  <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                    Safari
                  </a>
                  <a href="https://support.microsoft.com/it-it/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer">
                    Edge
                  </a>
                </div>
              </div>

              <div className="management-option">
                <h4>🚫 Opt-out Servizi Terzi</h4>
                <p>
                  Puoi disattivare specifici servizi di terze parti utilizzando 
                  i loro strumenti di opt-out:
                </p>
                <div className="optout-links">
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Google Analytics Opt-out
                  </a>
                  <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer">
                    Facebook Ads Preferences
                  </a>
                  <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
                    Google Ads Settings
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>6. Conseguenze della Disabilitazione</h2>
            <div className="consequences">
              <div className="consequence-item consequence-item--warning">
                <h4>⚠️ Cookie Tecnici Necessari</h4>
                <p>
                  La disabilitazione di questi cookie può compromettere il funzionamento 
                  del sito e impedire l'utilizzo di alcune funzionalità essenziali come 
                  il carrello della spesa e il processo di checkout.
                </p>
              </div>
              <div className="consequence-item consequence-item--info">
                <h4>📊 Cookie Analitici</h4>
                <p>
                  La disabilitazione non influisce sul funzionamento del sito, ma ci impedisce 
                  di raccogliere dati per migliorare l'esperienza utente e le prestazioni del sito.
                </p>
              </div>
              <div className="consequence-item consequence-item--neutral">
                <h4>🎯 Cookie di Marketing</h4>
                <p>
                  La disabilitazione non influisce sul funzionamento del sito, ma potresti 
                  vedere annunci meno pertinenti ai tuoi interessi.
                </p>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>7. Cookie di Terze Parti</h2>
            <p>
              Il nostro sito utilizza servizi di terze parti che possono installare 
              i propri cookie. Questi servizi hanno le proprie politiche sui cookie:
            </p>
            
            <div className="third-party-services">
              <div className="service-card">
                <h4>Google (Analytics, Ads, reCAPTCHA)</h4>
                <p>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy Google
                  </a>
                </p>
              </div>
              <div className="service-card">
                <h4>Facebook (Pixel, Social Plugins)</h4>
                <p>
                  <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer">
                    Privacy Policy Facebook
                  </a>
                </p>
              </div>
              <div className="service-card">
                <h4>Stripe (Pagamenti)</h4>
                <p>
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy Stripe
                  </a>
                </p>
              </div>
              <div className="service-card">
                <h4>PayPal (Pagamenti)</h4>
                <p>
                  <a href="https://www.paypal.com/it/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer">
                    Privacy Policy PayPal
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="cookie-section">
            <h2>8. Aggiornamenti della Cookie Policy</h2>
            <p>
              Questa Cookie Policy può essere aggiornata periodicamente per riflettere 
              cambiamenti nelle nostre pratiche sui cookie o per altri motivi operativi, 
              legali o normativi.
            </p>
            <p>
              Ti invitiamo a consultare regolarmente questa pagina per rimanere informato 
              sui cookie che utilizziamo e su come li utilizziamo.
            </p>
          </section>

          <section className="cookie-section">
            <h2>9. Contatti</h2>
            <p>
              Per qualsiasi domanda relativa a questa Cookie Policy o alle nostre 
              pratiche sui cookie, puoi contattarci:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong> privacy@rusticocalabria.it
              </div>
              <div className="contact-item">
                <strong>Telefono:</strong> +39 0984 123456
              </div>
              <div className="contact-item">
                <strong>Indirizzo:</strong> Via Roma 123, 87100 Cosenza (CS), Italia
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy; 