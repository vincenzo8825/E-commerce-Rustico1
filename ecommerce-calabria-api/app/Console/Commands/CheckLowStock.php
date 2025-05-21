<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\StockService;

class CheckLowStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:check-low {threshold=5 : La soglia per considerare un prodotto con stock basso}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Controlla tutti i prodotti con stock basso e invia notifiche agli amministratori';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $threshold = (int) $this->argument('threshold');

        $this->info("Controllo prodotti con stock inferiore o uguale a {$threshold}...");

        $stockService = new StockService($threshold);
        $stockService->checkLowStockProducts();

        $this->info('Controllo completato! Controlla i log per i dettagli.');

        return Command::SUCCESS;
    }
}
