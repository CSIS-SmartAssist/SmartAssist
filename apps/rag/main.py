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
    if request.url.path == "/health":
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