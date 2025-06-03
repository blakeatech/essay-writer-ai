import { useEffect, useState } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Function to get CSRF token from cookie
    const getCsrfToken = () => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; csrf-token=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    // Set initial CSRF token
    setCsrfToken(getCsrfToken());

    // Update CSRF token when cookie changes
    const handleCookieChange = () => {
      setCsrfToken(getCsrfToken());
    };

    document.addEventListener('cookiechange', handleCookieChange);
    return () => {
      document.removeEventListener('cookiechange', handleCookieChange);
    };
  }, []);

  return csrfToken;
} 