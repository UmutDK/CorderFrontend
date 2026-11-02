import { Injectable, signal } from '@angular/core';

/**
 * Message temporaire (« Enregistré », « Supprimé »), affiché par le cadre de l'administration :
 * il reste visible même si la page change juste après (création → page de modification).
 */
@Injectable({ providedIn: 'root' })
export class AdminToast {
  readonly message = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  show(message: string, durationMs = 4000): void {
    clearTimeout(this.timer);
    this.message.set(message);
    this.timer = setTimeout(() => this.message.set(null), durationMs);
  }
}
