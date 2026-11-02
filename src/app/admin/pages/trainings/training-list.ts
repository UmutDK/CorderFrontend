import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { LoadState, toLoadState } from '../../../core/api/load-state';
import { Icon } from '../../../shared/ui/icon/icon';
import { AdminApi } from '../../core/admin-api';
import { AdminToast } from '../../core/admin-toast';
import { AdminTrainingRow, ApiError } from '../../core/admin.models';
import { ConfirmDialog } from '../../ui/confirm-dialog/confirm-dialog';

type Period = 'upcoming' | 'past';

@Component({
  selector: 'app-training-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, Icon, ConfirmDialog],
  templateUrl: './training-list.html',
  styleUrl: './training-list.css',
})
export class TrainingList {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(AdminToast);

  /** Incrémenté pour recharger la liste (après une suppression) */
  private readonly reload = signal(0);
  protected readonly state = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.api.list<AdminTrainingRow>('trainings').pipe(toLoadState()))),
    { initialValue: { status: 'loading' } as LoadState<AdminTrainingRow[]> },
  );

  protected readonly period = signal<Period>('upcoming');
  protected readonly query = signal('');

  /** Sessions à venir par date croissante, passées de la plus récente à la plus ancienne */
  private readonly split = computed(() => {
    const s = this.state();
    const all = s.status === 'success' ? s.data : [];
    const now = Date.now();
    return {
      upcoming: all.filter((t) => Date.parse(t.endsAt) >= now),
      past: all.filter((t) => Date.parse(t.endsAt) < now).reverse(),
    };
  });

  protected readonly counts = computed(() => ({
    upcoming: this.split().upcoming.length,
    past: this.split().past.length,
  }));

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('fr');
    return this.split()[this.period()].filter(
      (t) => !q || `${t.title} ${t.location} ${t.licenceType}`.toLocaleLowerCase('fr').includes(q),
    );
  });

  protected isClosed(t: AdminTrainingRow): boolean {
    return Date.parse(t.registrationDeadline) < Date.now();
  }

  protected fillPercent(t: AdminTrainingRow): number {
    return Math.min(100, Math.round((t.registered / t.capacity) * 100));
  }

  // ---------- Suppression ----------

  private readonly dialog = viewChild.required(ConfirmDialog);
  protected readonly toDelete = signal<AdminTrainingRow | null>(null);
  protected readonly deleting = signal(false);

  protected askDelete(training: AdminTrainingRow): void {
    this.toDelete.set(training);
    this.dialog().open();
  }

  protected confirmDelete(): void {
    const training = this.toDelete();
    if (!training || this.deleting()) return;
    this.deleting.set(true);
    this.api.delete(`trainings/${training.id}`).subscribe({
      next: () => this.afterDelete(`« ${training.title} » a été supprimée.`),
      error: (e: ApiError) =>
        this.afterDelete(
          e.error === 'has_registrations'
            ? 'Cette formation a des inscrits : annulez-les ou masquez la formation.'
            : 'La suppression a échoué. Réessayez.',
        ),
    });
  }

  private afterDelete(message: string): void {
    this.deleting.set(false);
    this.dialog().close();
    this.reload.update((n) => n + 1);
    this.toast.show(message);
  }
}
