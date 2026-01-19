from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Challenge, Transaction
from datetime import datetime

payment_bp = Blueprint('payment', __name__)

# Mock PayPal Configuration
PAYPAL_CONFIG = {
    "client_id": "mock_client_id",
    "client_secret": "mock_client_secret",
    "mode": "sandbox"
}

@payment_bp.route('/api/payment/process', methods=['POST'])
def process_payment():
    data = request.json
    user_id = data.get('user_id')
    amount = data.get('amount')
    method = data.get('method') # card, paypal, cmi
    tier = data.get('tier') # starter, pro, elite
    payment_details = data.get('payment_details', {})
    
    # 1. Validate Payment Details
    if method == 'card':
        # In production, use payment gateway (Stripe, Checkout.com, etc.)
        # Validate card info here
        if not payment_details.get('email'):
            return jsonify({"error": "Email required"}), 400
    
    elif method == 'paypal':
        # In production, integrate PayPal SDK
        if not payment_details.get('paypalEmail'):
            return jsonify({"error": "PayPal email required"}), 400
    
    # 2. Process Payment (Simulated for MVP)
    # In real app: Call payment gateway API
    # For now, we simulate success
    
    # Create transaction record
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        type='payment',
        status='completed'
    )
    db.session.add(transaction)
    
    # 3. Activate Challenge
    # Determine start balance based on tier
    start_balance = 5000.0
    if tier == 'pro':
        start_balance = 10000.0
    elif tier == 'elite':
        start_balance = 25000.0
        
    challenge = Challenge(
        user_id=user_id,
        status='active',
        start_balance=start_balance,
        current_equity=start_balance,
        start_date=datetime.utcnow()
    )
    db.session.add(challenge)
    db.session.commit()
    
    # 4. Send confirmation email (in production)
    # send_confirmation_email(payment_details.get('email'), challenge.id)
    
    return jsonify({
        "message": "Payment successful",
        "transaction_id": transaction.id,
        "challenge_id": challenge.id,
        "status": "success",
        "payment_method": method,
        "tier": tier,
        "balance": start_balance
    })

@payment_bp.route('/api/payment/paypal-config', methods=['GET'])
def get_paypal_config():
    # Endpoint to provide frontend with PayPal Client ID
    return jsonify({"client_id": PAYPAL_CONFIG["client_id"]})
