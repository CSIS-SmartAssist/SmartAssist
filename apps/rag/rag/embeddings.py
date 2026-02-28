"""sentence-transformers wrapper. Model: all-MiniLM-L6-v2 (384 dims)."""
# TODO: Load model once, expose encode(texts) -> list[list[float]]

def get_embedder():
    raise NotImplementedError("get_embedder() to be implemented")
