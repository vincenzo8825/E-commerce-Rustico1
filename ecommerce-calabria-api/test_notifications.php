<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Notifications\SupportTicketCreated;
use App\Notifications\SupportTicketReply;
use App\Notifications\SupportTicketUserReply;

echo "🧪 TEST SISTEMA NOTIFICHE SUPPORTO\n";
echo "==================================\n\n";

try {
    // Trova/crea gli utenti di test
    $userTest = User::firstOrCreate(
        ['email' => 'prova@red.it'],
        [
            'name' => 'Mario',
            'surname' => 'Test',
            'email' => 'prova@red.it',
            'password' => bcrypt('password'),
            'is_admin' => false,
            'email_verified_at' => now()
        ]
    );

    $adminTest = User::firstOrCreate(
        ['email' => 'admin@example.it'],
        [
            'name' => 'Admin',
            'surname' => 'Test',
            'email' => 'admin@example.it',
            'password' => bcrypt('password'),
            'is_admin' => true,
            'email_verified_at' => now()
        ]
    );

    echo "✅ Utenti di test trovati/creati:\n";
    echo "   - User: {$userTest->name} {$userTest->surname} ({$userTest->email}) - ID: {$userTest->id}\n";
    echo "   - Admin: {$adminTest->name} {$adminTest->surname} ({$adminTest->email}) - ID: {$adminTest->id}\n\n";

    // Trova tutti gli admin per le notifiche
    $allAdmins = User::where('is_admin', true)->get();
    echo "📋 Admin totali nel sistema: " . $allAdmins->count() . "\n\n";

    // 1. Test: Utente crea un ticket
    echo "🎫 TEST 1: Utente crea un ticket di supporto\n";
    $ticket = SupportTicket::create([
        'user_id' => $userTest->id,
        'ticket_number' => 'TIC-' . date('Ymd') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
        'subject' => 'Test Notifiche - Problema con ordine',
        'description' => 'Questo è un ticket di test per verificare il sistema di notifiche.',
        'status' => 'open',
        'priority' => 'medium'
    ]);

    echo "   ✅ Ticket creato: #{$ticket->ticket_number}\n";

    // Invia notifica a tutti gli admin
    foreach ($allAdmins as $admin) {
        $admin->notify(new SupportTicketCreated($ticket));
        echo "   📧 Notifica inviata all'admin: {$admin->email}\n";
    }

    // 2. Test: Admin risponde al ticket
    echo "\n💬 TEST 2: Admin risponde al ticket\n";
    $adminMessage = SupportMessage::create([
        'support_ticket_id' => $ticket->id,
        'user_id' => $adminTest->id,
        'message' => 'Grazie per aver contattato il supporto. Stiamo esaminando il tuo caso.',
        'is_from_admin' => true
    ]);

    echo "   ✅ Messaggio admin creato\n";

    // Invia notifica all'utente
    $userTest->notify(new SupportTicketReply($ticket));
    echo "   📧 Notifica inviata all'utente: {$userTest->email}\n";

    // 3. Test: Utente risponde
    echo "\n🗨️ TEST 3: Utente risponde al ticket\n";
    $userMessage = SupportMessage::create([
        'support_ticket_id' => $ticket->id,
        'user_id' => $userTest->id,
        'message' => 'Grazie per la risposta rapida! Vorrei aggiungere più dettagli...',
        'is_from_admin' => false
    ]);

    echo "   ✅ Messaggio utente creato\n";

    // Invia notifica a tutti gli admin
    foreach ($allAdmins as $admin) {
        $admin->notify(new SupportTicketUserReply($ticket));
        echo "   📧 Notifica inviata all'admin: {$admin->email}\n";
    }

    echo "\n📊 RIEPILOGO TEST:\n";
    echo "==================\n";
    echo "✅ Ticket creato: #{$ticket->ticket_number}\n";
    echo "✅ Notifiche inviate agli admin: " . $allAdmins->count() . "\n";
    echo "✅ Admin ha risposto: {$adminTest->name}\n";
    echo "✅ Notifica inviata all'utente: {$userTest->email}\n";
    echo "✅ Utente ha risposto\n";
    echo "✅ Notifiche inviate agli admin: " . $allAdmins->count() . "\n\n";

    // Verifica notifiche nel database
    $userNotifications = $userTest->unreadNotifications()->count();
    $adminNotifications = $adminTest->unreadNotifications()->count();

    echo "📬 NOTIFICHE NEL DATABASE:\n";
    echo "==========================\n";
    echo "📨 Notifiche non lette utente ({$userTest->email}): {$userNotifications}\n";
    echo "📨 Notifiche non lette admin ({$adminTest->email}): {$adminNotifications}\n\n";

    // Lista delle notifiche dell'utente
    if ($userNotifications > 0) {
        echo "📋 Dettaglio notifiche utente:\n";
        foreach ($userTest->unreadNotifications as $notification) {
            $data = $notification->data;
            echo "   - " . ($data['new_message'] ?? $data['message'] ?? 'Nuova notifica') . "\n";
        }
        echo "\n";
    }

    // Lista delle notifiche dell'admin
    if ($adminNotifications > 0) {
        echo "📋 Dettaglio notifiche admin:\n";
        foreach ($adminTest->unreadNotifications as $notification) {
            $data = $notification->data;
            echo "   - " . ($data['message'] ?? 'Nuova notifica') . "\n";
        }
        echo "\n";
    }

    echo "🎉 TEST COMPLETATO CON SUCCESSO!\n";
    echo "\n🔗 Credenziali per il test manuale:\n";
    echo "====================================\n";
    echo "👤 Utente normale:\n";
    echo "   Email: prova@red.it\n";
    echo "   Password: password\n";
    echo "   URL: http://localhost:5173/login\n\n";
    echo "🔧 Admin:\n";
    echo "   Email: admin@example.it\n";
    echo "   Password: password\n";
    echo "   URL: http://localhost:5173/admin\n\n";

} catch (Exception $e) {
    echo "❌ ERRORE: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
