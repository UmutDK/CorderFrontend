import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Icon } from '../../ui/icon/icon';
import { Accent, CONTACT, POLES } from '../../../core/navigation/navigation.data';
import { FormsService } from '../../../core/services/forms.service';

const PROFILES = ['Agriculteur / horticulteur', 'Professionnel du secteur', 'Commune / gestionnaire public', 'Particulier', 'Autre'];

type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly forms = inject(FormsService);

  /** false sur la page /contact, dont l'en-tête de page porte déjà le titre */
  readonly showIntro = input(true);

  protected readonly contact = CONTACT;
  protected readonly mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    CONTACT.addressLines.join(', '),
  )}`;
  protected readonly profiles = PROFILES;
  protected readonly services = POLES.map((p) => ({ value: p.accent!, label: p.label }));
  protected readonly status = signal<SubmitStatus>('idle');

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true }),
    profile: new FormControl('', { nonNullable: true, validators: Validators.required }),
    // Vide = « Je ne sais pas » : la demande est orientée par Corder
    pole: new FormControl<Accent | ''>('', { nonNullable: true }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  /** Erreur à afficher seulement après passage dans le champ */
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

    const { name, email, phone, profile, pole, message } = this.form.getRawValue();
    this.status.set('sending');
    this.forms
      .sendContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        profile,
        pole: pole || null,
        message: message.trim(),
        consent: true,
      })
      .subscribe({
        next: () => this.status.set('sent'),
        error: () => this.status.set('error'),
      });
  }

  protected reset(): void {
    this.form.reset();
    this.status.set('idle');
  }
}
