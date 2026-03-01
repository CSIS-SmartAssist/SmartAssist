-- rag schema — raw SQL (FastAPI only). Run after Prisma migrations.
-- Requires: CREATE EXTENSION IF NOT EXISTS vector; (run once in Neon SQL editor)

CREATE SCHEMA IF NOT EXISTS rag;

CREATE TABLE IF NOT EXISTS rag.embeddings (
  id            SERIAL PRIMARY KEY,
  document_id   TEXT NOT NULL,
  chunk_index   INT NOT NULL,
  chunk_text    TEXT NOT NULL,
  embedding     vector(384),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_embeddings_vector
  ON rag.embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE IF NOT EXISTS rag.drive_sync_log (
    drive_file_id TEXT PRIMARY KEY,
    filename      TEXT NOT NULL,
    checksum      TEXT NOT NULL,
    synced_at     TIMESTAMPTZ DEFAULT now()
);