import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../shared/ui/icon/icon';
import { PRIMARY_NAV, QUICK_LINKS } from '../../navigation/navigation.data';

@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink, Icon],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNav {
  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly nav = PRIMARY_NAV;
  protected readonly quickLinks = QUICK_LINKS;
  protected readonly expanded = signal<number | null>(null);

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    const body = inject(DOCUMENT).body;

    effect(() => {
      const isOpen = this.open();
      body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        // Attendre que le tiroir ne soit plus « inert » avant de donner le focus
        setTimeout(() => this.closeButton()?.nativeElement.focus(), 50);
      } else {
        this.expanded.set(null);
      }
    });
  }

  protected toggle(index: number): void {
    this.expanded.update((current) => (current === index ? null : index));
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
