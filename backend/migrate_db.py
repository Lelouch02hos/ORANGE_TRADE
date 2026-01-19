"""
Script to add the position column to the Trade table
"""
import sqlite3
import os

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'tradesense.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if position column exists
    cursor.execute("PRAGMA table_info(trade)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'position' not in columns:
        print("Adding 'position' column to Trade table...")
        cursor.execute("ALTER TABLE trade ADD COLUMN position VARCHAR(10) DEFAULT 'long'")
        conn.commit()
        print("✅ Column 'position' added successfully!")
    else:
        print("✅ Column 'position' already exists!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()

print("\nMigration completed!")
