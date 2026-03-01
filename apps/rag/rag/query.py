from rag.embeddings import generate_embeddings
from rag.vector_store import search_similar_chunks
from rag.llm import call_groq

CONFIDENCE_THRESHOLD = 0.25


def build_prompt_with_context(question: str, chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks):
        context_parts.append(f"[Source {i+1}]\n{chunk['chunk_text']}")
    context = "\n\n".join(context_parts)
    return (
        f"You are a helpful academic assistant for the CS department at BITS Goa.\n"
        f"Use the following context from official department documents to answer the question.\n"
        f"If the context is helpful, use it and cite it. If it's not enough, supplement with your own knowledge.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )


def build_prompt_general(question: str) -> str:
    return (
        f"You are a helpful academic assistant for the CS department at BITS Goa.\n"
        f"Answer the following question as helpfully as possible.\n"
        f"If it is about department-specific policies or documents you don't have access to, "
        f"say so and suggest the student contact the department office.\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )


def query_rag(message: str) -> dict:
    # Step 1 — embed the question
    query_embedding = generate_embeddings([message])[0]

    # Step 2 — search pgvector
    results = search_similar_chunks(query_embedding, top_k=5)

    # Step 3 — check if we have good context
    good_results = [r for r in results if r["score"] >= CONFIDENCE_THRESHOLD]

    if good_results:
        # We have relevant documents — use them
        prompt = build_prompt_with_context(message, good_results)
        answer = call_groq(prompt)
        citations = [
            {
                "document_id": r["document_id"],
                "excerpt": r["chunk_text"][:200],
                "score": round(r["score"], 3),
            }
            for r in good_results
        ]
        return {"answer": answer, "citations": citations}
    else:
        # No relevant documents — use Llama as general assistant
        prompt = build_prompt_general(message)
        answer = call_groq(prompt)
        return {"answer": answer, "citations": []}