import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Icon, IconName } from '../../shared/ui/icon/icon';
import { AdminApi } from '../core/admin-api';
import { AdminAuth } from '../core/admin-auth';
import { AdminToast } from '../core/admin-toast';

interface AdminNavItem {
  label: string;
  icon: IconName;
  /** Absent = rubrique prévue mais pas encore disponible */
  link?: string;
}

const NAV: AdminNavItem[] = [
  { label: 'Tableau de bord', icon: 'dashboard', link: '/admin' },
  { label: 'Actualités', icon: 'file-text', link: '/admin/actualites' },
  { label: 'Formations', icon: 'graduation-cap', link: '/admin/formations' },
  { label: 'Inscriptions', icon: 'users', link: '/admin/inscriptions' },
  { label: 'Messages', icon: 'mail' },
  { label: 'Newsletter', icon: 'message' },
  { label: 'FAQ', icon: 'help' },
  { label: 'Équipe', icon: 'user' },
  { label: 'Chiffres clés', icon: 'chart' },
];

/** Cadre de l'administration : navigation latérale, barre du haut, page courante. */
@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  protected readonly auth = inject(AdminAuth);
  protected readonly toast = inject(AdminToast).message;
  protected readonly nav = NAV;

  constructor() {
    // Session expirée pendant le travail : retour à la connexion, puis à cette page
    effect(() => {
      if (!this.api.sessionExpired()) return;
      untracked(() => {
        this.auth.forget();
        this.router.navigate(['/admin/connexion'], {
          queryParams: { retour: this.router.url, expiree: 1 },
        });
      });
    });
  }

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/admin/connexion'));
  }
}
