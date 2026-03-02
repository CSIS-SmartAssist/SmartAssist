import json
import io
import logging
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload
from google.oauth2 import service_account
from core.config import settings
from rag.ingest import ingest_file
from db.session import get_connection, release_connection

log = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive"]

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


def upload_to_drive(file_bytes: bytes, filename: str, mime_type: str) -> dict:
    """Upload a file to the configured Google Drive folder and return metadata.

    Uses supportsAllDrives=True so this works for both regular folders and
    Shared Drives.  Service accounts have no personal storage quota, so the
    target folder MUST live on a Shared Drive (or the account must use
    domain-wide delegation).
    """
    if not settings.google_service_account_json or not settings.google_drive_folder_id:
        raise ValueError("Google Drive is not configured (missing service account or folder ID)")

    service = get_drive_service()

    # Parse service account email for error messages
    try:
        sa_email = json.loads(settings.google_service_account_json).get("client_email", "unknown")
    except Exception:
        sa_email = "unknown"

    file_metadata = {
        "name": filename,
        "parents": [settings.google_drive_folder_id],
    }

    media = MediaIoBaseUpload(
        io.BytesIO(file_bytes), mimetype=mime_type, resumable=True
    )

    try:
        created_file = (
            service.files()
            .create(
                body=file_metadata,
                media_body=media,
                fields="id, name, md5Checksum, modifiedTime",
                supportsAllDrives=True,
            )
            .execute()
        )
    except HttpError as e:
        error_detail = str(e)
        if e.resp.status == 403 and "storageQuotaExceeded" in error_detail:
            raise PermissionError(
                f"Service accounts have no personal storage quota. "
                f"The target folder must be on a Shared Drive (Team Drive). "
                f"Create a Shared Drive → move the folder into it → "
                f"add '{sa_email}' as a Contributor. "
                f"See: https://developers.google.com/drive/api/guides/about-shareddrives"
            )
        if e.resp.status == 403:
            raise PermissionError(
                f"Google Drive upload forbidden (403). "
                f"Service account: '{sa_email}'. "
                f"Google error: {error_detail}"
            )
        raise

    log.info("Uploaded %s to Drive as %s", filename, created_file["id"])

    return {
        "drive_file_id": created_file["id"],
        "filename": created_file["name"],
        "checksum": created_file.get("md5Checksum", ""),
        "modified_time": created_file.get("modifiedTime", ""),
    }


def sync_drive_folder() -> dict:
    if not settings.google_service_account_json or not settings.google_drive_folder_id:
        return {"status": "skipped", "reason": "Drive not configured"}

    service = get_drive_service()

    results = service.files().list(
        q=f"'{settings.google_drive_folder_id}' in parents and trashed=false",
        fields="files(id, name, mimeType, md5Checksum, modifiedTime)",
        pageSize=100,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
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
                ingested.append({
                    "name": f["name"],
                    "drive_file_id": file_id,
                    "mime_type": actual_mime,
                    "checksum": checksum,
                })

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