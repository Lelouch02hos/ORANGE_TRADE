# Simple script to test PostgreSQL connection and create tables
import os
from dotenv import load_dotenv
load_dotenv()

import psycopg2

# Test connection
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'tradeorange_db')
    )
    print("[OK] PostgreSQL connection successful!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"[INFO] PostgreSQL version: {version[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")
