import { Accent } from '../navigation/navigation.data';

/** Corps de POST /contact */
export interface ContactRequest {
  name: string;
  email: string;
  phone: string | null;
  profile: string;
  /** Pôle concerné, null = « Je ne sais pas, orientez-moi » */
  pole: Accent | null;
  message: string;
  consent: true;
}

/** Corps de POST /newsletter/subscriptions */
export interface NewsletterRequest {
  email: string;
  consent: true;
}

export interface SubmitResponse {
  ok: boolean;
}
