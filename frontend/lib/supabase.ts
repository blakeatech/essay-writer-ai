// Import our improved Supabase configuration
import supabase, { 
  signUpWithEmail, 
  signInWithEmail, 
  signOut, 
  verifyOtp 
} from './supabaseConfig';

// Export everything
export { 
  supabase, 
  signUpWithEmail, 
  signInWithEmail, 
  signOut, 
  verifyOtp 
}; 