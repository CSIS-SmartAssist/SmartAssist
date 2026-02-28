from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/ingest/file")
async def ingest_file_endpoint(file: UploadFile = File(...)):
    return {"status": "placeholder"}

@router.post("/ingest/sync")
async def sync_endpoint():
    return {"status": "placeholder"}

@router.get("/ingest/status")
async def status_endpoint():
    return {"status": "placeholder"}