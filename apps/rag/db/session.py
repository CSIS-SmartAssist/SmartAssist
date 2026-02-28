import threading

import psycopg2
from psycopg2 import pool
from core.config import settings

_connection_pool: pool.SimpleConnectionPool | None = None
_pool_lock = threading.Lock()


def _get_pool() -> pool.SimpleConnectionPool:
    global _connection_pool
    if _connection_pool is None:
        with _pool_lock:
            if _connection_pool is None:
                if not settings.database_url or not settings.database_url.strip():
                    raise RuntimeError(
                        "DATABASE_URL is not configured. "
                        "Set the DATABASE_URL environment variable before starting the service."
                    )
                _connection_pool = pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=10,
                    dsn=settings.database_url,
                )
    return _connection_pool


def get_connection():
    return _get_pool().getconn()


def release_connection(conn):
    _get_pool().putconn(conn)