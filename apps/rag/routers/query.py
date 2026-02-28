"""POST /rag/query — embed → pgvector → Groq → response with citations."""
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from core.config import settings

router = APIRouter()


class QueryBody(BaseModel):
    message: str = ""


def _require_internal_secret(x_internal_secret: str | None) -> None:
    if not x_internal_secret or x_internal_secret != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/query")
def query_rag(
    body: QueryBody,
    x_internal_secret: str | None = Header(None),
):
    _require_internal_secret(x_internal_secret)
    # TODO: call rag.query pipeline (embed → pgvector → Groq → citations)
    return {"answer": f"(RAG response for: {body.message})", "citations": []}
