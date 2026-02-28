from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import query, ingest
from core.config import settings

app = FastAPI(title="CSIS SmartAssist RAG Service")

# CORS — only allow Next.js to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add Vercel URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Internal secret check — every request must have the right header
@app.middleware("http")
async def verify_internal_secret(request: Request, call_next):
    path = request.url.path

    # Normalize path to handle trailing slashes (e.g., "/health/").
    if path != "/" and path.endswith("/"):
        normalized_path = path.rstrip("/")
    else:
        normalized_path = path

    # Paths that should bypass the internal secret check (health and docs).
    allowed_paths = {"/health"}
    for docs_path in (app.docs_url, app.openapi_url, app.redoc_url):
        if docs_path:
            allowed_paths.add(docs_path)

    if normalized_path in allowed_paths:
        return await call_next(request)
    secret = request.headers.get("x-internal-secret")
    if secret != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden")
    return await call_next(request)

app.include_router(query.router, prefix="/rag")
app.include_router(ingest.router, prefix="/rag")

@app.get("/health")
def health():
    return {"status": "ok"}