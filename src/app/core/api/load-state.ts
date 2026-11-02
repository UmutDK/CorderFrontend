import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, OperatorFunction, catchError, map, of, pipe, startWith } from 'rxjs';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' };

/** Opérateur : émet « loading », puis « success » avec les données, ou « error » */
export function toLoadState<T>(): OperatorFunction<T, LoadState<T>> {
  return pipe(
    map((data): LoadState<T> => ({ status: 'success', data })),
    catchError(() => of<LoadState<T>>({ status: 'error' })),
    startWith<LoadState<T>>({ status: 'loading' }),
  );
}

/**
 * Transforme un appel API en signal chargement / succès / erreur pour les templates.
 * À appeler dans un contexte d'injection (initialiseur de champ d'un composant).
 */
export function loadState<T>(source: Observable<T>): Signal<LoadState<T>> {
  return toSignal(source.pipe(toLoadState()), { requireSync: true });
}

/** Données si chargées, sinon null (pratique dans un computed) */
export function dataOf<T>(state: LoadState<T>): T | null {
  return state.status === 'success' ? state.data : null;
}
