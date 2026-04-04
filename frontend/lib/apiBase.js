/**
 * Base URL for the public API (browser). Set NEXT_PUBLIC_API_URL in .env.local.
 */
export function getPublicApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.replace(/\/+$/, '');
  }
  return 'http://localhost:8000';
}
