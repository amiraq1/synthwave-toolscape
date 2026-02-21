import sqlite3
import pandas as pd
import re

def clean_database(input_db, output_db, output_csv):
    print(f"--- Cleaning Database ---")
    
    # 1. Read data
    conn = sqlite3.connect(input_db)
    df = pd.read_sql_query("SELECT * FROM ai_tools", conn)
    conn.close()
    
    initial_count = len(df)
    print(f"Initial row count: {initial_count}")
    
    # 2. Filter out missing links
    df = df[df['link'].notna() & (df['link'] != '')]
    
    # 3. Filter out the specific github awesome list markdown links
    # These are mostly section links inside the same README
    df = df[~df['link'].str.contains('github.com/tankvn/awesome-ai-tools/blob/main/README.md', na=False, case=False)]
    
    # 4. Filter out any remaining links ending in .md or .md#something
    df = df[~df['link'].str.contains(r'\.md(#.*)?$', na=False, case=False, regex=True)]

    # 5. Drop duplicates based on the link (we don't want repeated tools)
    df = df.drop_duplicates(subset=['link'])
    
    final_count = len(df)
    removed_count = initial_count - final_count
    
    print(f"Removed {removed_count} noise/duplicate rows.")
    print(f"Final row count: {final_count}")
    
    # Save to a new SQLite DB
    conn_out = sqlite3.connect(output_db)
    df.to_sql('ai_tools', conn_out, if_exists='replace', index=False)
    conn_out.close()
    
    # Save to CSV for easy inspection or import
    df.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"Cleaned data saved to:\n - {output_db}\n - {output_csv}")

if __name__ == "__main__":
    input_path = r"c:\Users\Aledari\Downloads\ai_tools_database (1).db"
    output_db = r"c:\Users\Aledari\Downloads\ai_tools_database_cleaned.db"
    output_csv = r"c:\Users\Aledari\Downloads\ai_tools_cleaned.csv"
    
    clean_database(input_path, output_db, output_csv)
