<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\SupportTicket;
use Illuminate\Support\Str;

class SupportTicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prendiamo gli utenti non admin
        $users = User::where('is_admin', false)->get();

        // Prendiamo l'admin per le risposte
        $admin = User::where('is_admin', true)->first();

        if (!$admin) {
            // Se non esiste un admin, lo creiamo
            $adminId = DB::table('users')->insertGetId([
                'name' => 'Admin',
                'surname' => 'System',
                'email' => 'admin@saporidicalabriae.it',
                'password' => bcrypt('admin123'),
                'is_admin' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $admin = User::find($adminId);
        }

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
            $userIds = [$userId];
        } else {
            $userIds = $users->pluck('id')->toArray();
        }

        // Prendiamo alcuni ordini per collegarli ai ticket
        $orders = Order::all();

        // Stati validi per i ticket
        $statuses = ['open', 'in_progress', 'closed'];

        // Priorità possibili
        $priorities = ['high', 'medium', 'low'];

        // Oggetti comuni dei ticket
        $subjects = [
            'Problemi con ordine #%s',
            'Richiesta informazioni su prodotto',
            'Informazioni su spedizione',
            'Prodotto danneggiato',
            'Richiesta fattura',
            'Cambio indirizzo di spedizione',
            'Problema con il pagamento',
            'Richiesta rimborso',
            'Quando arriveranno i nuovi prodotti?',
            'Posso modificare il mio ordine?',
            'Assistenza con la procedura di reso',
            'Non ho ricevuto il codice sconto',
            'Dubbi sulla qualità del prodotto',
            'Come posso tracciare la mia spedizione?',
            'Suggerimenti per nuovi prodotti'
        ];

        // Generiamo ticket per gli ultimi 30 giorni
        $ticketsData = [];

        for ($day = 0; $day < 30; $day++) {
            $date = Carbon::now()->subDays($day);

            // Più ticket nei giorni recenti
            $numTickets = $day < 7 ? rand(0, 2) : ($day < 15 ? rand(0, 1) : (rand(0, 100) < 30 ? 1 : 0));

            for ($i = 0; $i < $numTickets; $i++) {
                // Selezioniamo un utente casuale
                $userId = $userIds[array_rand($userIds)];
                $user = User::find($userId);

                // Orario casuale per il ticket
                $ticketTime = $date->copy()->addHours(rand(8, 20))->addMinutes(rand(0, 59));

                // Selezioniamo un oggetto casuale
                $subjectIndex = array_rand($subjects);
                $subject = $subjects[$subjectIndex];

                // Colleghiamo alcuni ticket a ordini esistenti
                $orderId = null;
                if (!$orders->isEmpty() && rand(0, 100) < 70) {
                    $order = $orders->random();
                    $orderId = $order->id;
                    // Se l'oggetto ha un placeholder per il numero ordine, lo sostituiamo
                    if (strpos($subject, '#%s') !== false) {
                        $subject = sprintf($subject, $order->order_number);
                    }
                } else if (strpos($subject, '#%s') !== false) {
                    // Generiamo un numero ordine casuale se necessario
                    $subject = sprintf($subject, 'ORD-' . strtoupper(Str::random(8)));
                }

                // Stato con distribuzione realistica (più aperti e in elaborazione che chiusi)
                $status = $statuses[rand(0, 100) < 30 ? 2 : (rand(0, 100) < 50 ? 1 : 0)];

                // Priorità casuale con più media che alta o bassa
                $priority = $priorities[rand(0, 100) < 20 ? 0 : (rand(0, 100) < 70 ? 1 : 2)];

                // Aggiorniamo la data se il ticket è in elaborazione o chiuso
                $updatedAt = $ticketTime;
                if ($status !== 'open') {
                    $updatedAt = $ticketTime->copy()->addHours(rand(1, 24));
                }

                $ticketData = [
                    'user_id' => $userId,
                    'ticket_number' => 'TIC-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                    'subject' => $subject,
                    'status' => $status,
                    'priority' => $priority,
                    'created_at' => $ticketTime,
                    'updated_at' => $updatedAt,
                    'order_id' => $orderId,
                    'messages' => []
                ];

                // Aggiungiamo i messaggi iniziali
                $initialMessage = [
                    'user_id' => $userId,
                    'message' => $this->getInitialMessage($subject),
                    'is_from_admin' => false,
                    'created_at' => $ticketTime,
                    'updated_at' => $ticketTime
                ];

                $ticketData['messages'][] = $initialMessage;

                // Se il ticket non è aperto, aggiungiamo risposte dell'admin
                if ($status !== 'open') {
                    $responseTime = $ticketTime->copy()->addHours(rand(1, 8));

                    $adminResponse = [
                        'user_id' => $admin->id,
                        'message' => $this->getAdminResponse($subject, $status),
                        'is_from_admin' => true,
                        'created_at' => $responseTime,
                        'updated_at' => $responseTime
                    ];

                    $ticketData['messages'][] = $adminResponse;

                    // Se c'è stata risposta dell'admin, a volte l'utente risponde nuovamente
                    if ($status === 'in_progress' && rand(0, 100) < 60) {
                        $userReplyTime = $responseTime->copy()->addHours(rand(1, 6));

                        $userReply = [
                            'user_id' => $userId,
                            'message' => $this->getUserReply($subject),
                            'is_from_admin' => false,
                            'created_at' => $userReplyTime,
                            'updated_at' => $userReplyTime
                        ];

                        $ticketData['messages'][] = $userReply;
                    }

                    // Se il ticket è chiuso, aggiungiamo un messaggio finale dell'admin
                    if ($status === 'closed') {
                        $finalResponseTime = $responseTime->copy()->addHours(rand(2, 12));

                        $finalResponse = [
                            'user_id' => $admin->id,
                            'message' => $this->getClosingMessage(),
                            'is_from_admin' => true,
                            'created_at' => $finalResponseTime,
                            'updated_at' => $finalResponseTime
                        ];

                        $ticketData['messages'][] = $finalResponse;
                    }
                }

                $ticketsData[] = $ticketData;
            }
        }

        // Inserisci i ticket nel database
        foreach ($ticketsData as $ticketData) {
            $messages = $ticketData['messages'];
            unset($ticketData['messages']);

            // Verifichiamo se esiste già un modello SupportTicket
            if (class_exists(SupportTicket::class)) {
                $ticket = SupportTicket::create($ticketData);

                // Aggiungiamo tutti i messaggi
                foreach ($messages as $messageData) {
                    DB::table('support_messages')->insert([
                        'support_ticket_id' => $ticket->id,
                        'user_id' => $messageData['user_id'],
                        'message' => $messageData['message'],
                        'is_from_admin' => $messageData['is_from_admin'],
                        'created_at' => $messageData['created_at'],
                        'updated_at' => $messageData['updated_at'],
                    ]);
                }
            } else {
                // Altrimenti inseriamo direttamente nella tabella
                $ticketId = DB::table('support_tickets')->insertGetId($ticketData);

                // Aggiungiamo tutti i messaggi
                foreach ($messages as $messageData) {
                    DB::table('support_messages')->insert([
                        'support_ticket_id' => $ticketId,
                        'user_id' => $messageData['user_id'],
                        'message' => $messageData['message'],
                        'is_from_admin' => $messageData['is_from_admin'],
                        'created_at' => $messageData['created_at'],
                        'updated_at' => $messageData['updated_at'],
                    ]);
                }
            }
        }

        $this->command->info('Ticket di supporto inseriti con successo: ' . count($ticketsData));
    }

    /**
     * Genera un messaggio iniziale in base all'oggetto del ticket
     */
    private function getInitialMessage($subject)
    {
        if (strpos($subject, 'Problemi con ordine') !== false) {
            return 'Buongiorno, ho effettuato un ordine ma non ho ricevuto la conferma via email. Potete verificare lo stato? Grazie.';
        } elseif (strpos($subject, 'informazioni su prodotto') !== false) {
            return 'Salve, vorrei sapere se il prodotto "Nduja di Spilinga" contiene conservanti o additivi. Grazie.';
        } elseif (strpos($subject, 'spedizione') !== false) {
            return 'Buongiorno, volevo sapere quali sono i tempi di spedizione per la Calabria. Grazie.';
        } elseif (strpos($subject, 'danneggiato') !== false) {
            return 'Ho ricevuto il prodotto danneggiato durante il trasporto. Il barattolo di Nduja si è rotto. Vorrei procedere con un reso. Come posso fare?';
        } elseif (strpos($subject, 'fattura') !== false) {
            return 'Avrei bisogno della fattura per il mio acquisto per la mia contabilità. Potreste inviarmela via email?';
        } elseif (strpos($subject, 'indirizzo') !== false) {
            return 'Ho appena effettuato un ordine ma ho inserito l\'indirizzo sbagliato. Posso modificarlo? Il numero civico corretto è 14, non 12.';
        } elseif (strpos($subject, 'pagamento') !== false) {
            return 'Ho provato ad effettuare il pagamento con carta di credito ma la transazione è stata rifiutata. C\'è un problema con il vostro sistema?';
        } elseif (strpos($subject, 'rimborso') !== false) {
            return 'Salve, ho restituito un prodotto la settimana scorsa ma non ho ancora ricevuto il rimborso. Potete controllare? Grazie.';
        } elseif (strpos($subject, 'nuovi prodotti') !== false) {
            return 'Buongiorno, volevo sapere quando saranno disponibili i nuovi prodotti della linea "Sapori del Pollino" di cui avete parlato sui social.';
        } elseif (strpos($subject, 'modificare il mio ordine') !== false) {
            return 'Ho appena fatto un ordine ma vorrei aggiungere un altro prodotto. È possibile modificarlo o devo fare un nuovo ordine?';
        } elseif (strpos($subject, 'reso') !== false) {
            return 'Vorrei restituire un prodotto che ho acquistato. Come funziona la procedura di reso? Devo pagare le spese di spedizione?';
        } elseif (strpos($subject, 'codice sconto') !== false) {
            return 'Mi sono iscritto alla newsletter ma non ho mai ricevuto il codice sconto del 10% promesso. Potete aiutarmi?';
        } elseif (strpos($subject, 'qualità') !== false) {
            return 'Ho dubbi sulla qualità del formaggio che ho ricevuto. La confezione riporta una data di scadenza molto vicina. È normale?';
        } elseif (strpos($subject, 'tracciare') !== false) {
            return 'Ho effettuato un ordine 3 giorni fa ma non ho ricevuto informazioni sulla spedizione. Come posso tracciare il mio pacco?';
        } elseif (strpos($subject, 'Suggerimenti') !== false) {
            return 'Sono un vostro cliente abituale e vorrei suggerirvi di aggiungere al catalogo i lupini di Diamante. Sono difficili da trovare online.';
        } else {
            return 'Buongiorno, avrei bisogno di assistenza riguardo questo argomento. Grazie per l\'attenzione.';
        }
    }

    /**
     * Genera una risposta dell'admin in base al soggetto e allo stato
     */
    private function getAdminResponse($subject, $status)
    {
        if (strpos($subject, 'Problemi con ordine') !== false) {
            return 'Gentile cliente, abbiamo verificato il suo ordine e risulta correttamente registrato nel nostro sistema. Le abbiamo inviato nuovamente la mail di conferma. Mi faccia sapere se l\'ha ricevuta. Cordiali saluti.';
        } elseif (strpos($subject, 'informazioni su prodotto') !== false) {
            return 'Buongiorno, la nostra Nduja di Spilinga è un prodotto artigianale che non contiene conservanti né additivi. Gli unici ingredienti sono carne di maiale, peperoncino piccante calabrese, sale e spezie naturali. Restiamo a disposizione per ulteriori informazioni.';
        } elseif (strpos($subject, 'spedizione') !== false) {
            return 'Gentile cliente, per la Calabria i tempi di consegna sono generalmente di 1-2 giorni lavorativi. Appena l\'ordine viene spedito, riceverà una email con il codice di tracciamento. Grazie per averci contattato.';
        } elseif (strpos($subject, 'danneggiato') !== false) {
            return 'Ci dispiace molto per l\'inconveniente. Per procedere con il reso, la preghiamo di scattare una foto del prodotto danneggiato e inviarla a questo indirizzo email. Provvederemo immediatamente a spedirle un nuovo prodotto senza costi aggiuntivi.';
        } elseif (strpos($subject, 'fattura') !== false) {
            return 'Certamente! Abbiamo preparato la fattura richiesta e l\'abbiamo appena inviata al suo indirizzo email. La preghiamo di controllare anche nella cartella spam. Restiamo a disposizione per qualsiasi altra necessità.';
        } else {
            if ($status === 'in_progress') {
                return 'Gentile cliente, abbiamo preso in carico la sua richiesta e stiamo verificando la situazione. Le risponderemo al più presto con maggiori dettagli. Grazie per la pazienza.';
            } else {
                return 'Buongiorno, grazie per averci contattato. Abbiamo verificato la sua richiesta e possiamo confermarle che tutto è stato risolto. Se ha bisogno di ulteriore assistenza, non esiti a contattarci nuovamente. Cordiali saluti.';
            }
        }
    }

    /**
     * Genera una risposta dell'utente
     */
    private function getUserReply($subject)
    {
        $replies = [
            'Grazie per la risposta tempestiva! Attendo aggiornamenti.',
            'Ho controllato la mail ma non ho trovato nulla. Potete ricontrollare?',
            'Perfetto, grazie mille per l\'assistenza!',
            'Ho ancora un dubbio: quanto tempo ho per effettuare il reso?',
            'Ho appena ricevuto l\'email, grazie mille!',
            'Capisco, attendo vostre notizie allora.',
            'Grazie per la spiegazione dettagliata.',
            'Ho appena inviato le foto richieste via email.',
            'Mi confermate che non ci saranno costi aggiuntivi?',
            'Ottimo, sono soddisfatto della soluzione proposta.'
        ];

        return $replies[array_rand($replies)];
    }

    /**
     * Genera un messaggio di chiusura per i ticket risolti
     */
    private function getClosingMessage()
    {
        $closingMessages = [
            'Siamo lieti di aver risolto il suo problema. Il ticket viene ora chiuso. Se ha bisogno di ulteriore assistenza, non esiti ad aprire un nuovo ticket. Cordiali saluti, il team di Sapori di Calabria.',
            'Confermiamo che la sua richiesta è stata completamente soddisfatta. Se il problema dovesse ripresentarsi, ci contatti nuovamente. Grazie per la fiducia accordataci.',
            'Poiché il problema risulta risolto, procediamo con la chiusura del ticket. Le ricordiamo che il nostro servizio clienti è sempre a sua disposizione per qualsiasi necessità futura.',
            'Grazie per averci confermato che tutto è risolto. Chiudiamo questo ticket e le auguriamo buona giornata. A presto!',
            'Siamo felici di aver potuto aiutarla. Ticket chiuso con successo. Apprezziamo molto la sua preferenza per i nostri prodotti!'
        ];

        return $closingMessages[array_rand($closingMessages)];
    }
}
