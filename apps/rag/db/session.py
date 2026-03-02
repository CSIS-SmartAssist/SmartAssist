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
            dsn=settings.database_url,
            keepalives=1,
            keepalives_idle=30,
            keepalives_interval=10,
            keepalives_count=5,
            connect_timeout=10,
        )
        conn = _pool.getconn()
        register_vector(conn)
        _pool.putconn(conn)
    return _pool

def get_connection():
    try:
        conn = get_pool().getconn()
        conn.isolation_level
        register_vector(conn)
        return conn
    except Exception:
        # Connection is stale — reset the pool and try once more
        global _pool
        try:
            _pool.closeall()
        except Exception:
            pass
        _pool = None
        conn = get_pool().getconn()
        register_vector(conn)
        return conn

def release_connection(conn):
    try:
        get_pool().putconn(conn)
    except Exception:
        pass