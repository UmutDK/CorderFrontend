import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { Icon } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { LICENCE_TYPES, TrainingDetail } from '../../core/models/training';
import { TrainingsService } from '../../core/services/trainings.service';
import { dataOf, toLoadState } from '../../core/api/load-state';

type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-training-detail-page',
  imports: [RouterLink, DatePipe, CurrencyPipe, ReactiveFormsModule, Icon, PageHeader],
  templateUrl: './training-detail-page.html',
  styleUrl: './training-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingDetailPage {
  private readonly trainings = inject(TrainingsService);

  /** Paramètre de route :slug */
  readonly slug = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => this.trainings.bySlug(slug).pipe(toLoadState()))),
    { initialValue: { status: 'loading' } as const },
  );
  /** Fiche relue après l'inscription (places restantes à jour), sans réafficher le chargement */
  private readonly refreshed = signal<TrainingDetail | null>(null);

  protected readonly training = computed(() => {
    const fresh = this.refreshed();
    return fresh?.slug === this.slug() ? fresh : dataOf(this.state());
  });

  protected readonly licenceLabel = computed(
    () => LICENCE_TYPES.find((l) => l.code === this.training()?.licenceType)?.label ?? '',
  );

  /** Inscription impossible : complet ou date limite dépassée */
  protected readonly closedReason = computed((): 'full' | 'deadline' | null => {
    const t = this.training();
    if (!t) return null;
    if (t.seatsLeft === 0) return 'full';
    if (Date.now() > Date.parse(t.registrationDeadline)) return 'deadline';
    return null;
  });

  protected readonly seatsPercent = computed(() => {
    const t = this.training();
    return t ? Math.round(((t.capacity - t.seatsLeft) / t.capacity) * 100) : 0;
  });

  protected readonly status = signal<SubmitStatus>('idle');

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    lastName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    licenceNumber: new FormControl('', { nonNullable: true }),
    organization: new FormControl('', { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  constructor() {
    // Titre de l'onglet avec le nom de la formation
    const title = inject(Title);
    effect(() => {
      const t = this.training();
      if (t) title.setTitle(`${t.title} — Formations — Corder ASBL`);
    });

    // Nouvelle formation affichée (navigation d'une fiche à l'autre) : formulaire vierge
    effect(() => {
      this.slug();
      untracked(() => {
        this.status.set('idle');
        this.form.reset();
      });
    });
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.status() === 'sending') return;

    const v = this.form.getRawValue();
    const slug = this.slug();
    this.status.set('sending');
    this.trainings
      .register(slug, {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        licenceNumber: v.licenceNumber.trim() || null,
        organization: v.organization.trim() || null,
        consent: true,
      })
      .subscribe({
        next: () => {
          this.status.set('sent');
          // Le backend a décompté la place : on relit la fiche pour afficher le bon nombre
          this.trainings.bySlug(slug).subscribe({ next: (t) => this.refreshed.set(t), error: () => {} });
        },
        error: () => this.status.set('error'),
      });
  }

  /** Télécharge un fichier .ics pour ajouter la formation à son agenda (Outlook, Google, Apple…) */
  protected addToCalendar(t: TrainingDetail): void {
    const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escape = (text: string) => text.replace(/[\\;,]/g, (c) => `\\${c}`);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Corder ASBL//Formations//FR',
      'BEGIN:VEVENT',
      `UID:formation-${t.id}@corder.be`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(t.startsAt)}`,
      `DTEND:${stamp(t.endsAt)}`,
      `SUMMARY:${escape(t.title)}`,
      `LOCATION:${escape(t.venue ? `${t.venue.name}, ${t.venue.address}` : 'En ligne')}`,
      `URL:${location.href}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t.slug}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
