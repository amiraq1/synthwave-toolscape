import sqlite3
import json
import os

# Path to the database file (Update this if needed)
DB_PATH = r"c:\Users\Aledari\Downloads\ai_tools_database.db"

def inspect_db():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        print(f"📂 Connected to: {DB_PATH}")
        print("-" * 40)

        # 1. Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("⚠️ No tables found in the database.")
            return

        print(f"📊 Found {len(tables)} tables:")
        
        for table in tables:
            table_name = table[0]
            print(f"\n🔹 Table: {table_name}")
            
            # 2. Get columns for each table
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            col_names = [col[1] for col in columns]
            print(f"   Columns: {', '.join(col_names)}")
            
            # 3. Count rows
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"   Rows: {count}")

            # 4. Show sample row
            if count > 0:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
                sample = cursor.fetchone()
                print(f"   Sample: {sample}")

        conn.close()
        print("-" * 40)

    except sqlite3.Error as e:
        print(f"❌ SQLite Error: {e}")

if __name__ == "__main__":
    inspect_db()
