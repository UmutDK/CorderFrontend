import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Icon, IconName } from '../../../../shared/ui/icon/icon';
import { Accent } from '../../../../core/navigation/navigation.data';

interface QuickTask {
  /** Étiquette de domaine affichée en haut à droite de la carte */
  tag?: string;
  title: string;
  text: string;
  cta: string;
  route: string;
  icon: IconName;
  accent: Accent;
}

const TASKS: QuickTask[] = [
  {
    title: 'Consulter la législation',
    text: 'Prenez connaissance de la réglementation sur les produits phytopharmaceutiques en Wallonie.',
    cta: 'Consulter la législation',
    route: '/legislation',
    icon: 'shield',
    accent: 'crp',
  },
  {
    tag: 'Phytosanitaire',
    title: 'Gérer ma phytolicence',
    text: 'Obtenez, renouvelez ou mettez à jour votre phytolicence professionnelle.',
    cta: 'Accéder à la phytolicence',
    route: '/phytolicence',
    icon: 'book',
    accent: 'phytolicence',
  },
  {
    title: 'Trouver une formation',
    text: 'Inscrivez-vous à une formation phytolicence, sur la lutte intégrée ou bien encore sur la protection raisonnée des cultures, que vous soyez professionnel ou citoyen.',
    cta: 'Voir l’agenda',
    route: '/formations',
    icon: 'graduation-cap',
    accent: 'formation',
  },
  {
    title: 'Découvrir nos indicateurs',
    text: 'PhytoScore & PhytoRisque : des OAD pour une meilleure compréhension des risques liés à l’utilisation des PPP.',
    cta: 'Voir les indicateurs',
    route: '/outils/indicateurs',
    icon: 'chart',
    accent: 'recherche',
  },
];

const POPULAR_SEARCHES = ['Renouveler ma phytolicence', 'Glyphosate', 'Mildiou', 'Formation P2', 'APPI’Field'];

// Illustration décorative du registre (aria-hidden), pas de vraies données
const REGISTER_PREVIEW = [
  { date: '12/09', crop: 'Froment', product: 'Fongicide', dose: '1,2 L/ha' },
  { date: '04/09', crop: 'Pomme de terre', product: 'Biocontrôle', dose: '2 kg/ha' },
  { date: '28/08', crop: 'Maïs', product: 'Herbicide', dose: '0,8 L/ha' },
];

@Component({
  selector: 'app-quick-tasks',
  imports: [RouterLink, Icon],
  templateUrl: './quick-tasks.html',
  styleUrl: './quick-tasks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickTasks {
  private readonly router = inject(Router);

  protected readonly tasks = TASKS;
  protected readonly popularSearches = POPULAR_SEARCHES;
  protected readonly registerPreview = REGISTER_PREVIEW;

  protected onSearch(event: Event, query: string): void {
    event.preventDefault();
    const q = query.trim();
    if (q) this.router.navigate(['/recherche'], { queryParams: { q } });
  }
}
