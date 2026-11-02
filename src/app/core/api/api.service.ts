import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { API_CONFIG } from './api.config';

/** Enveloppe de toutes les réponses « liste » de l'API (voir docs/api-contract.md) */
export interface ApiList<T> {
  data: T[];
  meta: { total: number };
}

type QueryParams = Record<string, string | number | boolean>;

/** Seul point d'accès HTTP du site : les services métier passent tous par ici. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list<T>(resource: string, params: QueryParams = {}): Observable<ApiList<T>> {
    if (this.config.mock) {
      // Les fichiers JSON ignorent les filtres : les services appliquent limite / tri eux-mêmes
      return this.http.get<ApiList<T>>(`${this.config.baseUrl}/${resource}.json`);
    }
    return this.http.get<ApiList<T>>(`${this.config.baseUrl}/${resource}`, {
      params: new HttpParams({ fromObject: params }),
    });
  }

  /** Un seul élément : réponse { data: T } ; en mode mock, fichier {resource}.json (ex. trainings/{slug}.json) */
  get<T>(resource: string): Observable<T> {
    const url = this.config.mock
      ? `${this.config.baseUrl}/${resource}.json`
      : `${this.config.baseUrl}/${resource}`;
    return this.http.get<{ data: T }>(url).pipe(map((res) => res.data));
  }

  post<T>(resource: string, body: unknown): Observable<T> {
    if (this.config.mock) {
      // Simule un envoi réussi, avec un petit délai pour voir l'état « envoi en cours »
      return of({ ok: true } as T).pipe(delay(700));
    }
    return this.http.post<T>(`${this.config.baseUrl}/${resource}`, body);
  }
}
