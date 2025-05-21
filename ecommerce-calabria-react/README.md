📚 README.md
markdown# eCommerce Prodotti Tipici Calabresi

Un'applicazione eCommerce completa per la vendita di prodotti tipici calabresi, sviluppata con React (frontend) e Laravel (backend).

## 🌟 Caratteristiche Principali

- **Autenticazione completa** con verifica email
- **Catalogo prodotti** organizzato per categorie
- **Carrello acquisti** con gestione completa
- **Sistema preferiti** per salvare prodotti interessanti
- **Sistema recensioni** per feedback sui prodotti
- **Dashboard utente** con storico ordini e gestione profilo
- **Dashboard admin** con:
  - Gestione prodotti e categorie
  - Gestione ordini
  - Supporto clienti
  - Statistiche vendite
  - Gestione magazzino
  - Creazione codici sconto

## 🛠️ Tecnologie Utilizzate

### Frontend
- React.js con Vite
- React Router per navigazione
- Axios per richieste API
- CSS con metodologia BEM

### Backend
- Laravel 10
- Laravel Sanctum per autenticazione
- MySQL per database

## 📋 Requisiti

- PHP 8.1 o superiore
- Composer
- Node.js 16 o superiore
- MySQL 5.7 o superiore

## 🚀 Installazione

### Backend (Laravel)

1. Clona il repository
   ```bash
   git clone https://github.com/tuousername/ecommerce-calabria.git
   cd ecommerce-calabria/backend

Installa le dipendenze
bashcomposer install

Copia il file .env di esempio
bashcp .env.example .env

Configura il file .env con le tue credenziali database
Genera la chiave dell'applicazione
bashphp artisan key:generate

Esegui le migrazioni e i seed
bashphp artisan migrate --seed

Avvia il server
bashphp artisan serve


Frontend (React)

Naviga nella directory frontend
bashcd ../frontend

Installa le dipendenze
bashnpm install

Crea un file .env.local e configura l'URL API
VITE_API_URL=http://localhost:8000/api

Avvia il server di sviluppo
bashnpm run dev


📊 Struttura Database

users: Utenti dell'applicazione (clienti e admin)
categories: Categorie prodotti calabresi
products: Prodotti tipici calabresi
carts/cart_items: Carrello acquisti
favorites: Prodotti preferiti degli utenti
orders/order_items: Ordini effettuati
support_tickets/support_messages: Sistema supporto clienti
discount_codes: Codici sconto
reviews: Recensioni prodotti

👤 Account Predefiniti
Amministratore

Email: admin@calabria-ecommerce.it
Password: password123

Cliente di Esempio

Email: cliente@example.com
Password: password

📱 Funzionalità Utente

Registrazione e login con verifica email
Navigazione catalogo prodotti per categorie
Ricerca prodotti con filtri avanzati
Aggiunta prodotti al carrello
Salvataggio prodotti nei preferiti
Completamento ordini con checkout
Visualizzazione storico ordini
Invio ticket di supporto

🔧 Funzionalità Admin

Gestione completa prodotti (CRUD)
Gestione categorie
Monitoraggio e aggiornamento stati ordini
Risposta a ticket supporto
Creazione e gestione codici sconto
Visualizzazione statistiche vendite
Gestione magazzino con notifiche stock basso

📦 Prodotti Inclusi (Esempi)

Olio d'oliva: Olio Extravergine d'Oliva Biologico Calabrese, Olio al Peperoncino
Formaggi: Pecorino Crotonese DOP, Caciocavallo Silano, Ricotta Affumicata
Salumi: 'Nduja di Spilinga, Soppressata Calabrese, Pancetta Arrotolata
Conserve: Pomodori Secchi sott'Olio, Peperoncini Ripieni al Tonno, Melanzane sott'Olio

🤝 Contribuire
Sei interessato a contribuire? Fantastico! Per favore segui questi passi:

Fai il fork del repository
Crea un branch per la tua feature (git checkout -b feature/nome-feature)
Esegui commit delle tue modifiche (git commit -m 'Aggiungi funzionalità X')
Pusha al branch (git push origin feature/nome-feature)
Apri una Pull Request

📝 Licenza
Questo progetto è rilasciato sotto licenza MIT.
