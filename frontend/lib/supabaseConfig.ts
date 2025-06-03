import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with custom settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're running on the client side
const isBrowser = typeof window !== 'undefined';

// Define the site URL for auth callbacks
const getSiteUrl = () => {
  if (isBrowser) {
    return window.location.origin;
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

// Create a Supabase client with configured auth settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',  // More secure flow for auth
    // Use localStorage only on the browser
    storage: isBrowser
      ? {
          getItem: (key) => {
            const itemValue = localStorage.getItem(key);
            return itemValue ? JSON.parse(itemValue) : null;
          },
          setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
          },
          removeItem: (key) => {
            localStorage.removeItem(key);
          },
        }
      : { // Provide dummy/noop storage for server-side
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
  },
});

// Helper function to sign up with improved redirect handling
export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });
}

// Helper function to sign in with improved error handling
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// Helper function to sign out
export async function signOut() {
  return supabase.auth.signOut();
}

// Helper function to verify a one-time password (OTP) token
export async function verifyOtp(token: string, type: 'signup' | 'recovery' | 'email') {
  return supabase.auth.verifyOtp({
    token_hash: token,
    type,
  });
}

export default supabase; 