import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminApi } from '../../core/admin-api';
import { AdminAuth } from '../../core/admin-auth';
import { ApiError } from '../../core/admin.models';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);
  protected readonly available = inject(AdminApi).available;

  /** Paramètres d'URL : page à rouvrir après connexion, session expirée */
  readonly retour = input<string>();
  readonly expiree = input<string>();

  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.sending()) return;

    const { email, password } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    this.auth.login(email.trim(), password).subscribe({
      next: () => {
        // Seules les adresses de l'administration sont acceptées comme page de retour
        const target = this.retour()?.startsWith('/admin') ? this.retour()! : '/admin';
        this.router.navigateByUrl(target);
      },
      error: (e: ApiError) => {
        this.sending.set(false);
        this.form.controls.password.reset();
        this.error.set(
          e.error === 'invalid_credentials'
            ? 'Adresse e-mail ou mot de passe incorrect.'
            : e.error === 'too_many_requests'
              ? 'Trop de tentatives. Réessayez dans une heure.'
              : 'Connexion impossible pour le moment. Réessayez dans un instant.',
        );
      },
    });
  }
}
