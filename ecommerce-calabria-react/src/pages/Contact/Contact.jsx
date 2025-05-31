import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simula invio email
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contattaci - Rustico Calabria</title>
        <meta name="description" content="Contatta Rustico Calabria per informazioni sui nostri prodotti tipici calabresi. Siamo qui per aiutarti con qualsiasi domanda." />
        <meta name="keywords" content="contatti, rustico calabria, assistenza, informazioni, prodotti tipici" />
      </Helmet>

      <div className="contact-page">
        <div className="contact-hero">
          <div className="container">
            <h1>Contattaci</h1>
            <p className="contact-hero__subtitle">
              Siamo qui per aiutarti
            </p>
          </div>
        </div>

        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Informazioni di Contatto</h2>
              
              <div className="contact-item">
                <h3>📍 Indirizzo</h3>
                <p>Via della Tradizione, 123<br />87100 Cosenza (CS)<br />Calabria, Italia</p>
              </div>

              <div className="contact-item">
                <h3>📞 Telefono</h3>
                <p><a href="tel:+390984123456">+39 0984 123456</a></p>
              </div>

              <div className="contact-item">
                <h3>📧 Email</h3>
                <p><a href="mailto:info@rusticocalabria.it">info@rusticocalabria.it</a></p>
              </div>

              <div className="contact-item">
                <h3>🕒 Orari</h3>
                <p>Lunedì - Venerdì: 9:00 - 18:00<br />Sabato: 9:00 - 13:00<br />Domenica: Chiuso</p>
              </div>

              <div className="contact-item">
                <h3>📱 Social Media</h3>
                <div className="social-links">
                  <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                  <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Inviaci un Messaggio</h2>
              
              {submitted ? (
                <div className="success-message">
                  <h3>✅ Messaggio Inviato!</h3>
                  <p>Grazie per averci contattato. Ti risponderemo al più presto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nome Completo *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Il tuo nome"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="la.tua@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Oggetto *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleziona un oggetto</option>
                      <option value="info-prodotti">Informazioni sui prodotti</option>
                      <option value="ordine">Problemi con un ordine</option>
                      <option value="spedizione">Spedizione e consegna</option>
                      <option value="qualita">Qualità del prodotto</option>
                      <option value="partnership">Partnership e collaborazioni</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Messaggio *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Scrivi qui il tuo messaggio..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Invio in corso...' : 'Invia Messaggio'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="contact-faq">
            <h2>Domande Frequenti</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>🚚 Quanto tempo per la spedizione?</h3>
                <p>Le spedizioni vengono effettuate entro 24-48 ore e arrivano in 2-5 giorni lavorativi.</p>
              </div>
              <div className="faq-item">
                <h3>📦 Posso modificare il mio ordine?</h3>
                <p>Puoi modificare l'ordine entro 2 ore dall'acquisto contattandoci subito.</p>
              </div>
              <div className="faq-item">
                <h3>🔄 Politica di reso?</h3>
                <p>Accettiamo resi entro 14 giorni per prodotti non deperibili e non aperti.</p>
              </div>
              <div className="faq-item">
                <h3>🌶️ Sono davvero piccanti?</h3>
                <p>Sì! I nostri peperoncini sono autentici calabresi, quindi preparati al fuoco!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact; 