import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { LoadState, toLoadState } from '../../../core/api/load-state';
import { Icon } from '../../../shared/ui/icon/icon';
import { AdminApi } from '../../core/admin-api';
import { AdminToast } from '../../core/admin-toast';
import { AdminArticleRow, PublicationStatus } from '../../core/admin.models';
import { ConfirmDialog } from '../../ui/confirm-dialog/confirm-dialog';

export const STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmée',
  published: 'Publiée',
};

@Component({
  selector: 'app-article-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, Icon, ConfirmDialog],
  templateUrl: './article-list.html',
})
export class ArticleList {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(AdminToast);

  /** Incrémenté pour recharger la liste (après une suppression) */
  private readonly reload = signal(0);
  protected readonly state = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.api.list<AdminArticleRow>('articles').pipe(toLoadState()))),
    { initialValue: { status: 'loading' } as LoadState<AdminArticleRow[]> },
  );

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly query = signal('');
  protected readonly status = signal<PublicationStatus | ''>('');

  protected readonly rows = computed(() => {
    const s = this.state();
    if (s.status !== 'success') return [];
    const q = this.query().trim().toLocaleLowerCase('fr');
    const status = this.status();
    return s.data.filter(
      (a) =>
        (!status || a.status === status) &&
        (!q || a.title.toLocaleLowerCase('fr').includes(q) || a.category.label.toLocaleLowerCase('fr').includes(q)),
    );
  });

  // ---------- Suppression avec confirmation ----------

  private readonly dialog = viewChild.required(ConfirmDialog);
  protected readonly toDelete = signal<AdminArticleRow | null>(null);
  protected readonly deleting = signal(false);

  protected askDelete(article: AdminArticleRow): void {
    this.toDelete.set(article);
    this.dialog().open();
  }

  protected confirmDelete(): void {
    const article = this.toDelete();
    if (!article || this.deleting()) return;
    this.deleting.set(true);
    this.api.delete(`articles/${article.id}`).subscribe({
      next: () => this.afterDelete(`« ${article.title} » a été supprimée.`),
      error: () => this.afterDelete('La suppression a échoué. Réessayez.'),
    });
  }

  private afterDelete(message: string): void {
    this.deleting.set(false);
    this.dialog().close();
    this.reload.update((n) => n + 1);
    this.toast.show(message);
  }
}
