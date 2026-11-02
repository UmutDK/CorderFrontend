import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../api/api.service';
import { FaqItem, KeyFigure, TeamMember } from '../models/content';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly api = inject(ApiService);

  /** GET /faq — dans l'ordre défini par Corder */
  faq(): Observable<FaqItem[]> {
    return this.api.list<FaqItem>('faq').pipe(map((res) => res.data));
  }

  /** GET /team */
  team(): Observable<TeamMember[]> {
    return this.api.list<TeamMember>('team').pipe(map((res) => res.data));
  }

  /** GET /key-figures */
  keyFigures(): Observable<KeyFigure[]> {
    return this.api.list<KeyFigure>('key-figures').pipe(map((res) => res.data));
  }
}
