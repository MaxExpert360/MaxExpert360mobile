/**
 * Base API URL Configuration for MaxExpert360 Frontend.
 *
 * In local development or unified SPA hosting, defaults to '' (relative paths).
 * When the frontend is hosted on GitHub Pages (maxexpert360.ca) and the backend
 * runs separately on Google Cloud Run, VITE_API_BASE_URL is set at build time:
 * e.g. VITE_API_BASE_URL=https://maxexpert360-api-xyz.a.run.app
 */
export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''
).replace(/\/+$/, '');

/**
 * Returns the fully qualified or relative URL for a backend API route.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
