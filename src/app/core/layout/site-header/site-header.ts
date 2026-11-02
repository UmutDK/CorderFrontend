import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Icon } from '../../../shared/ui/icon/icon';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { PRIMARY_NAV, QUICK_LINKS } from '../../navigation/navigation.data';

const CLOSE_DELAY_MS = 180;

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon, MobileNav],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly nav = PRIMARY_NAV;
  protected readonly quickLinks = QUICK_LINKS;

  protected readonly openIndex = signal<number | null>(null);
  protected readonly compact = signal(false);
  protected readonly mobileOpen = signal(false);

  private readonly canHover =
    typeof matchMedia !== 'undefined' && matchMedia('(hover: hover)').matches;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private hoverOpenedAt = 0;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        this.openIndex.set(null);
        this.mobileOpen.set(false);
      });
  }

  protected onItemEnter(index: number, hasMega: boolean): void {
    if (!this.canHover) return;
    clearTimeout(this.closeTimer);
    if (hasMega && this.openIndex() !== index) {
      this.hoverOpenedAt = Date.now();
    }
    this.openIndex.set(hasMega ? index : null);
  }

  protected onItemLeave(): void {
    if (!this.canHover) return;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.openIndex.set(null), CLOSE_DELAY_MS);
  }

  protected toggle(index: number): void {
    // Évite qu'un clic juste après l'ouverture au survol referme aussitôt le menu
    if (this.openIndex() === index && Date.now() - this.hoverOpenedAt < 400) return;
    this.openIndex.update((current) => (current === index ? null : index));
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    // Compact = la barre supérieure est sortie de l'écran (seuil = --topbar-h)
    this.compact.set(window.scrollY > 36);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    const index = this.openIndex();
    if (index === null) return;
    this.openIndex.set(null);
    this.host.nativeElement.querySelector<HTMLElement>(`#mega-trigger-${index}`)?.focus();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.openIndex.set(null);
    }
  }
}
