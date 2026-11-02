import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/ui/icon/icon';

// Page temporaire pour toutes les routes pas encore développées.
@Component({
  selector: 'app-placeholder',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section bg-cross" style="min-height: 60vh">
      <div class="container section-head">
        <span class="eyebrow">Bientôt disponible</span>
        <h1>Page en cours de construction</h1>
        <p>Cette page fera partie d’une prochaine étape du projet.</p>
        <a routerLink="/" class="link-arrow">Retour à l’accueil <app-icon name="arrow-right" [size]="18" /></a>
      </div>
    </section>
  `,
})
export class Placeholder {}
