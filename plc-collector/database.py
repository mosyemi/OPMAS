"""
OPMAS-001 | Database Connection Pool
MySQL connection pool shared by the collector and alarm engine.
"""
import logging
import mysql.connector
from mysql.connector import pooling
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

logger = logging.getLogger(__name__)

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="opmas_pool",
            pool_size=5,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=False,
        )
        logger.info("MySQL connection pool created")
    return _pool


def execute(query, params=None, fetch=False):
    """Run a query. If fetch=True, returns rows."""
    conn = get_pool().get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        if fetch:
            return cursor.fetchall()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def close_pool():
    # mysql-connector manages pool lifecycle automatically
    logger.info("MySQL connection pool released")
