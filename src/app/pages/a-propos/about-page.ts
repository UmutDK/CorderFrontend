import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon, IconName } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { CONTACT, POLES } from '../../core/navigation/navigation.data';
import { ContentService } from '../../core/services/content.service';
import { dataOf, loadState } from '../../core/api/load-state';

// Textes repris de la page « Nos missions » de corder.be (reformulés, à faire valider par Corder)
const AUDIENCES = [
  'Agriculteurs',
  'Horticulteurs',
  'Maraîchers',
  'Gestionnaires de parcs et jardins',
  'Particuliers',
];

const MISSIONS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'message',
    title: 'Faire dialoguer les acteurs',
    text: 'Favoriser les échanges entre les acteurs du monde rural pour une protection intégrée et raisonnée des végétaux.',
  },
  {
    icon: 'sprout',
    title: 'Diagnostiquer et conseiller',
    text: 'Reconnaître une maladie, identifier l’agent responsable, comprendre son apparition pour la prévenir et connaître le seuil d’intervention.',
  },
  {
    icon: 'book',
    title: 'Informer sur la phytolicence et les produits',
    text: 'Répondre aux questions sur la phytolicence et sur les produits phytopharmaceutiques : produits autorisés, usages et cadre légal.',
  },
  {
    icon: 'shield',
    title: 'Accompagner sur la réglementation',
    text: 'Soutenir les professionnels qui diversifient leurs activités ou développent de nouvelles filières.',
  },
  {
    icon: 'chart',
    title: 'Mesurer les utilisations',
    text: 'Estimer l’utilisation des produits phytopharmaceutiques en Wallonie.',
  },
];

const VISION: { icon: IconName; text: string }[] = [
  { icon: 'user', text: 'Protéger la santé de tous, utilisateurs comme consommateurs' },
  { icon: 'heart', text: 'Protéger la santé animale' },
  { icon: 'leaf', text: 'Protéger l’eau, le sol, l’air et la biodiversité' },
  { icon: 'shield', text: 'Répondre aux exigences légales' },
];

// Registre BCE : ASBL constituée le 6 septembre 1994
const FACTS = [
  { label: 'Statut', value: 'Association sans but lucratif (ASBL)' },
  { label: 'Depuis', value: '1994' },
  { label: 'Siège', value: 'Bâtiment Kellner, campus de Louvain-la-Neuve' },
  { label: 'N° d’entreprise', value: 'BE 0453.764.119' },
];

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, Icon, PageHeader],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly audiences = AUDIENCES;
  protected readonly missions = MISSIONS;
  protected readonly vision = VISION;
  protected readonly facts = FACTS;
  protected readonly poles = POLES;
  protected readonly contact = CONTACT;

  protected readonly teamState = loadState(inject(ContentService).team());
  private readonly team = computed(() => dataOf(this.teamState()) ?? []);
  protected readonly board = computed(() => this.team().filter((m) => m.group === 'board'));
  protected readonly staff = computed(() => this.team().filter((m) => m.group === 'staff'));

  protected initials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
}
