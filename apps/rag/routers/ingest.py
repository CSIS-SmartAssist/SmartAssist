from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from rag.ingest import ingest_file
from db.session import get_connection, release_connection
import mimetypes

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

    print(f"File: {file.filename}, detected type: {content_type}")

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