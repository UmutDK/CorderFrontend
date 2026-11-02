import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { LICENCE_TYPES, LicenceType } from '../../../core/models/training';
import { Icon } from '../../../shared/ui/icon/icon';
import { AdminApi } from '../../core/admin-api';
import { AdminToast } from '../../core/admin-toast';
import { AdminTraining, AdminTrainingInput, ApiError, ProgramStep } from '../../core/admin.models';

/** Clôture des inscriptions proposée par défaut : 5 jours avant la formation */
const DEFAULT_DEADLINE_DAYS = 5;

/** Champs de l'API → contrôles du formulaire, pour afficher les erreurs du serveur au bon endroit */
const SERVER_FIELDS: Record<string, string> = {
  startsAt: 'date',
  endsAt: 'endTime',
  registrationDeadline: 'deadline',
};

function stepGroup(step: ProgramStep = { time: '', title: '' }) {
  return new FormGroup({
    time: new FormControl(step.time, { nonNullable: true, validators: Validators.maxLength(20) }),
    title: new FormControl(step.title, { nonNullable: true, validators: Validators.maxLength(200) }),
  });
}

function objectiveControl(text = '') {
  return new FormControl(text, { nonNullable: true, validators: Validators.maxLength(300) });
}

@Component({
  selector: 'app-training-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './training-edit.html',
  styleUrl: './training-edit.css',
})
export class TrainingEdit {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly toast = inject(AdminToast);

  /** Paramètre de route ; absent sur /admin/formations/nouvelle */
  readonly id = input<string>();
  /** ?copie=ID : nouvelle session pré-remplie à partir d'une formation existante */
  readonly copie = input<string>();

  protected readonly licences = LICENCE_TYPES;
  protected readonly saved = signal<AdminTraining | null>(null);
  protected readonly copiedFrom = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  /** Vrai pendant reset() : la date chargée ne doit pas recalculer la clôture */
  private resetting = false;

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    slug: new FormControl('', { nonNullable: true, validators: Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/) }),
    summary: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    audience: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    licenceType: new FormControl<LicenceType | null>(null, { validators: Validators.required }),
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    startTime: new FormControl('09:00', { nonNullable: true, validators: Validators.required }),
    endTime: new FormControl('12:30', { nonNullable: true, validators: Validators.required }),
    deadline: new FormControl('', { nonNullable: true, validators: Validators.required }),
    mode: new FormControl<'onsite' | 'online'>('onsite', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true, validators: Validators.maxLength(120) }),
    venueName: new FormControl('', { nonNullable: true, validators: Validators.maxLength(255) }),
    venueAddress: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
    onlineUrl: new FormControl('', { nonNullable: true, validators: Validators.pattern(/^https:\/\/\S+$/) }),
    objectives: new FormArray([objectiveControl()]),
    program: new FormArray([stepGroup()]),
    price: new FormControl<number | null>(0, { validators: [Validators.required, Validators.min(0)] }),
    capacity: new FormControl<number | null>(25, { validators: [Validators.required, Validators.min(1)] }),
    isPublished: new FormControl(true, { nonNullable: true }),
  });

  private readonly values = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    requireSync: true,
  });
  protected readonly isOnline = computed(() => this.values().mode === 'online');
  protected readonly isNew = computed(() => !this.saved());

  constructor() {
    // Fiche à modifier, copie d'une fiche, ou formulaire vierge
    effect(() => {
      const id = this.id();
      const copy = this.copie();
      untracked(() => {
        if (id) this.load(Number(id), false);
        else if (copy) this.load(Number(copy), true);
        else this.reset(null, false);
      });
    });

    // Date choisie et clôture encore vide : proposer 5 jours avant
    this.form.controls.date.valueChanges.subscribe((date) => {
      const deadline = this.form.controls.deadline;
      if (this.resetting || !date || deadline.dirty) return;
      const d = new Date(`${date}T00:00`);
      d.setDate(d.getDate() - DEFAULT_DEADLINE_DAYS);
      deadline.setValue(formatDate(d, 'yyyy-MM-dd', this.locale));
    });
  }

  private load(id: number, asCopy: boolean): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.get<AdminTraining>(`trainings/${id}`).subscribe({
      next: (training) => {
        this.reset(training, asCopy);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  /**
   * Remplit le formulaire. En copie : même contenu, mais nouvelle date à choisir,
   * adresse de page régénérée et formation masquée jusqu'à vérification.
   */
  private reset(t: AdminTraining | null, asCopy: boolean): void {
    this.saved.set(asCopy ? null : t);
    this.copiedFrom.set(asCopy && t ? t.title : null);
    this.formError.set(null);

    const day = (iso: string) => formatDate(iso, 'yyyy-MM-dd', this.locale);
    const time = (iso: string) => formatDate(iso, 'HH:mm', this.locale);
    const keepDates = t && !asCopy;

    const objectives = this.form.controls.objectives;
    objectives.clear({ emitEvent: false });
    for (const text of t?.objectives.length ? t.objectives : ['']) objectives.push(objectiveControl(text), { emitEvent: false });

    const program = this.form.controls.program;
    program.clear({ emitEvent: false });
    for (const step of t?.program.length ? t.program : [{ time: '', title: '' }]) program.push(stepGroup(step), { emitEvent: false });

    this.resetting = true;
    this.form.reset({
      title: t?.title ?? '',
      slug: asCopy ? '' : (t?.slug ?? ''),
      summary: t?.summary ?? '',
      audience: t?.audience ?? '',
      licenceType: t?.licenceType ?? null,
      date: keepDates ? day(t.startsAt) : '',
      startTime: t ? time(t.startsAt) : '09:00',
      endTime: t ? time(t.endsAt) : '12:30',
      deadline: keepDates ? day(t.registrationDeadline) : '',
      mode: t?.online ? 'online' : 'onsite',
      location: t && !t.online ? t.location : '',
      venueName: t?.venueName ?? '',
      venueAddress: t?.venueAddress ?? '',
      onlineUrl: t?.onlineUrl ?? '',
      price: t?.price ?? 0,
      capacity: t?.capacity ?? 25,
      isPublished: asCopy ? false : (t?.isPublished ?? true),
    });
    this.resetting = false;
    if (asCopy) this.form.markAsDirty();
  }

  // ---------- Listes : objectifs et programme ----------

  protected addObjective(): void {
    this.form.controls.objectives.push(objectiveControl());
    this.form.markAsDirty();
  }

  protected removeObjective(index: number): void {
    this.form.controls.objectives.removeAt(index);
    this.form.markAsDirty();
  }

  protected addStep(): void {
    this.form.controls.program.push(stepGroup());
    this.form.markAsDirty();
  }

  protected removeStep(index: number): void {
    this.form.controls.program.removeAt(index);
    this.form.markAsDirty();
  }

  protected moveStep(index: number, delta: -1 | 1): void {
    const program = this.form.controls.program;
    const target = index + delta;
    if (target < 0 || target >= program.length) return;
    const step = program.at(index);
    program.removeAt(index, { emitEvent: false });
    program.insert(target, step);
    this.form.markAsDirty();
  }

  // ---------- Erreurs ----------

  protected showError(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }

  protected serverError(name: string): string | null {
    return (this.form.get(name)?.errors?.['server'] as string | undefined) ?? null;
  }

  // ---------- Enregistrement ----------

  protected onSubmit(): void {
    const v = this.form.getRawValue();
    const online = v.mode === 'online';
    // Champs obligatoires selon le mode (présentiel : ville et lieu)
    if (!online && !v.location.trim()) this.form.controls.location.setErrors({ required: true });
    if (!online && !v.venueName.trim()) this.form.controls.venueName.setErrors({ required: true });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Certains champs sont à compléter ou à corriger.');
      return;
    }
    if (this.saving()) return;

    const at = (date: string, time: string) => new Date(`${date}T${time}`).toISOString();
    const payload: AdminTrainingInput = {
      title: v.title.trim(),
      slug: v.slug.trim() || null,
      summary: v.summary.trim(),
      audience: v.audience.trim(),
      licenceType: v.licenceType!,
      objectives: v.objectives.map((o) => o.trim()).filter(Boolean),
      program: v.program.filter((s) => s.title.trim() || s.time.trim()),
      startsAt: at(v.date, v.startTime),
      endsAt: at(v.date, v.endTime),
      registrationDeadline: at(v.deadline, '23:59'),
      location: online ? 'En ligne' : v.location.trim(),
      price: Number(v.price),
      capacity: Number(v.capacity),
      online,
      venueName: online ? null : v.venueName.trim(),
      venueAddress: online ? null : v.venueAddress.trim() || null,
      onlineUrl: online ? v.onlineUrl.trim() || null : null,
      isPublished: v.isPublished,
    };

    const current = this.saved();
    const request = current
      ? this.api.put<AdminTraining>(`trainings/${current.id}`, payload)
      : this.api.post<AdminTraining>('trainings', payload);

    this.saving.set(true);
    this.formError.set(null);
    request.subscribe({
      next: (training) => {
        this.saving.set(false);
        this.reset(training, false);
        this.toast.show(training.isPublished ? 'Enregistré : visible dans l’agenda du site.' : 'Enregistré (masquée).');
        if (!current) {
          this.router.navigate(['/admin/formations', training.id], { replaceUrl: true });
        }
      },
      error: (e: ApiError) => {
        this.saving.set(false);
        if (e.fields) {
          for (const [field, message] of Object.entries(e.fields)) {
            const control = this.form.get(SERVER_FIELDS[field] ?? field);
            control?.setErrors({ server: message });
            control?.markAsTouched();
          }
          this.formError.set('Certains champs sont à corriger.');
        } else if (e.error !== 'unauthenticated') {
          this.formError.set('L’enregistrement a échoué. Vos modifications sont toujours là : réessayez.');
        }
      },
    });
  }

  /** Utilisé par la garde de sortie : modifications non enregistrées ? */
  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving();
  }
}
