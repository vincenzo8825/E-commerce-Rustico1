import React from 'react';
import { Helmet } from 'react-helmet-async';
import './RightOfWithdrawal.scss';

const RightOfWithdrawal = () => {
  return (
    <div className="right-of-withdrawal">
      <Helmet>
        <title>Diritto di Recesso - Rustico Calabria</title>
        <meta name="description" content="Informazioni sul diritto di recesso per gli acquisti su Rustico Calabria. Termini, condizioni e procedure per il reso dei prodotti." />
        <meta name="keywords" content="diritto di recesso, reso prodotti, rimborso, garanzia consumatore, rustico calabria" />
        <link rel="canonical" href="https://rusticocalabria.it/right-of-withdrawal" />
      </Helmet>

      <div className="right-of-withdrawal__container">
        <header className="right-of-withdrawal__header">
          <div className="right-of-withdrawal__badge">
            <i className="fas fa-undo-alt"></i>
            <span>Diritto di Recesso</span>
          </div>
          <h1 className="right-of-withdrawal__title">Diritto di Recesso</h1>
          <p className="right-of-withdrawal__subtitle">
            Informazioni complete sui tuoi diritti di recesso e le procedure per il reso dei prodotti acquistati
          </p>
          <div className="right-of-withdrawal__meta">
            <span className="right-of-withdrawal__date">
              <i className="fas fa-calendar-alt"></i>
              Ultimo aggiornamento: 15 Gennaio 2024
            </span>
          </div>
        </header>

        <div className="right-of-withdrawal__content">
          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-info-circle"></i>
              Informazioni Generali
            </h2>
            <div className="right-of-withdrawal__text">
              <p>
                In conformità al Decreto Legislativo 6 settembre 2005, n. 206 (Codice del Consumo) e successive modificazioni, 
                hai il diritto di recedere dal contratto di acquisto entro 14 giorni senza dover fornire alcuna motivazione.
              </p>
              <p>
                Il periodo di recesso scade dopo 14 giorni dal giorno in cui tu o un terzo da te designato, 
                diverso dal vettore, acquisite il possesso fisico dei beni.
              </p>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-clock"></i>
              Termini per il Recesso
            </h2>
            <div className="right-of-withdrawal__highlight-box">
              <h3>Hai 14 giorni di tempo</h3>
              <p>Il termine di 14 giorni decorre:</p>
              <ul>
                <li>Per i beni: dal giorno della consegna</li>
                <li>Per contratti multipli: dal giorno di consegna dell'ultimo bene</li>
                <li>Per beni consegnati in lotti: dal giorno di consegna dell'ultimo lotto</li>
              </ul>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-file-alt"></i>
              Come Esercitare il Diritto di Recesso
            </h2>
            <div className="right-of-withdrawal__steps">
              <div className="right-of-withdrawal__step">
                <div className="right-of-withdrawal__step-number">1</div>
                <div className="right-of-withdrawal__step-content">
                  <h3>Comunicazione</h3>
                  <p>Invia una comunicazione scritta a:</p>
                  <ul>
                    <li>Email: <strong>resi@rusticocalabria.it</strong></li>
                    <li>PEC: <strong>rusticocalabria@pec.it</strong></li>
                    <li>Raccomandata A/R: Via Roma 123, 87100 Cosenza (CS)</li>
                  </ul>
                </div>
              </div>
              
              <div className="right-of-withdrawal__step">
                <div className="right-of-withdrawal__step-number">2</div>
                <div className="right-of-withdrawal__step-content">
                  <h3>Informazioni Richieste</h3>
                  <p>Nella comunicazione indica:</p>
                  <ul>
                    <li>Numero d'ordine</li>
                    <li>Data di acquisto</li>
                    <li>Prodotti da restituire</li>
                    <li>Motivo del reso (facoltativo)</li>
                  </ul>
                </div>
              </div>
              
              <div className="right-of-withdrawal__step">
                <div className="right-of-withdrawal__step-number">3</div>
                <div className="right-of-withdrawal__step-content">
                  <h3>Restituzione</h3>
                  <p>Restituisci i prodotti entro 14 giorni dalla comunicazione</p>
                </div>
              </div>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-box"></i>
              Condizioni per il Reso
            </h2>
            <div className="right-of-withdrawal__conditions">
              <div className="right-of-withdrawal__condition right-of-withdrawal__condition--allowed">
                <h3><i className="fas fa-check-circle"></i> Prodotti Restituibili</h3>
                <ul>
                  <li>Prodotti non deperibili in confezione originale</li>
                  <li>Prodotti non aperti e non consumati</li>
                  <li>Articoli da regalo con etichette originali</li>
                  <li>Prodotti non personalizzati</li>
                </ul>
              </div>
              
              <div className="right-of-withdrawal__condition right-of-withdrawal__condition--excluded">
                <h3><i className="fas fa-times-circle"></i> Prodotti Non Restituibili</h3>
                <ul>
                  <li>Prodotti alimentari deperibili (salumi, formaggi freschi)</li>
                  <li>Prodotti aperti o parzialmente consumati</li>
                  <li>Articoli personalizzati o su misura</li>
                  <li>Prodotti con sigillo di garanzia rimosso</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-shipping-fast"></i>
              Modalità di Restituzione
            </h2>
            <div className="right-of-withdrawal__text">
              <h3>Spedizione</h3>
              <p>
                I costi di restituzione sono a tuo carico, salvo diversi accordi. 
                Ti consigliamo di utilizzare un corriere tracciabile e di conservare la ricevuta di spedizione.
              </p>
              
              <h3>Imballaggio</h3>
              <p>
                I prodotti devono essere restituiti nell'imballaggio originale, integro e completo di tutti gli accessori. 
                Utilizza un imballaggio adeguato per evitare danni durante il trasporto.
              </p>
              
              <h3>Indirizzo di Reso</h3>
              <div className="right-of-withdrawal__address">
                <strong>Rustico Calabria S.r.l.</strong><br />
                Centro Resi<br />
                Via Roma 123<br />
                87100 Cosenza (CS)<br />
                Italia
              </div>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-euro-sign"></i>
              Rimborsi
            </h2>
            <div className="right-of-withdrawal__refund-info">
              <div className="right-of-withdrawal__refund-item">
                <h3>Tempistiche</h3>
                <p>Il rimborso verrà elaborato entro <strong>14 giorni</strong> dal ricevimento del reso</p>
              </div>
              
              <div className="right-of-withdrawal__refund-item">
                <h3>Modalità</h3>
                <p>Il rimborso avverrà con la stessa modalità di pagamento utilizzata per l'acquisto</p>
              </div>
              
              <div className="right-of-withdrawal__refund-item">
                <h3>Importo</h3>
                <p>Rimborso completo del prezzo pagato, escluse le spese di spedizione originali</p>
              </div>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-exclamation-triangle"></i>
              Responsabilità del Consumatore
            </h2>
            <div className="right-of-withdrawal__text">
              <p>
                Sei responsabile della diminuzione del valore dei beni risultante da una manipolazione 
                diversa da quella necessaria per stabilire la natura, le caratteristiche e il funzionamento dei beni.
              </p>
              <p>
                In caso di danneggiamento o deterioramento del prodotto dovuto a un uso improprio, 
                potremmo trattenere una parte del rimborso corrispondente alla diminuzione di valore.
              </p>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-headset"></i>
              Assistenza
            </h2>
            <div className="right-of-withdrawal__contact">
              <p>Per qualsiasi domanda sul diritto di recesso, contattaci:</p>
              <div className="right-of-withdrawal__contact-methods">
                <div className="right-of-withdrawal__contact-method">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>Email</strong>
                    <span>resi@rusticocalabria.it</span>
                  </div>
                </div>
                
                <div className="right-of-withdrawal__contact-method">
                  <i className="fas fa-phone"></i>
                  <div>
                    <strong>Telefono</strong>
                    <span>+39 0984 123456</span>
                  </div>
                </div>
                
                <div className="right-of-withdrawal__contact-method">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Orari</strong>
                    <span>Lun-Ven: 9:00-18:00</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="right-of-withdrawal__section">
            <h2 className="right-of-withdrawal__section-title">
              <i className="fas fa-balance-scale"></i>
              Risoluzione delle Controversie
            </h2>
            <div className="right-of-withdrawal__text">
              <p>
                In caso di controversie relative al diritto di recesso, puoi rivolgerti:
              </p>
              <ul>
                <li>Alle Camere di Commercio territorialmente competenti</li>
                <li>Alle associazioni dei consumatori</li>
                <li>Alla piattaforma europea ODR per acquisti online</li>
                <li>All'Autorità Garante della Concorrenza e del Mercato</li>
              </ul>
            </div>
          </section>
        </div>

        <footer className="right-of-withdrawal__footer">
          <div className="right-of-withdrawal__footer-content">
            <p>
              <i className="fas fa-info-circle"></i>
              Questa pagina è conforme al Decreto Legislativo 6 settembre 2005, n. 206 (Codice del Consumo) 
              e al Decreto Legislativo 21 febbraio 2014, n. 21.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RightOfWithdrawal; 