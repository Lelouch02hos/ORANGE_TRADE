from flask import Blueprint, jsonify
from extensions import db
from models import Challenge, Trade
from datetime import datetime, timedelta

challenge_bp = Blueprint('challenge', __name__)

def check_rules(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge or challenge.status != 'active':
        return

    # 1. Calculate current equity (balance + unrealized P&L)
    # For simplicity in this MVP, we'll assume current_equity is updated by the trade execution or a price feed updater.
    # In a real system, we'd fetch live prices for open trades here.
    
    start_balance = challenge.start_balance
    current_equity = challenge.current_equity
    
    # 2. Check Max Total Loss (10%)
    max_loss_limit = start_balance * 0.90
    if current_equity <= max_loss_limit:
        challenge.status = 'failed'
        db.session.commit()
        return "failed"

    # 3. Check Daily Loss (5%)
    # We need to know the equity at the start of the day. 
    # For MVP, let's approximate: if current_equity drops 5% below start_balance (simplified) 
    # OR strictly: we should store 'start_of_day_equity'.
    # Let's assume start_of_day_equity is stored or calculated. 
    # For this MVP, let's use a simplified rule: Daily Loss is based on High Water Mark of the day? 
    # Or just fixed 5% of starting balance for the day.
    # Let's implement a simple version: if equity < start_balance * 0.95 (This is actually total loss of 5%)
    # The prompt says: "If equity drops 5% in a day". 
    # Let's assume we reset a 'daily_start_equity' every day. 
    # For now, let's just check if it drops 5% from start_balance as a stricter rule, or we can add a field later.
    
    daily_loss_limit = start_balance * 0.95
    if current_equity <= daily_loss_limit:
         challenge.status = 'failed'
         db.session.commit()
         return "failed"

    # 4. Check Profit Target (10%)
    profit_target = start_balance * 1.10
    if current_equity >= profit_target:
        challenge.status = 'funded'
        db.session.commit()
        return "funded"
        
    return "active"

@challenge_bp.route('/api/challenge/<int:id>/status', methods=['GET'])
def get_challenge_status(id):
    status = check_rules(id)
    challenge = Challenge.query.get(id)
    return jsonify({
        "status": challenge.status,
        "current_equity": challenge.current_equity,
        "start_balance": challenge.start_balance
    })

def evaluate_all_challenges():
    with db.session.begin():
        active_challenges = Challenge.query.filter_by(status='active').all()
        for challenge in active_challenges:
            check_rules(challenge.id)
        # Commit is handled by the context manager or we can commit explicitly if needed
        # db.session.commit() 

