/**
 * Base URL for API calls from the browser.
 * NEXT_PUBLIC_API_URL overrides (production). Default is local FastAPI on port 8000.
 */
export function getPublicApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.replace(/\/+$/, '');
  }
  return 'http://localhost:8000';
}

/** User-facing message when fetch() fails (often CORS or backend down). */
export function apiNetworkErrorMessage(err) {
  const msg = err?.message || '';
  if (msg === 'Failed to fetch') {
    return 'Cannot reach the API. Start the backend on port 8000 (e.g. from the frontend folder run: npm run dev:full).';
  }
  return msg || 'Network error — is the API running?';
}
