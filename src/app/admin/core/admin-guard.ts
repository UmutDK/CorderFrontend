import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AdminAuth } from './admin-auth';

/** Pages de l'administration : non connecté → /admin/connexion, en revenant ensuite à la page demandée */
export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AdminAuth)
    .check()
    .pipe(
      map((ok) => ok || router.createUrlTree(['/admin/connexion'], { queryParams: { retour: state.url } })),
    );
};

/** Formulaire avec des modifications non enregistrées : confirmation avant de quitter la page */
export const confirmUnsaved: CanDeactivateFn<{ hasUnsavedChanges(): boolean }> = (component) =>
  !component.hasUnsavedChanges() ||
  window.confirm('Vos modifications ne sont pas enregistrées. Quitter quand même cette page ?');

/** Page de connexion : déjà connecté → tableau de bord */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AdminAuth)
    .check()
    .pipe(map((ok) => (ok ? router.createUrlTree(['/admin']) : true)));
};
