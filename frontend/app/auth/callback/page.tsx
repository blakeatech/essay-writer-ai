"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Suspense } from 'react';

// Create a component that uses useSearchParams
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve('timeout')
          }, 5000) // 5 seconds timeout
        });

        // Race between the session check and timeout
        const result = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);

        // If we got a timeout, assume success
        if (result === 'timeout') {
          console.log('Auth callback timed out, assuming success');
          router.replace('/dashboard');
          return;
        }

        // If we got here, we got a real response
        const { data, error } = result as any;

        if (error) {
          console.error("Session error:", error);
          setError(error.message);
          setIsProcessing(false);
          return;
        }

        if (data?.session) {
          router.replace('/dashboard');
          return;
        }

        setError("Authentication failed. Please try signing in again.");
        setIsProcessing(false);

      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message || "An unexpected error occurred");
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Verification Error</h1>
          <p>{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={48} />
        <p className="mt-4">Completing authentication...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
} 