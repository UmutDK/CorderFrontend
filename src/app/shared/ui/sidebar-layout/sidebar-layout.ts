import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { Icon, IconName } from '../icon/icon';

let nextId = 0;

/**
 * Mise en page des pages intérieures : barre latérale (filtres ou navigation de rubrique) + contenu.
 * Mobile : la barre latérale se replie derrière un bouton ; à partir de 1024px elle est toujours visible et collante.
 *
 * <app-sidebar-layout label="Filtres">
 *   <div sidebar>…</div>
 *   …contenu principal…
 * </app-sidebar-layout>
 */
@Component({
  selector: 'app-sidebar-layout',
  imports: [Icon],
  templateUrl: './sidebar-layout.html',
  styleUrl: './sidebar-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLayout {
  /** Nom de la barre latérale (bouton mobile + aria-label) */
  readonly label = input.required<string>();
  readonly icon = input<IconName>('sliders');
  /** Pastille sur le bouton mobile, ex. nombre de filtres actifs */
  readonly badge = input<number>(0);

  protected readonly open = signal(false);
  protected readonly panelId = `sidebar-panel-${nextId++}`;
}
