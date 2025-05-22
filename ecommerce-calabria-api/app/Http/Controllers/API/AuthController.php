<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Registrazione utente
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_admin' => false, // Default non è admin
        ]);

        // Invia email di verifica
        event(new Registered($user));

        // Crea un token di accesso anche se l'email non è verificata
        // per mostrare un messaggio appropriato nel frontend
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrazione avvenuta con successo. Controlla la tua email per la verifica.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'email_verified' => false,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    // Login utente
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Credenziali non valide.'],
            ]);
        }

        $user = $request->user();

        // Verifica se c'è bisogno di forzare l'aggiornamento dello stato di verifica
        $this->ensureEmailVerificationStatus($user);

        // Genera token anche se l'email non è verificata, ma includi flag nel response
        $token = $user->createToken('auth_token')->plainTextToken;

        // Se l'utente è admin, consideriamo l'email come verificata
        if ($user->is_admin) {
            // Verifichiamo l'email dell'admin se non è già verificata
            if (!$user->email_verified_at) {
                // Impostiamo il timestamp di verifica email
                $user->email_verified_at = now();
                $user->save();
            }

            return response()->json([
                'message' => 'Login effettuato con successo',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'email' => $user->email,
                    'email_verified' => true,
                    'is_admin' => $user->is_admin,
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
                'email_verified' => true,
            ]);
        }

        // Se l'email non è verificata per utenti normali, informa l'utente ma concedi comunque un token limitato
        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Devi verificare la tua email prima di accedere a tutte le funzionalità.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'email' => $user->email,
                    'email_verified' => false,
                    'is_admin' => $user->is_admin,
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
                'email_verified' => false,
            ], 200);
        }

        return response()->json([
            'message' => 'Login effettuato con successo',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'email_verified' => true,
                'is_admin' => $user->is_admin,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
            'email_verified' => true,
        ]);
    }

    // Logout utente
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout effettuato con successo.'
        ]);
    }

    // Check stato utente
    public function checkAuthStatus(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'authenticated' => false
            ]);
        }

        // Verifica se c'è bisogno di forzare l'aggiornamento dello stato di verifica
        $this->ensureEmailVerificationStatus($user);

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'email_verified' => $user->email_verified_at ? true : false,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    /**
     * Assicura che lo stato di verifica dell'email sia corretto nel database
     */
    private function ensureEmailVerificationStatus($user)
    {
        // Verifica nel database se c'è un problema di tipo di dati o formato
        if (!$user->email_verified_at) {
            // Controlla direttamente nel database se esiste un record con email verificata
            $verifiedUser = User::where('id', $user->id)
                                ->whereNotNull('email_verified_at')
                                ->first();

            if ($verifiedUser) {
                // Forza l'aggiornamento dell'utente corrente
                $user->email_verified_at = $verifiedUser->email_verified_at;
                $user->save();
                return true;
            }
        }

        return false;
    }
}
