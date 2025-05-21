<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\SupportTicket;
use Illuminate\Support\Str;

class SupportTicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prendiamo alcuni utenti per associarli ai ticket
        $users = User::all();

        if ($users->isEmpty()) {
            // Assicuriamoci di avere almeno un utente oltre all'admin
            $userId = DB::table('users')->insertGetId([
                'name' => 'Giovanna',
                'surname' => 'Ferrari',
                'email' => 'cliente@esempio.it',
                'password' => bcrypt('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            // Prendiamo l'ID del primo utente non admin
            $userId = $users->where('is_admin', false)->first()->id ?? $users->first()->id;
        }

        // Dati ticket di supporto presi dal mockup del frontend
        $tickets = [
            [
                'user_id' => $userId,
                'ticket_number' => 'TIC-' . Str::random(8),
                'subject' => 'Problema con l\'ordine #985',
                'status' => 'open', // Stato valido secondo la migrazione
                'priority' => 'high', // Priorità valida secondo la migrazione
                'created_at' => Carbon::parse('2023-05-09T11:00:00'),
                'updated_at' => Carbon::parse('2023-05-09T11:00:00'),
                'order_id' => null, // Se necessario, colleghiamo a un ordine esistente
            ],
            [
                'user_id' => $userId,
                'ticket_number' => 'TIC-' . Str::random(8),
                'subject' => 'Informazioni su spedizione',
                'status' => 'open', // Stato valido secondo la migrazione
                'priority' => 'medium', // Priorità valida secondo la migrazione
                'created_at' => Carbon::parse('2023-05-08T16:45:00'),
                'updated_at' => Carbon::parse('2023-05-08T16:45:00'),
                'order_id' => null,
            ],
            // Aggiungiamo altri ticket per avere più dati
            [
                'user_id' => $userId,
                'ticket_number' => 'TIC-' . Str::random(8),
                'subject' => 'Prodotto danneggiato',
                'status' => 'in_progress', // Stato valido secondo la migrazione
                'priority' => 'high', // Priorità valida secondo la migrazione
                'created_at' => Carbon::parse('2023-05-07T09:30:00'),
                'updated_at' => Carbon::parse('2023-05-07T09:30:00'),
                'order_id' => null,
            ],
            [
                'user_id' => $userId,
                'ticket_number' => 'TIC-' . Str::random(8),
                'subject' => 'Richiesta fattura',
                'status' => 'open', // Stato valido secondo la migrazione
                'priority' => 'low', // Priorità valida secondo la migrazione
                'created_at' => Carbon::parse('2023-05-06T14:20:00'),
                'updated_at' => Carbon::parse('2023-05-06T14:20:00'),
                'order_id' => null,
            ],
        ];

        // Inserisci i ticket nel database
        foreach ($tickets as $ticketData) {
            // Verifichiamo se esiste già un modello SupportTicket
            if (class_exists(SupportTicket::class)) {
                $ticket = SupportTicket::create($ticketData);

                // Aggiungiamo anche il primo messaggio al ticket
                DB::table('support_messages')->insert([
                    'support_ticket_id' => $ticket->id,
                    'user_id' => $ticket->user_id,
                    'message' => $this->getInitialMessage($ticket->subject),
                    'is_from_admin' => false,
                    'created_at' => $ticket->created_at,
                    'updated_at' => $ticket->updated_at,
                ]);
            } else {
                // Altrimenti inseriamo direttamente nella tabella
                DB::table('support_tickets')->insert($ticketData);
            }
        }

        $this->command->info('Ticket di supporto inseriti con successo: ' . count($tickets));
    }

    /**
     * Genera un messaggio iniziale in base all'oggetto del ticket
     */
    private function getInitialMessage($subject)
    {
        if (strpos($subject, 'ordine') !== false) {
            return 'Buongiorno, ho effettuato un ordine ma non ho ricevuto la conferma via email. Potete verificare lo stato? Grazie.';
        } elseif (strpos($subject, 'spedizione') !== false) {
            return 'Salve, vorrei sapere quali sono i tempi di spedizione per la Calabria. Grazie.';
        } elseif (strpos($subject, 'danneggiato') !== false) {
            return 'Ho ricevuto il prodotto danneggiato durante il trasporto. Vorrei procedere con un reso. Come posso fare?';
        } elseif (strpos($subject, 'fattura') !== false) {
            return 'Avrei bisogno della fattura per il mio acquisto per la mia contabilità. Potreste inviarmela via email?';
        } else {
            return 'Buongiorno, avrei bisogno di assistenza riguardo questo argomento. Grazie per l\'attenzione.';
        }
    }
}
