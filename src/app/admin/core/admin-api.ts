import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { API_CONFIG } from '../../core/api/api.config';
import { ApiList } from '../../core/api/api.service';
import { ApiError } from './admin.models';

/**
 * Accès HTTP de l'administration (routes /admin/… de l'API).
 * La session est un cookie : le navigateur l'envoie tout seul, l'API est sur la même origine.
 * Une réponse 401 (session expirée) signale sessionExpired, que le cadre transforme en retour à la connexion.
 */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  /** false en mode données d'exemple : l'administration a besoin du backend PHP */
  readonly available = !this.config.mock;
  readonly sessionExpired = signal(false);

  private url(path: string): string {
    return `${this.config.baseUrl}/admin/${path}`;
  }

  /** Adresse à ouvrir directement (téléchargement d'un export : le cookie de session suit le lien) */
  href(path: string): string {
    return this.url(path);
  }

  list<T>(path: string): Observable<T[]> {
    return this.http.get<ApiList<T>>(this.url(path)).pipe(
      map((res) => res.data),
      catchError((e) => this.fail(e)),
    );
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<{ data: T }>(this.url(path)).pipe(
      map((res) => res.data),
      catchError((e) => this.fail(e)),
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<{ data: T }>(this.url(path), body).pipe(
      map((res) => res.data),
      catchError((e) => this.fail(e)),
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<{ data: T }>(this.url(path), body).pipe(
      map((res) => res.data),
      catchError((e) => this.fail(e)),
    );
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(this.url(path)).pipe(
      map(() => undefined),
      catchError((e) => this.fail(e)),
    );
  }

  /** Envoi d'une image → URL publique du fichier */
  upload(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ data: { url: string } }>(this.url('uploads'), form).pipe(
      map((res) => res.data.url),
      catchError((e) => this.fail(e)),
    );
  }

  /** Erreur normalisée { error, fields } ; 401 hors connexion = session expirée */
  private fail(e: unknown): Observable<never> {
    const response = e instanceof HttpErrorResponse ? e : null;
    if (response?.status === 401 && !response.url?.endsWith('/admin/login')) {
      this.sessionExpired.set(true);
    }
    const body = response?.error;
    const error: ApiError =
      body && typeof body === 'object' && typeof body.error === 'string'
        ? { error: body.error, fields: body.fields }
        : { error: response?.status === 0 ? 'network_error' : 'server_error' };
    return throwError(() => error);
  }
}
