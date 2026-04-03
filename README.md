# HanziLane

A DuChinese-like proof of concept built with Next.js, Tailwind, and shadcn/ui.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Run with Docker Compose

```bash
docker compose up --build
```

This starts:
- `db`: PostgreSQL 16 on `localhost:5432`
- `app`: HanziLane on `http://localhost:3000`

On startup the app waits for Postgres, applies Prisma migrations, seeds the starter stories, and then launches Next.js.
