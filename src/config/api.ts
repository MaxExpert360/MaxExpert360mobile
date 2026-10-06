/**
 * Base API URL Configuration for MaxExpert360 Frontend.
 *
 * In local development, AI Studio Preview (ais-pre-*, ais-dev-*), or unified full-stack hosting,
 * defaults to '' (relative paths) so all requests hit the local Express backend on the same origin
 * without cross-origin preflight/CORS issues.
 *
 * When the frontend is hosted on a separate static host (e.g. GitHub Pages on maxexpert360.ca),
 * it points to the remote Cloud Run backend via VITE_API_BASE_URL.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;

    // Local development, AI Studio standalone preview (*.ai.studio), or internal preview (*.run.app):
    // always use same-origin relative API so requests hit the local Express backend on the same host.
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.ai.studio') ||
      hostname.includes('ai.studio') ||
      hostname.endsWith('.run.app') ||
      hostname.includes('ais-pre-') ||
      hostname.includes('ais-dev-')
    ) {
      return '';
    }

    const envBase = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').replace(/\/+$/, '');
    if (envBase) {
      try {
        const parsed = new URL(envBase);
        if (parsed.hostname === hostname) {
          return ''; // Same origin
        }
      } catch {
        // If not a valid absolute URL, return as-is
      }
      return envBase;
    }

    // Explicit fallback for maxexpert360.ca domain if VITE_API_BASE_URL is not set at build time:
    if (hostname === 'maxexpert360.ca' || hostname === 'www.maxexpert360.ca') {
      return 'https://maxexpert360mobile-backend-928037073642.northamerica-northeast1.run.app';
    }

    return '';
  }

  return ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').replace(/\/+$/, '');
}

export const API_BASE_URL: string = resolveApiBaseUrl();

/**
 * Returns the fully qualified or relative URL for a backend API route.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = typeof window !== 'undefined' ? resolveApiBaseUrl() : API_BASE_URL;
  return `${base}${cleanPath}`;
}
