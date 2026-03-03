import sqlite3
import pandas as pd
import sys

def analyze_sqlite(db_path):
    print(f"--- Analyzing SQLite Database: {db_path} ---")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database.")
            return

        print(f"\nFound {len(tables)} tables:")
        
        # Analyze each table
        for table in tables:
            table_name = table[0]
            print(f"\n=============================")
            print(f"Table: {table_name}")
            print(f"=============================")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"Row count: {count}")
            
            # Get schema
            print("\nSchema:")
            df_schema = pd.read_sql_query(f"PRAGMA table_info({table_name})", conn)
            print(df_schema[['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk']].to_string(index=False))
            
            # Print sample data
            if count > 0:
                print("\nSample Data (first 3 rows):")
                df_sample = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT 3", conn)
                print(df_sample.to_string(index=False))
            
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    db_path = r"c:\Users\Aledari\Downloads\ai_tools_database (1).db"
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    
    analyze_sqlite(db_path)
