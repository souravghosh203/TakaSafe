/**
 * Builds a backend URL from the deployment-time VITE_API_BASE_URL setting.
 * With no setting, development uses Vite's local /api proxy.
 */
const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

export const apiUrl = (pathname: string): string => {
  const normalisedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${configuredApiBase}${normalisedPath}`;
};
