/**
 * Base URL for API calls from the browser.
 * - Development without NEXT_PUBLIC_API_URL: '' → same origin /api/v1/* (see next.config.mjs proxy).
 * - Production or explicit URL: set NEXT_PUBLIC_API_URL to your API.
 */
export function getPublicApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  return 'http://localhost:8000';
}

/** User-facing message when fetch() fails (often CORS or backend down). */
export function apiNetworkErrorMessage(err) {
  const msg = err?.message || '';
  if (msg === 'Failed to fetch') {
    return 'Sem ligação à API. Garante que o backend está na porta 8000 (na pasta frontend: npm run dev:full). Reinicia o Next após alterar a config. Se usares .env.local com NEXT_PUBLIC_API_URL, confirma que o URL está correto.';
  }
  return msg || 'Erro de rede — a API está a correr?';
}
