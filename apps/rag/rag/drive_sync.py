import json
import io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2 import service_account
from core.config import settings
from rag.ingest import ingest_file
from db.session import get_connection, release_connection

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

MIME_MAP = {
    "application/pdf": "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain": "text/plain",
    "application/vnd.google-apps.document": "text/plain",
}

EXPORT_MIME = {
    "application/vnd.google-apps.document": "text/plain",
}


def get_drive_service():
    creds_json = json.loads(settings.google_service_account_json)
    creds = service_account.Credentials.from_service_account_info(
        creds_json, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds)


def sync_drive_folder() -> dict:
    if not settings.google_service_account_json or not settings.google_drive_folder_id:
        return {"status": "skipped", "reason": "Drive not configured"}

    service = get_drive_service()

    results = service.files().list(
        q=f"'{settings.google_drive_folder_id}' in parents and trashed=false",
        fields="files(id, name, mimeType, md5Checksum, modifiedTime)",
        pageSize=100,
    ).execute()

    files = results.get("files", [])
    ingested = []
    skipped = []
    failed = []

    conn = get_connection()
    cur = conn.cursor()

    try:
        for f in files:
            mime = f.get("mimeType")
            if mime not in MIME_MAP:
                skipped.append(f["name"])
                continue

            file_id = f["id"]
            checksum = f.get("md5Checksum") or f.get("modifiedTime", "")

            # Skip if already ingested with same checksum
            cur.execute(
                "SELECT 1 FROM rag.drive_sync_log WHERE drive_file_id = %s AND checksum = %s",
                (file_id, checksum),
            )
            if cur.fetchone():
                skipped.append(f["name"])
                continue

            try:
                if mime in EXPORT_MIME:
                    request = service.files().export_media(
                        fileId=file_id,
                        mimeType=EXPORT_MIME[mime]
                    )
                else:
                    request = service.files().get_media(fileId=file_id)

                buffer = io.BytesIO()
                downloader = MediaIoBaseDownload(buffer, request)
                done = False
                while not done:
                    _, done = downloader.next_chunk()

                file_bytes = buffer.getvalue()
                actual_mime = MIME_MAP[mime]

                ingest_file(file_bytes, actual_mime, file_id)

                cur.execute(
                    """
                    INSERT INTO rag.drive_sync_log (drive_file_id, filename, checksum, synced_at)
                    VALUES (%s, %s, %s, now())
                    ON CONFLICT (drive_file_id) DO UPDATE
                    SET checksum = EXCLUDED.checksum, synced_at = now()
                    """,
                    (file_id, f["name"], checksum),
                )
                conn.commit()
                ingested.append(f["name"])

            except Exception as e:
                conn.rollback()
                failed.append({"name": f["name"], "error": str(e)})

    finally:
        cur.close()
        release_connection(conn)

    return {
        "status": "done",
        "ingested": ingested,
        "skipped": skipped,
        "failed": failed,
    }