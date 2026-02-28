"""POST /rag/ingest/file, POST /rag/ingest/sync, GET /rag/ingest/status, GET /health."""
from fastapi import APIRouter, Header, HTTPException

from core.config import settings

router = APIRouter()


def _require_internal_secret(x_internal_secret: str | None) -> None:
    if not x_internal_secret or x_internal_secret != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/ingest/file")
def ingest_file(
    x_internal_secret: str | None = Header(None),
):
    _require_internal_secret(x_internal_secret)
    # TODO: receive file bytes or drive_file_id + document_id, call ingest_file()
    return {"status": "ok", "message": "ingest/file not yet implemented"}


@router.post("/ingest/sync")
def ingest_sync(
    x_internal_secret: str | None = Header(None),
):
    _require_internal_secret(x_internal_secret)
    # TODO: Drive sync → diff → ingest_file() for new/changed
    return {"status": "ok", "message": "ingest/sync not yet implemented"}


@router.get("/ingest/status")
def ingest_status(
    x_internal_secret: str | None = Header(None),
):
    _require_internal_secret(x_internal_secret)
    # TODO: return list of documents and ingestion status
    return {"documents": []}
