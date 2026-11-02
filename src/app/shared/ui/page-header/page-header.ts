import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  /** Absent pour la page courante (dernier élément) */
  route?: string;
}

/**
 * En-tête des pages intérieures : fil d'Ariane, surtitre, titre (h1) et introduction.
 * Le contenu projeté (boutons, chiffres…) s'affiche sous l'introduction.
 */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly lead = input<string>();
  readonly eyebrow = input<string>();
  /** Fil d'Ariane sans « Accueil », ajouté automatiquement */
  readonly crumbs = input<Crumb[]>([]);
  /** Marge basse agrandie quand des cartes chevauchent l'en-tête */
  readonly overlap = input(false);
}
