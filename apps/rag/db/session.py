import psycopg2
from psycopg2 import pool
from core.config import settings

connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=settings.database_url
)

def get_connection():
    return connection_pool.getconn()

def release_connection(conn):
    connection_pool.putconn(conn)