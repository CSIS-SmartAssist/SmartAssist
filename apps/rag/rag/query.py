"""embed → pgvector search → confidence check → Groq → response with citations."""
# TODO: Implement:
# - Embed query with sentence-transformers
# - pgvector similarity search (top-k=5)
# - If score < threshold → graceful "no answer found"
# - Assemble prompt + call Groq (Llama 3.3 70B)
# - Return { answer, citations }

def run_query(message: str) -> dict:
    return {"answer": "", "citations": []}
