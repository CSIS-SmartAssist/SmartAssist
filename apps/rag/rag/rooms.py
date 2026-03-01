from db.session import get_connection, release_connection

def get_all_rooms() -> list[dict]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute('SELECT id, name, location, capacity FROM "Room"')
        rows = cur.fetchall()
        cur.close()
        return [
            {
                "id": row[0],
                "name": row[1],
                "location": row[2],
                "capacity": row[3],
            }
            for row in rows
        ]
    finally:
        release_connection(conn)