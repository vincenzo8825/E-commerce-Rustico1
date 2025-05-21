# Sapori di Calabria - API Backend

API backend per l'eCommerce di prodotti tipici calabresi "Sapori di Calabria", costruito con Laravel.

## 📚 Indice

- [Requisiti](#requisiti)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Struttura del Database](#struttura-del-database)
- [API Endpoints](#api-endpoints)
- [Autenticazione](#autenticazione)
- [Testing](#testing)
- [Deployment](#deployment)
- [Licenza](#licenza)

## 📋 Requisiti

- PHP >= 8.1
- Composer
- MySQL >= 8.0
- Node.js >= 16 (per il frontend)
- Server web (Apache/Nginx)

## 🚀 Installazione

1. Clona il repository
   ```bash
   git clone https://github.com/tuo-username/ecommerce-calabria-api.git
   cd ecommerce-calabria-api
   ```

2. Installa le dipendenze
   ```bash
   composer install
   ```

3. Copia il file di ambiente
   ```bash
   cp .env.example .env
   ```

4. Genera la chiave dell'applicazione
   ```bash
   php artisan key:generate
   ```

5. Configura il database in `.env`
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ecommerce_calabria
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. Esegui le migrazioni e i seeder
   ```bash
   php artisan migrate --seed
   ```

7. Installa e compila gli asset
   ```bash
   npm install && npm run build
   ```

8. Avvia il server di sviluppo
   ```bash
   php artisan serve
   ```

## ⚙️ Configurazione

### Email

Configura l'invio di email nel file `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@sapovidicalabria.it"
MAIL_FROM_NAME="${APP_NAME}"
```

### Sanctum (API Authentication)

Assicurati che la configurazione di Sanctum in `config/sanctum.php` sia corretta. Per lo sviluppo locale:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## 📊 Struttura del Database

Il database contiene le seguenti tabelle principali:

- **users**: Utenti del sistema (clienti e amministratori)
- **categories**: Categorie di prodotti
- **products**: Prodotti con dettagli e stock
- **orders**: Ordini effettuati dagli utenti
- **order_items**: Prodotti contenuti negli ordini
- **carts**: Carrelli utente
- **cart_items**: Prodotti nei carrelli
- **favorites**: Prodotti preferiti dagli utenti
- **support_tickets**: Ticket di supporto
- **support_messages**: Messaggi nei ticket di supporto
- **discount_codes**: Codici sconto utilizzabili
- **notifications**: Notifiche per utenti

## 🌐 API Endpoints

### Pubbliche

- `GET /api/products`: Elenco prodotti pubblici
- `GET /api/products/{slug}`: Dettagli singolo prodotto