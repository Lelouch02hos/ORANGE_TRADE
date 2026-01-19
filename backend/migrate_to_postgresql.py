"""
Script to migrate data from SQLite to PostgreSQL
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Import models
from models import User, Challenge, Trade, Transaction
from extensions import db

def get_sqlite_engine():
    """Create SQLite engine"""
    basedir = os.path.abspath(os.path.dirname(__file__))
    sqlite_uri = 'sqlite:///' + os.path.join(basedir, 'tradesense.db')
    return create_engine(sqlite_uri)

def get_postgresql_uri():
    """Build PostgreSQL connection URI"""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'tradeorange_db')
    
    return f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

def migrate_data():
    """Migrate all data from SQLite to PostgreSQL"""
    
    print("[INFO] Starting migration from SQLite to PostgreSQL...\n")
    
    # Create engines
    sqlite_engine = get_sqlite_engine()
    postgresql_uri = get_postgresql_uri()
    postgresql_engine = create_engine(postgresql_uri)
    
    # Create sessions
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgresql_engine)
    
    sqlite_session = SqliteSession()
    postgres_session = PostgresSession()
    
    try:
        # Check if SQLite database exists
        inspector = inspect(sqlite_engine)
        if not inspector.get_table_names():
            print("[WARNING] No tables found in SQLite database")
            return False
        
        print("[INFO] Source SQLite Database:")
        print(f"   Tables: {inspector.get_table_names()}\n")
        
        # Migrate each model
        models_to_migrate = [
            (User, 'Users'),
            (Challenge, 'Challenges'),
            (Trade, 'Trades'),
            (Transaction, 'Transactions')
        ]
        
        migration_report = []
        
        for model, name in models_to_migrate:
            try:
                # Get all records from SQLite
                records = sqlite_session.query(model).all()
                count = len(records)
                
                if count == 0:
                    print(f"[SKIP] {name}: No records to migrate")
                    migration_report.append(f"{name}: 0 records")
                    continue
                
                print(f"[MIGRATING] {name}...")
                
                # Add records to PostgreSQL
                for record in records:
                    # Create a new instance with the same data
                    postgres_session.merge(record)
                
                postgres_session.commit()
                
                # Verify migration
                postgres_count = postgres_session.query(model).count()
                
                if postgres_count == count:
                    print(f"   [OK] {count} records migrated successfully")
                    migration_report.append(f"{name}: {count} records [OK]")
                else:
                    print(f"   [WARNING] SQLite had {count} records, PostgreSQL has {postgres_count}")
                    migration_report.append(f"{name}: {count} -> {postgres_count} records [WARNING]")
                
            except Exception as e:
                print(f"   [ERROR] Error migrating {name}: {e}")
                migration_report.append(f"{name}: FAILED [ERROR]")
                postgres_session.rollback()
        
        print("\n" + "="*50)
        print("[REPORT] MIGRATION REPORT")
        print("="*50)
        for report in migration_report:
            print(f"  {report}")
        print("="*50)
        
        print("\n[SUCCESS] Migration completed!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        postgres_session.rollback()
        return False
        
    finally:
        sqlite_session.close()
        postgres_session.close()

if __name__ == '__main__':
    # First create the database if needed
    print("Step 1: Ensuring PostgreSQL database exists...\n")
    from create_postgresql_db import create_database
    
    if not create_database():
        print("\n[ERROR] Failed to create database. Aborting migration.")
        sys.exit(1)
    
    print("\n" + "="*50)
    print("Step 2: Creating tables in PostgreSQL...\n")
    
    # Create tables in PostgreSQL
    from app import app
    with app.app_context():
        try:
            # Update the database URI to PostgreSQL
            app.config['SQLALCHEMY_DATABASE_URI'] = get_postgresql_uri()
            db.init_app(app)
            db.create_all()
            print("[OK] Tables created in PostgreSQL\n")
        except Exception as e:
            print(f"[ERROR] Error creating tables: {e}")
            sys.exit(1)
    
    print("="*50)
    print("Step 3: Migrating data...\n")
    
    # Migrate data
    success = migrate_data()
    
    if success:
        print("\n[SUCCESS] Migration completed successfully!")
        print("\n[INFO] Next steps:")
        print("   1. Restart your backend server")
        print("   2. Test the application")
        print("   3. Keep tradesense.db as backup")
    else:
        print("\n[ERROR] Migration failed. Please check the errors above.")
        sys.exit(1)
