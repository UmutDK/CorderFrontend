import type { ApiConfig } from '../app/core/api/api.config';

/** Build de production : l'API est sur le même domaine, dans public_html/api (cPanel) */
export const environment: { api: ApiConfig } = {
  api: { baseUrl: '/api', mock: false },
};
