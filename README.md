# Cabas

Liste de courses partagée, à deux. Projet d'entraînement complet (API, backend, frontend, déploiement, devops) pensé pour un usage réel au quotidien.

## Stack technique

- **Monorepo** : pnpm workspaces (`apps/api`, `apps/web`)
- **Backend** : [Fastify](https://fastify.dev) + TypeScript, [Prisma ORM](https://www.prisma.io) + PostgreSQL (via Docker en local)
- **Frontend** : [Next.js](https://nextjs.org) (App Router) + Tailwind CSS v4
- **Temps réel** : Server-Sent Events (`@fastify/sse`)
- **Auth maison** : sessions par cookie, connexion par code OTP envoyé par email (Resend, domaine `mail.nivlem.fr` vérifié). Google Auth prévu mais jamais branché (bouton visible, désactivé)
- **Composants réutilisables** : `Button`, `TextInput`, `Card`

## Modèle de données

```
Household (foyer) ↔ User(s)
Household → List(s) → Item(s)
Session (liée à un User)
LoginCode (code OTP par email)
```

- Chaque `User` appartient à un seul `Household`, rejoint via un code d'invitation (`inviteCode`).
- Chaque `List` et ses `Item`s appartiennent à un `Household` — isolation stricte entre foyers.

## Structure du monorepo

```
cabas/
├── docker-compose.yml       # Postgres local
├── apps/
│   ├── api/                 # Backend Fastify + Prisma
│   │   ├── prisma/          # schema.prisma + migrations
│   │   └── src/
│   │       ├── routes/      # auth, lists, items, events (SSE), health
│   │       ├── lib/         # session, broadcast (SSE)
│   │       └── generated/   # client Prisma généré (ne pas éditer)
│   └── web/                 # Frontend Next.js (App Router)
│       └── src/
│           ├── app/         # pages : login, mes listes, détail d'une liste
│           ├── components/  # Button, TextInput, Card
│           └── lib/         # client API, types
```

## Lancer le projet en local

### Prérequis

- Node.js
- pnpm (`pnpm@11.20.0`, voir `packageManager` dans les `package.json`)
- Docker (pour PostgreSQL)

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Lancer PostgreSQL (Docker)

```bash
docker compose up -d
```

Postgres est exposé sur le port `4242` (user/password/db : `cabas`).

### 3. Configurer les variables d'environnement

Dans `apps/api/.env` :

```
DATABASE_URL=postgresql://cabas:cabas@localhost:4242/cabas
RESEND_API_KEY=...
```

### 4. Appliquer les migrations Prisma

```bash
cd apps/api
pnpm prisma migrate dev
```

### 5. Lancer les deux serveurs de dev

Dans deux terminaux séparés, depuis la racine :

```bash
pnpm --filter api dev
```

```bash
pnpm --filter web dev
```

L'API tourne par défaut sur son port Fastify, le frontend Next.js sur `http://localhost:3000`.

## État actuel

Tout tourne en local (Docker pour Postgres, deux serveurs `pnpm dev`). Jamais déployé en ligne. Premier commit et push GitHub faits récemment.

## Roadmap / à faire

- [ ] Brancher Google Auth (bouton déjà présent dans l'UI, désactivé)
- [ ] Déploiement (Vercel pour le web, Railway ou équivalent pour l'API + Postgres — jamais lancé)
- [ ] Limiter les tentatives sur `/auth/otp/verify` (aujourd'hui seule la demande de code est throttlée, 3 par 10 minutes)
- [ ] Accès réel depuis mobile (bloqué en test, changements annulés, jamais résolu jusqu'au bout)
- [ ] Style plus personnel — l'UI actuelle est jugée trop générique
- [ ] Extraire `DeleteAction` en composant réutilisable (mineur)
- [ ] Mettre en place la CI/CD (GitHub Actions), jamais attaqué
