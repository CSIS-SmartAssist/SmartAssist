import psycopg2
from psycopg2 import pool
from pgvector.psycopg2 import register_vector
from core.config import settings

def create_pool():
    p = pool.SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        dsn=settings.database_url
    )
    # Register vector type on a connection so psycopg2 understands it
    conn = p.getconn()
    register_vector(conn)
    p.putconn(conn)
    return p

connection_pool = create_pool()

def get_connection():
    conn = connection_pool.getconn()
    register_vector(conn)
    return conn

def release_connection(conn):
    connection_pool.putconn(conn)