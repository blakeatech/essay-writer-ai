import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { csrfMiddleware } from './middleware/csrf';

// Auth routes (where we don't want authenticated users to access)
const authRoutes = ['/signin', '/signup', '/forgot-password'];
// Non-auth routes that should be accessible without authentication
const publicRoutes = ['/auth/verify-email', '/auth/callback', '/', '/about', '/terms-of-service', '/privacy-policy'];
// Auth protected routes
const authProtectedRoutes = ['/dashboard', '/dashboard/papers', '/dashboard/buy-credits', '/dashboard/help'];
// API routes that need CSRF protection
const apiRoutes = ['/api/v1'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Apply CSRF protection for API routes
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    const csrfResponse = await csrfMiddleware(req);
    if (csrfResponse.status === 403) {
      return csrfResponse;
    }
  }

  // Check if it's the auth callback with a code parameter
  // This is a special case we want to ensure works correctly
  if (pathname === '/auth/callback' && req.nextUrl.searchParams.has('code')) {
    return res;
  }

  // Skip session check for other public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return res;
  }

  // Only create Supabase client if necessary
  const isProtectedRoute = authProtectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route);

  if (!isProtectedRoute && !isAuthRoute) {
    return res;
  }

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session check error:', error);
      // On error, clear any existing session cookies to prevent login issues
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/signin';
      const response = NextResponse.redirect(redirectUrl);
      
      // Set an expired auth cookie to clear any invalid session data
      response.cookies.set('sb-auth-token', '', { 
        expires: new Date(0),
        path: '/' 
      });
      
      return response;
    }

    // If user is not authenticated and tries to access protected routes, redirect to signin
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/signin';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated and tries to access auth routes, redirect to dashboard
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to continue but log the error
    return res;
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/api/v1/:path*',
    '/dashboard/:path*',
    '/signin',
    '/signup',
    '/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/callback'
  ],
}; 