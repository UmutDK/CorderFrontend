import { Routes } from '@angular/router';

import { PublicLayout } from './core/layout/public-layout/public-layout';

/** Pages du site public, affichées dans le cadre en-tête + pied de page */
const publicRoutes: Routes = [
  {
    path: '',
    title: 'Corder ASBL — Coordination Recherche et Développement Rural',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'formations',
    title: 'Formations — Corder ASBL',
    loadComponent: () =>
      import('./pages/formations/formations-page').then((m) => m.FormationsPage),
  },
  {
    // Le titre de l'onglet est mis à jour par la page une fois la formation chargée
    path: 'formations/:slug',
    title: 'Formation — Corder ASBL',
    loadComponent: () =>
      import('./pages/formations/training-detail-page').then((m) => m.TrainingDetailPage),
  },
  {
    path: 'actualites',
    title: 'Actualités — Corder ASBL',
    loadComponent: () => import('./pages/actualites/news-page').then((m) => m.NewsPage),
  },
  {
    // Le titre de l'onglet est mis à jour par la page une fois l'article chargé
    path: 'actualites/:slug',
    title: 'Actualité — Corder ASBL',
    loadComponent: () => import('./pages/actualites/article-page').then((m) => m.ArticlePage),
  },
  {
    path: 'a-propos',
    title: 'À propos — Corder ASBL',
    loadComponent: () => import('./pages/a-propos/about-page').then((m) => m.AboutPage),
  },
  {
    path: 'contact',
    title: 'Contact — Corder ASBL',
    loadComponent: () => import('./pages/contact/contact-page').then((m) => m.ContactPage),
  },
  {
    path: '**',
    title: 'Page en construction — Corder ASBL',
    loadComponent: () => import('./pages/placeholder/placeholder').then((m) => m.Placeholder),
  },
];

export const routes: Routes = [
  {
    // Administration : cadre et pages propres, chargés seulement quand on y va
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '', component: PublicLayout, children: publicRoutes },
];
