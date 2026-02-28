# CSIS SmartAssist

A **smart chatbot + room booking system** for the BITS Goa CS department. Students ask questions about policies, TA forms, and lab rules (AI answers with citations), check room availability, and book rooms. Admins approve/reject bookings (Google Calendar + email), upload documents to the AI knowledge base, and sync a Google Drive folder (manual + daily via Inngest).

---

## Architecture

```
┌──────────────────────────┐
│       USER BROWSER        │
└────────────┬─────────────┘
             │
┌────────────▼──────────────────────────┐
│        NEXT.JS (apps/web)              │
│  Auth (NextAuth + Google) · Bookings   │
│  Admin · Chat proxy · Inngest handler  │
└──────┬──────────────────┬─────────────┘
       │                  │
       │     ┌────────────▼────────────────┐
       │     │   FASTAPI (apps/rag)         │
       │     │   RAG: query, ingest, sync   │
       │     │   pgvector · Groq · Drive    │
       │     └────────────┬────────────────┘
       │                  │
┌──────▼──────────────────▼─────────────┐
│   NEON POSTGRES (single database)      │
│   public: User, Room, Booking, Doc    │
│   rag: embeddings (pgvector)           │
└───────────────────────────────────────┘

INNGEST (external) → 3 AM daily → POST /api/inngest → Next.js calls FastAPI /rag/ingest/sync
```

- **Next.js** = auth, business logic, bookings, admin UI, chat proxy, Inngest. Never calls FastAPI from the browser; all RAG calls are server-side with `x-internal-secret`.
- **FastAPI** = RAG only (query, ingest, Drive sync). Protected by shared secret; only Next.js talks to it.
- **Neon** = one Postgres: public schema (Prisma), `rag` schema (raw SQL for pgvector).
- **Inngest** = daily cron; runs even when the RAG service is asleep (e.g. on Render).

---

## Tech stack

| Layer              | Technology |
|--------------------|------------|
| Frontend + API     | Next.js (App Router), Vercel |
| RAG service        | FastAPI (Python), Render |
| Auth               | NextAuth.js + Google OAuth (domain-restricted) |
| Database           | Neon (serverless Postgres) |
| ORM                | Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Vector store       | pgvector on Neon |
| LLM                | Groq (Llama 3.3 70B) |
| Embeddings         | sentence-transformers (in FastAPI) |
| Cron               | Inngest |

---

## Repository structure

```
SmartAssist/
├── apps/
│   ├── web/                    # Next.js — frontend + API
│   │   ├── src/
│   │   │   ├── app/            # Routes: (auth)/login, chat, bookings, admin
│   │   │   ├── app/api/        # auth, chat, inngest, bookings, admin
│   │   │   ├── components/     # chat, bookings, admin, ui
│   │   │   └── lib/            # auth, inngest, prisma, rag-client, middleware
│   │   └── middleware.ts
│   │
│   └── rag/                    # FastAPI — RAG microservice
│       ├── main.py
│       ├── routers/            # query, ingest
│       ├── rag/                # ingest, query, drive_sync, embeddings, vector_store, chunker, parsers
│       ├── db/, core/
│       ├── Dockerfile
│       └── requirements.txt
│
├── packages/
│   ├── db/                     # Prisma schema + RAG SQL
│   │   ├── prisma/
│   │   │   └── schema.prisma   # User, Room, Booking, Document
│   │   ├── prisma.config.ts    # Prisma 7 — DATABASE_URL for CLI
│   │   ├── migrations/
│   │   │   └── 001_rag_schema.sql   # rag.embeddings + pgvector
│   │   ├── seed.ts
│   │   └── generated/          # Prisma client (gitignored)
│   │
│   └── types/                  # Shared TypeScript types
│
├── .env                        # Not committed; copy from .env.example
├── .env.example
├── package.json                # Workspaces + scripts
└── README.md
```

---

## Prerequisites

- Node 18+
- npm
- Neon account ([neon.tech](https://neon.tech))
- (Optional) Python 3.11+ for local RAG service

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd SmartAssist
npm install
```

`postinstall` in `packages/db` runs `prisma generate`. If `DATABASE_URL` is missing, a placeholder URL is used so install succeeds.

### 2. Environment variables

Create **`.env`** at the **repo root**. Copy from `.env.example` and fill in at least:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

For Neon: use the connection string from the dashboard (pooler or direct). Include `?sslmode=require` (and `&channel_binding=require` if needed).

**Next.js** loads `.env` from its app directory. Either:

- Copy (or symlink) root `.env` to **`apps/web/.env`**, or  
- Create `apps/web/.env` with the same variables the web app needs (`DATABASE_URL`, `NEXTAUTH_*`, `RAG_SERVICE_URL`, `INTERNAL_SECRET`, etc.).

See `.env.example` for the full list (Auth, RAG, Inngest, Google, SMTP).

### 3. Database (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy the connection string into `DATABASE_URL`.
2. In the Neon **SQL Editor**, enable pgvector (once per project):

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. Push the Prisma schema (creates `User`, `Room`, `Booking`, `Document` in `public`):

   ```bash
   npm run db:push
   ```

   If you get **P1001** (can’t reach database), wake the project from the Neon SQL Editor (run any query), then retry. Use the **direct** connection string if the pooler URL fails.

4. Create the RAG schema and `rag.embeddings` table. Either run the contents of **`packages/db/migrations/001_rag_schema.sql`** in the Neon SQL Editor, or (with `psql` and `DATABASE_URL` set):

   ```bash
   cd packages/db
   psql "$env:DATABASE_URL" -f migrations/001_rag_schema.sql
   ```

5. (Optional) Seed test users and rooms:

   ```bash
   cd packages/db
   npm run seed
   ```

### 4. Run the apps

From the **repo root**:

- **Next.js (frontend + API)**  
  ```bash
  npm run dev:web
  ```  
  App runs at http://localhost:3000.

- **FastAPI (RAG service)**  
  ```bash
  npm run dev:rag
  ```  
  RAG service at http://localhost:8000. Set `RAG_SERVICE_URL=http://localhost:8000` in `.env` for the web app.

- **Prisma Studio**  
  ```bash
  npm run db:studio
  ```

---

## Scripts (from repo root)

| Command        | Description |
|----------------|-------------|
| `npm install`  | Install all workspaces; runs `prisma generate` in `packages/db`. |
| `npm run dev:web` | Start Next.js dev server (apps/web). |
| `npm run dev:rag` | Start FastAPI RAG service (apps/rag). |
| `npm run db:generate` | Regenerate Prisma client. |
| `npm run db:push` | Push schema to DB (no migrations). |
| `npm run db:studio` | Open Prisma Studio. |
| `npm run build` | Build all workspaces. |

---

## Security

- **Browser never calls FastAPI.** All RAG requests go through Next.js API routes; server-side code calls FastAPI with header `x-internal-secret: INTERNAL_SECRET`.
- **INTERNAL_SECRET** must match in Next.js and FastAPI env.
- **Admin routes** check user role server-side.
- **Secrets** stay in `.env`; never commit or log them.

See **AGENTS.md** for full rules.

---

## Contributing

Branch workflow: `feature-branch → development → main`. Use the branch naming pattern `feature/`, `bugfix/`, `update/`, or `release/` and conventional commit messages. **Never open PRs directly to `main`.**

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for full details.

---

## Deployment

- **Next.js** → Vercel (root: `apps/web`). Set all env vars from `.env.example`.
- **FastAPI** → Render (root: `apps/rag`, runtime: Docker). Set `DATABASE_URL`, `GROQ_API_KEY`, `INTERNAL_SECRET`, Google Drive vars.
- **Inngest** → Register the production Next.js URL in the Inngest dashboard; cron runs at 3 AM and calls Next.js, which calls FastAPI `/rag/ingest/sync`.

---

## References

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Branch workflow, naming, and commit conventions.
- **bible.md** — Full hackathon spec, flows, and task breakdown.
- **AGENTS.md** — Repository operating rules and invariants.
- **.env.example** — All environment variables.
