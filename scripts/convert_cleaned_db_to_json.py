import pandas as pd
import json

def convert_to_json():
    print("--- Converting CSV to JSON for Supabase Import ---")
    input_csv = r"c:\Users\Aledari\Downloads\ai_tools_cleaned.csv"
    output_json = r"d:\synthwave-toolscape\public\data\massive_tools_import.json"
    
    # Read the cleaned CSV
    df = pd.read_csv(input_csv)
    
    # Rename columns to match Supabase expected schema
    df = df.rename(columns={
        'name': 'title',
        'link': 'url'
    })
    
    # Drop rows without title or url
    df = df.dropna(subset=['title', 'url'])
    
    # Fill NaN descriptions and categories with empty strings
    df['description'] = df['description'].fillna("")
    df['category'] = df['category'].fillna("General")
    
    # Ensure all columns are strings (except if we had booleans etc.)
    df['title'] = df['title'].astype(str).str.strip()
    df['url'] = df['url'].astype(str).str.strip()
    df['description'] = df['description'].astype(str).str.strip()
    df['category'] = df['category'].astype(str).str.strip()
    
    # Add pricing_type default (it's mostly missing in this dataset)
    df['pricing_type'] = "Freemium" 
    
    # Add published flag
    df['is_published'] = True
    
    # Convert to list of dictionaries
    records = df.to_dict(orient='records')
    
    # Save as JSON
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully created: {output_json}")
    print(f"Total entries: {len(records)}")
    print("You can now run: node scripts/sync-tools-to-supabase.js --source=public/data/massive_tools_import.json")

if __name__ == "__main__":
    convert_to_json()
