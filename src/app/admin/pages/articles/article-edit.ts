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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { Accent } from '../../../core/navigation/navigation.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { AdminApi } from '../../core/admin-api';
import { AdminToast } from '../../core/admin-toast';
import { AdminArticle, AdminArticleInput, ApiError, Category } from '../../core/admin.models';
import { RichTextEditor } from '../../ui/rich-text-editor/rich-text-editor';
import { STATUS_LABELS } from './article-list';

const POLES: { value: Accent; label: string }[] = [
  { value: 'clinique', label: 'Clinique des plantes' },
  { value: 'crp', label: 'Cellule CRP' },
  { value: 'phytolicence', label: 'Cellule phytolicence' },
  { value: 'recherche', label: 'Recherche' },
  { value: 'formation', label: 'Formations' },
];

const ALERTS_SLUG = 'alertes';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Valeur d'un <input type="datetime-local"> (heure locale) */
function toLocalInput(date: Date | string, locale: string): string {
  return formatDate(date, "yyyy-MM-dd'T'HH:mm", locale);
}

@Component({
  selector: 'app-article-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon, RichTextEditor],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.css',
})
export class ArticleEdit {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly toast = inject(AdminToast);

  /** Paramètre de route ; absent sur /admin/actualites/nouvelle */
  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());

  protected readonly poles = POLES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly categories = toSignal(this.api.list<Category>('categories'), { initialValue: [] });

  /** Article tel qu'enregistré sur le serveur (null pour un nouvel article) */
  protected readonly saved = signal<AdminArticle | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    slug: new FormControl('', { nonNullable: true, validators: Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/) }),
    excerpt: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    body: new FormControl('', { nonNullable: true, validators: Validators.required }),
    categoryId: new FormControl<number | null>(null, { validators: Validators.required }),
    pole: new FormControl<Accent | null>(null),
    alertLevel: new FormControl<'urgent' | 'info'>('info', { nonNullable: true }),
    featured: new FormControl(false, { nonNullable: true }),
    imageUrl: new FormControl<string | null>(null),
    imageAlt: new FormControl('', { nonNullable: true, validators: Validators.maxLength(255) }),
    publish: new FormControl<'draft' | 'publish'>('draft', { nonNullable: true }),
    publishedAt: new FormControl('', { nonNullable: true }),
  });

  private readonly values = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    requireSync: true,
  });

  protected readonly isAlert = computed(() => {
    const id = this.values().categoryId;
    return this.categories().find((c) => c.id === id)?.slug === ALERTS_SLUG;
  });

  /** Statut qui sera appliqué à l'enregistrement, pour le libellé du bouton */
  protected readonly nextStatus = computed(() => {
    const v = this.values();
    if (v.publish === 'draft') return 'draft';
    return v.publishedAt && new Date(v.publishedAt).getTime() > Date.now() ? 'scheduled' : 'published';
  });

  protected readonly autoSlug = computed(() =>
    (this.values().title ?? '')
      .toLocaleLowerCase('fr')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  );

  constructor() {
    // Chargement de l'article (ou formulaire vierge) à chaque changement d'identifiant
    effect(() => {
      const id = this.id();
      untracked(() => (id ? this.load(Number(id)) : this.reset(null)));
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.get<AdminArticle>(`articles/${id}`).subscribe({
      next: (article) => {
        this.reset(article);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  /** Remplit le formulaire avec l'article enregistré (ou des valeurs par défaut) */
  private reset(article: AdminArticle | null): void {
    this.saved.set(article);
    this.formError.set(null);
    this.form.reset({
      title: article?.title ?? '',
      slug: article?.slug ?? '',
      excerpt: article?.excerpt ?? '',
      body: article?.body ?? '',
      categoryId: article?.categoryId ?? null,
      pole: article?.pole ?? null,
      alertLevel: article?.alertLevel ?? 'info',
      featured: article?.featured ?? false,
      imageUrl: article?.imageUrl ?? null,
      imageAlt: article?.imageAlt ?? '',
      publish: article?.publishedAt ? 'publish' : 'draft',
      publishedAt: toLocalInput(article?.publishedAt ?? new Date(), this.locale),
    });
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  protected serverError(name: keyof typeof this.form.controls): string | null {
    return (this.form.controls[name].errors?.['server'] as string | undefined) ?? null;
  }

  // ---------- Image ----------

  protected onImageSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      this.form.controls.imageUrl.setErrors({ server: 'Image trop lourde (5 Mo maximum).' });
      return;
    }
    this.uploading.set(true);
    this.api.upload(file).subscribe({
      next: (url) => {
        this.uploading.set(false);
        this.form.patchValue({ imageUrl: url });
        this.form.markAsDirty();
      },
      error: (e: ApiError) => {
        this.uploading.set(false);
        this.form.controls.imageUrl.setErrors({ server: e.fields?.['file'] ?? 'L’envoi de l’image a échoué.' });
      },
    });
  }

  protected removeImage(): void {
    this.form.patchValue({ imageUrl: null, imageAlt: '' });
    this.form.markAsDirty();
  }

  // ---------- Enregistrement ----------

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Certains champs sont à compléter ou à corriger.');
      return;
    }
    if (this.saving()) return;

    const v = this.form.getRawValue();
    const isAlert = this.isAlert();
    const payload: AdminArticleInput = {
      title: v.title.trim(),
      slug: v.slug.trim() || null,
      excerpt: v.excerpt.trim(),
      body: v.body,
      categoryId: v.categoryId!,
      pole: v.pole,
      alertLevel: isAlert ? v.alertLevel : null,
      featured: !isAlert && v.featured,
      imageUrl: v.imageUrl,
      imageAlt: v.imageUrl ? v.imageAlt.trim() : '',
      publishedAt: v.publish === 'publish' ? new Date(v.publishedAt || Date.now()).toISOString() : null,
    };

    const current = this.saved();
    const request = current
      ? this.api.put<AdminArticle>(`articles/${current.id}`, payload)
      : this.api.post<AdminArticle>('articles', payload);

    this.saving.set(true);
    this.formError.set(null);
    request.subscribe({
      next: (article) => {
        this.saving.set(false);
        this.reset(article);
        this.toast.show(article.status === 'published' ? 'Enregistré et publié sur le site.' : 'Enregistré.');
        if (!current) {
          this.router.navigate(['/admin/actualites', article.id], { replaceUrl: true });
        }
      },
      error: (e: ApiError) => {
        this.saving.set(false);
        if (e.fields) {
          for (const [field, message] of Object.entries(e.fields)) {
            const control = this.form.get(field);
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
