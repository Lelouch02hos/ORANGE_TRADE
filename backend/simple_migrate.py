"""
Script simplifié pour migrer les données de SQLite vers PostgreSQL
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import sessionmaker

# Charger les variables d'environnement
load_dotenv()

def get_postgresql_uri():
    """Build PostgreSQL connection URI"""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'tradeorange_db')
    
    return f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

def get_sqlite_uri():
    """Build SQLite connection URI"""
    basedir = os.path.abspath(os.path.dirname(__file__))
    return 'sqlite:///' + os.path.join(basedir, 'tradesense.db')

def main():
    print("[INFO] Simple migration script for TradeOrange")
    print("=" * 60)
    
    # Create engines
    sqlite_uri = get_sqlite_uri()
    postgres_uri = get_postgresql_uri()
    
    print(f"[INFO] Connecting to SQLite: tradesense.db")
    print(f"[INFO] Connecting to PostgreSQL: tradeorange_db")
    
    try:
        sqlite_engine = create_engine(sqlite_uri)
        postgres_engine = create_engine(postgres_uri)
        
        # Test connections
        with sqlite_engine.connect() as conn:
            print("[OK] SQLite connection successful")
        
        with postgres_engine.connect() as conn:
            print("[OK] PostgreSQL connection successful")
        
        # Get metadata
        metadata = MetaData()
        metadata.reflect(bind=sqlite_engine)
        
        print(f"\n[INFO] Tables to migrate: {list(metadata.tables.keys())}")
        
        # Create tables in PostgreSQL
        print("\n[INFO] Creating tables in PostgreSQL...")
        metadata.create_all(postgres_engine)
        print("[OK] Tables created")
        
        # Migrate data for each table
        print("\n[INFO] Migrating data...")
        
        SqliteSession = sessionmaker(bind=sqlite_engine)
        PostgresSession = sessionmaker(bind=postgres_engine)
        
        sqlite_session = SqliteSession()
        postgres_session = PostgresSession()
        
        migration_report = []
        
        for table_name in metadata.tables.keys():
            table = metadata.tables[table_name]
            
            # Read from SQLite
            select_stmt = table.select()
            with sqlite_engine.connect() as conn:
                rows = conn.execute(select_stmt).fetchall()
            
            if not rows:
                print(f"  [SKIP] {table_name}: No data")
                migration_report.append(f"{table_name}: 0 records")
                continue
            
            print(f"  [MIGRATE] {table_name}: {len(rows)} records...")
            
            # Insert into PostgreSQL
            with postgres_engine.connect() as conn:
                for row in rows:
                    insert_stmt = table.insert().values(**dict(row._mapping))
                    conn.execute(insert_stmt)
                conn.commit()
            
            print(f"    [OK] Migrated {len(rows)} records")
            migration_report.append(f"{table_name}: {len(rows)} records [OK]")
        
        sqlite_session.close()
        postgres_session.close()
        
        print("\n" + "=" * 60)
        print("[REPORT] MIGRATION SUMMARY")
        print("=" * 60)
        for report in migration_report:
            print(f"  {report}")
        print("=" * 60)
        
        print("\n[SUCCESS] Migration completed successfully!")
        print("\n[INFO] Next steps:")
        print("  1. Keep tradesense.db as backup")
        print("  2. Restart your backend server")
        print("  3. Test the application")
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
