import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Icon } from '../../../../shared/ui/icon/icon';
import { FormsService } from '../../../../core/services/forms.service';

const TOPICS = ['Alertes réglementaires', 'Actualités', 'Formations'];

type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-newsletter',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Newsletter {
  private readonly forms = inject(FormsService);

  protected readonly topics = TOPICS;
  protected readonly status = signal<SubmitStatus>('idle');

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.status() === 'sending') return;

    this.status.set('sending');
    this.forms
      .subscribeNewsletter({ email: this.form.controls.email.value.trim(), consent: true })
      .subscribe({
        next: () => this.status.set('sent'),
        error: () => this.status.set('error'),
      });
  }
}
