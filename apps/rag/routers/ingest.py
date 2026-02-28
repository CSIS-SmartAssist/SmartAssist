"""POST /rag/ingest/file, POST /rag/ingest/sync, GET /rag/ingest/status, GET /health."""
import asyncio

from fastapi import APIRouter, Form, Header, HTTPException, UploadFile

from core.config import settings
from rag.ingest import ingest_file as _ingest_file

router = APIRouter()


def _require_internal_secret(x_internal_secret: str | None) -> None:
    if not x_internal_secret or x_internal_secret != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/ingest/file")
async def ingest_file_endpoint(
    file: UploadFile,
    document_id: str = Form(...),
    x_internal_secret: str | None = Header(None),
):
    _require_internal_secret(x_internal_secret)
    file_bytes = await file.read()
    mime_type = file.content_type or "application/octet-stream"
    try:
        result = await asyncio.to_thread(_ingest_file, file_bytes, mime_type, document_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Ingestion failed") from exc
    return result


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
