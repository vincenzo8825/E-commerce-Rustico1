<?php
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    // Ottieni la struttura della tabella order_items
    $columns = Schema::getColumnListing('order_items');
    echo "Colonne della tabella order_items:\n";
    print_r($columns);

    // Ottieni un record di esempio
    $orderItem = DB::table('order_items')->first();
    echo "\nEsempio di record dalla tabella order_items:\n";
    print_r($orderItem);

} catch (Exception $e) {
    echo "Errore: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
