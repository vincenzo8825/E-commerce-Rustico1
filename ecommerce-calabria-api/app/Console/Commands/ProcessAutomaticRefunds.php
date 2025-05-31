<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Refund;
use App\Http\Controllers\API\RefundController;
use Illuminate\Support\Facades\Log;

class ProcessAutomaticRefunds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'refunds:process-automatic
                            {--limit=10 : Number of refunds to process}
                            {--dry-run : Show what would be processed without actually processing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process automatic refunds based on predefined rules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');
        $dryRun = $this->option('dry-run');

        $this->info('🔄 Inizio processamento rimborsi automatici...');

        if ($dryRun) {
            $this->warn('⚠️  Modalità DRY-RUN attiva - nessun rimborso verrà effettivamente processato');
        }

        // Trova rimborsi pendenti che possono essere processati automaticamente
        $refunds = Refund::with(['order', 'user'])
            ->where('status', 'pending')
            ->limit($limit)
            ->get()
            ->filter(function ($refund) {
                return $refund->isAutoProcessable();
            });

        if ($refunds->isEmpty()) {
            $this->info('✅ Nessun rimborso automatico da processare');
            return 0;
        }

        $this->info("📋 Trovati {$refunds->count()} rimborsi da processare automaticamente");

        $processed = 0;
        $failed = 0;

        foreach ($refunds as $refund) {
            $this->line("🔍 Processando rimborso {$refund->refund_number} (€{$refund->amount})");
            $this->line("   📦 Ordine: {$refund->order->order_number}");
            $this->line("   👤 Cliente: {$refund->user->name} {$refund->user->surname}");
            $this->line("   📝 Motivo: {$refund->reason}");

            if ($dryRun) {
                $this->info("   ✅ [DRY-RUN] Sarebbe stato processato automaticamente");
                $processed++;
                continue;
            }

            try {
                $refundController = app(RefundController::class);
                $refundController->autoProcessRefund($refund);

                $refund->refresh();

                if ($refund->status === 'approved') {
                    $this->info("   ✅ Rimborso processato con successo");
                    $processed++;
                } else {
                    $this->error("   ❌ Rimborso fallito - Status: {$refund->status}");
                    $failed++;
                }

            } catch (\Exception $e) {
                $this->error("   ❌ Errore durante processamento: {$e->getMessage()}");
                $failed++;

                Log::error('Errore processamento rimborso automatico', [
                    'refund_id' => $refund->id,
                    'error' => $e->getMessage()
                ]);
            }

            $this->line('');
        }

        // Riepilogo
        $this->line('📊 RIEPILOGO:');
        $this->info("   ✅ Processati con successo: {$processed}");

        if ($failed > 0) {
            $this->error("   ❌ Falliti: {$failed}");
        }

        if (!$dryRun) {
            Log::info('Comando rimborsi automatici completato', [
                'processed' => $processed,
                'failed' => $failed,
                'total_checked' => $refunds->count()
            ]);
        }

        return $failed > 0 ? 1 : 0;
    }
}
