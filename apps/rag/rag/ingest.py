"""ingest_file() — core pipeline: detect type → extract text → chunk → embed → pgvector."""
# TODO: Implement full pipeline:
# - Detect file type → extract text (PDF/DOCX/TXT)
# - Update DB status PROCESSING
# - Chunk with LangChain RecursiveCharacterTextSplitter (500/50)
# - Generate embeddings (sentence-transformers/all-MiniLM-L6-v2)
# - Batch insert into rag.embeddings
# - Update DB status DONE (or FAILED with errorMessage, retry once)

def ingest_file(file_bytes=None, drive_file_id=None, document_id: str = ""):
    raise NotImplementedError("ingest_file() to be implemented")
