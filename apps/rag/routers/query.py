from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.query import query_rag

router = APIRouter()

class QueryRequest(BaseModel):
    message: str

@router.post("/query")
async def query_endpoint(body: QueryRequest):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    result = query_rag(body.message)
    return result