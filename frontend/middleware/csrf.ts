import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET environment variable is not set');
}

// Function to generate a random token
function generateToken() {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Function to create a hash of the token
async function hashToken(token: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + CSRF_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Function to verify a token
async function verifyToken(token: string, hash: string) {
  const calculatedHash = await hashToken(token);
  return calculatedHash === hash;
}

export async function csrfMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return res;
  }

  // Get or generate CSRF token
  let csrfToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  if (!csrfToken) {
    csrfToken = generateToken();
    const hashedToken = await hashToken(csrfToken);
    
    res.cookies.set(CSRF_COOKIE_NAME, hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  // For POST, PUT, DELETE requests, validate the CSRF token
  const headerToken = req.headers.get('x-csrf-token');
  
  if (!headerToken || !(await verifyToken(headerToken, csrfToken))) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return res;
} 