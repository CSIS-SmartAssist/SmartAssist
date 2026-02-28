from db.session import get_connection, release_connection
from psycopg2.extras import execute_values

def save_chunks(document_id: str, chunks: list[str], embeddings: list[list[float]]):
    conn = get_connection()
    cur = None
    try:
        cur = conn.cursor()

        # Delete old chunks for this document if reinserting
        cur.execute("DELETE FROM rag.embeddings WHERE document_id = %s", (document_id,))

        # Insert new chunks
        rows = [
            (document_id, idx, chunk, embedding)
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]

        execute_values(
            cur,
            """
            INSERT INTO rag.embeddings (document_id, chunk_index, chunk_text, embedding)
            VALUES %s
            """,
            rows,
            template="(%s, %s, %s, %s::vector)"
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        if cur is not None:
            cur.close()
        release_connection(conn)