import sqlite3
import pandas as pd
from urllib.parse import urlparse
import sys

def explore_links(db_path):
    print(f"--- Exploring Links in: {db_path} ---")
    
    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query("SELECT * FROM ai_tools", conn)
    conn.close()
    
    print(f"Total rows before cleaning: {len(df)}")
    
    # Extract domain
    def get_domain(url):
        try:
            return urlparse(str(url)).netloc
        except:
            return ""
            
    df['domain'] = df['link'].apply(get_domain)
    
    print("\n--- Top 20 Domains ---")
    print(df['domain'].value_counts().head(20))
    
    # Let's see what github links look like
    github_links = df[df['domain'] == 'github.com']
    print(f"\nTotal github.com links: {len(github_links)}")
    if len(github_links) > 0:
        print("Sample github links:")
        print(github_links['link'].head(10).to_string(index=False))

    # Basic cleaning logic: keep rows where link doesn't contain 'awesome-ai-tools' 
    # or perhaps just filter out anything pointing back to the readme.
    
if __name__ == "__main__":
    db_path = r"c:\Users\Aledari\Downloads\ai_tools_database (1).db"
    explore_links(db_path)
