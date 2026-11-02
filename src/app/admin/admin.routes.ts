import { Routes } from '@angular/router';

import { adminGuard, confirmUnsaved, guestGuard } from './core/admin-guard';
import { AdminLayout } from './layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'connexion',
    title: 'Connexion — Administration Corder',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        title: 'Tableau de bord — Administration Corder',
        loadComponent: () => import('./pages/dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'actualites',
        title: 'Actualités — Administration Corder',
        loadComponent: () => import('./pages/articles/article-list').then((m) => m.ArticleList),
      },
      {
        path: 'actualites/nouvelle',
        title: 'Nouvelle actualité — Administration Corder',
        canDeactivate: [confirmUnsaved],
        loadComponent: () => import('./pages/articles/article-edit').then((m) => m.ArticleEdit),
      },
      {
        // :id reçu en input() par la page (withComponentInputBinding)
        path: 'actualites/:id',
        title: 'Modifier une actualité — Administration Corder',
        canDeactivate: [confirmUnsaved],
        loadComponent: () => import('./pages/articles/article-edit').then((m) => m.ArticleEdit),
      },
      {
        path: 'formations',
        title: 'Formations — Administration Corder',
        loadComponent: () => import('./pages/trainings/training-list').then((m) => m.TrainingList),
      },
      {
        // ?copie=ID : nouvelle session pré-remplie
        path: 'formations/nouvelle',
        title: 'Nouvelle formation — Administration Corder',
        canDeactivate: [confirmUnsaved],
        loadComponent: () => import('./pages/trainings/training-edit').then((m) => m.TrainingEdit),
      },
      {
        path: 'formations/:id',
        title: 'Modifier une formation — Administration Corder',
        canDeactivate: [confirmUnsaved],
        loadComponent: () => import('./pages/trainings/training-edit').then((m) => m.TrainingEdit),
      },
      {
        // ?formation=ID : inscrits d'une seule formation
        path: 'inscriptions',
        title: 'Inscriptions — Administration Corder',
        loadComponent: () =>
          import('./pages/registrations/registration-list').then((m) => m.RegistrationList),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
