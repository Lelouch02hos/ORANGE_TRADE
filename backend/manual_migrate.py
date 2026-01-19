# Smart migration script that adapts to schema differences
import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# SQLite connection
sqlite_conn = sqlite3.connect('tradesense.db')
sqlite_conn.row_factory = sqlite3.Row
sqlite_cursor = sqlite_conn.cursor()

# PostgreSQL connection
pg_conn = psycopg2.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    port=os.getenv('DB_PORT', '5432'),
    user=os.getenv('DB_USER', 'postgres'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'tradeorange_db')
)
pg_cursor = pg_conn.cursor()

print("[INFO] Starting smart data migration...")

def get_common_columns(sqlite_table, pg_table):
    """Get columns that exist in both tables"""
    # Get SQLite columns
    sqlite_cursor.execute(f"PRAGMA table_info({sqlite_table})")
    sqlite_cols = set([row[1] for row in sqlite_cursor.fetchall()])
    
    # Get PostgreSQL columns
    pg_cursor.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '{pg_table}'
    """)
    pg_cols = set([row[0] for row in pg_cursor.fetchall()])
    
    common = sqlite_cols.intersection(pg_cols)
    return list(common)

# Migrate user table
try:
    common_cols = get_common_columns('user', 'user')
    print(f"[INFO] User table - common columns: {common_cols}")
    
    if common_cols:
        sqlite_cursor.execute("SELECT * FROM user")
        users = sqlite_cursor.fetchall()
        
        if users:
            print(f"[MIGRATE] user: {len(users)} records...")
            for user in users:
                values = [user[col] if col in user.keys() else None for col in common_cols]
                placeholders = ', '.join(['%s'] * len(common_cols))
                sql = f"INSERT INTO \"user\" ({', '.join(common_cols)}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING"
                pg_cursor.execute(sql, values)
            pg_conn.commit()
            print(f"  [OK] Migrated {len(users)} users")
        else:
            print("[SKIP] user: No data")
    else:
        print("[SKIP] user: No common columns")
except Exception as e:
    print(f"  [ERROR] user: {e}")
    pg_conn.rollback()

# Migrate challenge table
try:
    common_cols = get_common_columns('challenge', 'challenge')
    print(f"[INFO] Challenge table - common columns: {common_cols}")
    
    if common_cols:
        sqlite_cursor.execute("SELECT * FROM challenge")
        challenges = sqlite_cursor.fetchall()
        
        if challenges:
            print(f"[MIGRATE] challenge: {len(challenges)} records...")
            for challenge in challenges:
                values = [challenge[col] if col in challenge.keys() else None for col in common_cols]
                placeholders = ', '.join(['%s'] * len(common_cols))
                sql = f"INSERT INTO challenge ({', '.join(common_cols)}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING"
                pg_cursor.execute(sql, values)
            pg_conn.commit()
            print(f"  [OK] Migrated {len(challenges)} challenges")
        else:
            print("[SKIP] challenge: No data")
    else:
        print("[SKIP] challenge: No common columns")
except Exception as e:
    print(f"  [ERROR] challenge: {e}")
    pg_conn.rollback()

# Migrate trade table
try:
    common_cols = get_common_columns('trade', 'trade')
    print(f"[INFO] Trade table - common columns: {common_cols}")
    
    if common_cols:
        sqlite_cursor.execute("SELECT * FROM trade")
        trades = sqlite_cursor.fetchall()
        
        if trades:
            print(f"[MIGRATE] trade: {len(trades)} records...")
            for trade in trades:
                values = [trade[col] if col in trade.keys() else None for col in common_cols]
                placeholders = ', '.join(['%s'] * len(common_cols))
                sql = f"INSERT INTO trade ({', '.join(common_cols)}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING"
                pg_cursor.execute(sql, values)
            pg_conn.commit()
            print(f"  [OK] Migrated {len(trades)} trades")
        else:
            print("[SKIP] trade: No data")
    else:
        print("[SKIP] trade: No common columns")
except Exception as e:
    print(f"  [ERROR] trade: {e}")
    pg_conn.rollback()

# Migrate transaction table
try:
    common_cols = get_common_columns('transaction', 'transaction')
    print(f"[INFO] Transaction table - common columns: {common_cols}")
    
    if common_cols:
        sqlite_cursor.execute("SELECT * FROM \"transaction\"")
        transactions = sqlite_cursor.fetchall()
        
        if transactions:
            print(f"[MIGRATE] transaction: {len(transactions)} records...")
            for transaction in transactions:
                values = [transaction[col] if col in transaction.keys() else None for col in common_cols]
                placeholders = ', '.join(['%s'] * len(common_cols))
                sql = f"INSERT INTO \"transaction\" ({', '.join(common_cols)}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING"
                pg_cursor.execute(sql, values)
            pg_conn.commit()
            print(f"  [OK] Migrated {len(transactions)} transactions")
        else:
            print("[SKIP] transaction: No data")
    else:
        print("[SKIP] transaction: No common columns")
except Exception as e:
    print(f"  [ERROR] transaction: {e}")
    pg_conn.rollback()

# Close connections
sqlite_cursor.close()
sqlite_conn.close()
pg_cursor.close()
pg_conn.close()

print("\n[SUCCESS] Migration completed!")
print("[INFO] Your data has been migrated to PostgreSQL")
print("[INFO] SQLite file (tradesense.db) has been kept as backup")
