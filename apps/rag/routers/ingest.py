"""POST /rag/ingest/file, POST /rag/ingest/sync, GET /rag/ingest/status, GET /health."""
import logging

from fastapi import APIRouter, Header, HTTPException, UploadFile, File, Form

from core.config import settings
import rag.ingest as ingest_module

logger = logging.getLogger(__name__)

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
    file_bytes = await file.read()
    mime_type = file.content_type or "application/octet-stream"
    try:
        result = ingest_module.ingest_file(file_bytes, mime_type, document_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Unexpected ingestion error for document_id=%s: %s", document_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Ingestion failed due to an internal error")
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
