import type { ApiConfig } from '../app/core/api/api.config';

/**
 * Développement (npm start) : données d'exemple de public/data, aucun backend nécessaire.
 * Avec le backend PHP lancé en local : npm run start:api (environment.local-api.ts).
 * Le build de production utilise environment.prod.ts (voir fileReplacements dans angular.json).
 */
export const environment: { api: ApiConfig } = {
  api: { baseUrl: 'data', mock: true },
};
