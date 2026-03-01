from rag.embeddings import generate_embeddings
from rag.vector_store import search_similar_chunks
from rag.llm import call_groq, call_groq_with_tools
from rag.rooms import get_all_rooms

CONFIDENCE_THRESHOLD = 0.25

BOOKING_KEYWORDS = [
    "book", "reserve", "booking", "reservation",
    "schedule", "i want to book", "can i book",
    "book lab", "book room", "book seminar"
]

def is_booking_intent(message: str) -> bool:
    msg = message.lower()
    return any(keyword in msg for keyword in BOOKING_KEYWORDS)


def build_prompt_with_context(question: str, chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks):
        context_parts.append(f"[Source {i+1}]\n{chunk['chunk_text']}")
    context = "\n\n".join(context_parts)
    return (
        f"You are a helpful academic assistant for the CS department at BITS Goa.\n"
        f"Use the following context from official department documents to answer the question.\n"
        f"If the context is helpful, use it and cite it.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )


def build_prompt_general(question: str) -> str:
    return (
        f"You are a helpful academic assistant for the CS department at BITS Goa.\n"
        f"Answer the following question as helpfully as possible.\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )


def query_rag(message: str) -> dict:
    # Step 1 — fast keyword check before any embedding or LLM call
    if is_booking_intent(message):
        rooms = get_all_rooms()
        tool_result = call_groq_with_tools(message, rooms)

        if tool_result["type"] == "booking_request":
            return {
                "type": "booking_request",
                "params": tool_result["params"],
                "answer": None,
                "citations": []
            }

        if tool_result["type"] == "booking_incomplete":
            return {
                "type": "text",
                "answer": tool_result["answer"],
                "citations": []
            }

        if tool_result["type"] == "text":
            # Groq didn't call the tool — ask for booking details directly
            room_names = ", ".join([r["name"] for r in rooms])
            return {
                "type": "text",
                "answer": (
                    f"I'd love to help you book a room! Please provide the following details:\n\n"
                    f"- **Room**: which room you need ({room_names})\n"
                    f"- **Date**: which date\n"
                    f"- **Time**: start and end time\n"
                    f"- **Reason**: purpose of the booking\n\n"
                    f"For example: *Book LT1 this Friday from 2pm to 4pm for my ML project*"
                ),
                "citations": []
            }

    # Step 2 — normal RAG flow
    query_embedding = generate_embeddings([message])[0]
    results = search_similar_chunks(query_embedding, top_k=5)
    good_results = [r for r in results if r["score"] >= CONFIDENCE_THRESHOLD]

    if good_results:
        prompt = build_prompt_with_context(message, good_results)
        citations = [
            {
                "document_id": r["document_id"],
                "excerpt": r["chunk_text"][:200],
                "score": round(r["score"], 3),
            }
            for r in good_results
        ]
    else:
        prompt = build_prompt_general(message)
        citations = []

    try:
        answer = call_groq(prompt)
    except Exception:
        answer = "I'm having trouble connecting right now. Please try again in a moment."
        citations = []

    return {
        "type": "text",
        "answer": answer,
        "citations": citations
    }