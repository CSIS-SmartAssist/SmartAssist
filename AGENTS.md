# AGENTS.md — Repository Operating Rules

This file defines the **non-negotiable engineering rules** for anyone (human or AI agent) contributing to this repository.

It exists to:

* Protect architectural integrity
* Prevent hackathon-time regressions
* Keep production behavior predictable
* Ensure demo reliability

If a change violates this document, it should not be merged.

---

# 1. Core Architecture Invariants (DO NOT BREAK)

## 1.1 Service Separation

* Next.js = authentication, business logic, bookings, admin UI, Inngest integration.
* FastAPI = RAG only (query + ingestion + embeddings + vector search).
* Browser NEVER calls FastAPI directly.
* All FastAPI requests must include `x-internal-secret` header.

## 1.2 Database Ownership

* `public` schema → managed by Prisma (Next.js only).
* `rag` schema → managed by raw SQL (FastAPI only).
* Do not mix responsibilities.

## 1.3 Ingestion Rules

* All documents must pass through `ingest_file()`.
* Document status must always move through:
  `PENDING → PROCESSING → DONE | FAILED`
* Never silently swallow ingestion errors.

## 1.4 Cron Execution

* Cron is handled ONLY by Inngest.
* FastAPI must not contain internal schedulers.

---

# 2. Non-Negotiable Security Rules

* No secrets in code.
* No secrets in logs.
* No service account JSON committed.
* `INTERNAL_SECRET` must match across services.
* Admin routes must verify role server-side.
* FastAPI must reject requests without internal header.

If unsure about a change affecting security → do not merge.

---

# 3. Code Contribution Rules

## 3.1 Before Writing Code

* Understand which service owns the logic.
* Do not duplicate business logic across services.
* Prefer modifying existing modules over creating parallel logic.

## 3.2 Pull Request Requirements

Every PR must:

* Be small and focused
* Include a clear description
* Include a test plan
* Confirm no breaking env variable changes
* Confirm deployment impact (if any)

## 3.3 Logging Standard

* **All code MUST use the global logger utility** (`apps/web/src/lib/logger.ts`) — raw `console.*` calls are forbidden outside the logger itself.
* Import as: `import * as logger from "@/lib/logger";`
* Use the correct contextual logger:
  * `logger.logApi("error" | "request" | "response", endpoint, details)` — API route handlers
  * `logger.logAuth("signIn" | "signOut" | "session" | "error", details)` — Auth flows
  * `logger.logDb(operation, details)` — Database operations (Prisma, raw SQL)
  * `logger.logEvent(eventName, payload)` — Background jobs, cron, Inngest functions
  * `logger.error(tag, ...args)` / `logger.warn(tag, ...args)` — General errors/warnings
  * `logger.info(tag, ...args)` / `logger.debug(tag, ...args)` — Dev-only diagnostics
* Every `catch` block MUST log the error with context (operation name, entity IDs, error message) before returning or rethrowing.
* Never log sensitive data: passwords, tokens, secrets, full credentials, or full document contents.
* Log retrieval scores and ingestion state transitions.
* **When adding any new feature, API route, component with error handling, or lib module — integrate the logger from the start. This is not optional.**

---

# 4. RAG Quality Standards

## 4.1 Embeddings

* Use `sentence-transformers/all-MiniLM-L6-v2` unless explicitly upgrading.
* Store chunk metadata (document_id, chunk_index).

## 4.2 Retrieval

* Default top-k = 5.
* If similarity < threshold, return graceful "no answer found".
* Do not hallucinate beyond retrieved context.

## 4.3 Prompting

System prompt must enforce:

* Answer only from provided context.
* If not found, say "I don’t know".
* Always include citations.

## 4.4 Fallback

If LLM call fails:

* Return retrieved chunks directly.
* Do not crash endpoint.

---

# 5. Booking System Integrity

* Conflict checks must be server-side.
* Approve action must be transactional.
* Approval must auto-reject conflicting PENDING bookings.
* Calendar creation must not partially succeed without DB update.

Never allow double-booking through race conditions.

---

# 6. Deployment Discipline

Before production deploy:

* Confirm `/health` works.
* Confirm ingestion works on at least one document.
* Confirm chat returns cited answer.
* Confirm booking approval creates calendar event.
* Confirm Inngest cron is registered.

Render cold start must be manually warmed before demo.

---

# 7. Performance & Reliability Rules

* No blocking operations in request path unless required.
* Chunking and embedding must be batched.
* After bulk insert into pgvector → run ANALYZE.
* Avoid large synchronous loops in API handlers.

---

# 8. Things That Must Never Happen

* FastAPI exposed publicly without secret validation.
* Hardcoded API keys.
* Direct DB writes to rag schema from Next.js.
* Silent ingestion failure.
* Chat endpoint returning uncited answers.

---

# 9. Demo Safety Rules

Before demo:

* Warm FastAPI container.
* Confirm 10+ documents show DONE.
* Test one booking approval.
* Keep backup screen recording ready.

If something fails live:

* Switch to backup ingestion → query flow.

---

# 10. Change Management

If modifying:

* DB schema
* Embedding model
* Chunking strategy
* Cron behavior
* Authentication logic

You must:

1. Announce in team chat
2. Update README if needed
3. Confirm local + production compatibility

---

# 11. Ownership Map

* apps/rag/* → RAG Engineer
* apps/web/api/chat → Full-Stack Lead
* apps/web/api/inngest → Full-Stack Lead
* apps/web/api/bookings → Backend Engineer
* apps/web/api/admin → Backend Engineer
* UI components → Frontend Contributor

Do not modify another owner’s core logic without review.

---

# 12. Philosophy

This is a demo-critical system.

Correctness > cleverness.
Stability > feature count.
Clear errors > silent failure.
Deterministic outputs > creative outputs.

If a feature risks breaking the demo, it should be postponed.

---

Version: 1.0
This file defines the operating contract of this repository.
