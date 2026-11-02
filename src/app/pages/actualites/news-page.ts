import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Icon } from '../../shared/ui/icon/icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { ArticleCard } from '../../shared/ui/article-card/article-card';
import { NewsService } from '../../core/services/news.service';
import { dataOf, loadState } from '../../core/api/load-state';

const PAGE_SIZE = 9;

@Component({
  selector: 'app-news-page',
  imports: [RouterLink, DatePipe, Icon, PageHeader, ArticleCard],
  templateUrl: './news-page.html',
  styleUrl: './news-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPage {
  private readonly news = inject(NewsService);

  protected readonly state = loadState(this.news.allArticles());
  protected readonly alertsState = loadState(this.news.latestAlerts(5));
  private readonly articles = computed(() => dataOf(this.state()) ?? []);
  protected readonly alerts = computed(() => dataOf(this.alertsState()) ?? []);

  /** Catégories présentes, avec leur nombre d'articles */
  protected readonly categories = computed(() => {
    const counts = new Map<string, { slug: string; label: string; count: number }>();
    for (const { category } of this.articles()) {
      const entry = counts.get(category.slug) ?? { ...category, count: 0 };
      entry.count++;
      counts.set(category.slug, entry);
    }
    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  });

  // Filtre dans l'URL (?categorie=…) : liens partageables, retour arrière conservé
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });
  protected readonly category = computed(() => this.params().get('categorie'));
  protected readonly categoryLabel = computed(
    () => this.categories().find((c) => c.slug === this.category())?.label ?? null,
  );

  private readonly filtered = computed(() =>
    this.articles().filter((a) => !this.category() || a.category.slug === this.category()),
  );

  /** Article à la une : seulement sur la vue « Toutes » */
  protected readonly featured = computed(() =>
    this.category() ? null : (this.filtered().find((a) => a.featured) ?? null),
  );

  private readonly rest = computed(() => this.filtered().filter((a) => a !== this.featured()));
  private readonly limit = linkedSignal({ source: this.rest, computation: () => PAGE_SIZE });
  protected readonly visible = computed(() => this.rest().slice(0, this.limit()));
  protected readonly remaining = computed(() => this.rest().length - this.visible().length);
  protected readonly total = computed(() => this.filtered().length);

  protected showMore(): void {
    this.limit.update((n) => n + PAGE_SIZE);
  }
}
