from fastembed import TextEmbedding

model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]