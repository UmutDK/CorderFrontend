import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { SidebarLayout } from '../../shared/ui/sidebar-layout/sidebar-layout';
import { TrainingTimeline } from '../../shared/ui/training/training-timeline';
import { LICENCE_TYPES, LicenceType } from '../../core/models/training';
import { TrainingsService } from '../../core/services/trainings.service';
import { dataOf, loadState } from '../../core/api/load-state';

const PAGE_SIZE = 10;

/** Minuscules sans accents, pour une recherche tolérante (« reglementation » trouve « Réglementation ») */
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Component({
  selector: 'app-formations-page',
  imports: [RouterLink, Icon, PageHeader, SidebarLayout, TrainingTimeline],
  templateUrl: './formations-page.html',
  styleUrl: './formations-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationsPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly licenceTypes = LICENCE_TYPES;

  protected readonly state = loadState(inject(TrainingsService).upcoming());
  private readonly trainings = computed(() => dataOf(this.state()) ?? []);

  protected readonly locations = computed(() =>
    [...new Set(this.trainings().map((t) => t.location))].sort((a, b) => a.localeCompare(b, 'fr')),
  );

  // Les filtres vivent dans l'URL (?q=…&lieu=…&type=…&dispo=1) : partageables et conservés au retour arrière
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly query = computed(() => this.params().get('q') ?? '');
  protected readonly location = computed(() => this.params().get('lieu'));
  protected readonly type = computed(() => this.params().get('type') as LicenceType | null);
  protected readonly availableOnly = computed(() => this.params().get('dispo') === '1');

  protected readonly activeFilters = computed(
    () =>
      [this.query(), this.location(), this.type(), this.availableOnly()].filter(Boolean).length,
  );

  protected readonly filtered = computed(() => {
    const q = normalize(this.query().trim());
    return this.trainings().filter(
      (t) =>
        (!q || normalize(`${t.title} ${t.location}`).includes(q)) &&
        (!this.location() || t.location === this.location()) &&
        (!this.type() || t.licenceType === this.type()) &&
        (!this.availableOnly() || t.seatsLeft > 0),
    );
  });

  /** Revient à la première page dès que les résultats changent */
  private readonly limit = linkedSignal({ source: this.filtered, computation: () => PAGE_SIZE });
  protected readonly visible = computed(() => this.filtered().slice(0, this.limit()));
  protected readonly remaining = computed(() => this.filtered().length - this.visible().length);

  protected setFilter(params: Params): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected resetFilters(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  protected showMore(): void {
    this.limit.update((n) => n + PAGE_SIZE);
  }
}
