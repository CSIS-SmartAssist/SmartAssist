# SmartAssist

Monorepo: Next.js (web), FastAPI (RAG), Prisma (DB), shared types, PostgreSQL (Neon).

## Structure

```
SmartAssist/
├── apps/
│   ├── web/          ← Next.js (create with steps below)
│   │   ├── Auth.js   (add after scaffold)
│   │   ├── API Routes
│   │   └── Middleware
│   └── rag-service/  ← Python FastAPI
├── packages/
│   ├── db/           ← Prisma schema (PostgreSQL / Neon)
│   └── types/        ← Shared TypeScript types
└── package.json      (npm workspaces)
```

---

## 1. Create the Next.js app (interactive)

From the **repo root** (`d:\VS\projects\SmartAssist`), run:

```bash
npx create-next-app@latest apps/web
```

When prompted, choose:

- **TypeScript** – Yes
- **ESLint** – Yes
- **Tailwind CSS** – Yes (or per preference)
- **`src/` directory** – Yes (recommended)
- **App Router** – Yes
- **Customize default import alias** – No (or Yes and keep `@/*`)
- **Turbopack for `next dev`** – optional

This creates `apps/web` with App Router, and you can add **Auth.js**, **API routes** (`app/api/...`), and **Middleware** (`middleware.ts`) there afterward.

---

## 2. PostgreSQL (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy the connection string.
2. In repo root (or in `apps/web` if only the web app uses DB), create `.env`:

   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

3. Generate Prisma client and push schema:

   ```bash
   npm install
   npm run db:generate
   npm run db:push
   ```

---

## 3. Install and run

From repo root:

```bash
npm install
```

- **Next.js (web):**  
  `npm run dev:web`  
  (runs from `apps/web`)

- **RAG service (FastAPI):**  
  `cd apps/rag-service` then create a venv, install deps, and run:

  ```bash
  python -m venv .venv
  .venv\Scripts\activate
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8001
  ```

  Or use the npm script: `npm run dev:rag` (requires `uvicorn` on PATH).

- **Prisma Studio:**  
  `npm run db:studio`

---

## 4. After Next.js is created (Auth.js, API, Middleware)

- **Auth.js:** Add `auth.js` (or `auth.config.ts`) in `apps/web` and configure provider(s). Use the [Auth.js Next.js docs](https://authjs.dev/getting-started/installation?framework=Next.js).
- **API routes:** Use `apps/web/app/api/.../route.ts` (App Router).
- **Middleware:** Add `apps/web/middleware.ts` for auth and other cross-cutting logic.

Once you’ve run `npx create-next-app@latest apps/web` and chosen the options above, run **`npm install`** again from the repo root so the workspace picks up `apps/web`. You’ll then have the full monorepo scaffold with Next.js in place.
