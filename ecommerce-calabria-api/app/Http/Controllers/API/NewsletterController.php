<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    /**
     * Iscrizione alla newsletter
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
            'preferences' => 'nullable|array',
            'preferences.new_products' => 'nullable|boolean',
            'preferences.offers' => 'nullable|boolean',
            'preferences.recipes' => 'nullable|boolean',
            'preferences.events' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $existingSubscription = Newsletter::where('email', $email)->first();

        if ($existingSubscription) {
            if ($existingSubscription->is_active) {
                return response()->json([
                    'message' => 'Questa email è già iscritta alla newsletter',
                    'data' => [
                        'email' => $email,
                        'subscribed_at' => $existingSubscription->subscribed_at,
                        'is_verified' => $existingSubscription->isEmailVerified()
                    ]
                ], 200);
            } else {
                // Riattiva subscription esistente
                $existingSubscription->resubscribe();
                if ($request->has('preferences')) {
                    $existingSubscription->update(['preferences' => $request->preferences]);
                }
                if ($request->has('name')) {
                    $existingSubscription->update(['name' => $request->name]);
                }

                return response()->json([
                    'message' => 'Iscrizione riattivata con successo!',
                    'data' => [
                        'email' => $email,
                        'subscribed_at' => $existingSubscription->subscribed_at,
                        'is_verified' => $existingSubscription->isEmailVerified()
                    ]
                ], 200);
            }
        }

        // Crea nuova subscription
        $newsletter = Newsletter::create([
            'email' => $email,
            'name' => $request->name,
            'preferences' => $request->preferences ?? [
                'new_products' => true,
                'offers' => true,
                'recipes' => true,
                'events' => false,
            ],
            'source' => $request->source ?? 'website',
        ]);

        // TODO: Inviare email di conferma
        // $this->sendConfirmationEmail($newsletter);

        return response()->json([
            'message' => 'Iscrizione completata con successo! Controlla la tua email per confermare.',
            'data' => [
                'email' => $email,
                'subscribed_at' => $newsletter->subscribed_at,
                'is_verified' => false // Sarà true dopo conferma email
            ]
        ], 201);
    }

    /**
     * Disiscrizione dalla newsletter
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function unsubscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required_without:token|email',
            'token' => 'required_without:email|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $newsletter = null;

        if ($request->has('token')) {
            $newsletter = Newsletter::where('token', $request->token)->first();
        } elseif ($request->has('email')) {
            $newsletter = Newsletter::where('email', $request->email)->where('is_active', true)->first();
        }

        if (!$newsletter) {
            return response()->json([
                'message' => 'Iscrizione non trovata'
            ], 404);
        }

        $newsletter->unsubscribe();

        return response()->json([
            'message' => 'Disiscrizione completata con successo. Ci dispiace vederti andare!',
            'data' => [
                'email' => $newsletter->email,
                'unsubscribed_at' => $newsletter->unsubscribed_at
            ]
        ], 200);
    }

    /**
     * Aggiorna preferenze newsletter
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function updatePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'preferences' => 'required|array',
            'preferences.new_products' => 'nullable|boolean',
            'preferences.offers' => 'nullable|boolean',
            'preferences.recipes' => 'nullable|boolean',
            'preferences.events' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $newsletter = Newsletter::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        if (!$newsletter) {
            return response()->json([
                'message' => 'Iscrizione non trovata'
            ], 404);
        }

        $newsletter->update(['preferences' => $request->preferences]);

        return response()->json([
            'message' => 'Preferenze aggiornate con successo!',
            'data' => [
                'email' => $newsletter->email,
                'preferences' => $newsletter->getPreferencesWithDefaults()
            ]
        ], 200);
    }

    /**
     * Ottieni preferenze attuali
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getPreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Email non valida',
                'errors' => $validator->errors()
            ], 422);
        }

        $newsletter = Newsletter::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        if (!$newsletter) {
            return response()->json([
                'message' => 'Iscrizione non trovata'
            ], 404);
        }

        return response()->json([
            'data' => [
                'email' => $newsletter->email,
                'name' => $newsletter->name,
                'preferences' => $newsletter->getPreferencesWithDefaults(),
                'subscribed_at' => $newsletter->subscribed_at,
                'is_verified' => $newsletter->isEmailVerified()
            ]
        ], 200);
    }

    /**
     * Conferma email newsletter
     *
     * @param string $token
     * @return \Illuminate\Http\Response
     */
    public function confirmEmail($token)
    {
        $newsletter = Newsletter::where('token', $token)->first();

        if (!$newsletter) {
            return response()->json([
                'message' => 'Token non valido'
            ], 404);
        }

        if ($newsletter->isEmailVerified()) {
            return response()->json([
                'message' => 'Email già confermata'
            ], 200);
        }

        $newsletter->markEmailAsVerified();

        return response()->json([
            'message' => 'Email confermata con successo! Ora riceverai le nostre newsletter.',
            'data' => [
                'email' => $newsletter->email,
                'email_verified_at' => $newsletter->email_verified_at
            ]
        ], 200);
    }

    /**
     * Statistiche newsletter per admin
     *
     * @return \Illuminate\Http\Response
     */
    public function statistics()
    {
        $totalSubscriptions = Newsletter::count();
        $activeSubscriptions = Newsletter::active()->count();
        $verifiedSubscriptions = Newsletter::active()->verified()->count();
        $recentSubscriptions = Newsletter::where('subscribed_at', '>=', now()->subDays(30))->count();

        // Statistiche per preferenze
        $preferencesStats = Newsletter::active()
            ->get()
            ->map(function ($newsletter) {
                return $newsletter->getPreferencesWithDefaults();
            })
            ->reduce(function ($carry, $prefs) {
                foreach ($prefs as $key => $value) {
                    if ($value) {
                        $carry[$key] = ($carry[$key] ?? 0) + 1;
                    }
                }
                return $carry;
            }, []);

        return response()->json([
            'data' => [
                'total_subscriptions' => $totalSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'verified_subscriptions' => $verifiedSubscriptions,
                'recent_subscriptions' => $recentSubscriptions,
                'unsubscribed_count' => $totalSubscriptions - $activeSubscriptions,
                'verification_rate' => $activeSubscriptions > 0 ?
                    round(($verifiedSubscriptions / $activeSubscriptions) * 100, 2) : 0,
                'preferences_stats' => $preferencesStats
            ]
        ], 200);
    }

    /**
     * Lista iscritti per admin (con paginazione)
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function list(Request $request)
    {
        $query = Newsletter::query();

        // Filtri
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->has('verified')) {
            if ($request->verified === 'true') {
                $query->verified();
            } elseif ($request->verified === 'false') {
                $query->whereNull('email_verified_at');
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $subscribers = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($subscribers, 200);
    }
}
