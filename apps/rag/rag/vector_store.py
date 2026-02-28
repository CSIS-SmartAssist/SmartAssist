"""pgvector read/write helpers for rag.embeddings."""
# TODO: insert_embeddings(), search(query_embedding, top_k=5)

def insert_embeddings(document_id: str, chunks: list[tuple[int, str]], embeddings: list[list[float]]):
    raise NotImplementedError("insert_embeddings() to be implemented")


def search(query_embedding: list[float], top_k: int = 5):
    raise NotImplementedError("search() to be implemented")
