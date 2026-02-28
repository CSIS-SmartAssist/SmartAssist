"""Pg connection pool to Neon. Used by vector_store and ingest."""
import os
from contextlib import contextmanager

import psycopg2
from psycopg2.extras import RealDictCursor

# Connection is created from env DATABASE_URL
def get_connection():
    return psycopg2.connect(os.environ.get("DATABASE_URL", ""), cursor_factory=RealDictCursor)


@contextmanager
def get_cursor():
    conn = get_connection()
    try:
        yield conn.cursor()
        conn.commit()
    finally:
        conn.close()
