from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from rag.ingest import ingest_file
from db.session import get_connection, release_connection
import mimetypes
import logging

log = logging.getLogger(__name__)

router = APIRouter()

SUPPORTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
]

@router.post("/ingest/file")
async def ingest_file_endpoint(
    file: UploadFile = File(...),
    document_id: str = Form(...)
):
    # Detect from filename if content_type is generic
    content_type = file.content_type
    if content_type == "application/octet-stream" or not content_type:
        guessed, _ = mimetypes.guess_type(file.filename or "")
        content_type = guessed or content_type

    if content_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}"
        )

    file_bytes = await file.read()

    try:
        result = ingest_file(file_bytes, content_type, document_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@router.post("/ingest/upload-to-drive")
async def upload_to_drive_and_ingest(
    file: UploadFile = File(...),
    document_id: str = Form(...),
):
    """Upload a file to the configured Google Drive folder, then ingest into RAG."""
    content_type = file.content_type
    if content_type == "application/octet-stream" or not content_type:
        guessed, _ = mimetypes.guess_type(file.filename or "")
        content_type = guessed or content_type

    if content_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}",
        )

    file_bytes = await file.read()

    # Step 1 — upload to Google Drive
    try:
        from rag.drive_sync import upload_to_drive

        drive_result = upload_to_drive(
            file_bytes, file.filename or "document", content_type
        )
        log.info(
            "Uploaded to Drive: file_id=%s, name=%s",
            drive_result["drive_file_id"],
            drive_result["filename"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Google Drive upload failed: {str(e)}",
        )

    # Step 2 — ingest into RAG pipeline
    try:
        ingest_result = ingest_file(file_bytes, content_type, document_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    # Step 3 — record in drive_sync_log so future syncs skip this file
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO rag.drive_sync_log (drive_file_id, filename, checksum, synced_at)
            VALUES (%s, %s, %s, now())
            ON CONFLICT (drive_file_id) DO UPDATE
            SET checksum = EXCLUDED.checksum, synced_at = now()
            """,
            (
                drive_result["drive_file_id"],
                drive_result["filename"],
                drive_result.get("checksum", ""),
            ),
        )
        conn.commit()
        cur.close()
    finally:
        release_connection(conn)

    return {
        **ingest_result,
        "drive_file_id": drive_result["drive_file_id"],
    }


@router.post("/ingest/sync")
async def sync_endpoint():
    try:
        from rag.drive_sync import sync_drive_folder
        result = sync_drive_folder()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ingest/status")
async def status_endpoint():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM rag.embeddings")
        total_chunks = cur.fetchone()[0]
        cur.execute("SELECT COUNT(DISTINCT document_id) FROM rag.embeddings")
        total_docs = cur.fetchone()[0]
        cur.close()
        return {
            "total_documents": total_docs,
            "total_chunks": total_chunks,
            "status": "ok"
        }
    finally:
        release_connection(conn)


@router.get("/ingest/drive-check")
async def drive_check_endpoint():
    """Verify Google Drive config: credentials, folder access, and write permission."""
    from core.config import settings
    import json as _json

    if not settings.google_service_account_json:
        return {"ok": False, "error": "GOOGLE_SERVICE_ACCOUNT_JSON is not set"}
    if not settings.google_drive_folder_id:
        return {"ok": False, "error": "GOOGLE_DRIVE_FOLDER_ID is not set"}

    try:
        sa_email = _json.loads(settings.google_service_account_json).get("client_email", "unknown")
    except Exception:
        return {"ok": False, "error": "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON"}

    try:
        from rag.drive_sync import get_drive_service
        service = get_drive_service()
        folder = service.files().get(
            fileId=settings.google_drive_folder_id,
            fields="id, name, capabilities, driveId, teamDriveId",
            supportsAllDrives=True,
        ).execute()
    except Exception as e:
        return {
            "ok": False,
            "error": f"Cannot access Drive folder: {e}",
            "service_account": sa_email,
            "folder_id": settings.google_drive_folder_id,
        }

    caps = folder.get("capabilities", {})
    can_write = caps.get("canEdit", False) or caps.get("canAddChildren", False)
    is_shared_drive = bool(folder.get("driveId") or folder.get("teamDriveId"))

    error = None
    if not can_write:
        error = (
            f"Service account '{sa_email}' cannot write to folder "
            f"'{folder.get('name')}'. Share it as Editor."
        )
    elif not is_shared_drive:
        error = (
            "WARNING: This folder is NOT on a Shared Drive. "
            "Service accounts cannot upload to regular Drive folders "
            "(storageQuotaExceeded). Move the folder to a Shared Drive, "
            "or create a new Shared Drive and update GOOGLE_DRIVE_FOLDER_ID."
        )

    return {
        "ok": can_write and is_shared_drive,
        "folder_name": folder.get("name"),
        "folder_id": folder.get("id"),
        "service_account": sa_email,
        "can_write": can_write,
        "is_shared_drive": is_shared_drive,
        "error": error,
    }