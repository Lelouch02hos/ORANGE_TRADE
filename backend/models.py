from extensions import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='trader') # trader, admin, support
    is_verified = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    challenges = db.relationship('Challenge', backref='user', lazy=True)
    transactions = db.relationship('Transaction', foreign_keys='Transaction.user_id', backref='user', lazy=True)

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='active') # active, failed, funded
    start_balance = db.Column(db.Float, default=5000.0)
    current_equity = db.Column(db.Float, default=5000.0)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    trades = db.relationship('Trade', backref='challenge', lazy=True)

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    type = db.Column(db.String(10), nullable=False) # buy, sell
    position = db.Column(db.String(10), default='long') # long, short
    quantity = db.Column(db.Float, nullable=False)
    open_price = db.Column(db.Float, nullable=False)
    close_price = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(10), default='open') # open, closed
    profit = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False) # payment, deposit, withdrawal
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected, completed
    approved_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    approval_timestamp = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.String(500), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class AdminLog(db.Model):
    """Audit trail for all admin actions"""
    __tablename__ = 'admin_log'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)  # e.g., "user_suspended", "transaction_approved"
    target_type = db.Column(db.String(50), nullable=True)  # e.g., "user", "transaction"
    target_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class PlatformConfig(db.Model):
    """Platform configuration settings"""
    __tablename__ = 'platform_config'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
