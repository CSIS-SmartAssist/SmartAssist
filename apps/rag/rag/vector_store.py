from db.session import get_connection, release_connection

def search_similar_chunks(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Convert to string format pgvector understands
        embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
        
        cur.execute(
            """
            SELECT
                document_id,
                chunk_text,
                1 - (embedding <=> %s::vector) AS score
            FROM rag.embeddings
            ORDER BY embedding <=> %s::vector
            LIMIT %s
            """,
            (embedding_str, embedding_str, top_k)
        )
        rows = cur.fetchall()
        cur.close()
        return [
            {
                "document_id": row[0],
                "chunk_text": row[1],
                "score": float(row[2])
            }
            for row in rows
        ]
    finally:
        release_connection(conn)

def save_chunks(document_id: str, chunks: list[str], embeddings: list[list[float]]):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM rag.embeddings WHERE document_id = %s", (document_id,))

        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
            cur.execute(
                """
                INSERT INTO rag.embeddings (document_id, chunk_index, chunk_text, embedding)
                VALUES (%s, %s, %s, %s::vector)
                """,
                (document_id, idx, chunk, embedding_str)
            )

        conn.commit()
        cur.close()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        release_connection(conn)