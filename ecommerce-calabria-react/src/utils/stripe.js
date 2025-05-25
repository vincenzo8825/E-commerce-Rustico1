import { loadStripe } from '@stripe/stripe-js';

// Sostituisci con la tua chiave pubblica Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

export default stripePromise; 