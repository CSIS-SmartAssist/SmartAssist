from rag.parsers.pdf import parse_pdf
from rag.parsers.docx import parse_docx
from rag.parsers.txt import parse_txt
from rag.chunker import get_chunks
from rag.embeddings import generate_embeddings
from rag.vector_store import save_chunks

SUPPORTED_TYPES = {
    "application/pdf": parse_pdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": parse_docx,
    "text/plain": parse_txt,
}

def ingest_file(file_bytes: bytes, mime_type: str, document_id: str) -> dict:
    # Step 1 — pick the right parser
    parser = SUPPORTED_TYPES.get(mime_type)
    if not parser:
        raise ValueError(f"Unsupported file type: {mime_type}")

    # Step 2 — extract text
    text = parser(file_bytes)
    if not text:
        raise ValueError("File appears to be empty or unreadable")

    # Step 3 — chunk
    chunks = get_chunks(text)
    if not chunks:
        raise ValueError("No chunks produced from document")

    # Step 4 — embed
    embeddings = generate_embeddings(chunks)

    # Step 5 — save to pgvector
    save_chunks(document_id, chunks, embeddings)

    return {
        "document_id": document_id,
        "chunks": len(chunks),
        "status": "done"
    }