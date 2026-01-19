"""
Database migration script to update schema for admin system
Run this after updating models.py
"""

from app import app, db
from models import User, Challenge, Trade, Transaction, AdminLog, PlatformConfig

print("🔄 Starting database migration for admin system...")

with app.app_context():
    # Drop all tables and recreate (WARNING: This will delete all data)
    # For production, use proper migration tools like Alembic
    print("⚠️  Recreating database tables...")
    db.drop_all()
    db.create_all()
    print("✅ Database tables created successfully!")
    
    # Create a default admin user
    from werkzeug.security import generate_password_hash
    admin_exists = User.query.filter_by(username='admin').first()
    
    if not admin_exists:
        admin = User(
            username='admin',
            email='admin@tradeorange.com',
            password=generate_password_hash('admin123'),
            role='admin',
            is_verified=True,
            is_suspended=False
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Default admin user created!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!")
    
    # Initialize default platform config
    default_configs = [
        ('maintenance_mode', 'false'),
        ('min_deposit', '100'),
        ('max_deposit', '100000'),
        ('withdrawal_fee_percent', '0'),
        ('trading_enabled', 'true')
    ]
    
    for key, value in default_configs:
        config = PlatformConfig(key=key, value=value)
        db.session.add(config)
    
    db.session.commit()
    print("✅ Default platform configuration created!")

print("🎉 Migration completed successfully!")
