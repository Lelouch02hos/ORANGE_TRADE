"""
Script to create PostgreSQL database for TradeOrange
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    """Create the tradeorange_db database if it doesn't exist"""
    
    # Connection parameters
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'tradeorange_db')
    
    print(f"[INFO] Connecting to PostgreSQL server at {db_host}:{db_port}...")
    
    try:
        # Connect to PostgreSQL server (not a specific database)
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database='postgres'  # Connect to default database
        )
        
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        
        exists = cursor.fetchone()
        
        if exists:
            print(f"[OK] Database '{db_name}' already exists")
        else:
            # Create database
            cursor.execute(f'CREATE DATABASE {db_name}')
            print(f"[OK] Database '{db_name}' created successfully")
        
        cursor.close()
        conn.close()
        
        print(f"\n[SUCCESS] PostgreSQL setup complete!")
        print(f"   Database: {db_name}")
        print(f"   Host: {db_host}")
        print(f"   Port: {db_port}")
        
        return True
        
    except psycopg2.Error as e:
        print(f"[ERROR] {e}")
        print("\nPlease verify:")
        print("  - PostgreSQL is running")
        print("  - Credentials are correct in .env file")
        print("  - User has permission to create databases")
        return False

if __name__ == '__main__':
    create_database()
