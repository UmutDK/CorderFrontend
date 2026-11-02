import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { ContactRequest, NewsletterRequest, SubmitResponse } from '../models/forms';

@Injectable({ providedIn: 'root' })
export class FormsService {
  private readonly api = inject(ApiService);

  /** POST /contact */
  sendContact(request: ContactRequest): Observable<SubmitResponse> {
    return this.api.post<SubmitResponse>('contact', request);
  }

  /** POST /newsletter/subscriptions */
  subscribeNewsletter(request: NewsletterRequest): Observable<SubmitResponse> {
    return this.api.post<SubmitResponse>('newsletter/subscriptions', request);
  }
}
