"""POST /rag/ingest/file, POST /rag/ingest/sync, GET /rag/ingest/status, GET /health."""
import logging
from fastapi import APIRouter, Header, HTTPException, UploadFile, File, Form

from core.config import settings
from rag.ingest import ingest_file as _ingest_file

logger = logging.getLogger(__name__)

_MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

router = APIRouter()


def _require_internal_secret(x_internal_secret: str | None) -> None:
    if not x_internal_secret or x_internal_secret != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/ingest/file")
async def ingest_file(
    document_id: str = Form(...),
    file: UploadFile = File(...),
    x_internal_secret: str | None = Header(None),
):
    _require_internal_secret(x_internal_secret)
    mime_type = file.content_type
    if not mime_type:
        raise HTTPException(status_code=422, detail="Missing file content type")
    if file.size is not None and file.size > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 50 MB)")
    file_bytes = await file.read()
    if len(file_bytes) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 50 MB)")
    try:
        result = _ingest_file(file_bytes, mime_type, document_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Ingestion failed for document_id=%s", document_id)
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
