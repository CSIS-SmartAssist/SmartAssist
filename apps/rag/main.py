"""
CSIS SmartAssist — RAG microservice.
All RAG logic: query, ingestion, embeddings, vector search.
Protected by x-internal-secret; only Next.js calls this service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import query, ingest

app = FastAPI(title="CSIS SmartAssist RAG", version="0.1.0")

if settings.cors_origins:
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(query.router, prefix="/rag", tags=["query"])
app.include_router(ingest.router, prefix="/rag", tags=["ingest"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "rag"}
