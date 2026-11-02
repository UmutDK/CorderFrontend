import type { ApiConfig } from '../app/core/api/api.config';

/**
 * npm run start:api : backend PHP local (php -S localhost:8000 dans le dépôt backend).
 * Les appels à /api sont relayés vers localhost:8000 par le serveur Angular (proxy.conf.json) :
 * même origine qu'en production, donc le cookie de session de l'administration fonctionne.
 */
export const environment: { api: ApiConfig } = {
  api: { baseUrl: '/api', mock: false },
};
