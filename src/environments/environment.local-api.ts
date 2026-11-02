import type { ApiConfig } from '../app/core/api/api.config';

/** npm run start:api : backend PHP local (composer serve dans le dépôt backend, port 8000) */
export const environment: { api: ApiConfig } = {
  api: { baseUrl: 'http://localhost:8000', mock: false },
};
