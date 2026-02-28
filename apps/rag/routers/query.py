from fastapi import APIRouter

router = APIRouter()

@router.post("/query")
async def query_endpoint():
    return {"answer": "placeholder", "citations": []}