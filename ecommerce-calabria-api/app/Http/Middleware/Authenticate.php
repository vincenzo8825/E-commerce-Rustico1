<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Per le richieste API, non reindirizziamo ma restituiamo una risposta JSON
        if ($request->expectsJson()) {
            return null; // Questo farà in modo che Laravel restituisca una risposta 401 invece di reindirizzare
        }

        // Se è una richiesta web (non API), reindirizziamo alla rotta login.redirect
        // che reindirizzerà l'utente alla pagina di login del frontend
        return route('login.redirect');
    }
}
