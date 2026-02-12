import sqlite3
import json
import os
from datetime import datetime

# DB Path
DB_PATH = r"c:\Users\Aledari\Downloads\ai_tools_database.db"
OUTPUT_PATH = "public/data/real_tools.json"

def export_db():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        # Use Row factory to access columns by name
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        print(f"📊 Reading from: {DB_PATH}")
        
        # Select relevant columns
        cursor.execute("SELECT id, name, link, description, category FROM ai_tools")
        rows = cursor.fetchall()
        
        tools = []
        
        for row in rows:
            # Map SQLite columns to our Schema
            tool = {
                "id": str(row["id"]), # Convert to string to match our schema maybe? Or keep number. Our schema usually uses numbers for import but string for uuid. Let's keep ID for reference or let Supabase generate new ones?
                # Actually, better to let Supabase generate IDs to avoid conflicts, but we can keep it in 'id' if we want to upsert.
                # Let's drop ID and let Supabase auto-increment.
                
                "title": row["name"] or "Untitled Tool",
                "title_en": row["name"] or "Untitled Tool", # Copy name to English title
                "description": row["description"] or "No description provided.",
                "description_en": row["description"] or "No description provided.",
                "category": row["category"] or "Uncategorized",
                "url": row["link"] or "",
                
                # Default fields for Schema compatibility
                "image_url": "", # No image in DB
                "pricing_type": "Free", # Default to Free as we don't know
                "is_featured": False,
                "is_published": True,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "features": [],
                "screenshots": [],
                "is_sponsored": False,
                "supports_arabic": False
            }
            tools.append(tool)

        conn.close()

        # Write to JSON
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(tools, f, indent=2, ensure_ascii=False)

        print(f"✅ Successfully exported {len(tools)} tools to {OUTPUT_PATH}")

    except sqlite3.Error as e:
        print(f"❌ SQLite Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    export_db()
