import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Helper to fetch data from the Express backend securely using Clerk's JWT.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const { getToken } = auth();
  const token = await getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Ensure we send JSON if body exists and no content-type is set
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    // Provide a default cache strategy (no-store for analytics usually)
    cache: options.cache || 'no-store'
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}
