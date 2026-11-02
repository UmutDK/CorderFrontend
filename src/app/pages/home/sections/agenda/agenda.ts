import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { TrainingTimeline } from '../../../../shared/ui/training/training-timeline';
import { LICENCE_TYPES, LicenceType } from '../../../../core/models/training';
import { TrainingsService } from '../../../../core/services/trainings.service';
import { dataOf, loadState } from '../../../../core/api/load-state';

// L'accueil n'affiche qu'un aperçu, l'agenda complet est sur /formations
const MAX_VISIBLE = 6;

@Component({
  selector: 'app-agenda',
  imports: [RouterLink, Icon, TrainingTimeline],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Agenda {
  protected readonly licenceTypes = LICENCE_TYPES;

  protected readonly state = loadState(inject(TrainingsService).upcoming());
  private readonly trainings = computed(() => dataOf(this.state()) ?? []);

  /** Lieux proposés dans le filtre, déduits des formations */
  protected readonly locations = computed(() =>
    [...new Set(this.trainings().map((t) => t.location))].sort((a, b) => a.localeCompare(b, 'fr')),
  );

  /** null = tous */
  protected readonly location = signal<string | null>(null);
  protected readonly type = signal<LicenceType | null>(null);

  private readonly filtered = computed(() =>
    this.trainings().filter(
      (t) =>
        (!this.location() || t.location === this.location()) &&
        (!this.type() || t.licenceType === this.type()),
    ),
  );

  protected readonly total = computed(() => this.filtered().length);
  protected readonly visible = computed(() => this.filtered().slice(0, MAX_VISIBLE));

  protected readonly hasFilters = computed(() => this.location() !== null || this.type() !== null);

  protected resetFilters(): void {
    this.location.set(null);
    this.type.set(null);
  }
}
