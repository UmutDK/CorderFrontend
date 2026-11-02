import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { AdminApi } from './admin-api';
import { AdminUser } from './admin.models';

/** Utilisateur connecté à l'administration (session côté serveur, cookie HttpOnly). */
@Injectable({ providedIn: 'root' })
export class AdminAuth {
  private readonly api = inject(AdminApi);

  /** undefined = pas encore vérifié auprès du serveur */
  private readonly current = signal<AdminUser | null | undefined>(undefined);
  readonly user = computed(() => this.current() ?? null);

  /** Vérifie la session une fois (GET /admin/me), puis répond depuis la mémoire */
  check(): Observable<boolean> {
    const known = this.current();
    if (known !== undefined) return of(known !== null);
    if (!this.api.available) return of(false);

    return this.api.get<AdminUser>('me').pipe(
      tap((user) => this.current.set(user)),
      map(() => true),
      catchError(() => {
        this.current.set(null);
        return of(false);
      }),
    );
  }

  login(email: string, password: string): Observable<AdminUser> {
    return this.api.post<AdminUser>('login', { email, password }).pipe(
      tap((user) => {
        this.current.set(user);
        this.api.sessionExpired.set(false);
      }),
    );
  }

  logout(): Observable<void> {
    return this.api.post<unknown>('logout', {}).pipe(
      catchError(() => of(null)),
      map(() => this.forget()),
    );
  }

  /** Oublie l'utilisateur côté navigateur (déconnexion ou session expirée) */
  forget(): void {
    this.current.set(null);
  }
}
