import cx_Oracle

try:
    conn = cx_Oracle.connect("ASHA/ASHA@localhost:1521/XE")
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, name, role, phc_id FROM users")
    rows = cursor.fetchall()
    print("=" * 60)
    print("USERS IN DATABASE:")
    print("=" * 60)
    for r in rows:
        print(f"ID: {r[0]} | Username: {r[1]} | Name: {r[2]} | Role: {r[3]} | PHC: {r[4]}")
    cursor.close()
    conn.close()
except Exception as e:
    print("Error:", e)
