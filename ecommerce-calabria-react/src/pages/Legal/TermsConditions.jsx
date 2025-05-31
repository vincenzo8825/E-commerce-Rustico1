import React from 'react';
import { Helmet } from 'react-helmet-async';
import './TermsConditions.scss';

const TermsConditions = () => {
  return (
    <div className="terms-conditions">
      <Helmet>
        <title>Termini e Condizioni - Rustico Calabria</title>
        <meta name="description" content="Termini e condizioni di vendita di Rustico Calabria" />
      </Helmet>

      <div className="terms-conditions__container">
        <div className="terms-conditions__header">
          <h1>Termini e Condizioni di Vendita</h1>
          <p className="terms-conditions__subtitle">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        <div className="terms-conditions__content">
          <section className="terms-section">
            <h2>1. Informazioni Generali</h2>
            <p>
              I presenti Termini e Condizioni disciplinano l'utilizzo del sito web 
              <strong> www.rusticocalabria.it</strong> e l'acquisto di prodotti tramite 
              il nostro negozio online.
            </p>
            <p>
              <strong>Denominazione sociale:</strong> Rustico Calabria S.r.l.<br />
              <strong>Sede legale:</strong> Via Roma 123, 87100 Cosenza (CS), Italia<br />
              <strong>Partita IVA:</strong> IT12345678901<br />
              <strong>Codice Fiscale:</strong> 12345678901<br />
              <strong>REA:</strong> CS-123456<br />
              <strong>Capitale sociale:</strong> € 10.000,00 i.v.<br />
              <strong>Email:</strong> info@rusticocalabria.it<br />
              <strong>Telefono:</strong> +39 0984 123456
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Definizioni</h2>
            <div className="definition-list">
              <div className="definition-item">
                <h4>Venditore</h4>
                <p>Rustico Calabria S.r.l., titolare del sito web e del negozio online.</p>
              </div>
              <div className="definition-item">
                <h4>Cliente/Consumatore</h4>
                <p>La persona fisica che acquista prodotti per uso personale, non professionale.</p>
              </div>
              <div className="definition-item">
                <h4>Sito</h4>
                <p>Il sito web www.rusticocalabria.it e tutte le sue pagine.</p>
              </div>
              <div className="definition-item">
                <h4>Prodotti</h4>
                <p>I prodotti alimentari tipici calabresi venduti tramite il sito.</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>3. Registrazione e Account</h2>
            <p>
              Per effettuare acquisti è necessario registrarsi fornendo dati veritieri e completi. 
              L'utente è responsabile della riservatezza delle proprie credenziali di accesso.
            </p>
            <ul>
              <li>I dati forniti devono essere veritieri e aggiornati</li>
              <li>È vietato creare account multipli per la stessa persona</li>
              <li>L'account è personale e non trasferibile</li>
              <li>Il Venditore si riserva il diritto di sospendere account sospetti</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Prodotti e Prezzi</h2>
            <div className="info-box info-box--warning">
              <h4>⚠️ Importante</h4>
              <p>
                I prezzi sono espressi in Euro, IVA inclusa, e possono variare senza preavviso. 
                Il prezzo applicato sarà quello vigente al momento dell'ordine.
              </p>
            </div>
            
            <h3>Caratteristiche dei Prodotti</h3>
            <ul>
              <li>Tutti i prodotti sono di origine calabrese certificata</li>
              <li>Le immagini sono rappresentative ma potrebbero differire leggermente dal prodotto reale</li>
              <li>I pesi indicati sono approssimativi con tolleranza del ±5%</li>
              <li>Tutti i prodotti rispettano le normative alimentari vigenti</li>
            </ul>

            <h3>Disponibilità</h3>
            <p>
              I prodotti sono venduti fino ad esaurimento scorte. In caso di indisponibilità, 
              il Cliente sarà tempestivamente informato e potrà scegliere un prodotto sostitutivo 
              o richiedere il rimborso.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Ordini e Pagamenti</h2>
            
            <h3>Processo di Ordine</h3>
            <div className="process-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Selezione Prodotti</h4>
                  <p>Aggiungi i prodotti desiderati al carrello</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Checkout</h4>
                  <p>Inserisci i dati di spedizione e fatturazione</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Pagamento</h4>
                  <p>Completa il pagamento con il metodo scelto</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h4>Conferma</h4>
                  <p>Ricevi la conferma dell'ordine via email</p>
                </div>
              </div>
            </div>

            <h3>Metodi di Pagamento Accettati</h3>
            <div className="payment-methods">
              <div className="payment-method">
                <span className="payment-icon">💳</span>
                <div>
                  <h4>Carte di Credito/Debito</h4>
                  <p>Visa, Mastercard, American Express</p>
                </div>
              </div>
              <div className="payment-method">
                <span className="payment-icon">🏦</span>
                <div>
                  <h4>Bonifico Bancario</h4>
                  <p>Per ordini superiori a €50</p>
                </div>
              </div>
              <div className="payment-method">
                <span className="payment-icon">📱</span>
                <div>
                  <h4>PayPal</h4>
                  <p>Pagamento sicuro e veloce</p>
                </div>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>6. Spedizioni e Consegne</h2>
            
            <h3>Zone di Consegna</h3>
            <p>Effettuiamo spedizioni in tutta Italia e nei seguenti paesi UE:</p>
            <div className="shipping-zones">
              <div className="zone">
                <h4>🇮🇹 Italia</h4>
                <p>Consegna in 2-3 giorni lavorativi</p>
                <p><strong>Spedizione gratuita</strong> per ordini superiori a €50</p>
              </div>
              <div className="zone">
                <h4>🇪🇺 Unione Europea</h4>
                <p>Consegna in 5-7 giorni lavorativi</p>
                <p>Costi di spedizione variabili per paese</p>
              </div>
            </div>

            <h3>Costi di Spedizione</h3>
            <ul>
              <li><strong>Italia:</strong> €5,90 (gratuita sopra €50)</li>
              <li><strong>UE:</strong> €12,90 - €19,90 (a seconda del paese)</li>
              <li><strong>Prodotti refrigerati:</strong> Supplemento €3,00</li>
            </ul>

            <div className="info-box info-box--info">
              <h4>📦 Imballaggio Speciale</h4>
              <p>
                Utilizziamo imballaggi isotermici per garantire la freschezza dei prodotti 
                durante il trasporto, specialmente per salumi e formaggi.
              </p>
            </div>
          </section>

          <section className="terms-section">
            <h2>7. Diritto di Recesso</h2>
            <p>
              Ai sensi del Codice del Consumo (D.Lgs. 206/2005), hai diritto di recedere 
              dal contratto entro <strong>14 giorni</strong> dalla ricezione dei prodotti, 
              senza dover fornire alcuna motivazione.
            </p>

            <h3>Modalità di Recesso</h3>
            <ol>
              <li>Invia comunicazione scritta a: recessi@rusticocalabria.it</li>
              <li>Utilizza il modulo di recesso allegato alla spedizione</li>
              <li>Restituisci i prodotti integri e nella confezione originale</li>
              <li>Il rimborso avverrà entro 14 giorni dal ricevimento della merce</li>
            </ol>

            <div className="info-box info-box--warning">
              <h4>⚠️ Esclusioni dal Diritto di Recesso</h4>
              <p>
                Il diritto di recesso è escluso per:
              </p>
              <ul>
                <li>Prodotti deperibili o con scadenza ravvicinata</li>
                <li>Prodotti personalizzati o su misura</li>
                <li>Prodotti aperti o consumati parzialmente</li>
                <li>Prodotti igienico-sanitari aperti</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>8. Garanzie e Responsabilità</h2>
            
            <h3>Garanzia di Conformità</h3>
            <p>
              Tutti i prodotti sono garantiti conformi alle descrizioni e alle normative vigenti. 
              In caso di difetti di conformità, il Cliente ha diritto alla sostituzione o al rimborso.
            </p>

            <h3>Limitazioni di Responsabilità</h3>
            <ul>
              <li>La responsabilità è limitata al valore dell'ordine</li>
              <li>Non siamo responsabili per danni indiretti o consequenziali</li>
              <li>La responsabilità per ritardi di consegna è limitata al rimborso delle spese di spedizione</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>9. Proprietà Intellettuale</h2>
            <p>
              Tutti i contenuti del sito (testi, immagini, loghi, marchi) sono protetti da diritti 
              di proprietà intellettuale e non possono essere utilizzati senza autorizzazione scritta.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Risoluzione delle Controversie</h2>
            <p>
              Per la risoluzione di eventuali controversie, il Cliente può rivolgersi a:
            </p>
            <ul>
              <li><strong>Mediazione:</strong> Camera di Commercio di Cosenza</li>
              <li><strong>Arbitrato:</strong> Camera Arbitrale presso la CCIAA di Cosenza</li>
              <li><strong>Piattaforma ODR:</strong> ec.europa.eu/consumers/odr</li>
            </ul>
            <p>
              Il foro competente per le controversie è quello di Cosenza.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Modifiche ai Termini</h2>
            <p>
              Ci riserviamo il diritto di modificare questi Termini e Condizioni. 
              Le modifiche saranno pubblicate su questa pagina e comunicate via email 
              agli utenti registrati.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Contatti</h2>
            <div className="contact-grid">
              <div className="contact-item">
                <h4>📧 Email</h4>
                <p>info@rusticocalabria.it</p>
              </div>
              <div className="contact-item">
                <h4>📞 Telefono</h4>
                <p>+39 0984 123456</p>
              </div>
              <div className="contact-item">
                <h4>📍 Indirizzo</h4>
                <p>Via Roma 123<br />87100 Cosenza (CS)</p>
              </div>
              <div className="contact-item">
                <h4>🕒 Orari</h4>
                <p>Lun-Ven: 9:00-18:00<br />Sab: 9:00-13:00</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions; 