import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../api/api.service';
import { SubmitResponse } from '../models/forms';
import { RegistrationRequest, Training, TrainingDetail } from '../models/training';

@Injectable({ providedIn: 'root' })
export class TrainingsService {
  private readonly api = inject(ApiService);

  /** GET /trainings?upcoming=true — formations à venir, de la plus proche à la plus lointaine */
  upcoming(): Observable<Training[]> {
    return this.api
      .list<Training>('trainings', { upcoming: true })
      .pipe(map((res) => [...res.data].sort((a, b) => a.startsAt.localeCompare(b.startsAt))));
  }

  /** GET /trainings/{slug} */
  bySlug(slug: string): Observable<TrainingDetail> {
    return this.api.get<TrainingDetail>(`trainings/${encodeURIComponent(slug)}`);
  }

  /** POST /trainings/{slug}/registrations */
  register(slug: string, request: RegistrationRequest): Observable<SubmitResponse> {
    return this.api.post<SubmitResponse>(`trainings/${encodeURIComponent(slug)}/registrations`, request);
  }
}
