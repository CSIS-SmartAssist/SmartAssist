import psycopg2
from psycopg2 import pool
from pgvector.psycopg2 import register_vector

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        from core.config import settings
        _pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=settings.database_url
        )
        conn = _pool.getconn()
        register_vector(conn)
        _pool.putconn(conn)
    return _pool

def get_connection():
    conn = get_pool().getconn()
    register_vector(conn)
    return conn

def release_connection(conn):
    get_pool().putconn(conn)