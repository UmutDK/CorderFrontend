import { Accent } from '../navigation/navigation.data';

export interface Article {
  id: number;
  /** Identifiant d'URL : /actualites/{slug} */
  slug: string;
  title: string;
  excerpt: string;
  /** Date ISO 8601 */
  publishedAt: string;
  category: { slug: string; label: string };
  /** Pôle lié (couleur d'accent), null si article général */
  pole: Accent | null;
  image: { url: string; alt: string } | null;
  /** Mis en avant en tête des actualités */
  featured: boolean;
}

/** Article complet : GET /articles/{slug} (aussi valable pour le slug d'une alerte) */
export interface ArticleDetail extends Article {
  /** Contenu en HTML simple issu de l'éditeur de l'administration (p, h2, h3, ul, ol, a, strong, em, blockquote) */
  body: string;
  /** Mise à jour éventuelle après publication */
  updatedAt: string | null;
}

export interface Alert {
  id: number;
  slug: string;
  title: string;
  publishedAt: string;
  /** urgent : échéance ou retrait · info : changement à connaître */
  level: 'urgent' | 'info';
}
