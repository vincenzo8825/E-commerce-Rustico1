# Sistema di Notifiche per Ticket di Supporto

## Panoramica

Questo documento descrive l'implementazione completa del sistema di notifiche per i ticket di supporto nel progetto Sapori di Calabria.

## Funzionalità Implementate

### 1. Creazione Ticket di Supporto
- ✅ **Pagina di creazione**: `/dashboard/support/new`
- ✅ **Campi del form**: Oggetto, Descrizione, Priorità
- ✅ **Validazione**: Lato client e server
- ✅ **Redirect**: Ritorno alla lista ticket con messaggio di successo
- ✅ **Notifica admin**: Gli admin ricevono notifica quando viene creato un nuovo ticket

### 2. Gestione delle Notifiche

#### Backend (Laravel)
- ✅ **SupportTicketCreated**: Notifica inviata agli admin quando l'utente crea un ticket
- ✅ **SupportTicketReply**: Notifica inviata all'utente quando l'admin risponde
- ✅ **SupportTicketUserReply**: Notifica inviata agli admin quando l'utente risponde

#### Frontend (React)
- ✅ **NotificationCenter**: Componente campanella presente in navbar utente e admin
- ✅ **Aggiornamento automatico**: Le notifiche si aggiornano ogni 30 secondi
- ✅ **Badge contatore**: Mostra il numero di notifiche non lette
- ✅ **Gestione stato**: Segna come lette/non lette

### 3. Dashboard Utente
- ✅ **Lista ticket**: Visualizza tutti i ticket dell'utente
- ✅ **Conversazioni**: Espansione per vedere messaggi e rispondere
- ✅ **Stati ticket**: open, in_progress, closed
- ✅ **Alert di successo**: Quando si crea un ticket
- ✅ **Notifiche**: Campanella nella navbar

### 4. Dashboard Admin
- ✅ **Lista ticket**: Visualizza tutti i ticket con filtri
- ✅ **Risposta ai ticket**: Gli admin possono rispondere
- ✅ **Gestione stati**: Aggiornamento stato ticket
- ✅ **Notifiche**: Campanella nell'header admin

## Architettura del Sistema

### Flusso delle Notifiche

1. **Utente crea ticket**
   ```
   Utente → CreateTicket → API → SupportTicketCreated → Admin
   ```

2. **Admin risponde al ticket**
   ```
   Admin → TicketDetail → API → SupportTicketReply → Utente
   ```

3. **Utente risponde al ticket**
   ```
   Utente → SupportTickets → API → SupportTicketUserReply → Admin
   ```

### Componenti Coinvolti

#### Backend (Laravel)
- `UserDashboardController::createSupportTicket()`
- `UserDashboardController::addMessageToTicket()`
- `AdminDashboardController::addMessageToTicket()`
- `NotificationController::index()`
- Notifiche: `SupportTicketCreated`, `SupportTicketReply`, `SupportTicketUserReply`

#### Frontend (React)
- `CreateTicket.jsx` - Form creazione ticket
- `SupportTickets.jsx` - Lista e gestione ticket utente
- `NotificationCenter.jsx` - Sistema notifiche
- `Dashboard.jsx` (Admin) - Include notifiche admin

### Stati dei Ticket
- `open`: Ticket appena creato o riaperto
- `in_progress`: Ticket in lavorazione
- `closed`: Ticket chiuso

### Endpoint API Utilizzati
- `POST /user/support-tickets` - Crea nuovo ticket
- `POST /user/support-tickets/{id}/messages` - Utente aggiunge messaggio
- `POST /admin/dashboard/support-tickets/{id}/messages` - Admin risponde
- `GET /notifications` - Ottiene notifiche utente
- `POST /notifications/{id}/read` - Segna notifica come letta

## Caratteristiche Tecniche

### Sicurezza
- ✅ Autenticazione richiesta per tutti gli endpoint
- ✅ Autorizzazione: solo admin possono vedere tutti i ticket
- ✅ Gli utenti vedono solo i propri ticket
- ✅ Validazione input lato server

### Performance
- ✅ Aggiornamento notifiche ogni 30 secondi (configurabile)
- ✅ Caricamento notifiche solo quando necessario
- ✅ Notifiche inviate tramite queue (background)

### UX/UI
- ✅ Alert di successo con auto-dismiss
- ✅ Animazioni CSS per gli alert
- ✅ Icone emoji per migliore UX
- ✅ Design responsivo
- ✅ Stati di caricamento

## File Modificati/Creati

### Backend
- `app/Notifications/SupportTicketCreated.php` (nuovo)
- `app/Notifications/SupportTicketUserReply.php` (nuovo)
- `app/Http/Controllers/API/UserDashboardController.php` (modificato)
- `app/Http/Controllers/API/AdminDashboardController.php` (modificato)

### Frontend
- `src/pages/User/CreateTicket.jsx` (modificato)
- `src/pages/User/SupportTickets.jsx` (modificato)
- `src/pages/User/Dashboard.scss` (modificato - aggiunti stili alert)
- `src/pages/Admin/Dashboard.jsx` (modificato - aggiunto NotificationCenter)
- `src/pages/Admin/Admin.scss` (modificato - stili notifiche admin)
- `src/components/Notifications/NotificationCenter.jsx` (modificato)

## Configurazione

### Variabili di Ambiente
Assicurarsi che siano configurate le code per le notifiche:
```
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
# ... altre configurazioni email
```

### Database
Le tabelle necessarie sono già presenti:
- `support_tickets`
- `support_messages` 
- `notifications`

## Test e Verifica

### Scenario di Test Completo

1. **Utente crea ticket**
   - Login come utente normale
   - Vai a `/dashboard/support`
   - Clicca "Nuovo Ticket"
   - Compila form e invia
   - Verifica messaggio di successo
   - Verifica che gli admin ricevano notifica

2. **Admin risponde**
   - Login come admin
   - Controlla notifiche (campanella)
   - Vai alla lista ticket admin
   - Apri ticket e rispondi
   - Verifica che utente riceva notifica

3. **Utente risponde di nuovo**
   - Login come utente
   - Controlla notifiche
   - Vai ai propri ticket
   - Espandi ticket e rispondi
   - Verifica che admin riceva notifica

## Possibili Estensioni Future

- ✏️ Notifiche browser push
- ✏️ Notifiche via SMS/WhatsApp
- ✏️ Sistema di priorità automatico
- ✏️ Template di risposta rapida per admin
- ✏️ Statistiche e analytics sui ticket
- ✏️ Sistema di rating del supporto

---

**Stato**: ✅ Implementazione Completa
**Data**: Dicembre 2024
**Versione**: 1.0 