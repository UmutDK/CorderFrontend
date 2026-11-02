import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { loadState } from '../../../core/api/load-state';
import { Icon, IconName } from '../../../shared/ui/icon/icon';
import { AdminApi } from '../../core/admin-api';
import { AdminAuth } from '../../core/admin-auth';
import { AdminStats } from '../../core/admin.models';

interface StatTile {
  key: keyof AdminStats;
  label: string;
  icon: IconName;
  accent: string;
}

const TILES: StatTile[] = [
  { key: 'articlesPublished', label: 'actualités publiées', icon: 'file-text', accent: 'clinique' },
  { key: 'articlesDraft', label: 'brouillons ou programmées', icon: 'pencil', accent: 'recherche' },
  { key: 'trainingsUpcoming', label: 'formations à venir', icon: 'graduation-cap', accent: 'formation' },
  { key: 'registrationsLast30Days', label: 'inscriptions (30 jours)', icon: 'users', accent: 'phytolicence' },
  { key: 'messagesLast30Days', label: 'messages reçus (30 jours)', icon: 'mail', accent: 'crp' },
  { key: 'newsletterSubscribers', label: 'abonnés à la newsletter', icon: 'message', accent: 'clinique' },
];

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  protected readonly user = inject(AdminAuth).user;
  protected readonly stats = loadState(inject(AdminApi).get<AdminStats>('stats'));
  protected readonly tiles = TILES;
}
