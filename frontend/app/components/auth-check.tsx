'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
} 