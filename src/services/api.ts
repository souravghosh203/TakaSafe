/**
 * Builds a backend URL from the deployment-time VITE_API_BASE_URL setting.
 * With no setting, development uses Vite's local /api proxy.
 */
const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

if (import.meta.env.PROD && configuredApiBase) {
  const apiOrigin = new URL(configuredApiBase, window.location.origin);
  if (apiOrigin.protocol !== 'https:') {
    throw new Error('Production API URLs must use HTTPS. Set VITE_API_BASE_URL to an HTTPS origin.');
  }
}

export const apiUrl = (pathname: string): string => {
  const normalisedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${configuredApiBase}${normalisedPath}`;
};
