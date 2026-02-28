# CSIS SmartAssist — 24-Hour Hackathon Bible (Final Version)

---

## The Team

| Person | Role |
|--------|------|
| **You** | RAG Engineer — FastAPI RAG microservice, ingestion pipeline, embeddings, vector search |
| **Vedant** | Backend Engineer — Next.js API routes, booking logic, DB queries |
| **Mit** | Full-Stack Lead — oversees everything, Next.js auth, Inngest cron, integration, hard fixes |
| **Saksham** | Beginner — guided UI tasks each phase, always has clear instructions |

---

## What We're Building

```
A smart chatbot + room booking system for BITS Goa CS department

Students can:
  → Ask questions about policies, TA forms, lab rules (AI answers with citations)
  → Check room/lab availability
  → Book rooms via chat or a form

Admins can:
  → Approve or reject bookings (auto-creates Google Calendar event on approval)
  → Upload documents directly from dashboard (goes into AI knowledge base)
  → Connect Google Drive folder + manually sync with a button
  → Auto-sync happens every 24 hours via Inngest (runs even if Render is asleep)
```

---

## The Architecture Split

```
Next.js (Vercel)                    FastAPI (Render)
────────────────────────────        ──────────────────────────────
Auth — NextAuth + Google OAuth      POST /rag/query
Booking routes                      POST /rag/ingest/file
Admin routes                        POST /rag/ingest/sync
Document metadata in DB             GET  /rag/ingest/status
Google Calendar integration         pgvector reads/writes
Email confirmation                  sentence-transformers (local)
All DB reads/writes (Prisma)        Groq API calls
Inngest cron handler
Frontend UI

Inngest (External Scheduler)
────────────────────────────
Fires at 3 AM every day
Calls Next.js Inngest handler
Next.js handler calls FastAPI sync
Runs regardless of Render sleep state
```

Next.js is the brain — it handles everything users and admins do.
FastAPI is a private RAG microservice — Next.js calls it server-side only.
Inngest is the scheduler — it lives outside both services and wakes them up on schedule.

---

## Why Inngest for the Cron Job

APScheduler runs inside the FastAPI container. When Render's free tier puts the container to sleep after 15 minutes of inactivity, APScheduler sleeps too — meaning your 3 AM Drive sync silently never runs.

Inngest is an external scheduler. It fires at 3 AM regardless of whether your Render container is awake. It calls your Next.js handler, which wakes up Render by calling FastAPI. The sync always runs.

```
WITHOUT INNGEST (APScheduler):
  3 AM → Render is asleep → APScheduler never fires → sync never happens ❌

WITH INNGEST:
  3 AM → Inngest fires → hits Next.js /api/inngest (Vercel always awake)
       → Next.js calls FastAPI /rag/ingest/sync (wakes Render)
       → sync runs ✅
```

Inngest free tier gives 100,000 function runs per month. A daily cron uses 365 per year. Zero cost.

---

## How Chat Works End to End

```
User sends message in browser
        │
        ▼
Next.js POST /api/chat  (server-side route handler)
        │
        ├── Validates session (NextAuth)
        │
        └── Calls FastAPI internally:
            POST https://csis-rag.onrender.com/rag/query
            Headers: { x-internal-secret: <INTERNAL_SECRET> }
            Body: { message: "What is the TA policy?" }
                │
                ▼
            FastAPI embeds query (sentence-transformers, local)
                │
                ▼
            pgvector similarity search on Neon
                │
                ▼
            Confidence check (score < 0.4 → graceful no-result)
                │
                ▼
            Assemble prompt + call Groq (Llama 3.3 70B)
                │
                ▼
            Return { answer, citations }
                │
        ▼
Next.js forwards response to browser
```

---

## How the Inngest Cron Works

```
3:00 AM every day
        │
        ▼
Inngest fires scheduled job
        │
        ▼
POST https://your-app.vercel.app/api/inngest  (Next.js handler, Mit writes this)
        │
        ▼
Next.js Inngest handler calls FastAPI:
POST https://csis-rag.onrender.com/rag/ingest/sync
Headers: { x-internal-secret: <INTERNAL_SECRET> }
        │
        ▼
FastAPI polls Google Drive folder
Diffs files by checksum + modifiedTime
Calls ingest_file() for new or changed files
Updates Document records in DB
        │
        ▼
Inngest logs success or failure with full trace
Retries automatically on failure
```

---

## Tech Stack (All Free)

| Layer | Tool | Why |
|-------|------|-----|
| Frontend + Business Logic | Next.js (App Router) on Vercel | Auth, bookings, admin, UI |
| RAG Microservice | FastAPI (Python) on Render | Pure RAG — query + ingestion |
| Auth | NextAuth.js + Google OAuth | Domain-restricted to college email |
| Password Security | bcrypt.js | Industry standard password hashing |
| Database | Neon (Serverless Postgres) | App data + pgvector in same DB |
| Vector Store | pgvector extension on Neon | Stores document embeddings |
| ORM | Prisma | Type-safe DB queries in Next.js |
| LLM | Groq (Llama 3.3 70B) | Free, globally hosted, very fast |
| Embeddings | sentence-transformers (local) | Runs inside FastAPI, free, no rate limits |
| Document Storage | Google Drive (private folder) | Free, secure, OAuth-gated |
| PDF Parsing | PyMuPDF | High quality text extraction |
| DOCX Parsing | python-docx | Native DOCX reading |
| Cron Scheduler | Inngest | External, fires even when Render is asleep |

---

## Full Architecture Diagram

```
                         ┌──────────────────────────┐
                         │       USER BROWSER        │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼──────────────────────────┐
                         │        NEXT.JS ON VERCEL               │
                         │                                        │
                         │  Pages:                                │
                         │    /chat   /bookings   /admin          │
                         │                                        │
                         │  API Routes:                           │
                         │    /api/auth        (NextAuth)         │
                         │    /api/chat        (calls FastAPI)    │
                         │    /api/bookings/*  (Vedant)           │
                         │    /api/admin/*     (Vedant)           │
                         │    /api/inngest     (Inngest handler)  │
                         └──────┬──────────────────┬─────────────┘
                                │                  │
              ┌─────────────────▼──┐    ┌──────────▼────────────────┐
              │   NEON POSTGRES     │    │    FASTAPI ON RENDER       │
              │                    │    │    (private RAG service)   │
              │  public schema:    │    │                            │
              │  users, rooms,     │    │  POST /rag/query           │
              │  bookings, docs    │◄───│  POST /rag/ingest/file     │
              │                    │    │  POST /rag/ingest/sync     │
              │  rag schema:       │    │  GET  /rag/ingest/status   │
              │  embeddings        │    │  GET  /health              │
              └────────────────────┘    │                            │
                                        │  sentence-transformers     │
                                        │  LangChain (Python)        │
                                        └──────────┬────────────────┘
                                                   │ calls
                                        ┌──────────▼────────────────┐
                                        │        GROQ API            │
                                        │     Llama 3.3 70B          │
                                        └───────────────────────────┘
                                                   │
                                        ┌──────────▼────────────────┐
                                        │      GOOGLE DRIVE          │
                                        │    (private folder)        │
                                        └───────────────────────────┘

  ┌─────────────────────┐
  │       INNGEST        │
  │  (external scheduler)│
  │                     │
  │  Fires 3 AM daily   ├──────────► POST /api/inngest (Next.js)
  │  Retries on failure │               │
  │  Full trace logs    │               └──► POST /rag/ingest/sync (FastAPI)
  └─────────────────────┘
```

---

## Security

```
Layer 1 — User Access
  NextAuth Google OAuth
  Only @goa.bits-pilani.ac.in emails can log in
  Role-based: USER vs ADMIN stored in DB

Layer 2 — Password Security (Mit)
  bcrypt.js hashes all passwords
  Plain text password never stored anywhere

Layer 3 — FastAPI Protection
  FastAPI is never called directly by the browser
  Next.js calls it server-side only
  Every request includes a shared secret header:
    x-internal-secret: <INTERNAL_SECRET>
  FastAPI rejects any request without this header
  Inngest calls Next.js, Next.js calls FastAPI — chain is secure

Layer 4 — Inngest Security
  Inngest signs every request with a signing key
  Next.js verifies the signature before processing
  Prevents anyone from spoofing a fake cron trigger

Layer 5 — Document Security
  All documents live in a private Google Drive folder
  Only the service account (credentials in env vars) can read it
  Folder link alone is useless without OAuth

Layer 6 — Embedding Security
  Vectors in Neon are just arrays of numbers
  Even if DB is leaked, vectors alone reveal nothing

Layer 7 — Secrets
  All API keys and tokens are server-side env vars only
  Never in the browser, never in git
```

---

## Database Schema

```sql
-- ─────────────────────────────────────────
-- public schema  (Prisma managed)
-- ─────────────────────────────────────────

User
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  role          Role      @default(USER)    -- USER | ADMIN
  createdAt     DateTime  @default(now())

Room
  id            String    @id @default(cuid())
  name          String                      -- "Lab 3"
  location      String
  capacity      Int
  amenities     String[]

Booking
  id            String    @id @default(cuid())
  userId        String
  roomId        String
  startTime     DateTime
  endTime       DateTime
  reason        String
  status        BookingStatus @default(PENDING)  -- PENDING | APPROVED | REJECTED
  createdAt     DateTime  @default(now())

Document
  id            String    @id @default(cuid())
  filename      String
  source        DocSource                   -- DIRECT_UPLOAD | GOOGLE_DRIVE
  driveFileId   String?
  mimeType      String
  checksum      String?
  lastModified  DateTime?
  ingestionStatus IngestionStatus @default(PENDING)
                                            -- PENDING | PROCESSING | DONE | FAILED
  ingestedAt    DateTime?
  errorMessage  String?
  createdAt     DateTime  @default(now())

-- ─────────────────────────────────────────
-- rag schema  (raw SQL migration)
-- ─────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA IF NOT EXISTS rag;

CREATE TABLE rag.embeddings (
  id            SERIAL PRIMARY KEY,
  document_id   TEXT NOT NULL,
  chunk_index   INT NOT NULL,
  chunk_text    TEXT NOT NULL,
  embedding     vector(384),     -- sentence-transformers/all-MiniLM-L6-v2 = 384 dims
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON rag.embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## Document Ingestion — 3 Triggers, 1 Pipeline

```
TRIGGER 1 — Direct Upload
  Admin uploads file in dashboard
  → Next.js POST /api/admin/upload
  → Pushes file to Google Drive private folder
  → Saves Document record in DB (status: PENDING)
  → Calls FastAPI POST /rag/ingest/file
  → FastAPI runs ingest_file() → status: DONE

TRIGGER 2 — Manual Drive Sync
  Admin clicks "Sync Google Drive"
  → Next.js POST /api/admin/drive-sync
  → Calls FastAPI POST /rag/ingest/sync
  → FastAPI polls Drive folder, diffs by checksum
  → Runs ingest_file() for new/changed files
  → Updates Document records in DB

TRIGGER 3 — Inngest Auto Daily Sync (3 AM every day)
  Inngest fires on schedule
  → Hits Next.js POST /api/inngest
  → Next.js calls FastAPI POST /rag/ingest/sync
  → Same logic as Trigger 2
  → Runs regardless of Render sleep state
  → Inngest retries automatically on failure
```

---

## ingest_file() — The Core Pipeline (FastAPI)

```
ingest_file(file_bytes OR drive_file_id, document_id)
        │
        ▼
Detect file type → extract text
  PDF  → PyMuPDF
  DOCX → python-docx
  TXT  → decode utf-8
        │
        ▼
Update DB → status: PROCESSING
        │
        ▼
Chunk text
  LangChain RecursiveCharacterTextSplitter
  chunk_size=500 | chunk_overlap=50
        │
        ▼
Generate embeddings
  sentence-transformers/all-MiniLM-L6-v2
  runs locally inside FastAPI — no API call, no rate limit
  output: vector(384)
        │
        ▼
Batch insert into rag.embeddings (Neon)
        │
        ▼
Update DB → status: DONE, ingestedAt: now()
        │
        ▼ (on any error)
Update DB → status: FAILED, errorMessage: <details>
Retry once before marking failed
```

---

## Booking Flow

```
Student: "Book Lab 3 this Friday 2-4pm"
        │
        ▼
Next.js POST /api/bookings/request
  Conflict check:
  Any APPROVED booking overlapping same room + time?
  → YES: return "Lab 3 is already booked"
  → NO:  create booking, status: PENDING
        │
        ▼
Admin sees PENDING in dashboard → clicks Approve
        │
        ▼
Next.js POST /api/admin/approve/[id]
  DB transaction:
  1. Set this booking → APPROVED
  2. All other PENDING bookings for same room + time → REJECTED
  3. Create Google Calendar event
  4. Send confirmation email (Nodemailer)
```

---

## Admin Dashboard

```
┌────────────────────────────────────────────────────────┐
│  CSIS SmartAssist  |  Admin Dashboard                  │
│  [Bookings Tab]  [Documents Tab]                       │
└────────────────────────────────────────────────────────┘

Bookings Tab:
┌─────────────┬────────┬─────────────┬──────────┬────────────────┐
│ Requester   │ Room   │ Time        │ Reason   │ Actions        │
├─────────────┼────────┼─────────────┼──────────┼────────────────┤
│ John Doe    │ Lab 3  │ Fri 2–4pm   │ ML proj  │ [✓ Approve][✗] │
│ Jane Smith  │ SR 101 │ Sat 10–12pm │ Team mtg │ [✓ Approve][✗] │
└─────────────┴────────┴─────────────┴──────────┴────────────────┘

Documents Tab:
  [📁 Upload File]  [🔄 Sync Google Drive]
  Last auto-sync: Today at 3:00 AM (via Inngest)

┌────────────────────┬───────────────┬──────────────┬─────────────┐
│ Filename           │ Source        │ Status       │ Date        │
├────────────────────┼───────────────┼──────────────┼─────────────┤
│ ta_policy.pdf      │ Direct Upload │ ✅ Done       │ 2 hours ago │
│ lab_rules.docx     │ Google Drive  │ ✅ Done       │ 1 day ago   │
│ reimbursement.pdf  │ Google Drive  │ 🔄 Processing │ just now    │
│ old_circular.pdf   │ Google Drive  │ ❌ Failed     │ 3 days ago  │
└────────────────────┴───────────────┴──────────────┴─────────────┘
```

---

## Repository Structure

```
csis-smartassist/
│
├── apps/
│   │
│   ├── web/                                  # Next.js — frontend + business logic
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx              # Login page
│   │   │   ├── chat/
│   │   │   │   └── page.tsx                  # Chat UI (Saksham)
│   │   │   ├── bookings/
│   │   │   │   └── page.tsx                  # Booking form (Saksham)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                  # Admin root
│   │   │   │   ├── bookings/
│   │   │   │   │   └── page.tsx              # Admin bookings tab (Saksham)
│   │   │   │   └── documents/
│   │   │   │       └── page.tsx              # Admin documents tab (Saksham)
│   │   │   ├── layout.tsx                    # Root layout + navbar
│   │   │   └── page.tsx                      # Home / redirect
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts              # NextAuth (Mit)
│   │   │   ├── chat/
│   │   │   │   └── route.ts                  # Calls FastAPI /rag/query (Mit)
│   │   │   ├── inngest/
│   │   │   │   └── route.ts                  # Inngest handler + cron job def (Mit)
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts                  # GET all bookings (Vedant)
│   │   │   │   └── request/
│   │   │   │       └── route.ts              # POST create booking (Vedant)
│   │   │   └── admin/
│   │   │       ├── approve/
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts          # POST approve (Vedant)
│   │   │       ├── reject/
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts          # POST reject (Vedant)
│   │   │       ├── upload/
│   │   │       │   └── route.ts              # POST file upload → FastAPI (Vedant)
│   │   │       ├── drive-sync/
│   │   │       │   └── route.ts              # POST manual sync → FastAPI (Vedant)
│   │   │       └── documents/
│   │   │           └── route.ts              # GET list documents (Vedant)
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                           # shadcn/ui auto-generated
│   │   │   ├── chat/
│   │   │   │   ├── MessageBubble.tsx         # User + assistant bubbles (Saksham)
│   │   │   │   ├── CitationCard.tsx          # Citation card below AI response (Saksham)
│   │   │   │   └── ChatInput.tsx             # Message input bar (Saksham)
│   │   │   ├── bookings/
│   │   │   │   └── BookingForm.tsx           # Room booking form (Saksham)
│   │   │   └── admin/
│   │   │       ├── BookingsTable.tsx         # Pending bookings + approve/reject (Saksham)
│   │   │       ├── DocumentsTable.tsx        # Documents + status badges (Saksham)
│   │   │       ├── FileUploadZone.tsx        # Drag + drop upload (Saksham)
│   │   │       └── DriveSyncButton.tsx       # Manual sync button (Saksham)
│   │   │
│   │   ├── lib/
│   │   │   ├── auth.ts                       # NextAuth config (Mit)
│   │   │   ├── inngest.ts                    # Inngest client + cron function def (Mit)
│   │   │   ├── prisma.ts                     # Prisma client singleton (Vedant)
│   │   │   ├── rag-client.ts                 # Internal fetch wrapper to FastAPI (Mit)
│   │   │   └── middleware.ts                 # Role auth helpers (Mit)
│   │   │
│   │   ├── middleware.ts                      # Next.js edge middleware (Mit)
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── rag/                                  # FastAPI — RAG microservice only (YOU)
│       │
│       ├── main.py                           # App entry, mounts routers, secret check
│       │
│       ├── routers/
│       │   ├── query.py                      # POST /rag/query
│       │   └── ingest.py                     # POST /rag/ingest/file
│       │                                     # POST /rag/ingest/sync
│       │                                     # GET  /rag/ingest/status
│       │                                     # GET  /health
│       │
│       ├── rag/
│       │   ├── ingest.py                     # ingest_file() core pipeline
│       │   ├── query.py                      # embed → pgvector → Groq → response
│       │   ├── drive_sync.py                 # Drive polling + diff logic
│       │   ├── embeddings.py                 # sentence-transformers wrapper
│       │   ├── vector_store.py               # pgvector read/write helpers
│       │   ├── chunker.py                    # LangChain text splitter config
│       │   └── parsers/
│       │       ├── pdf.py                    # PyMuPDF
│       │       ├── docx.py                   # python-docx
│       │       └── txt.py                    # plain text
│       │
│       ├── db/
│       │   └── session.py                    # pg connection pool to Neon
│       │
│       ├── core/
│       │   └── config.py                     # env var loading via pydantic-settings
│       │
│       ├── Dockerfile
│       ├── docker-compose.yml                # local dev only
│       ├── requirements.txt
│       └── .env                              # local only, never committed
│
├── packages/
│   └── db/                                   # Shared Prisma schema (Vedant)
│       ├── prisma/
│       │   ├── schema.prisma                 # User, Room, Booking, Document models
│       │   └── migrations/                   # Auto-generated by Prisma
│       ├── migrations/
│       │   └── 001_rag_schema.sql            # rag.embeddings table + pgvector index
│       └── seed.ts                           # 5 rooms + 3 test users (Saksham runs)
│
├── .env.example                              # Full env template (Mit creates)
├── .gitignore                                # .env, __pycache__, .venv, node_modules
├── package.json                              # Root workspace
└── README.md                                 # Saksham writes this
```

---

## .env.example

```bash
# ─── Database ─────────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/csis?sslmode=require

# ─── Next.js Auth ─────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Internal Secret (Next.js ↔ FastAPI) ──────────────────────
INTERNAL_SECRET=any-long-random-string-same-on-both-services

# ─── RAG Service ──────────────────────────────────────────────
RAG_SERVICE_URL=http://localhost:8000          # Render URL in production

# ─── LLM ──────────────────────────────────────────────────────
GROQ_API_KEY=

# ─── Google Drive ─────────────────────────────────────────────
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=                   # entire JSON as one-line string

# ─── Google Calendar ──────────────────────────────────────────
GOOGLE_CALENDAR_ID=

# ─── Email ────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# ─── Inngest ──────────────────────────────────────────────────
INNGEST_EVENT_KEY=                             # from Inngest dashboard
INNGEST_SIGNING_KEY=                           # from Inngest dashboard
```

---

## Python Dependencies

```
# apps/rag/requirements.txt

# Web framework
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12

# Database
psycopg2-binary==2.9.10
pgvector==0.3.6

# RAG + Embeddings
langchain==0.3.0
langchain-community==0.3.0
sentence-transformers==3.3.0
pymupdf==1.25.0
python-docx==1.1.2
groq==0.13.0

# Google APIs
google-api-python-client==2.154.0
google-auth==2.36.0
google-auth-oauthlib==1.2.1

# Config
pydantic-settings==2.6.0
python-dotenv==1.0.1
```

---

## 24-Hour Task Breakdown

---

### 🟡 HOURS 0–2 | Setup

| Person | Tasks |
|--------|-------|
| **Mit** | Confirm pgvector enabled on Neon. Set up `apps/web` with Next.js. Install shadcn/ui, Prisma, and Inngest (`npm install inngest`). Write `lib/rag-client.ts` and `lib/inngest.ts` skeletons. Share `.env.example` |
| **Vedant** | Confirm Prisma migrations are live on Neon. Run `001_rag_schema.sql` for pgvector table. Write and run seed (5 rooms, 3 test users) |
| **You** | Set up `apps/rag` folder structure. Create virtualenv, install `requirements.txt`. Write `test_connection.py` — connects to Neon, confirms pgvector. Download sentence-transformers model locally |
| **Saksham** | Fill in `.env` with all API keys. Run the seed script Vedant provides. Scaffold Next.js pages — create `/chat`, `/bookings`, `/admin` page files and navbar |

**✅ Checkpoint:** All tables in Neon, pgvector confirmed, sentence-transformers downloaded, Next.js and FastAPI both start locally

---

### 🔴 HOURS 2–6 | Core Pipelines

| Person | Tasks |
|--------|-------|
| **You** | Build `rag/ingest.py` with full `ingest_file()`. Test on 2 PDFs and 1 DOCX. Build `rag/query.py` — embed → pgvector search → confidence check → Groq → response with citations. Wire both into `routers/query.py` and `routers/ingest.py` |
| **Vedant** | Build Next.js booking routes — `POST /api/bookings/request` (conflict check → PENDING), `GET /api/bookings`, `POST /api/admin/approve/[id]` (transaction + auto-reject), `POST /api/admin/reject/[id]` |
| **Mit** | Build `POST /api/chat` — validates session, calls FastAPI via `rag-client.ts` with internal secret header, returns response. Set up NextAuth with Google provider restricted to college domain |
| **Saksham** | Build Chat UI — scrollable message list, user + assistant bubbles, citation cards, text input bar. Mit gives component shell |

**✅ Checkpoint:** `ingest_file()` works on real docs. `/rag/query` returns a Groq answer. Next.js `/api/chat` proxies it correctly to the browser.

---

### 🔵 HOURS 6–10 | Feature Build

| Person | Tasks |
|--------|-------|
| **You** | Build 3 ingestion triggers: **(1)** `POST /rag/ingest/file` handler (receives bytes → `ingest_file()`), **(2)** `POST /rag/ingest/sync` handler (Drive sync → diff → ingest changed files), **(3)** `GET /rag/ingest/status`. No cron needed in FastAPI — Inngest handles it |
| **Vedant** | Build Next.js admin routes — `POST /api/admin/upload` (push to Drive → DB record → call FastAPI), `POST /api/admin/drive-sync` (call FastAPI sync), `GET /api/admin/documents` |
| **Mit** | Set up Inngest — create `lib/inngest.ts` with client + cron function that calls FastAPI `/rag/ingest/sync` at 3 AM. Wire `POST /api/inngest` route handler. Add internal secret check to FastAPI `main.py`. Add role-based middleware to protect admin routes |
| **Saksham** | Build Chat page fully — call `/api/chat`, show loading spinner, render answer + citation cards on response |

**✅ Checkpoint:** All 3 ingestion triggers work. Inngest cron defined and connected. Login restricted to college email. Admin routes protected. Chat shows real cited answers.

---

### 🟢 HOURS 10–15 | Integration Sprint

| Person | Tasks |
|--------|-------|
| **You** | DB status updates at every stage of `ingest_file()`. Error handling and single retry logic. Help Mit debug any retrieval quality issues |
| **Vedant** | Google Calendar event creation on approval. Nodemailer email confirmation. Wire all routes to real DB data |
| **Mit** | Full integration pass — walk every user journey end to end, fix broken connections. Verify Inngest cron fires correctly in dev mode. Help Saksham connect remaining UI pages |
| **Saksham** | Build Booking Form (room picker, date/time, reason, submit → calls `/api/bookings/request`). Build Admin Bookings tab (pending table, approve/reject buttons). Vedant tells him the exact endpoints |

**✅ Checkpoint:** Full demo flow works locally — login → ask question → cited answer → book room → admin approves → calendar event → email sent. Inngest sync tested.

---

### ⚪ HOURS 15–19 | Deployment

| Person | Tasks |
|--------|-------|
| **You** | Write `Dockerfile` and `docker-compose.yml`. Build + test locally. Deploy to Render (Root: `apps/rag`, Runtime: Docker). Add env vars. Test `/health` and `/docs` on live Render URL |
| **Vedant** | Deploy Next.js to Vercel (Root: `apps/web`). Add all env vars including `RAG_SERVICE_URL` and `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`. Test all API routes on production |
| **Mit** | Connect Inngest to production — in Inngest dashboard register the Vercel URL (`https://your-app.vercel.app/api/inngest`). Run full demo script on production. Fix CORS, OAuth callbacks, any env mismatches |
| **Saksham** | Build Admin Documents tab — file upload dropzone, Sync Drive button, last sync timestamp, documents table with status badges |

**✅ Checkpoint:** App live on Vercel. FastAPI live on Render. Inngest connected to production URL. Full flow works end to end on production.

---

### 🏁 HOURS 19–22 | Polish & Edge Cases

| Person | Tasks |
|--------|-------|
| **You** | Graceful no-results message. Retry once on failed ingestion then mark FAILED. Clean error for unsupported file types |
| **Vedant** | Proper error messages on all routes. Handle expired Google Calendar tokens |
| **Mit** | Loading spinners, empty states, mobile check, college branding. Lock CORS to Vercel domain only. Confirm Inngest signing key is validated |
| **Saksham** | Run full demo script 3 times. Write down every bug + weird behavior with screenshots. Report to Mit |

---

### 🎤 HOURS 22–24 | Demo Prep

| Person | Tasks |
|--------|-------|
| **Mit** | Final demo run. Record backup screen video |
| **Vedant** | Prepare 5 test questions with known answers in the documents |
| **You** | Ingest 10–15 real department documents on production. Confirm all DONE. Wake up Render |
| **Saksham** | Build presentation slides — problem → solution → architecture → live demo → team → future scope |

---

## The Demo Script (Rehearse 3x)

```
1. Login with college Google account
   SHOWS: only @goa.bits-pilani.ac.in works

2. Ask: "What documents do I need for TA reimbursement?"
   SHOWS: cited answer from a real PDF with source names

3. Ask: "Is Lab 3 available this Friday 2-4pm?"
   SHOWS: live DB availability check

4. "Book Lab 3 this Friday 2-4pm for my ML project"
   SHOWS: booking created as PENDING

5. Admin → Documents tab → upload a new PDF
   SHOWS: status goes PROCESSING then DONE

6. Admin → click "Sync Google Drive"
   SHOWS: Drive files detected + ingested

7. Admin → Bookings tab → Approve the Lab 3 request
   SHOWS: APPROVED, conflicts auto-rejected, calendar event, email sent

8. Back to chat → ask something from the newly uploaded PDF
   SHOWS: AI knows the new document immediately
```

---

## Deployment — Full Steps

---

### 1 — Neon (Database)

```
1. neon.tech → New Project → "csis-smartassist"
2. Copy connection string → DATABASE_URL in everyone's .env
3. Neon SQL editor → run:
   CREATE EXTENSION IF NOT EXISTS vector;
4. Run Prisma migrations:
   cd packages/db && npx prisma migrate deploy
5. Run pgvector schema:
   psql $DATABASE_URL -f packages/db/migrations/001_rag_schema.sql
6. Run seed:
   cd packages/db && npx ts-node seed.ts
```

---

### 2 — Inngest (Cron Scheduler)

```
1. inngest.com → Create free account
2. New App → copy Event Key and Signing Key → into .env
3. In apps/web, install: npm install inngest
4. Mit writes lib/inngest.ts:

   import { Inngest } from "inngest"
   export const inngest = new Inngest({ id: "csis-smartassist" })

   export const driveSync = inngest.createFunction(
     { id: "daily-drive-sync", name: "Daily Drive Sync" },
     { cron: "0 3 * * *" },          // 3 AM every day
     async () => {
       await fetch(`${process.env.RAG_SERVICE_URL}/rag/ingest/sync`, {
         method: "POST",
         headers: { "x-internal-secret": process.env.INTERNAL_SECRET! }
       })
     }
   )

5. Mit writes apps/web/api/inngest/route.ts:

   import { serve } from "inngest/next"
   import { inngest, driveSync } from "@/lib/inngest"
   export const { GET, POST, PUT } = serve({ client: inngest, functions: [driveSync] })

6. After deploying to Vercel:
   Inngest dashboard → Apps → register URL:
   https://your-app.vercel.app/api/inngest
   Inngest will verify the connection and start scheduling
```

---

### 3 — Render (FastAPI RAG Service)

**Dockerfile (`apps/rag/Dockerfile`):**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake model into image at build time — no cold start download
RUN python -c "from sentence_transformers import SentenceTransformer; \
               SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml (local testing only):**

```yaml
version: '3.8'
services:
  rag:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - GOOGLE_DRIVE_FOLDER_ID=${GOOGLE_DRIVE_FOLDER_ID}
      - GOOGLE_SERVICE_ACCOUNT_JSON=${GOOGLE_SERVICE_ACCOUNT_JSON}
      - INTERNAL_SECRET=${INTERNAL_SECRET}
    restart: unless-stopped
```

**Deploy steps:**

```
1. render.com → New → Web Service → connect GitHub repo
   Root Directory: apps/rag
   Runtime: Docker
2. Add env vars:
   DATABASE_URL, GROQ_API_KEY, GOOGLE_DRIVE_FOLDER_ID,
   GOOGLE_SERVICE_ACCOUNT_JSON, INTERNAL_SECRET
3. Health Check Path: /health
4. Deploy → first build takes 5–8 min (bakes model into image)
5. Get URL: https://csis-rag.onrender.com
6. Test: https://csis-rag.onrender.com/docs
```

---

### 4 — Vercel (Next.js)

```
1. vercel.com → New Project → import GitHub repo
   Root Directory: apps/web
2. Add env vars:
   NEXTAUTH_URL         = https://your-app.vercel.app
   NEXTAUTH_SECRET      = (openssl rand -base64 32)
   GOOGLE_CLIENT_ID     = from Google Cloud Console
   GOOGLE_CLIENT_SECRET = from Google Cloud Console
   DATABASE_URL         = Neon connection string
   RAG_SERVICE_URL      = https://csis-rag.onrender.com
   INTERNAL_SECRET      = same value as Render
   INNGEST_EVENT_KEY    = from Inngest dashboard
   INNGEST_SIGNING_KEY  = from Inngest dashboard
3. In Google Cloud Console → OAuth credentials:
   Add: https://your-app.vercel.app/api/auth/callback/google
4. Deploy → every git push auto-redeploys
5. Register app in Inngest dashboard:
   https://your-app.vercel.app/api/inngest
```

---

### 5 — Google Cloud Console

```
1. console.cloud.google.com → New Project → "CSIS SmartAssist"
2. Enable APIs:
   → Google Drive API
   → Google Calendar API
   → People API
3. Create OAuth 2.0 credentials:
   Type: Web Application
   Redirect URIs:
     http://localhost:3000/api/auth/callback/google
     https://your-app.vercel.app/api/auth/callback/google
   Copy Client ID + Secret → into .env
4. Create Service Account (for FastAPI to access Drive):
   Credentials → Create Service Account → download JSON key
   Share your Google Drive folder with the service account email
   Paste entire JSON as GOOGLE_SERVICE_ACCOUNT_JSON env var
```

---

### Deployment Order on Hackathon Day

```
Hour 0–1  → Neon setup + migrations                    (Vedant)
Hour 1    → Everyone confirms DB connection works
Hour 2–5  → Build core pipelines locally
Hour 6–7  → Mit sets up Inngest locally, tests in dev mode
Hour 15   → docker build + docker-compose up            (You — local smoke test)
Hour 15   → Deploy FastAPI to Render                    (You)
Hour 16   → Get Render URL, share with team
Hour 16   → Deploy Next.js to Vercel                   (Vedant)
            Set RAG_SERVICE_URL = Render URL
Hour 16   → Register app URL in Inngest dashboard       (Mit)
Hour 17   → Full demo run on production                 (Mit)
Hour 18   → Fix prod bugs                               (Mit + Vedant + You)
Hour 23   → Wake up Render before demo
            curl https://csis-rag.onrender.com/health
```

---

## Critical Things That Break Production

**CORS** — FastAPI rejects requests from Vercel by default. Add the Vercel production URL to `allow_origins` in `main.py` before testing on production.

**Internal Secret mismatch** — `INTERNAL_SECRET` must be the exact same string in both Vercel and Render env vars. If they differ, every Next.js → FastAPI call returns 403.

**Inngest Signing Key** — The Inngest signing key must be set in Vercel env vars or Inngest will reject its own requests to your handler with a 401.

**Inngest app registration** — After deploying to Vercel, you must go to the Inngest dashboard and register `https://your-app.vercel.app/api/inngest`. Without this step, Inngest does not know where your app lives and the cron never fires.

**OAuth Redirect URI** — Must exactly match what is in Google Cloud Console. One character off and login fails.

**Render cold start** — Inngest will wake Render at 3 AM for the sync, but for the demo you still need to manually wake it. Hit `/health` 5 minutes before presenting.

**sentence-transformers first load** — Model is baked into the image but still takes a few seconds to load into memory on the very first request. Wake the container before demo time.

**Service Account Drive sharing** — The Google Drive folder must be explicitly shared with the service account email address. Without this FastAPI gets a 403 when fetching files.

**Prisma in serverless** — Add `?connection_limit=1` to `DATABASE_URL` in Vercel to avoid connection pool exhaustion in serverless functions.

---

## Free Tier Limits

| Service | Free Limit | Risk |
|---------|-----------|------|
| Neon | 0.5GB storage | Safe — 50 docs ≈ 50MB |
| Vercel | 100GB bandwidth/month | Safe |
| Render | 750 hrs/month, sleeps after 15min | ⚠️ Ping before demo |
| Groq | ~14,400 requests/day | Safe |
| sentence-transformers | Unlimited — runs locally | ✅ Zero risk |
| Google Drive | 15GB | Safe |
| Inngest | 100,000 runs/month | Safe — daily cron = 365/year |

---

## Who Owns What

| File / Folder | Owner |
|---------------|-------|
| `apps/rag/` entire folder | **You** |
| `apps/web/api/chat/route.ts` | **Mit** |
| `apps/web/api/inngest/route.ts` | **Mit** |
| `apps/web/lib/auth.ts` | **Mit** |
| `apps/web/lib/inngest.ts` | **Mit** |
| `apps/web/lib/rag-client.ts` | **Mit** |
| `apps/web/lib/middleware.ts` | **Mit** |
| `apps/web/middleware.ts` | **Mit** |
| `apps/web/api/bookings/` | **Vedant** |
| `apps/web/api/admin/` | **Vedant** |
| `apps/web/lib/prisma.ts` | **Vedant** |
| `packages/db/prisma/schema.prisma` | **Vedant** |
| `packages/db/migrations/` | **Vedant** |
| `apps/web/components/chat/` | **Saksham** |
| `apps/web/components/admin/` | **Saksham** |
| `apps/web/components/bookings/` | **Saksham** |
| `apps/web/app/**/page.tsx` | **Saksham** |
| `README.md` | **Saksham** |