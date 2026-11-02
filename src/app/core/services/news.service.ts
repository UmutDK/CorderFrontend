import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../api/api.service';
import { Alert, Article, ArticleDetail } from '../models/article';

const byDateDesc = (a: { publishedAt: string }, b: { publishedAt: string }) =>
  b.publishedAt.localeCompare(a.publishedAt);

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly api = inject(ApiService);

  /** GET /articles?limit= — les plus récents d'abord */
  latestArticles(limit: number): Observable<Article[]> {
    return this.api
      .list<Article>('articles', { limit })
      .pipe(map((res) => [...res.data].sort(byDateDesc).slice(0, limit)));
  }

  /** GET /articles — tous les articles, filtrés et paginés côté page */
  allArticles(): Observable<Article[]> {
    return this.api.list<Article>('articles').pipe(map((res) => [...res.data].sort(byDateDesc)));
  }

  /** GET /articles/{slug} */
  articleBySlug(slug: string): Observable<ArticleDetail> {
    return this.api.get<ArticleDetail>(`articles/${encodeURIComponent(slug)}`);
  }

  /** GET /alerts?limit= */
  latestAlerts(limit: number): Observable<Alert[]> {
    return this.api
      .list<Alert>('alerts', { limit })
      .pipe(map((res) => [...res.data].sort(byDateDesc).slice(0, limit)));
  }
}
