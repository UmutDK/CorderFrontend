import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';

import { LoadState, toLoadState } from '../../../core/api/load-state';
import { Icon } from '../../../shared/ui/icon/icon';
import { AdminApi } from '../../core/admin-api';
import { AdminToast } from '../../core/admin-toast';
import { AdminRegistration, AdminTrainingRow, ApiError } from '../../core/admin.models';
import { ConfirmDialog } from '../../ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-registration-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Icon, ConfirmDialog],
  templateUrl: './registration-list.html',
  styleUrl: './registration-list.css',
})
export class RegistrationList {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly toast = inject(AdminToast);

  /** ?formation=ID : inscrits d'une seule formation */
  readonly formation = input<string>();
  protected readonly trainingId = computed(() => Number(this.formation()) || null);

  /** Incrémenté pour recharger (après un ajout ou une annulation) */
  private readonly reload = signal(0);

  protected readonly trainings = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.api.list<AdminTrainingRow>('trainings'))),
    { initialValue: [] as AdminTrainingRow[] },
  );
  /** Liste déroulante : formations à venir d'abord (de la plus proche), puis les passées */
  protected readonly trainingOptions = computed(() => {
    const now = Date.now();
    const all = this.trainings();
    return {
      upcoming: all.filter((t) => Date.parse(t.endsAt) >= now),
      past: all.filter((t) => Date.parse(t.endsAt) < now).reverse(),
    };
  });
  protected readonly selected = computed(() => this.trainings().find((t) => t.id === this.trainingId()) ?? null);

  protected readonly state = toSignal(
    combineLatest([toObservable(this.trainingId), toObservable(this.reload)]).pipe(
      switchMap(([id]) =>
        this.api.list<AdminRegistration>(id ? `registrations?trainingId=${id}` : 'registrations').pipe(toLoadState()),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState<AdminRegistration[]> },
  );

  protected readonly query = signal('');
  protected readonly rows = computed(() => {
    const s = this.state();
    if (s.status !== 'success') return [];
    const q = this.query().trim().toLocaleLowerCase('fr');
    if (!q) return s.data;
    return s.data.filter((r) =>
      [r.firstName, r.lastName, r.email, r.phone, r.organization, r.licenceNumber]
        .join(' ')
        .toLocaleLowerCase('fr')
        .includes(q),
    );
  });

  protected readonly exportUrl = computed(() => {
    const id = this.trainingId();
    return this.api.href(id ? `registrations/export?trainingId=${id}` : 'registrations/export');
  });

  protected selectTraining(value: string): void {
    this.router.navigate([], { queryParams: { formation: value || null }, replaceUrl: true });
  }

  // ---------- Annulation ----------

  private readonly confirm = viewChild.required(ConfirmDialog);
  protected readonly toCancel = signal<AdminRegistration | null>(null);
  protected readonly cancelling = signal(false);

  protected askCancel(registration: AdminRegistration): void {
    this.toCancel.set(registration);
    this.confirm().open();
  }

  protected confirmCancel(): void {
    const r = this.toCancel();
    if (!r || this.cancelling()) return;
    this.cancelling.set(true);
    this.api.delete(`registrations/${r.id}`).subscribe({
      next: () => this.afterCancel(`Inscription de ${r.firstName} ${r.lastName} annulée : la place est libérée.`),
      error: () => this.afterCancel('L’annulation a échoué. Réessayez.'),
    });
  }

  private afterCancel(message: string): void {
    this.cancelling.set(false);
    this.confirm().close();
    this.reload.update((n) => n + 1);
    this.toast.show(message);
  }

  // ---------- Ajout manuel (inscription par téléphone, sur place…) ----------

  private readonly addDialog = viewChild.required<ElementRef<HTMLDialogElement>>('add');
  protected readonly adding = signal(false);
  protected readonly addError = signal<string | null>(null);

  protected readonly addForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    lastName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    licenceNumber: new FormControl('', { nonNullable: true }),
    organization: new FormControl('', { nonNullable: true }),
    sendConfirmation: new FormControl(true, { nonNullable: true }),
  });

  protected openAdd(): void {
    this.addForm.reset();
    this.addError.set(null);
    this.addDialog().nativeElement.showModal();
  }

  protected closeAdd(): void {
    this.addDialog().nativeElement.close();
  }

  protected showAddError(name: keyof typeof this.addForm.controls): boolean {
    const c = this.addForm.controls[name];
    return c.touched && c.invalid;
  }

  protected submitAdd(): void {
    const training = this.selected();
    if (!training) return;
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    if (this.adding()) return;

    const v = this.addForm.getRawValue();
    this.adding.set(true);
    this.addError.set(null);
    this.api
      .post(`trainings/${training.id}/registrations`, {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        licenceNumber: v.licenceNumber.trim() || null,
        organization: v.organization.trim() || null,
        sendConfirmation: v.sendConfirmation,
      })
      .subscribe({
        next: () => {
          this.adding.set(false);
          this.closeAdd();
          this.reload.update((n) => n + 1);
          this.toast.show(
            `Inscription ajoutée pour ${v.firstName} ${v.lastName}${v.sendConfirmation ? ' (confirmation envoyée)' : ''}.`,
          );
        },
        error: (e: ApiError) => {
          this.adding.set(false);
          this.addError.set(
            e.error === 'full'
              ? 'La formation est complète : augmentez le nombre de places dans sa fiche si nécessaire.'
              : e.error === 'already_registered'
                ? 'Cette adresse e-mail est déjà inscrite à cette formation.'
                : e.fields
                  ? Object.values(e.fields).join(' ')
                  : 'L’ajout a échoué. Réessayez.',
          );
        },
      });
  }
}
