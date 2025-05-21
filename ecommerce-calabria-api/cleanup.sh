#!/bin/bash

# Script per la pulizia del codice e la verifica degli standard

echo "🧹 Avvio pulizia del codice..."

# Ottimizza l'autoload
echo "Ottimizzazione Composer Autoload..."
composer dump-autoload --optimize

# Rimozione della cache di Laravel
echo "Pulizia cache Laravel..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Pulizia della cache opcode (se disponibile)
if command -v opcache_reset &> /dev/null; then
    echo "Pulizia cache OPcache..."
    php -r 'opcache_reset();'
fi

# Lint del codice PHP
echo "Verifica sintassi PHP..."
find app routes tests -name "*.php" -type f -print0 | xargs -0 -n1 php -l

# Formattazione del codice (richiede Laravel Pint)
if [ -f vendor/bin/pint ]; then
    echo "Formattazione codice con Laravel Pint..."
    vendor/bin/pint
else
    echo "Laravel Pint non è installato. Salto la formattazione."
    echo "Per installarlo eseguire: composer require laravel/pint --dev"
fi

# Controlla i problemi di sicurezza
if [ -f vendor/bin/security-checker ]; then
    echo "Controllo vulnerabilità di sicurezza..."
    vendor/bin/security-checker security:check composer.lock
else
    echo "Security Checker non è installato. Salto il controllo di sicurezza."
    echo "Per installarlo eseguire: composer require enlightn/security-checker --dev"
fi

# Controlla lo stato Artisan
echo "Verifica servizi Artisan..."
php artisan --version
php artisan status

echo "✅ Pulizia completata!"
