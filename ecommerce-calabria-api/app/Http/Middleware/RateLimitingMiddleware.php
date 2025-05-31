<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class RateLimitingMiddleware
{
    /**
     * Gestisce il rate limiting personalizzato per l'e-commerce Rustico Calabria
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        // Ottiene l'IP del client per il rate limiting
        $clientIp = $request->ip();

        // Configura limiti diversi basati sul tipo di richiesta
        $limits = $this->getRateLimits($type);

        // Crea una chiave unica per il rate limiting
        $key = $this->createRateLimitKey($request, $type, $clientIp);

        // Verifica se il limite è stato superato
        if (RateLimiter::tooManyAttempts($key, $limits['maxAttempts'])) {
            return $this->buildRateLimitResponse($key, $limits['maxAttempts']);
        }

        // Incrementa il contatore di tentativi
        RateLimiter::hit($key, $limits['decayMinutes'] * 60);

        // Continua con la richiesta
        $response = $next($request);

        // Aggiunge headers informativi sul rate limiting
        if ($response instanceof JsonResponse) {
            $this->addRateLimitHeaders($response, $key, $limits['maxAttempts']);
        }

        return $response;
    }

    /**
     * Ottiene i limiti di rate limiting basati sul tipo
     */
    private function getRateLimits(string $type): array
    {
        $limits = [
            'login' => [
                'maxAttempts' => config('app.rate_limit_login', 5),
                'decayMinutes' => 15, // 15 minuti di blocco
            ],
            'api' => [
                'maxAttempts' => config('app.rate_limit_api', 60),
                'decayMinutes' => 1, // 1 minuto
            ],
            'email' => [
                'maxAttempts' => config('app.rate_limit_email', 6),
                'decayMinutes' => 60, // 1 ora di blocco
            ],
            'checkout' => [
                'maxAttempts' => 10,
                'decayMinutes' => 5, // 5 minuti per checkout
            ],
            'search' => [
                'maxAttempts' => 30,
                'decayMinutes' => 1, // Rate limiting rilassato per ricerca
            ]
        ];

        return $limits[$type] ?? $limits['api'];
    }

    /**
     * Crea una chiave unica per il rate limiting
     */
    private function createRateLimitKey(Request $request, string $type, string $clientIp): string
    {
        $baseKey = "rate_limit:{$type}:{$clientIp}";

        // Per il login, include anche lo username se presente
        if ($type === 'login' && $request->has('email')) {
            $baseKey .= ':' . hash('sha256', $request->input('email'));
        }

        return $baseKey;
    }

    /**
     * Costruisce la risposta quando il rate limit è superato
     */
    private function buildRateLimitResponse(string $key, int $maxAttempts): JsonResponse
    {
        $retryAfter = RateLimiter::availableIn($key);

        return response()->json([
            'error' => 'Troppi tentativi effettuati',
            'message' => 'Hai superato il limite di richieste consentite. Riprova più tardi.',
            'retry_after' => $retryAfter,
            'max_attempts' => $maxAttempts,
            'type' => 'rate_limit_exceeded'
        ], 429)
        ->header('Retry-After', $retryAfter)
        ->header('X-RateLimit-Limit', $maxAttempts)
        ->header('X-RateLimit-Remaining', 0);
    }

    /**
     * Aggiunge headers informativi sul rate limiting
     */
    private function addRateLimitHeaders(JsonResponse $response, string $key, int $maxAttempts): void
    {
        $remaining = RateLimiter::remaining($key, $maxAttempts);
        $retryAfter = RateLimiter::availableIn($key);

        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => max(0, $remaining),
            'X-RateLimit-Reset' => now()->addSeconds($retryAfter)->timestamp,
        ]);
    }
}
