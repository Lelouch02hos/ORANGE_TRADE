from flask import Blueprint, jsonify
from extensions import db
from models import User, Challenge, Transaction, Trade
from sqlalchemy import func

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/user/<int:user_id>/challenges', methods=['GET'])
def get_user_challenges(user_id):
    challenges = Challenge.query.filter_by(user_id=user_id).all()
    
    challenges_data = []
    for challenge in challenges:
        challenges_data.append({
            'id': challenge.id,
            'status': challenge.status,
            'start_balance': challenge.start_balance,
            'current_equity': challenge.current_equity,
            'start_date': challenge.start_date.isoformat() if challenge.start_date else None
        })
    
    return jsonify(challenges_data)

@profile_bp.route('/api/user/<int:user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.timestamp.desc()).all()
    
    transactions_data = []
    for transaction in transactions:
        transactions_data.append({
            'id': transaction.id,
            'amount': transaction.amount,
            'type': transaction.type,
            'status': transaction.status,
            'timestamp': transaction.timestamp.isoformat() if transaction.timestamp else None
        })
    
    return jsonify(transactions_data)

@profile_bp.route('/api/user/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    # Get all challenges
    challenges = Challenge.query.filter_by(user_id=user_id).all()
    
    total_challenges = len(challenges)
    active_challenges = len([c for c in challenges if c.status == 'active'])
    funded_challenges = len([c for c in challenges if c.status == 'funded'])
    
    # Calculate total profit
    total_profit = sum(c.current_equity - c.start_balance for c in challenges)
    
    # Calculate win rate (challenges that are profitable)
    profitable = len([c for c in challenges if c.current_equity > c.start_balance])
    win_rate = (profitable / total_challenges * 100) if total_challenges > 0 else 0
    
    return jsonify({
        'totalChallenges': total_challenges,
        'activeChallenges': active_challenges,
        'fundedChallenges': funded_challenges,
        'totalProfit': total_profit,
        'winRate': win_rate
    })
