import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  /** Racine de l'API, ex. « https://api.corder.be/v1 » ; en mode mock : dossier public/data */
  baseUrl: string;
  /**
   * true : lit les fichiers JSON de public/data (aucun backend nécessaire)
   * false : appelle la vraie API REST
   */
  mock: boolean;
}

// Pour brancher le backend : { baseUrl: 'https://…/api', mock: false } dans app.config.ts
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => ({ baseUrl: 'data', mock: true }),
});
