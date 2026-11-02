import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { NewsService } from '../../../../core/services/news.service';
import { dataOf, loadState } from '../../../../core/api/load-state';

@Component({
  selector: 'app-news',
  imports: [RouterLink, DatePipe, Icon],
  templateUrl: './news.html',
  styleUrl: './news.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class News {
  private readonly news = inject(NewsService);

  protected readonly articlesState = loadState(this.news.latestArticles(4));
  protected readonly alertsState = loadState(this.news.latestAlerts(3));

  /** L'article mis en avant, sinon le plus récent */
  protected readonly featured = computed(() => {
    const articles = dataOf(this.articlesState()) ?? [];
    return articles.find((a) => a.featured) ?? articles[0] ?? null;
  });

  protected readonly others = computed(() =>
    (dataOf(this.articlesState()) ?? []).filter((a) => a !== this.featured()).slice(0, 3),
  );

  protected readonly alerts = computed(() => dataOf(this.alertsState()) ?? []);
}
