import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

let nextId = 0;

/**
 * Fenêtre de confirmation (élément <dialog> natif : focus piégé, Échap pour fermer).
 * Le message est projeté : <app-confirm-dialog #d heading="…" (confirmed)="…">Message</app-confirm-dialog>,
 * puis d.open() / d.close().
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog class="confirm" [attr.aria-labelledby]="titleId" (close)="closed.emit()">
      <h2 [id]="titleId">{{ heading() }}</h2>
      <div class="confirm__body"><ng-content /></div>
      <div class="confirm__actions">
        <button class="btn btn--outline" type="button" (click)="close()">
          {{ canConfirm() ? 'Annuler' : 'Fermer' }}
        </button>
        @if (canConfirm()) {
          <button class="btn btn--danger" type="button" [disabled]="busy()" (click)="confirmed.emit()">
            {{ busy() ? busyLabel() : confirmLabel() }}
          </button>
        }
      </div>
    </dialog>
  `,
  styles: `
    .confirm {
      width: min(28rem, calc(100% - 2rem));
      padding: 1.75rem;
      border: 0;
      border-radius: var(--r-md);
      box-shadow: var(--shadow-lg);
    }

    .confirm::backdrop {
      background: rgb(8 9 38 / 0.5);
    }

    h2 {
      margin-bottom: 0.75rem;
      font-size: 1.25rem;
    }

    .confirm__body {
      display: grid;
      gap: 0.5rem;
      color: var(--text-soft);
    }

    .confirm__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
  `,
})
export class ConfirmDialog {
  readonly heading = input.required<string>();
  readonly confirmLabel = input('Supprimer');
  readonly busyLabel = input('Suppression…');
  readonly busy = input(false);
  /** false : action impossible, seul « Fermer » est proposé (le message explique pourquoi) */
  readonly canConfirm = input(true);
  readonly confirmed = output();
  readonly closed = output();

  protected readonly titleId = `confirm-title-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }
}
