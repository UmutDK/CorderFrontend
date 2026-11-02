import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG } from '../api/api.config';
import { NewsService } from './news.service';

function setup(mock: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: { baseUrl: mock ? 'data' : 'https://api.test', mock } },
    ],
  });
  return { service: TestBed.inject(NewsService), http: TestBed.inject(HttpTestingController) };
}

const article = (id: number, publishedAt: string) => ({ id, publishedAt });

describe('NewsService', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('lit le fichier JSON en mode mock, trie du plus récent au plus ancien et limite', async () => {
    const { service, http } = setup(true);
    const result = firstValueFrom(service.latestArticles(2));

    http.expectOne('data/articles.json').flush({
      data: [article(1, '2026-09-01'), article(2, '2026-10-01'), article(3, '2026-08-01')],
      meta: { total: 3 },
    });

    expect((await result).map((a) => a.id)).toEqual([2, 1]);
  });

  it('appelle la vraie API avec le paramètre limit', async () => {
    const { service, http } = setup(false);
    const result = firstValueFrom(service.latestAlerts(3));

    http.expectOne('https://api.test/alerts?limit=3').flush({ data: [], meta: { total: 0 } });

    expect(await result).toEqual([]);
  });
});
