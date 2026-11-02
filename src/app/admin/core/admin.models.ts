import { LicenceType } from '../../core/models/training';
import { Accent } from '../../core/navigation/navigation.data';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export interface AdminStats {
  articlesPublished: number;
  articlesDraft: number;
  trainingsUpcoming: number;
  registrationsLast30Days: number;
  messagesLast30Days: number;
  newsletterSubscribers: number;
}

/** draft = brouillon · scheduled = date de publication future · published = visible sur le site */
export type PublicationStatus = 'draft' | 'scheduled' | 'published';

export interface Category {
  id: number;
  slug: string;
  label: string;
}

/** Ligne de la liste des actualités (GET /admin/articles) */
export interface AdminArticleRow {
  id: number;
  slug: string;
  title: string;
  category: { slug: string; label: string };
  pole: Accent | null;
  featured: boolean;
  alertLevel: 'urgent' | 'info' | null;
  status: PublicationStatus;
  publishedAt: string | null;
  updatedAt: string;
}

/** Article complet, tel que modifié dans le formulaire (GET / PUT /admin/articles/{id}) */
export interface AdminArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  categoryId: number;
  pole: Accent | null;
  imageUrl: string | null;
  imageAlt: string;
  featured: boolean;
  alertLevel: 'urgent' | 'info' | null;
  status: PublicationStatus;
  /** null = brouillon */
  publishedAt: string | null;
  updatedAt: string | null;
}

export type AdminArticleInput = Omit<AdminArticle, 'id' | 'status' | 'updatedAt' | 'slug'> & {
  /** null = généré à partir du titre */
  slug: string | null;
};

// ---------- Formations ----------

/** Ligne de la liste des formations (GET /admin/trainings) */
export interface AdminTrainingRow {
  id: number;
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  licenceType: LicenceType;
  capacity: number;
  registered: number;
  registrationDeadline: string;
  isPublished: boolean;
}

export interface ProgramStep {
  time: string;
  title: string;
}

/** Formation complète, telle que modifiée dans le formulaire */
export interface AdminTraining {
  id: number;
  slug: string;
  title: string;
  summary: string;
  audience: string;
  objectives: string[];
  program: ProgramStep[];
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  location: string;
  licenceType: LicenceType;
  price: number;
  capacity: number;
  registered: number;
  online: boolean;
  venueName: string | null;
  venueAddress: string | null;
  onlineUrl: string | null;
  isPublished: boolean;
}

export type AdminTrainingInput = Omit<AdminTraining, 'id' | 'registered' | 'slug'> & { slug: string | null };

/** Inscrit (GET /admin/registrations) */
export interface AdminRegistration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenceNumber: string | null;
  organization: string | null;
  createdAt: string;
  training: { id: number; title: string; slug: string; startsAt: string };
}

/** Erreur renvoyée par l'API : { ok: false, error, fields? } */
export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}
