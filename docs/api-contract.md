# Contrat d'API — site Corder

Ce document décrit ce que le frontend Angular attend du backend. Il est implémenté en PHP pur dans le dépôt backend (voir son README.md). Toute évolution doit être faite des deux côtés.

Des exemples complets de réponses se trouvent dans `public/data/*.json` : le frontend les utilise tant que l'API n'existe pas. **Une réponse de l'API doit avoir exactement la même forme que ces fichiers.**

## Règles générales

- **Base** : en production, l'API est sur le même domaine que le site, à `https://corder.be/api`. Toutes les routes ci-dessous sont relatives à cette base. En local, elle est à `http://localhost:8000`.
- **Format** : JSON en UTF-8 (`Content-Type: application/json; charset=utf-8`).
- **Dates** : ISO 8601 **avec fuseau**, par exemple `2026-11-05T09:00:00+01:00`.
- **Prix** : en euros TTC, nombre entier ou décimal, par exemple `45` ou `12.5`.
- **Textes** : en clair. Le frontend n'interprète pas le HTML, sauf mention contraire.
- **CORS** : seules les origines listées dans `CORS_ORIGINS` (fichier `.env` du backend) sont autorisées. En développement : `http://localhost:4200` et `http://localhost:4400`.
- **Listes** : toujours renvoyées dans cette enveloppe :

```json
{
  "data": [ /* éléments */ ],
  "meta": { "total": 42 }
}
```

`meta.total` est le nombre total d'éléments correspondant à la requête, avant `limit`. Il servira à la pagination des pages intérieures.

- **Erreurs** : code HTTP adapté (`400`, `404`, `405`, `409`, `422`, `429`, `500`) avec ce corps :

```json
{ "ok": false, "error": "validation_failed", "fields": { "email": "Adresse invalide" } }
```

`fields` n'est présent que pour les erreurs de validation (`422`).

Codes `error` possibles :

| Code | Statut | Cas |
|---|---|---|
| `invalid_json` | 400 | Corps de la requête illisible |
| `not_found` | 404 | Route ou slug inconnu |
| `method_not_allowed` | 405 | Mauvaise méthode HTTP |
| `full` | 409 | Formation complète |
| `closed` | 409 | Date limite d'inscription dépassée |
| `already_registered` | 409 | Cette adresse e-mail est déjà inscrite à la formation |
| `validation_failed` | 422 | Champs invalides, détail dans `fields` |
| `too_many_requests` | 429 | Anti-spam : trop d'envois depuis la même adresse IP en une heure |
| `server_error` | 500 | Erreur inattendue, journalisée côté serveur |

## Lecture (GET)

### `GET /articles`

Actualités, de la plus récente à la plus ancienne, **sans les alertes**.

| Paramètre | Type | Défaut | Rôle |
|---|---|---|---|
| `limit` | entier | aucun (tous) | Nombre maximum d'éléments, 200 au plus |
| `category` | texte | aucun | Slug de catégorie |

Élément (`Article`) :

| Champ | Type | Description |
|---|---|---|
| `id` | entier | Identifiant |
| `slug` | texte | Identifiant d'URL unique, sans accents (`/actualites/{slug}`) |
| `title` | texte | Titre |
| `excerpt` | texte | Résumé de 1 à 2 phrases |
| `publishedAt` | date ISO | Date de publication |
| `category` | objet | `{ "slug": "phytolicence", "label": "Phytolicence" }` |
| `pole` | texte ou `null` | Pôle lié : `clinique`, `crp`, `phytolicence`, `recherche`, `formation`. Il détermine la couleur affichée. |
| `image` | objet ou `null` | `{ "url": "https://…/photo.jpg", "alt": "Description" }` |
| `featured` | booléen | Article mis en avant sur l'accueil. Un seul à la fois de préférence. |

La page /actualites charge tous les articles et filtre par catégorie côté frontend. Au-delà d'une centaine d'articles, il faudra ajouter un paramètre `page`.

### `GET /articles/{slug}`

Article complet, dans l'enveloppe `{ "data": { … } }`. Exemples dans `public/data/articles/*.json`. **Ce endpoint doit aussi répondre pour le slug d'une alerte** : une alerte est publiée comme un article (catégorie `alertes`), et `/alerts` n'en donne que la liste courte.

Tous les champs d'`Article`, plus :

| Champ | Type | Description |
|---|---|---|
| `body` | texte HTML | Contenu issu de l'éditeur de l'administration. Balises attendues : `p`, `h2`, `h3`, `ul`, `ol`, `li`, `a`, `strong`, `em`, `blockquote`, `img`, `table`. **Le backend doit nettoyer ce HTML** (pas de `script`, pas d'attributs `on…`). Angular le nettoie aussi, mais par sécurité les deux côtés doivent le faire. Pas de `h1` : le titre est déjà affiché par la page. |
| `updatedAt` | date ISO ou `null` | Date de mise à jour, affichée si présente |

Si le slug n'existe pas, répondre `404`.

### `GET /alerts`

Alertes réglementaires, de la plus récente à la plus ancienne. Paramètre : `limit`.

| Champ | Type | Description |
|---|---|---|
| `id`, `slug`, `title`, `publishedAt` | | Comme pour les articles |
| `level` | texte | `urgent` (échéance, retrait) ou `info` |

### `GET /trainings`

Formations, de la plus proche à la plus lointaine.

| Paramètre | Type | Rôle |
|---|---|---|
| `upcoming` | `true` | Uniquement les formations qui n'ont pas encore commencé |

| Champ | Type | Description |
|---|---|---|
| `id`, `slug`, `title` | | |
| `startsAt`, `endsAt` | date ISO | Début et fin |
| `location` | texte | Ville, ou `En ligne` |
| `licenceType` | texte | `NP`, `P1`, `P2` ou `P3` |
| `price` | nombre | En euros TTC, `0` = gratuit |
| `seatsLeft` | entier | Places restantes, `0` = complet |

Le filtrage par lieu et par type se fait pour l'instant côté frontend. Pour la future page agenda complète, prévoir les paramètres `location`, `licenceType`, `page` et `limit`.

### `GET /trainings/{slug}`

Fiche complète d'une formation. La réponse n'est pas une liste : elle est enveloppée dans `{ "data": { … } }`. Exemples dans `public/data/trainings/*.json`.

Tous les champs de la liste, plus :

| Champ | Type | Description |
|---|---|---|
| `summary` | texte | Accroche de 1 à 2 phrases, affichée sous le titre |
| `audience` | texte | Public visé |
| `objectives` | liste de textes | Objectifs, un par ligne |
| `program` | liste | `[{ "time": "9h00", "title": "Accueil" }, …]` |
| `venue` | objet ou `null` | `{ "name": "…", "address": "…" }` ; `null` = en ligne |
| `capacity` | entier | Nombre total de places |
| `registrationDeadline` | date ISO | Après cette date, le formulaire d'inscription est remplacé par un message |

Si le slug n'existe pas, répondre `404`. Le frontend affiche alors « Cette formation est introuvable ».

### `GET /team`

Membres de l'équipe, dans l'ordre d'affichage.

| Champ | Type | Description |
|---|---|---|
| `id` | entier | |
| `firstName`, `lastName`, `role` | texte | |
| `group` | texte | `board` (conseil d'administration) ou `staff` |
| `email` | texte ou `null` | |
| `photo` | texte ou `null` | URL de la photo ; sans photo, le frontend affiche les initiales |

### `GET /faq`

Questions fréquentes, **dans l'ordre choisi par Corder** dans l'administration.

| Champ | Type |
|---|---|
| `id` | entier |
| `question` | texte |
| `answer` | texte |

### `GET /key-figures`

Chiffres clés de la section « Qui sommes-nous ? », dans l'ordre d'affichage. Quatre éléments sont attendus.

| Champ | Type | Description |
|---|---|---|
| `id` | entier | |
| `value` | texte | Libre, pour garder la mise en forme : `20+`, `1 500+` |
| `label` | texte | `années d’expertise` |

## Envoi (POST)

Les deux routes répondent `201` avec `{ "ok": true }` en cas de succès.

### `POST /contact`

```json
{
  "name": "Marie Dupont",
  "email": "marie@example.be",
  "phone": "0470 12 34 56",
  "profile": "Agriculteur / horticulteur",
  "pole": "clinique",
  "message": "Mes plants de tomates présentent des taches brunes…",
  "consent": true
}
```

- `phone` peut valoir `null`.
- `pole` vaut `null` quand l'utilisateur a choisi « Je ne sais pas, orientez-moi ».
- **Côté backend :**
  - revalider tous les champs, sans jamais faire confiance au frontend ;
  - refuser si `consent` n'est pas `true` ;
  - limiter le nombre d'envois par adresse IP, contre le spam ;
  - envoyer un e-mail au service concerné, ou à info@corder.be si `pole` vaut `null`.

### `POST /trainings/{slug}/registrations`

```json
{
  "firstName": "Marie",
  "lastName": "Dupont",
  "email": "marie@example.be",
  "phone": "0470 12 34 56",
  "licenceNumber": "P2-123456",
  "organization": null,
  "consent": true
}
```

- `licenceNumber` et `organization` peuvent valoir `null`.
- **Côté backend :**
  - vérifier **au moment de l'enregistrement** qu'il reste une place et que la date limite n'est pas dépassée. Deux personnes peuvent valider en même temps : utiliser une transaction ou un verrou ;
  - si c'est complet, répondre `409` avec `{ "ok": false, "error": "full" }` ; après la date limite, `409` avec `closed` ; si l'adresse e-mail est déjà inscrite, `409` avec `already_registered` ;
  - envoyer un e-mail de confirmation avec les informations pratiques, et le lien de connexion si la formation est en ligne ;
  - `seatsLeft` n'est pas stocké : il est calculé (`capacity` moins le nombre d'inscriptions).

### `POST /newsletter/subscriptions`

```json
{ "email": "marie@example.be", "consent": true }
```

- **Double confirmation (RGPD)** : un e-mail contient un lien vers `GET /newsletter/confirm?token=…`. L'inscription n'est active qu'après ce clic. Ce lien affiche lui-même une petite page HTML « Inscription confirmée ».
- Si l'adresse est déjà inscrite, répondre quand même `201` avec `{ "ok": true }`, pour ne pas révéler qui est inscrit.

## Brancher le frontend sur l'API

La source des données dépend de la configuration de build (`src/environments/`) :

| Commande | Données |
|---|---|
| `npm start` | Fichiers JSON de `public/data` (aucun backend nécessaire) |
| `npm run start:api` | API PHP locale sur `http://localhost:8000` |
| `ng build` (production) | `/api` sur le même domaine |

Aucun composant n'est à modifier : tous les appels passent par `src/app/core/api/api.service.ts`.
