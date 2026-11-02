import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon, IconName } from '../../shared/ui/icon/icon';
import { Contact } from '../../shared/sections/contact/contact';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { Accent } from '../../core/navigation/navigation.data';

interface Shortcut {
  title: string;
  text: string;
  route: string;
  fragment?: string;
  icon: IconName;
  accent: Accent;
}

// Raccourcis « libre-service » : beaucoup de demandes trouvent leur réponse sans formulaire
const SHORTCUTS: Shortcut[] = [
  {
    title: 'Faire analyser une plante',
    text: 'Envoyez vos photos ou un échantillon directement à la Clinique des plantes.',
    route: '/clinique-des-plantes',
    icon: 'sprout',
    accent: 'clinique',
  },
  {
    title: 'Ma phytolicence',
    text: 'Obtention, renouvellement, échéances : toutes les démarches.',
    route: '/phytolicence',
    icon: 'book',
    accent: 'phytolicence',
  },
  {
    title: 'Questions fréquentes',
    text: 'Les réponses aux questions que l’on nous pose le plus souvent.',
    route: '/',
    fragment: 'faq',
    icon: 'help',
    accent: 'recherche',
  },
];

@Component({
  selector: 'app-contact-page',
  imports: [RouterLink, Icon, Contact, PageHeader],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  protected readonly shortcuts = SHORTCUTS;
}
