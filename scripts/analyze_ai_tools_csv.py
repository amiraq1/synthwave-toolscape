import pandas as pd
import os

def analyze_tools_csv(file_path):
    print(f"--- Analyzing {file_path} ---")
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return

    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    print(f"\nTotal Tools: {len(df)}")
    
    print(f"\n--- Category Distribution ---")
    if 'category' in df.columns:
        print(df['category'].value_counts().head(10))
    else:
        print("Column 'category' not found.")
    
    print(f"\n--- Pricing Type Distribution ---")
    if 'pricing_type' in df.columns:
        print(df['pricing_type'].value_counts())
        
    print(f"\n--- Average Views & Clicks ---")
    if 'views_count' in df.columns and 'clicks_count' in df.columns:
        print(df[['views_count', 'clicks_count']].describe())

    print(f"\n--- Top 5 Tools by Views ---")
    if 'views_count' in df.columns and 'title' in df.columns:
        top_views = df.sort_values(by='views_count', ascending=False)[['title', 'views_count']].head(5)
        print(top_views)

    print(f"\n--- Missing Values (Top 10 columns with most missing) ---")
    missing = df.isnull().sum().sort_values(ascending=False)
    print(missing[missing > 0].head(10))

if __name__ == "__main__":
    # Go up one directory if run from scripts/
    csv_path = os.path.join(os.path.dirname(__file__), "..", "tools_rows.csv")
    analyze_tools_csv(csv_path)
