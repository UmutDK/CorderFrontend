// Contenus éditoriaux simples, modifiables par Corder depuis l'administration

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

/** Membre de l'équipe : GET /team (ordre d'affichage défini par Corder) */
export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  /** board : conseil d'administration · staff : équipe opérationnelle */
  group: 'board' | 'staff';
  email: string | null;
  /** URL d'une photo carrée, null = initiales */
  photo: string | null;
}

export interface KeyFigure {
  id: number;
  /** Texte libre pour garder la mise en forme : « 20+ », « 1 500+ » */
  value: string;
  label: string;
}
