# Guida al Deploy in Produzione

Questa guida fornisce istruzioni dettagliate per il deploy dell'eCommerce Sapori di Calabria in un ambiente di produzione.

## Indice

1. [Requisiti Server](#requisiti-server)
2. [Deploy Backend Laravel](#deploy-backend-laravel)
3. [Deploy Frontend React](#deploy-frontend-react)
4. [Configurazione Server Web](#configurazione-server-web)
5. [Configurazione Database](#configurazione-database)
6. [Sicurezza](#sicurezza)
7. [Monitoraggio](#monitoraggio)

## Requisiti Server

Per un'installazione in produzione, si raccomandano le seguenti specifiche minime:

- **Sistema Operativo**: Ubuntu 20.04 LTS o superiore
- **CPU**: 2 core
- **RAM**: 4GB (minimo)
- **Spazio Disco**: 20GB (SSD raccomandato)
- **Software**: 
  - PHP 8.1 o superiore
  - MySQL 8.0 o superiore (o MariaDB 10.4+)
  - Nginx o Apache
  - Node.js 16 o superiore
  - Composer
  - Redis (opzionale, per caching e code)

## Deploy Backend Laravel

### 1. Preparazione Server

```bash
# Aggiornamento pacchetti
sudo apt update && sudo apt upgrade -y

# Installazione dipendenze
sudo apt install -y php8.1-cli php8.1-fpm php8.1-mysql php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-gd php8.1-bcmath

# Installazione Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Configurazione Directory

```bash
# Creazione directory di deploy
sudo mkdir -p /var/www/ecommerce-calabria
sudo chown -R $USER:$USER /var/www/ecommerce-calabria
```

### 3. Clone Repository

```bash
# Clone del repository
cd /var/www/ecommerce-calabria
git clone https://github.com/tuo-username/ecommerce-calabria-api.git api
cd api
```

### 4. Installazione Dipendenze

```bash
# Installazione dipendenze PHP (modalità produzione)
composer install --optimize-autoloader --no-dev
```

### 5. Configurazione Ambiente

```bash
# Copia file .env
cp .env.example .env

# Genera chiave applicazione
php artisan key:generate

# Modifica file .env con configurazioni di produzione
nano .env
```

Impostazioni .env produzione:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.saporidicalabria.it

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_calabria_prod
DB_USERNAME=dbnameuser
DB_PASSWORD=secure_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailserver.tuo-dominio.it
MAIL_PORT=587
MAIL_USERNAME=no-reply@saporidicalabria.it
MAIL_PASSWORD=secure_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@saporidicalabria.it
MAIL_FROM_NAME="Sapori di Calabria"

SANCTUM_STATEFUL_DOMAINS=saporidicalabria.it,www.saporidicalabria.it
SESSION_DOMAIN=.saporidicalabria.it
```

### 6. Configurazione Database

```bash
# Esecuzione migrazioni e seeder
php artisan migrate --seed --force
```

### 7. Ottimizzazione Laravel

```bash
# Ottimizzazioni per l'ambiente di produzione
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 8. Configurazione Storage

```bash
# Imposta permessi e symlink
php artisan storage:link
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## Deploy Frontend React

### 1. Preparazione

```bash
# Installazione Node.js (usando NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
```

### 2. Clone Repository

```bash
# Clone del repository frontend
cd /var/www/ecommerce-calabria
git clone https://github.com/tuo-username/ecommerce-calabria-react.git frontend
cd frontend
```

### 3. Installazione Dipendenze

```bash
# Installazione dipendenze
npm ci
```

### 4. Configurazione

Crea un file .env.production:

```
VITE_API_URL=https://api.saporidicalabria.it
```

### 5. Build Produzione

```bash
# Build ottimizzato per produzione
npm run build
```

### 6. Distribuzione File Statici

Con Nginx, i file statici verranno serviti direttamente dalla directory `/var/www/ecommerce-calabria/frontend/dist`.

## Configurazione Server Web

### Configurazione Nginx

Crea un file di configurazione per il backend:

```bash
sudo nano /etc/nginx/sites-available/api.saporidicalabria.it
```

Contenuto:

```nginx
server {
    listen 80;
    server_name api.saporidicalabria.it;
    root /var/www/ecommerce-calabria/api/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Crea un file di configurazione per il frontend:

```bash
sudo nano /etc/nginx/sites-available/saporidicalabria.it
```

Contenuto:

```nginx
server {
    listen 80;
    server_name saporidicalabria.it www.saporidicalabria.it;
    root /var/www/ecommerce-calabria/frontend/dist;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Attiva i siti:

```bash
sudo ln -s /etc/nginx/sites-available/api.saporidicalabria.it /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/saporidicalabria.it /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL con Let's Encrypt

```bash
# Installazione Certbot
sudo apt install -y certbot python3-certbot-nginx

# Ottenimento certificati
sudo certbot --nginx -d saporidicalabria.it -d www.saporidicalabria.it
sudo certbot --nginx -d api.saporidicalabria.it

# Configurazione rinnovo automatico
sudo systemctl status certbot.timer
```

## Sicurezza

### Configurazione Firewall

```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Hardening PHP

Modifica `/etc/php/8.1/fpm/php.ini`:

```ini
expose_php = Off
max_execution_time = 30
max_input_time = 60
memory_limit = 256M
post_max_size = 64M
upload_max_filesize = 32M
display_errors = Off
log_errors = On
```

### Protezione Directory

```bash
sudo find /var/www/ecommerce-calabria -type d -exec chmod 755 {} \;
sudo find /var/www/ecommerce-calabria -type f -exec chmod 644 {} \;
```

## Monitoraggio

### Configurazione Log Rotation

```bash
sudo nano /etc/logrotate.d/ecommerce-calabria
```

Contenuto:

```
/var/www/ecommerce-calabria/api/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
```

### Task Scheduler

Configurazione Crontab per comandi Laravel:

```bash
sudo crontab -e
```

Aggiungi:

```
* * * * * cd /var/www/ecommerce-calabria/api && php artisan schedule:run >> /dev/null 2>&1
```

## Manutenzione

### Script di Backup

```bash
sudo nano /usr/local/bin/backup-ecommerce.sh
```

Contenuto:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_DIR="/var/backups/ecommerce-calabria"
DB_USER="dbuser"
DB_PASS="dbpassword"
DB_NAME="ecommerce_calabria_prod"

# Crea directory backup
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db-$TIMESTAMP.sql.gz

# Backup codice
tar -czf $BACKUP_DIR/api-$TIMESTAMP.tar.gz -C /var/www/ecommerce-calabria/api .
tar -czf $BACKUP_DIR/frontend-$TIMESTAMP.tar.gz -C /var/www/ecommerce-calabria/frontend .

# Backup uploads
tar -czf $BACKUP_DIR/uploads-$TIMESTAMP.tar.gz -C /var/www/ecommerce-calabria/api/storage/app/public .

# Pulizia vecchi backup (mantieni ultimi 7 giorni)
find $BACKUP_DIR -name "*.gz" -type f -mtime +7 -delete
```

Rendi eseguibile e programma:

```bash
sudo chmod +x /usr/local/bin/backup-ecommerce.sh
sudo crontab -e
```

Aggiungi:

```
0 3 * * * /usr/local/bin/backup-ecommerce.sh
```

---

Questa guida fornisce le istruzioni base per il deploy in produzione dell'eCommerce Sapori di Calabria. Personalizza le configurazioni in base alle specifiche esigenze dell'ambiente di produzione. 
