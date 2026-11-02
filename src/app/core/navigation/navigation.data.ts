import { IconName } from '../../shared/ui/icon/icon';

export type Accent = 'clinique' | 'crp' | 'phytolicence' | 'recherche' | 'formation';

export interface NavLink {
  label: string;
  /** Route interne (routerLink) */
  route?: string;
  /** Lien externe (ouvre un nouvel onglet) */
  href?: string;
  description?: string;
  icon?: IconName;
  accent?: Accent;
}

export interface NavGroup {
  title?: string;
  links: NavLink[];
  more?: NavLink;
}

export interface NavAside {
  eyebrow: string;
  title: string;
  text: string;
  cta: NavLink;
}

export interface NavItem {
  label: string;
  route?: string;
  mega?: {
    /** cards : grandes cartes colorées (pôles) · columns : colonnes de liens */
    layout: 'cards' | 'columns';
    groups: NavGroup[];
    aside?: NavAside;
  };
}

export const POLES: NavLink[] = [
  {
    label: 'Clinique des plantes',
    route: '/clinique-des-plantes',
    description: 'Analyses en laboratoire et diagnostic des maladies, ravageurs et carences.',
    icon: 'sprout',
    accent: 'clinique',
  },
  {
    label: 'Cellule CRP',
    route: '/crp',
    description: 'Information objective sur la législation des produits phytopharmaceutiques.',
    icon: 'shield',
    accent: 'crp',
  },
  {
    label: 'Cellule phytolicence',
    route: '/phytolicence',
    description: 'Obtention, renouvellement et suivi de votre phytolicence.',
    icon: 'book',
    accent: 'phytolicence',
  },
  {
    label: 'Projets de recherche',
    route: '/projets-de-recherche',
    description: 'Projets pour une protection intégrée et raisonnée des cultures.',
    icon: 'flask',
    accent: 'recherche',
  },
];

export const PRIMARY_NAV: NavItem[] = [
  {
    label: 'Nos services',
    mega: {
      layout: 'cards',
      groups: [{ links: POLES }],
      aside: {
        eyebrow: 'Besoin d’aide ?',
        title: 'Vous ne savez pas à qui vous adresser ?',
        text: 'Décrivez votre situation, nous orientons votre demande vers le bon service.',
        cta: { label: 'Poser une question', route: '/contact' },
      },
    },
  },
  {
    label: 'Phyto & législation',
    mega: {
      layout: 'columns',
      groups: [
        {
          title: 'Professionnels agricoles & horticoles',
          links: [
            { label: 'Protection durable des végétaux', route: '/legislation/agricoles/protection-durable' },
            { label: 'Produits phytopharmaceutiques', route: '/legislation/agricoles/produits' },
            { label: 'Utilisation et bonnes pratiques', route: '/legislation/agricoles/utilisation' },
            { label: 'Stockage et traçabilité', route: '/legislation/agricoles/stockage' },
            { label: 'Autocontrôle et contrôles', route: '/legislation/agricoles/controles' },
          ],
          more: { label: 'Tous les thèmes', route: '/legislation/agricoles' },
        },
        {
          title: 'Autres professionnels',
          links: [
            { label: 'Protection durable des végétaux', route: '/legislation/professionnels/protection-durable' },
            { label: 'Produits phytopharmaceutiques', route: '/legislation/professionnels/produits' },
            { label: 'Utilisation', route: '/legislation/professionnels/utilisation' },
            { label: 'Stockage et traçabilité', route: '/legislation/professionnels/stockage' },
            { label: 'Contrôles', route: '/legislation/professionnels/controles' },
          ],
          more: { label: 'Tous les thèmes', route: '/legislation/professionnels' },
        },
        {
          title: 'Particuliers',
          links: [
            { label: 'Protection durable des végétaux', route: '/legislation/particuliers/protection-durable' },
            { label: 'Produits autorisés', route: '/legislation/particuliers/produits' },
            { label: 'Bonnes pratiques', route: '/legislation/particuliers/utilisation' },
            { label: 'Environnement', route: '/legislation/particuliers/environnement' },
            { label: 'Santé', route: '/legislation/particuliers/sante' },
          ],
        },
        {
          title: 'Boîte à outils',
          links: [
            { label: 'Bulletins', route: '/legislation/bulletins' },
            { label: 'Listes phyto', route: '/legislation/listes-phyto' },
            { label: 'Publications', route: '/publications' },
            { label: 'Contacts utiles', route: '/legislation/contacts-utiles' },
          ],
        },
      ],
      aside: {
        eyebrow: 'Cellule CRP',
        title: 'Une question réglementaire ?',
        text: 'Nos conseillers vous répondent gratuitement et en toute indépendance.',
        cta: { label: 'Poser ma question', route: '/contact' },
      },
    },
  },
  {
    label: 'Phytolicence',
    mega: {
      layout: 'columns',
      groups: [
        {
          title: 'Ma phytolicence',
          links: [
            { label: 'Qu’est-ce qu’une phytolicence ?', route: '/phytolicence' },
            { label: 'Faire une demande', route: '/phytolicence/demande' },
            { label: 'Renouveler ma phytolicence', route: '/phytolicence/renouvellement' },
            { label: 'Mon compte PL', route: '/phytolicence/mon-compte' },
          ],
        },
        {
          title: 'Évaluation',
          links: [
            { label: 'Agenda des évaluations', route: '/phytolicence/evaluations' },
            // Quiz d'entraînement hébergé par Corder (lien repris de l'actuel corder.be)
            { label: 'Exemples de questions', href: 'https://quiz.corderapp.be' },
          ],
        },
        {
          title: 'Formations',
          links: [
            { label: 'Formations continues', route: '/formations' },
            { label: 'Formations initiales', route: '/formations' },
            { label: 'Trouver un centre agréé', route: '/phytolicence/centres' },
            { label: 'Devenir centre agréé', route: '/phytolicence/devenir-centre' },
          ],
        },
      ],
      aside: {
        eyebrow: 'Échéance 2027-2028',
        title: 'Votre phytolicence expire bientôt ?',
        text: 'De nombreuses phytolicences arrivent à échéance. Anticipez votre renouvellement.',
        cta: { label: 'Renouveler ma phytolicence', route: '/phytolicence/renouvellement' },
      },
    },
  },
  {
    label: 'Outils',
    mega: {
      layout: 'columns',
      groups: [
        {
          title: 'Registres',
          links: [
            {
              label: 'APPI’Field',
              route: '/outils/appi-field',
              description: 'Enregistrez et consultez vos utilisations de PPP.',
              icon: 'database',
            },
            {
              label: 'Registre électronique',
              route: '/outils/registre',
              description: 'Votre journal de traitements réglementaire.',
              icon: 'file-text',
            },
          ],
        },
        {
          title: 'Données & pratiques',
          links: [
            {
              label: 'Réduction des intrants',
              route: '/outils/reduction-intrants',
              description: 'Bonnes pratiques et indicateurs.',
              icon: 'leaf',
            },
            {
              label: 'Indicateurs',
              route: '/outils/indicateurs',
              description: 'Tableaux de bord sur l’utilisation des PPP.',
              icon: 'chart',
            },
          ],
        },
        {
          title: 'Ressources',
          links: [
            {
              label: 'Publications',
              route: '/publications',
              description: 'Fiches techniques, rapports et guides.',
              icon: 'file-text',
            },
            {
              label: 'FAQ',
              route: '/faq',
              description: 'Les questions les plus fréquentes.',
              icon: 'help',
            },
          ],
        },
      ],
      aside: {
        eyebrow: 'Nouveau · v3.2',
        title: 'APPI’Field évolue',
        text: 'Saisie simplifiée du biocontrôle et meilleure compatibilité mobile.',
        cta: { label: 'Découvrir', route: '/outils/appi-field' },
      },
    },
  },
  { label: 'Formations', route: '/formations' },
  { label: 'Actualités', route: '/actualites' },
  { label: 'À propos', route: '/a-propos' },
];

export const QUICK_LINKS: NavLink[] = [
  { label: 'Contact', route: '/contact' },
  { label: 'Newsletter', route: '/newsletter' },
];

export const FOOTER_NAV: NavLink[] = [
  { label: 'Phyto & législation', route: '/legislation' },
  { label: 'Phytolicence', route: '/phytolicence' },
  { label: 'Outils', route: '/outils' },
  { label: 'Formations', route: '/formations' },
  { label: 'Actualités', route: '/actualites' },
  { label: 'À propos', route: '/a-propos' },
  { label: 'Contact', route: '/contact' },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: 'Conditions générales', route: '/conditions-generales' },
  { label: 'Vie privée', route: '/vie-privee' },
  { label: 'Accessibilité', route: '/accessibilite' },
  { label: 'Cookies', route: '/cookies' },
];

export const CONTACT = {
  addressLines: ['Croix du Sud 2, L7.05.03', '1348 Louvain-la-Neuve'],
  phone: '010 47 37 54',
  phoneHref: 'tel:+3210473754',
  email: 'info@corder.be',
};

// Pages officielles, liées depuis corder.be
export const SOCIAL_LINKS: (NavLink & { icon: IconName })[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/corder-asbl', icon: 'linkedin' },
  { label: 'Facebook', href: 'https://www.facebook.com/CORDERasbl', icon: 'facebook' },
];
