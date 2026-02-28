from rag.embeddings import generate_embeddings
from rag.vector_store import search_similar_chunks
from rag.llm import call_groq

CONFIDENCE_THRESHOLD = 0.4

def build_prompt(question: str, chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks):
        context_parts.append(f"[Source {i+1}]\n{chunk['chunk_text']}")
    context = "\n\n".join(context_parts)
    return (
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer based only on the context above:"
    )

def query_rag(message: str) -> dict:
    query_embedding = generate_embeddings([message])[0]
    results = search_similar_chunks(query_embedding, top_k=5)

    if not results or results[0]["score"] < CONFIDENCE_THRESHOLD:
        return {
            "answer": "I don't have enough information in my knowledge base to answer that question confidently.",
            "citations": []
        }

    prompt = build_prompt(message, results)
    answer = call_groq(prompt)

    citations = [
        {
            "document_id": r["document_id"],
            "excerpt": r["chunk_text"][:200],
            "score": round(r["score"], 3)
        }
        for r in results
        if r["score"] >= CONFIDENCE_THRESHOLD
    ]

    return {"answer": answer, "citations": citations}