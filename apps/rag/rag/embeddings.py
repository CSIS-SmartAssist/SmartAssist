from sentence_transformers import SentenceTransformer

# Loads once when the module is imported — stays in memory
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()