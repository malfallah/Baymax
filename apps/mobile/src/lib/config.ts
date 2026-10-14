/** API base URL, e.g. https://api.example.com/api/v1. Empty → demo mode. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
export const IS_DEMO = API_URL.length === 0;
