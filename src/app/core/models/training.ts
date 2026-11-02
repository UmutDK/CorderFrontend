export type LicenceType = 'NP' | 'P1' | 'P2' | 'P3';

export const LICENCE_TYPES: { code: LicenceType; label: string }[] = [
  { code: 'NP', label: 'Distribution / conseil de produits non professionnels' },
  { code: 'P1', label: 'Assistant usage professionnel' },
  { code: 'P2', label: 'Usage professionnel' },
  { code: 'P3', label: 'Distribution / conseil de produits professionnels' },
];

export interface Training {
  id: number;
  slug: string;
  title: string;
  /** Date-heure ISO 8601 avec fuseau, ex. 2026-11-05T09:00:00+01:00 */
  startsAt: string;
  endsAt: string;
  /** Ville, ou « En ligne » */
  location: string;
  licenceType: LicenceType;
  /** Prix en euros TTC, 0 = gratuit */
  price: number;
  /** Places restantes, 0 = complet */
  seatsLeft: number;
}

/** Fiche complète d'une formation : GET /trainings/{slug} */
export interface TrainingDetail extends Training {
  summary: string;
  /** Public visé, en une phrase */
  audience: string;
  objectives: string[];
  program: { time: string; title: string }[];
  /** null = formation en ligne (le lien est envoyé par e-mail) */
  venue: { name: string; address: string } | null;
  /** Nombre total de places */
  capacity: number;
  /** Date ISO après laquelle les inscriptions sont fermées */
  registrationDeadline: string;
}

/** Corps de POST /trainings/{slug}/registrations */
export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Numéro de phytolicence (formations continues), null si pas encore de phytolicence */
  licenceNumber: string | null;
  organization: string | null;
  consent: true;
}
