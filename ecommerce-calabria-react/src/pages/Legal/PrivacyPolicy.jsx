import React from 'react';
import { Helmet } from 'react-helmet-async';
import './PrivacyPolicy.scss';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <Helmet>
        <title>Privacy Policy - Rustico Calabria</title>
        <meta name="description" content="Informativa sulla privacy e trattamento dei dati personali di Rustico Calabria" />
      </Helmet>

      <div className="privacy-policy__container">
        <div className="privacy-policy__header">
          <h1>Informativa sulla Privacy</h1>
          <p className="privacy-policy__subtitle">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        <div className="privacy-policy__content">
          <section className="privacy-section">
            <h2>1. Titolare del Trattamento</h2>
            <p>
              Il Titolare del trattamento dei dati è <strong>Rustico Calabria S.r.l.</strong>, 
              con sede legale in Via Roma 123, 87100 Cosenza (CS), Italia.
            </p>
            <p>
              <strong>Email:</strong> privacy@rusticocalabria.it<br />
              <strong>Telefono:</strong> +39 0984 123456<br />
              <strong>PEC:</strong> rusticocalabria@pec.it
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Dati Personali Raccolti</h2>
            <p>
              Raccogliamo e trattiamo le seguenti categorie di dati personali:
            </p>
            
            <div className="data-category">
              <h3>Dati di Identificazione</h3>
              <ul>
                <li>Nome e cognome</li>
                <li>Indirizzo email</li>
                <li>Numero di telefono</li>
                <li>Data di nascita</li>
                <li>Codice fiscale (se necessario per fatturazione)</li>
              </ul>
            </div>

            <div className="data-category">
              <h3>Dati di Fatturazione e Spedizione</h3>
              <ul>
                <li>Indirizzo di fatturazione</li>
                <li>Indirizzo di spedizione</li>
                <li>Partita IVA (per aziende)</li>
                <li>Codice destinatario/PEC (per fatturazione elettronica)</li>
              </ul>
            </div>

            <div className="data-category">
              <h3>Dati di Pagamento</h3>
              <ul>
                <li>Informazioni sulla carta di credito (tramite gateway sicuri)</li>
                <li>Cronologia degli ordini</li>
                <li>Preferenze di pagamento</li>
              </ul>
            </div>

            <div className="data-category">
              <h3>Dati di Navigazione</h3>
              <ul>
                <li>Indirizzo IP</li>
                <li>Tipo di browser e dispositivo</li>
                <li>Pagine visitate</li>
                <li>Tempo di permanenza sul sito</li>
                <li>Cookie e tecnologie simili</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2>3. Finalità del Trattamento</h2>
            <p>I tuoi dati personali vengono trattati per le seguenti finalità:</p>
            
            <div className="purpose-item">
              <h4>A) Esecuzione del Contratto</h4>
              <p>
                <strong>Base giuridica:</strong> Art. 6(1)(b) GDPR - Esecuzione del contratto<br />
                <strong>Finalità:</strong> Gestione ordini, spedizioni, fatturazione, assistenza clienti
              </p>
            </div>

            <div className="purpose-item">
              <h4>B) Obblighi Legali</h4>
              <p>
                <strong>Base giuridica:</strong> Art. 6(1)(c) GDPR - Adempimento obblighi legali<br />
                <strong>Finalità:</strong> Fatturazione, contabilità, adempimenti fiscali
              </p>
            </div>

            <div className="purpose-item">
              <h4>C) Marketing (con consenso)</h4>
              <p>
                <strong>Base giuridica:</strong> Art. 6(1)(a) GDPR - Consenso<br />
                <strong>Finalità:</strong> Newsletter, offerte promozionali, comunicazioni commerciali
              </p>
            </div>

            <div className="purpose-item">
              <h4>D) Legittimo Interesse</h4>
              <p>
                <strong>Base giuridica:</strong> Art. 6(1)(f) GDPR - Legittimo interesse<br />
                <strong>Finalità:</strong> Sicurezza del sito, prevenzione frodi, miglioramento servizi
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>4. Modalità di Trattamento</h2>
            <p>
              I dati personali sono trattati con strumenti automatizzati e manuali, 
              con logiche strettamente correlate alle finalità indicate e, comunque, 
              in modo da garantire la sicurezza e la riservatezza dei dati stessi.
            </p>
            <p>
              Adottiamo misure tecniche e organizzative appropriate per proteggere 
              i dati personali da accessi non autorizzati, alterazioni, divulgazioni 
              o distruzioni accidentali.
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Conservazione dei Dati</h2>
            <p>I dati personali vengono conservati per i seguenti periodi:</p>
            <ul>
              <li><strong>Dati contrattuali:</strong> 10 anni dalla fine del rapporto contrattuale</li>
              <li><strong>Dati di fatturazione:</strong> 10 anni per obblighi fiscali</li>
              <li><strong>Consenso marketing:</strong> Fino alla revoca del consenso</li>
              <li><strong>Dati di navigazione:</strong> 24 mesi</li>
              <li><strong>Cookie tecnici:</strong> Durata della sessione</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>6. Comunicazione e Diffusione</h2>
            <p>
              I dati personali possono essere comunicati a:
            </p>
            <ul>
              <li>Corrieri e spedizionieri per la consegna degli ordini</li>
              <li>Istituti di credito e sistemi di pagamento</li>
              <li>Consulenti fiscali e commercialisti</li>
              <li>Fornitori di servizi IT e hosting</li>
              <li>Autorità competenti quando richiesto dalla legge</li>
            </ul>
            <p>
              I dati non vengono diffusi pubblicamente né trasferiti in paesi 
              extra-UE senza adeguate garanzie.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Diritti dell'Interessato</h2>
            <p>
              In qualità di interessato, hai i seguenti diritti:
            </p>
            
            <div className="rights-grid">
              <div className="right-item">
                <h4>🔍 Diritto di Accesso</h4>
                <p>Ottenere informazioni sui tuoi dati trattati</p>
              </div>
              
              <div className="right-item">
                <h4>✏️ Diritto di Rettifica</h4>
                <p>Correggere dati inesatti o incompleti</p>
              </div>
              
              <div className="right-item">
                <h4>🗑️ Diritto di Cancellazione</h4>
                <p>Richiedere la cancellazione dei dati</p>
              </div>
              
              <div className="right-item">
                <h4>⏸️ Diritto di Limitazione</h4>
                <p>Limitare il trattamento dei dati</p>
              </div>
              
              <div className="right-item">
                <h4>📦 Diritto di Portabilità</h4>
                <p>Ricevere i dati in formato strutturato</p>
              </div>
              
              <div className="right-item">
                <h4>❌ Diritto di Opposizione</h4>
                <p>Opporti al trattamento per marketing</p>
              </div>
            </div>

            <p>
              Per esercitare i tuoi diritti, contattaci all'indirizzo: 
              <strong>privacy@rusticocalabria.it</strong>
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Cookie Policy</h2>
            <p>
              Il nostro sito utilizza cookie tecnici necessari per il funzionamento 
              e cookie di profilazione previo tuo consenso. Per maggiori informazioni 
              consulta la nostra <a href="/cookie-policy">Cookie Policy</a>.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di modificare questa informativa. 
              Le modifiche saranno pubblicate su questa pagina con indicazione 
              della data di ultimo aggiornamento.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Contatti</h2>
            <p>
              Per qualsiasi domanda relativa al trattamento dei dati personali, 
              puoi contattarci:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@rusticocalabria.it</p>
              <p><strong>Telefono:</strong> +39 0984 123456</p>
              <p><strong>Indirizzo:</strong> Via Roma 123, 87100 Cosenza (CS)</p>
            </div>
            <p>
              Hai inoltre il diritto di presentare reclamo al Garante per la 
              Protezione dei Dati Personali (www.gpdp.it).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 