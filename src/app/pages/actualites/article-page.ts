import { DatePipe, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { Icon } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { ArticleCard } from '../../shared/ui/article-card/article-card';
import { NewsService } from '../../core/services/news.service';
import { dataOf, loadState, toLoadState } from '../../core/api/load-state';

const RELATED_COUNT = 3;

@Component({
  selector: 'app-article-page',
  imports: [RouterLink, DatePipe, Icon, PageHeader, ArticleCard],
  templateUrl: './article-page.html',
  styleUrl: './article-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePage {
  private readonly news = inject(NewsService);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  /** Paramètre de route :slug */
  readonly slug = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => this.news.articleBySlug(slug).pipe(toLoadState()))),
    { initialValue: { status: 'loading' } as const },
  );
  protected readonly article = computed(() => dataOf(this.state()));

  /** Surtitre : « Catégorie · 21 octobre 2026 » */
  protected readonly eyebrow = computed(() => {
    const a = this.article();
    return a ? `${a.category.label} · ${formatDate(a.publishedAt, 'd MMMM y', this.locale)}` : undefined;
  });

  /** À lire aussi : même catégorie d'abord, puis les plus récents */
  private readonly allState = loadState(this.news.allArticles());
  protected readonly related = computed(() => {
    const current = this.article();
    const others = (dataOf(this.allState()) ?? []).filter((a) => a.slug !== this.slug());
    const sameCategory = others.filter((a) => a.category.slug === current?.category.slug);
    const rest = others.filter((a) => a.category.slug !== current?.category.slug);
    return [...sameCategory, ...rest].slice(0, RELATED_COUNT);
  });

  protected readonly copied = signal(false);

  constructor() {
    const title = inject(Title);
    effect(() => {
      const a = this.article();
      if (a) title.setTitle(`${a.title} — Actualités — Corder ASBL`);
    });
  }

  /** Les liens internes du contenu (HTML de l'administration) passent par le routeur : pas de rechargement complet */
  protected onContentClick(event: MouseEvent): void {
    const link = (event.target as HTMLElement).closest('a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    this.router.navigateByUrl(url.pathname + url.search + url.hash);
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(location.href);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      // Presse-papiers indisponible (navigateur ancien, http) : rien à faire, le lien reste dans la barre d'adresse
    }
  }

  protected shareLink(network: 'linkedin' | 'facebook' | 'email'): string {
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(this.article()?.title ?? '');
    switch (network) {
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'email':
        return `mailto:?subject=${text}&body=${url}`;
    }
  }
}
