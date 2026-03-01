# SmartAssist RAG Service

FastAPI service for RAG (query, ingest, Drive sync). The Next.js app calls it at `RAG_SERVICE_URL` (default `http://localhost:8000`) with header `x-internal-secret`.

## Prerequisites

- **Python 3.10+** (3.11 recommended)
- Same **Neon database** as the web app (RAG uses `rag` schema + pgvector; see `packages/db` migrations)

## Setup

1. **Create a virtual environment** (from this directory, `apps/rag`):

   ```bash
   python -m venv .venv
   ```

   On Windows (PowerShell):

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS/Linux:

   ```bash
   source .venv/bin/activate
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

   Or with [uv](https://docs.astral.sh/uv/):

   ```bash
   uv venv && source .venv/bin/activate   # or .\.venv\Scripts\Activate.ps1 on Windows
   uv pip install -r requirements.txt
   ```

3. **Environment variables**

   Copy `.env.example` to `.env` and set:

   - **`DATABASE_URL`** — Same Neon Postgres URL as the web app (use the **direct** connection string, not the pooler). RAG uses the `rag` schema for pgvector.
   - **`INTERNAL_SECRET`** — Must match the `INTERNAL_SECRET` in the **root** `.env` (used by Next.js). The web app sends this in `x-internal-secret` on every RAG request.
   - **`GROQ_API_KEY`** — For the LLM (Groq). Get it from [console.groq.com](https://console.groq.com).
   - Optional: `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON` for Drive sync; `CORS_ORIGINS` if you need more than `http://localhost:3000`.

   Ensure the **RAG schema** exists in Neon (run `packages/db/migrations/001_rag_schema.sql` or your project’s equivalent).

## Run

**From repo root** (with venv activated and `uvicorn` on `PATH`):

```bash
npm run dev:rag
```

**Or from this directory** (`apps/rag`) with venv activated:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Service: **http://localhost:8000**
- Health: **http://localhost:8000/health**
- OpenAPI: **http://localhost:8000/docs**

In the **root** `.env` (or `apps/web/.env`), set:

- `RAG_SERVICE_URL=http://localhost:8000`
- `INTERNAL_SECRET=<same value as in apps/rag/.env>`

Then start the web app (`npm run dev:web`). Chat will call this RAG service for answers.

---

## Troubleshooting

### `psycopg2.OperationalError: connection to server at "ep-xxx.neon.tech" ... failed: Connection timed out`

The RAG service could not reach your Neon Postgres (vector store). Try:

1. **Use the same `DATABASE_URL` as the web app**  
   Copy `DATABASE_URL` from the **root** `.env` (or `apps/web/.env`) into `apps/rag/.env`. The Next.js app uses the same Neon DB; if the web app can connect, RAG should use the exact same URL.

2. **Wake the Neon project**  
   On Neon’s free tier, projects suspend after inactivity. Open the [Neon Console](https://console.neon.tech), select your project, and run a simple query or wait for it to resume. The first connection after suspend can be slow.

3. **Try the pooled endpoint**  
   In the Neon dashboard, use the **Connection string** that uses **port 6543** (pooled) instead of 5432 (direct). Some networks or firewalls allow 6543 when 5432 is blocked. Put that full URL in `apps/rag/.env` as `DATABASE_URL`.

4. **Network / firewall**  
   If you’re on a restricted network (e.g. campus or corporate), outbound TCP to port 5432 (or 6543) may be blocked. Try from another network (e.g. mobile hotspot) or ask your IT to allow connections to `*.neon.tech`.

5. **Faster failure (optional)**  
   Add a timeout to the URL so the app doesn’t hang for minutes:
   ```text
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&connect_timeout=15
   ```
