from flask import Blueprint, jsonify
from extensions import db
from models import Challenge, User
from sqlalchemy import desc

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    # Rank traders by Profit Percentage
    # Profit % = ((Current Equity - Start Balance) / Start Balance) * 100
    
    # We query active or funded challenges
    results = db.session.query(
        User.username,
        Challenge.start_balance,
        Challenge.current_equity,
        ((Challenge.current_equity - Challenge.start_balance) / Challenge.start_balance * 100).label('profit_pct')
    ).join(User).filter(
        Challenge.status.in_(['active', 'funded'])
    ).order_by(
        desc('profit_pct')
    ).limit(10).all()
    
    leaderboard_data = []
    for r in results:
        leaderboard_data.append({
            "username": r.username,
            "profit_pct": round(r.profit_pct, 2),
            "equity": r.current_equity
        })
        
    return jsonify(leaderboard_data)
