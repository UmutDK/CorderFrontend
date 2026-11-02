import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface ApiConfig {
  /** Racine de l'API, ex. « /api » ; en mode mock : dossier public/data */
  baseUrl: string;
  /**
   * true : lit les fichiers JSON de public/data (aucun backend nécessaire)
   * false : appelle la vraie API REST
   */
  mock: boolean;
}

// Valeur choisie selon la configuration de build : src/environments/environment*.ts
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => environment.api,
});
