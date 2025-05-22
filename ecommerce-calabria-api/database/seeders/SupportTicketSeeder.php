<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Illuminate\Support\Str;
use App\Models\Product;

class SupportTicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Recupera utenti e admin
        $users = User::where('is_admin', false)->get();
        $admin = User::where('is_admin', true)->first();

        if ($users->isEmpty()) {
            $this->command->error('Non ci sono utenti nel database. Impossibile creare ticket di supporto.');
            return;
        }

        if (!$admin) {
            $this->command->warn('Nessun admin trovato. I messaggi di risposta verranno attribuiti all\'utente stesso.');
        }

        // Recupera ordini e prodotti per collegarli ai ticket
        $orders = Order::all();
        $products = Product::all();

        // Stati possibili per i ticket (utilizziamo i valori nella migrazione)
        $ticketStatuses = ['open', 'in_progress', 'closed'];

        // Priorità per i ticket (utilizziamo i valori nella migrazione)
        $ticketPriorities = ['low', 'medium', 'high'];

        // Ticket realistici riguardanti prodotti calabresi
        $realisticTickets = [
            [
                'subject' => 'Informazioni sulla conservazione della Nduja',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Buongiorno, ho acquistato la Nduja di Spilinga la scorsa settimana (ordine #ORD-2023-123) e volevo sapere come conservarla correttamente una volta aperta. Inoltre, quanto tempo può durare in frigorifero? Grazie mille per l\'aiuto!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Buongiorno, grazie per la sua richiesta. La Nduja di Spilinga, una volta aperta, dovrebbe essere conservata in frigorifero, preferibilmente in un contenitore ermetico o avvolta in pellicola alimentare. In queste condizioni, può essere conservata fino a 3-4 settimane. Le consigliamo di consumarla entro questo periodo per apprezzarne al meglio il gusto e la freschezza. Se ha altre domande, rimango a disposizione!'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Perfetto, grazie mille per le informazioni dettagliate! Proverò anche a spalmarla sulla bruschetta come suggerito nella descrizione del prodotto.'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Ottima idea! La Nduja sulla bruschetta è una delle preparazioni più tradizionali e apprezzate. Per un risultato ancora migliore, le suggerisco di scaldare leggermente il pane, in modo che il calore aiuti la Nduja a sprigionare tutto il suo aroma piccante. Buona degustazione!'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'medium'
            ],
            [
                'subject' => 'Problema con la spedizione del Caciocavallo',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Salve, ho effettuato un ordine tre giorni fa (numero ORD-2023-456) che includeva un Caciocavallo Silano DOP, ma quando ho aperto il pacco ho notato che il formaggio ha una consistenza strana e sembra aver sofferto il caldo durante il trasporto. La confezione è integra ma il prodotto non sembra essere in condizioni ottimali. Come posso procedere per un eventuale reso?'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Gentile cliente, mi dispiace molto per l\'inconveniente. La qualità dei nostri prodotti è la nostra priorità. Potrebbe cortesemente inviarci alcune foto del Caciocavallo ricevuto? Questo ci aiuterà a valutare la situazione e a procedere immediatamente con la sostituzione del prodotto, senza costi aggiuntivi per lei. Nel frattempo, le consiglio di conservare il formaggio in frigorifero.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Ho appena inviato le foto via email all\'indirizzo supporto@calabria.it. Attendo vostre indicazioni per il reso.'
                    ]
                ],
                'status' => 'in_progress',
                'priority' => 'high'
            ],
            [
                'subject' => 'Richiesta informazioni sui Mostaccioli',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Buongiorno, vorrei sapere se i Mostaccioli Calabresi contengono frutta secca, in particolare noci o mandorle. Mia figlia è allergica e volevo essere sicura prima di effettuare l\'acquisto. Grazie in anticipo!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Buongiorno, grazie per la sua richiesta. I nostri Mostaccioli Calabresi tradizionali contengono mandorle tritate nella ricetta. Tuttavia, abbiamo anche una variante senza frutta secca, specificatamente pensata per chi ha allergie. Se desidera, può ordinare la versione "Mostaccioli Calabresi - Variante Senza Frutta Secca" che troverà nella sezione dolci del nostro catalogo. Per qualsiasi altra informazione sugli allergeni, non esiti a contattarci.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Grazie mille per la risposta dettagliata! Non avevo notato la variante senza frutta secca. Procederò con l\'acquisto di quella versione. Apprezzo molto l\'attenzione verso chi ha allergie alimentari.'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Siamo felici di poterle offrire un\'alternativa adatta alle esigenze di sua figlia. La sua soddisfazione è importante per noi. Se avrà bisogno di altre informazioni sugli ingredienti o gli allergeni di qualsiasi nostro prodotto, non esiti a contattarci. Le auguriamo una buona degustazione!'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'medium'
            ],
            [
                'subject' => 'Errore nell\'ordine della Soppressata',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Buonasera, ho effettuato un ordine ieri (numero ORD-2023-789) ma mi sono accorto di aver sbagliato la quantità della Soppressata Calabrese. Ho ordinato una confezione ma vorrei modificare l\'ordine per riceverne tre. È possibile modificare l\'ordine se non è ancora stato spedito? Grazie!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Buonasera, ho verificato il suo ordine e fortunatamente non è ancora stato processato per la spedizione. Posso modificare la quantità della Soppressata da 1 a 3 confezioni. Il nuovo totale dell\'ordine sarà di €46.50. Le va bene procedere con questa modifica?'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Sì, perfetto! Proceda pure con la modifica, grazie mille per la disponibilità e la rapidità nella risposta.'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Ho aggiornato il suo ordine con la nuova quantità. Riceverà a breve un\'email con la conferma della modifica e il riepilogo aggiornato. Il suo ordine verrà spedito entro domani. Grazie per aver scelto i nostri prodotti!'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'high'
            ],
            [
                'subject' => 'Informazioni sulla produzione dell\'olio extravergine d\'oliva',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Salve, sono molto interessato all\'Olio Extra Vergine di Oliva Biologico che vendete. Vorrei sapere maggiori dettagli sul processo di produzione, la varietà di olive utilizzate e il periodo di raccolta. Inoltre, sarebbe possibile visitare il frantoio durante un mio viaggio in Calabria il prossimo mese? Grazie!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Gentile cliente, il nostro Olio Extra Vergine d\'Oliva Biologico è prodotto utilizzando principalmente olive della varietà Carolea, tipica della Calabria. La raccolta avviene tra ottobre e novembre, quando le olive raggiungono il giusto grado di maturazione. Il metodo di estrazione è a freddo, con temperature che non superano mai i 27°C, per preservare tutte le proprietà organolettiche e i polifenoli. Riguardo alla visita, certamente! I nostri frantoi partner sono aperti ai visitatori durante il periodo di produzione. Le suggerirei di contattarci una settimana prima del suo arrivo in Calabria per organizzare la visita. Saremo lieti di mostrarle l\'intero processo di produzione.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Grazie mille per le informazioni dettagliate! Mi fa piacere sapere che si tratta di olive Carolea, ho letto che sono particolarmente adatte per produrre oli di alta qualità. Vi contatterò sicuramente prima del mio viaggio per organizzare la visita. Nel frattempo, procederò con l\'acquisto di una bottiglia per assaggiarlo!'
                    ]
                ],
                'status' => 'in_progress',
                'priority' => 'low'
            ],
            [
                'subject' => 'Problema con il codice sconto ESTATE2023',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Buongiorno, sto cercando di utilizzare il codice sconto ESTATE2023 che ho ricevuto via email, ma il sistema dice che non è valido. Ho verificato di averlo scritto correttamente e dovrebbe essere ancora attivo secondo la vostra promozione. Potete aiutarmi?'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Buongiorno, mi scuso per l\'inconveniente. Ho verificato e il codice ESTATE2023 è effettivamente attivo nel nostro sistema. Il problema potrebbe essere legato al fatto che questo codice è valido solo per ordini superiori a €50. Il totale del suo carrello attuale raggiunge questa soglia? Inoltre, il codice non è cumulabile con altre promozioni attive. Se il problema persiste, posso generare un codice sconto personale per lei.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Ah, ecco il problema! Il mio carrello è di €48.90, quindi leggermente sotto la soglia. Aggiungerò un altro prodotto per superare i €50 e riprovare. Grazie per la spiegazione!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Perfetto! Sono felice di aver chiarito la situazione. Se dovesse incontrare altri problemi con il codice dopo aver superato la soglia dei €50, non esiti a contattarci nuovamente. Buon acquisto!'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'medium'
            ],
            [
                'subject' => 'Richiesta ricette tradizionali con la Cipolla Rossa di Tropea',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Buongiorno, ho recentemente acquistato la Cipolla Rossa di Tropea in Agrodolce e sono rimasto molto soddisfatto del prodotto. Vorrei sapere se avete delle ricette tradizionali calabresi che utilizzano questo ingrediente, oltre alle idee già presenti nella scheda prodotto. Grazie in anticipo!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Buongiorno e grazie per il suo interesse nelle nostre tradizioni culinarie! La Cipolla Rossa di Tropea è un ingrediente molto versatile nella cucina calabrese. Oltre agli utilizzi suggeriti nella scheda prodotto, le consigliamo queste ricette tradizionali:\n\n1. "Frittata di Cipolle di Tropea" - Un classico semplice ma delizioso.\n2. "Insalata di Arance e Cipolle" - Un contorno fresco tipico del periodo invernale.\n3. "Pasta con Cipolle di Tropea e \'Nduja" - Un primo piatto dal sapore intenso.\n4. "Baccalà con Cipolle di Tropea" - Un secondo piatto tradizionale della costa calabrese.\n\nSe desidera, possiamo inviarle le ricette dettagliate via email. Inoltre, stiamo per pubblicare un e-book gratuito con ricette tradizionali calabresi che includerà altre preparazioni con la Cipolla di Tropea.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Grazie mille per questi suggerimenti! Mi interesserebbe molto ricevere le ricette dettagliate, specialmente quella della pasta con Cipolla e \'Nduja che sembra deliziosa. La mia email è la stessa dell\'account. Sarei anche interessato all\'e-book quando sarà disponibile!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Ottimo! Ho appena inviato le ricette alla sua email. L\'e-book sarà disponibile tra circa due settimane e tutti i nostri clienti registrati riceveranno una notifica. Includere ingredienti regionali come la Cipolla di Tropea e la \'Nduja nelle ricette quotidiane è un ottimo modo per apprezzare i sapori autentici della Calabria. Se ha altre domande o desidera ulteriori suggerimenti culinari, non esiti a contattarci!'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'low'
            ],
            [
                'subject' => 'Informazioni sul Liquore al Bergamotto',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Salve, sto valutando l\'acquisto del Liquore al Bergamotto, ma vorrei prima alcune informazioni: qual è la gradazione alcolica esatta? Inoltre, è possibile conoscere la lista completa degli ingredienti? Grazie!'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Gentile cliente, il nostro Liquore al Bergamotto ha una gradazione alcolica del 30% vol. Gli ingredienti sono: alcool, zucchero, infuso di bucce di bergamotto calabrese (provenienti esclusivamente dalla zona di Reggio Calabria), acqua. Non contiene coloranti né conservanti artificiali, il caratteristico colore giallo-verde è dato naturalmente dal bergamotto. Viene prodotto secondo metodi tradizionali, con un\'infusione di almeno 30 giorni. È perfetto da gustare fresco come digestivo, ma anche come ingrediente per cocktail o per aromatizzare dolci.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Grazie per le informazioni dettagliate! Apprezzo molto il fatto che sia senza coloranti artificiali. Un\'ultima domanda: una volta aperta, quanto tempo si conserva la bottiglia?'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Una volta aperta, la bottiglia di Liquore al Bergamotto si conserva ottimamente per circa 2 anni se tenuta in un luogo fresco e asciutto, lontano da fonti di calore e luce diretta. Non è necessario conservarla in frigorifero, ma consigliamo di servirla fresca per apprezzarne al meglio l\'aroma. Se desidera gustarla ghiacciata, può raffreddarla in frigorifero qualche ora prima del consumo piuttosto che aggiungere ghiaccio, che diluirebbe il prodotto.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Perfetto, grazie mille per tutte queste informazioni! Procederò con l\'acquisto, sono curioso di assaggiare questo prodotto tipico calabrese.'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'low'
            ],
            [
                'subject' => 'Ritardo nella consegna dell\'ordine ORD-2023-555',
                'messages' => [
                    [
                        'from_user' => true,
                        'message' => 'Buongiorno, ho effettuato un ordine con numero ORD-2023-555 il 10 giugno, con spedizione prevista entro 2-3 giorni lavorativi. Oggi è il 18 giugno e non ho ancora ricevuto la merce né aggiornamenti sul tracking. Potete verificare lo stato del mio ordine? Grazie.'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Buongiorno, mi scuso per il ritardo nella consegna del suo ordine. Ho verificato immediatamente la situazione e purtroppo c\'è stato un problema con il corriere nella zona di Reggio Calabria, che ha causato un ritardo nel ritiro della merce dal nostro magazzino. Il pacco è stato finalmente preso in carico ieri e dovrebbe essere consegnato entro domani. Come compensazione per il disagio, abbiamo aggiunto al suo account un codice sconto del 15% (SCUSARITARDO15) valido per il prossimo acquisto. Le invieremo anche il nuovo tracking via email entro un\'ora.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Grazie per le informazioni e per il codice sconto, molto apprezzato! Attenderò la consegna di domani.'
                    ],
                    [
                        'from_user' => false,
                        'message' => 'Abbiamo appena ricevuto conferma che il suo pacco è in consegna per domani tra le 10:00 e le 13:00. Le abbiamo inviato l\'email con il link per tracciare la spedizione. Ancora una volta, ci scusiamo per il ritardo e la ringraziamo per la comprensione. Non esiti a contattarci per qualsiasi necessità.'
                    ],
                    [
                        'from_user' => true,
                        'message' => 'Ho ricevuto l\'email con il tracking, grazie mille per l\'assistenza e la tempestività nel risolvere il problema!'
                    ]
                ],
                'status' => 'closed',
                'priority' => 'high'
            ]
        ];

        // Creazione di ticket di supporto realistici
        $ticketCount = 0;

        foreach ($realisticTickets as $ticketData) {
            // Scegli un utente casuale
            $user = $users->random();

            // Data casuale negli ultimi 60 giorni
            $daysAgo = rand(0, 60);
            $ticketDate = Carbon::now()->subDays($daysAgo)->addHours(rand(0, 23))->addMinutes(rand(0, 59));

            // Cerca di collegare a un ordine esistente se disponibile
                $orderId = null;
            if ($orders->isNotEmpty() && strpos($ticketData['messages'][0]['message'], 'ORD-') !== false) {
                $orderId = $orders->random()->id;
            }

            // Genera un numero di ticket unico
            $ticketNumber = 'TIC-' . date('Ymd', strtotime($ticketDate)) . '-' . strtoupper(substr(md5(uniqid()), 0, 5));

            // Crea il ticket
            $ticket = new SupportTicket();
            $ticket->user_id = $user->id;
            $ticket->ticket_number = $ticketNumber;
            $ticket->subject = $ticketData['subject'];
            $ticket->status = $ticketData['status'];
            $ticket->priority = $ticketData['priority'];
            $ticket->order_id = $orderId;
            $ticket->created_at = $ticketDate;
            $ticket->updated_at = $ticketDate;
            $ticket->save();

            // Crea i messaggi della conversazione
            $currentDate = clone $ticketDate;

            foreach ($ticketData['messages'] as $messageData) {
                // Incrementa la data per ogni messaggio (1-24 ore di differenza)
                $currentDate = (clone $currentDate)->addHours(rand(1, 24));

                $supportMessage = new SupportMessage();
                $supportMessage->support_ticket_id = $ticket->id;
                $supportMessage->user_id = $messageData['from_user'] ? $user->id : $admin->id;
                $supportMessage->message = $messageData['message'];
                $supportMessage->is_from_admin = !$messageData['from_user'];
                $supportMessage->created_at = $currentDate;
                $supportMessage->updated_at = $currentDate;
                $supportMessage->save();

                // Aggiorna la data di aggiornamento del ticket con l'ultimo messaggio
                $ticket->updated_at = $currentDate;
                $ticket->save();
            }

            $ticketCount++;
        }

        // Crea ticket generici aggiuntivi per arrivare a 30 in totale
        $remainingTickets = 30 - $ticketCount;

        if ($remainingTickets > 0) {
            // Oggetti predefiniti per i ticket generici
            $genericSubjects = [
                'Domanda sulla spedizione',
                'Richiesta informazioni prodotto',
                'Problema con il pagamento',
                'Richiesta fattura',
                'Modifica ordine',
                'Informazioni sulla disponibilità',
                'Problema con il sito web',
                'Richiesta collaborazione',
                'Informazioni sugli ingredienti',
                'Dubbi sulla conservazione'
            ];

            // Messaggi generici iniziali
            $genericInitialMessages = [
                'Buongiorno, avrei bisogno di informazioni sulla spedizione del mio ordine recente.',
                'Salve, sto cercando maggiori dettagli su un prodotto del vostro catalogo.',
                'Ho riscontrato un problema durante il pagamento, potreste aiutarmi?',
                'Buongiorno, vorrei richiedere la fattura per il mio ultimo acquisto.',
                'Salve, è possibile modificare il mio ordine recente?',
                'Vorrei sapere se un prodotto attualmente esaurito tornerà disponibile presto.',
                'Ho difficoltà ad utilizzare il vostro sito, non riesco a completare l\'acquisto.',
                'Sono interessato a una possibile collaborazione con la vostra azienda.',
                'Avrei bisogno di conoscere tutti gli ingredienti di un vostro prodotto per allergie.',
                'Qual è il modo migliore per conservare i vostri prodotti dopo l\'apertura?'
            ];

            for ($i = 0; $i < $remainingTickets; $i++) {
                // Scegli un utente casuale
                $user = $users->random();

                // Data casuale negli ultimi 90 giorni
                $daysAgo = rand(0, 90);
                $ticketDate = Carbon::now()->subDays($daysAgo)->addHours(rand(0, 23))->addMinutes(rand(0, 59));

                // Scegli un soggetto e un messaggio casuale
                $subjectIndex = array_rand($genericSubjects);
                $subject = $genericSubjects[$subjectIndex];
                $initialMessage = $genericInitialMessages[$subjectIndex];

                // Ordine casuale se disponibile
                $orderId = $orders->isNotEmpty() ? ($orders->random()->id) : null;

                // Genera un numero di ticket unico
                $ticketNumber = 'TIC-' . date('Ymd', strtotime($ticketDate)) . '-' . strtoupper(substr(md5(uniqid()), 0, 5));

                // Stato e priorità casuali
                $statusRand = rand(1, 10);
                $status = $statusRand <= 4 ? 'open' : ($statusRand <= 8 ? 'in_progress' : 'closed');

                $priorityRand = rand(1, 10);
                $priority = $priorityRand <= 2 ? 'high' : ($priorityRand <= 8 ? 'medium' : 'low');

                // Crea il ticket
                $ticket = new SupportTicket();
                $ticket->user_id = $user->id;
                $ticket->ticket_number = $ticketNumber;
                $ticket->subject = $subject;
                $ticket->status = $status;
                $ticket->priority = $priority;
                $ticket->order_id = $orderId;
                $ticket->created_at = $ticketDate;
                $ticket->updated_at = $ticketDate;
                $ticket->save();

                // Crea il messaggio iniziale dell'utente
                $userMessage = new SupportMessage();
                $userMessage->support_ticket_id = $ticket->id;
                $userMessage->user_id = $user->id;
                $userMessage->message = $initialMessage;
                $userMessage->is_from_admin = false;
                $userMessage->created_at = $ticketDate;
                $userMessage->updated_at = $ticketDate;
                $userMessage->save();

                // Se il ticket è in_progress o closed, aggiungi risposta dell'admin
                if ($status != 'open') {
                    $adminResponseDate = (clone $ticketDate)->addHours(rand(1, 24));

                    $adminMessage = new SupportMessage();
                    $adminMessage->support_ticket_id = $ticket->id;
                    $adminMessage->user_id = $admin ? $admin->id : $user->id;
                    $adminMessage->message = 'Grazie per averci contattato. Stiamo lavorando alla sua richiesta e le risponderemo al più presto. Per qualsiasi ulteriore informazione, rimaniamo a disposizione.';
                    $adminMessage->is_from_admin = true;
                    $adminMessage->created_at = $adminResponseDate;
                    $adminMessage->updated_at = $adminResponseDate;
                    $adminMessage->save();

                    // Aggiorna la data di aggiornamento del ticket
                    $ticket->updated_at = $adminResponseDate;
                    $ticket->save();

                    // Se il ticket è chiuso, aggiungi messaggio finale dell'utente
                    if ($status == 'closed') {
                        $finalResponseDate = (clone $adminResponseDate)->addHours(rand(1, 24));

                        $finalMessage = new SupportMessage();
                        $finalMessage->support_ticket_id = $ticket->id;
                        $finalMessage->user_id = $user->id;
                        $finalMessage->message = 'Grazie per l\'assistenza! Il problema è stato risolto.';
                        $finalMessage->is_from_admin = false;
                        $finalMessage->created_at = $finalResponseDate;
                        $finalMessage->updated_at = $finalResponseDate;
                        $finalMessage->save();

                        // Aggiorna la data di aggiornamento del ticket
                        $ticket->updated_at = $finalResponseDate;
                        $ticket->save();
                    }
                }
            }
        }

        $this->command->info("Creati $ticketCount ticket di supporto dettagliati e " . (30 - $ticketCount) . " ticket generici, per un totale di 30 ticket");
    }
}
