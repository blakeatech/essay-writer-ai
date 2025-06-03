'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User, AuthError, Provider } from '@supabase/supabase-js';
import { supabase, signUpWithEmail, signInWithEmail, signOut } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  signInWithProvider: (provider: Provider) => Promise<void>;
  hasGoogleConnected: boolean;
  authError: string | null;
  setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get cached session
const getCachedSession = () => {
  try {
    const cached = localStorage.getItem('supabase.auth.token');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

// Helper function to create or update a user profile in our custom table
const ensureUserProfile = async (userId: string, email: string) => {
  try {
    // Check if we've already processed this profile in the current session
    const profileKey = `profile_created_${userId}`;
    if (localStorage.getItem(profileKey)) {
      return;
    }
    try {
      const { data: tableTest, error: tableError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
            
      if (tableError) {
        console.error('Cannot access user_profiles table:', tableError);
      }
    } catch (tableAccessError) {
      console.error('Exception accessing table:', tableAccessError);
    }
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
        
    if (fetchError) {
      console.error('Error checking for existing profile:', fetchError);
      throw fetchError;
    }
    
    if (existingProfile) {
      // Profile exists, just update the email and updated_at timestamp
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }
    } else {
      // Profile doesn't exist, create a new one
      const { data: insertData, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          credits: 2, // Default starting credits
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        throw insertError;
      }
    }
    
    // Mark this profile as processed for this session
    localStorage.setItem(profileKey, 'true');
    
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    // Don't rethrow - we want to continue even if profile creation fails
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from cache if available
    const cached = getCachedSession();
    return cached?.user || null;
  });
  const [session, setSession] = useState<Session | null>(() => {
    // Initialize from cache if available
    const cached = getCachedSession();
    return cached?.session || null;
  });
  const [isLoading, setIsLoading] = useState(!getCachedSession()); // Only start loading if no cached session
  const router = useRouter();
  const { toast } = useToast();
  const authChangeProcessed = useRef(false);
  const [hasGoogleConnected, setHasGoogleConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Force session reload on init to prevent stale sessions
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error loading session:', error);
          // Clear any cached data on error
          localStorage.removeItem('supabase.auth.token');
          setSession(null);
          setUser(null);
        } else if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Process profile creation without causing a navigation
          try {
            await ensureUserProfile(data.session.user.id, data.session.user.email || '');
          } catch (profileError) {
            console.error('Failed to ensure user profile during initial load:', profileError);
          }
        } else {
          // Clear any cached data when no session
          localStorage.removeItem('supabase.auth.token');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Unexpected error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
  }, []);

  useEffect(() => {
    if (authChangeProcessed.current) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setSession(session);
        setIsLoading(false);
        
        // Create user profile for new users or sign-ins
        if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          try {
            // Single refresh on email verification

            await ensureUserProfile(session.user.id, session.user.email || '');
            
            const hasGoogle = session.user.identities?.some(
              identity => identity.provider === 'google'
            );
            setHasGoogleConnected(!!hasGoogle);
            
          } catch (error) {
            console.error('Error ensuring user profile:', error);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setHasGoogleConnected(false);
        }
      }
    );

    authChangeProcessed.current = true;
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user has Google connected
  useEffect(() => {
    if (user) {
      // Check if the user has Google identity linked
      const hasGoogle = user.identities?.some(
        identity => identity.provider === 'google'
      );
      setHasGoogleConnected(!!hasGoogle);
    } else {
      setHasGoogleConnected(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      // Force a full page refresh when redirecting to dashboard
      window.location.href = '/dashboard';
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Check if email exists using our backend API
      try {
        // Send email as a query parameter
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/check-email-exists?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.exists) {
          setAuthError("This email is already registered. If you already have an account, please sign in instead.");
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          
          return { user: null, session: null };
        }
      } catch (checkError) {
        console.error('Error checking email existence:', checkError);
        // Continue with registration attempt even if check fails
      }
      
      
      // Attempt to sign up directly and handle any errors
      const { data, error } = await signUpWithEmail(email, password);
      
      if (error) {
        // Check if the error is because the user already exists
        if (error.message.includes('already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('already taken') ||
            error.message.includes('email address is already in use')) {
          toast({
            title: "Registration failed",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          console.error('Registration error:', error);
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { user: null, session: null };
      }

      // Registration successful
      toast({
        title: "Verification email sent",
        description: "Please check your email to confirm your account.",
      });
      
      router.push('/auth/verify-email');
      return data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { user: null, session: null };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // First, clear the Supabase session
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Clear any cached profile flags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profile_created_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Also revoke Google OAuth access
      // Create a hidden iframe to trigger Google logout
      const googleLogoutUrl = 'https://accounts.google.com/logout';
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleLogoutUrl;
      document.body.appendChild(iframe);
      
      // Remove the iframe after a short delay
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        
        // Redirect to the login page
        router.push('/signin');
        
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
      
      // Still redirect to login page even if there's an error
      router.push('/signin');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new method
  const signInWithProvider = async (provider: Provider) => {
    try {
      setIsLoading(true);
      
      // Set a flag in sessionStorage to indicate OAuth login is in progress
      sessionStorage.setItem('oauth_login', 'true');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: provider === 'google' ? 'https://www.googleapis.com/auth/drive.file' : undefined
        }
      });
      
      if (error) {
        console.error('OAuth sign in error:', error);
        // Clear the flag if there's an error
        sessionStorage.removeItem('oauth_login');
        throw error;
      }
      
      // The redirect will happen automatically
    } catch (error: any) {
      console.error('OAuth sign in failed:', error);
      // Clear the flag if there's an exception
      sessionStorage.removeItem('oauth_login');
      
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        isAuthenticated: !!user,
        signInWithProvider,
        hasGoogleConnected,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 