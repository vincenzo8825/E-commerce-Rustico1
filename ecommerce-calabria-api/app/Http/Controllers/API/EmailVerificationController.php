<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Events\Verified;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmailVerificationController extends Controller
{
    /**
     * Verifica l'email dell'utente senza richiedere autenticazione.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  string  $hash
     * @return \Illuminate\Http\Response
     */
    public function verify(Request $request, $id, $hash)
    {
        // Cerca l'utente per ID
        $user = User::findOrFail($id);

        // Controlla se l'email è già stata verificata
        if ($user->hasVerifiedEmail()) {
            return redirect()->away('http://localhost:5173/?email_already_verified=true');
        }

        // Verifica l'hash dell'email
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'URL di verifica non valido.'], 403);
        }

        // Verifica che l'URL firmato sia valido (controllo della firma)
        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'URL di verifica scaduto o non valido.'], 403);
        }

        // Imposta email_verified_at all'ora corrente
        $user->email_verified_at = Carbon::now();
        $user->save();

        // Emetti l'evento Verified
        event(new Verified($user));

        // Reindirizza l'utente al frontend con un parametro di query di successo
        return redirect()->away('http://localhost:5173/?email_verified=true');
    }
}
