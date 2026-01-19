from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Transaction, Challenge, Trade, AdminLog, PlatformConfig
from werkzeug.security import generate_password_hash, check_password_hash
from modules.admin_auth import require_admin, log_admin_action
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from modules.bvc_scraper import BVCScraper

admin_bp = Blueprint('admin', __name__)

# ==================== AUTHENTICATION ====================

@admin_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login endpoint with enhanced validation"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Identifiants requis'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401
    
    if user.role != 'admin':
        return jsonify({'success': False, 'message': 'Accès administrateur refusé'}), 403
    
    if user.is_suspended:
        return jsonify({'success': False, 'message': 'Compte suspendu'}), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    log_admin_action(user.id, 'admin_login')
    
    return jsonify({
        'success': True,
        'message': 'Connexion admin réussie',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

@admin_bp.route('/api/admin/verify', methods=['POST'])
@require_admin
def verify_admin(admin_user):
    """Verify admin session"""
    return jsonify({
        'success': True,
        'user': {
            'id': admin_user.id,
            'username': admin_user.username,
            'role': admin_user.role
        }
    }), 200

# ==================== USER MANAGEMENT ====================

@admin_bp.route('/api/admin/users', methods=['GET'])
@require_admin
def get_users(admin_user):
    """Get all users with pagination and filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    role_filter = request.args.get('role')
    search = request.args.get('search')
    
    query = User.query
    
    # Apply filters
    if role_filter:
        query = query.filter_by(role=role_filter)
    
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) | 
            (User.email.ilike(f'%{search}%'))
        )
    
    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    users = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'is_verified': u.is_verified,
        'is_suspended': u.is_suspended,
        'created_at': u.created_at.isoformat() if u.created_at else None,
        'last_login': u.last_login.isoformat() if u.last_login else None,
        'challenge_count': len(u.challenges)
    } for u in pagination.items]
    
    return jsonify({
        'success': True,
        'users': users,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['GET'])
@require_admin
def get_user(admin_user, user_id):
    """Get detailed user information"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
    
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_verified': user.is_verified,
            'is_suspended': user.is_suspended,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'challenges': [{
                'id': c.id,
                'status': c.status,
                'current_equity': c.current_equity,
                'start_date': c.start_date.isoformat()
            } for c in user.challenges],
            'transactions': [{
                'id': t.id,
                'amount': t.amount,
                'type': t.type,
                'status': t.status,
                'timestamp': t.timestamp.isoformat()
            } for t in user.transactions]
        }
    }), 200

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(admin_user, user_id):
    """Update user information"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'role' in data and data['role'] in ['trader', 'admin', 'support']:
        old_role = user.role
        user.role = data['role']
        log_admin_action(admin_user.id, 'user_role_changed', 'user', user_id, 
                        f"Role changed from {old_role} to {data['role']}")
    
    if 'is_verified' in data:
        user.is_verified = data['is_verified']
        log_admin_action(admin_user.id, 'user_verification_updated', 'user', user_id,
                        f"Verification set to {data['is_verified']}")
    
    if 'is_suspended' in data:
        user.is_suspended = data['is_suspended']
        action = 'user_suspended' if data['is_suspended'] else 'user_unsuspended'
        log_admin_action(admin_user.id, action, 'user', user_id)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Utilisateur modifié avec succès',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_verified': user.is_verified,
            'is_suspended': user.is_suspended
        }
    }), 200

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(admin_user, user_id):
    """Delete user account"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
    
    if user.id == admin_user.id:
        return jsonify({'success': False, 'message': 'Impossible de supprimer votre propre compte'}), 400
    
    username = user.username
    db.session.delete(user)
    db.session.commit()
    
    log_admin_action(admin_user.id, 'user_deleted', 'user', user_id, f"Deleted user: {username}")
    
    return jsonify({'success': True, 'message': f'Utilisateur {username} supprimé'}), 200

@admin_bp.route('/api/admin/users/<int:user_id>/reset-password', methods=['POST'])
@require_admin
def reset_user_password(admin_user, user_id):
    """Reset user password"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
    
    data = request.get_json()
    new_password = data.get('new_password', '123456')  # Default password
    
    user.password = generate_password_hash(new_password)
    db.session.commit()
    
    log_admin_action(admin_user.id, 'user_password_reset', 'user', user_id)
    
    return jsonify({
        'success': True,
        'message': f'Mot de passe réinitialisé pour {user.username}',
        'new_password': new_password
    }), 200

# ==================== TRANSACTION MANAGEMENT ====================

@admin_bp.route('/api/admin/transactions', methods=['GET'])
@require_admin
def get_transactions(admin_user):
    """Get all transactions with filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    status_filter = request.args.get('status')
    type_filter = request.args.get('type')
    
    query = Transaction.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    if type_filter:
        query = query.filter_by(type=type_filter)
    
    pagination = query.order_by(desc(Transaction.timestamp)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    transactions = [{
        'id': t.id,
        'user_id': t.user_id,
        'user': User.query.get(t.user_id).username if User.query.get(t.user_id) else 'Unknown',
        'amount': t.amount,
        'type': t.type,
        'status': t.status,
        'timestamp': t.timestamp.isoformat(),
        'approved_by': t.approved_by,
        'approval_timestamp': t.approval_timestamp.isoformat() if t.approval_timestamp else None,
        'rejection_reason': t.rejection_reason
    } for t in pagination.items]
    
    return jsonify({
        'success': True,
        'transactions': transactions,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@admin_bp.route('/api/admin/transactions/pending', methods=['GET'])
@require_admin
def get_pending_transactions(admin_user):
    """Get pending transactions requiring approval"""
    pending = Transaction.query.filter_by(status='pending').order_by(Transaction.timestamp).all()
    
    transactions = [{
        'id': t.id,
        'user_id': t.user_id,
        'user': User.query.get(t.user_id).username if User.query.get(t.user_id) else 'Unknown',
        'amount': t.amount,
        'type': t.type,
        'timestamp': t.timestamp.isoformat()
    } for t in pending]
    
    return jsonify({
        'success': True,
        'pending_transactions': transactions,
        'count': len(transactions)
    }), 200

@admin_bp.route('/api/admin/transactions/<int:transaction_id>/approve', methods=['PUT'])
@require_admin
def approve_transaction(admin_user, transaction_id):
    """Approve a pending transaction"""
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'success': False, 'message': 'Transaction non trouvée'}), 404
    
    transaction.status = 'approved'
    transaction.approved_by = admin_user.id
    transaction.approval_timestamp = datetime.utcnow()
    
    db.session.commit()
    
    log_admin_action(admin_user.id, 'transaction_approved', 'transaction', transaction_id,
                    f"Amount: {transaction.amount}, Type: {transaction.type}")
    
    return jsonify({
        'success': True,
        'message': 'Transaction approuvée'
    }), 200

@admin_bp.route('/api/admin/transactions/<int:transaction_id>/reject', methods=['PUT'])
@require_admin
def reject_transaction(admin_user, transaction_id):
    """Reject a pending transaction"""
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'success': False, 'message': 'Transaction non trouvée'}), 404
    
    data = request.get_json()
    reason = data.get('reason', 'Non spécifié')
    
    transaction.status = 'rejected'
    transaction.approved_by = admin_user.id
    transaction.approval_timestamp = datetime.utcnow()
    transaction.rejection_reason = reason
    
    db.session.commit()
    
    log_admin_action(admin_user.id, 'transaction_rejected', 'transaction', transaction_id,
                    f"Reason: {reason}")
    
    return jsonify({
        'success': True,
        'message': 'Transaction rejetée'
    }), 200

# ==================== FINANCIAL OVERVIEW ====================

@admin_bp.route('/api/admin/financials/summary', methods=['GET'])
@require_admin
def get_financial_summary(admin_user):
    """Get platform financial summary"""
    
    # Total deposits
    total_deposits = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.type == 'deposit',
        Transaction.status == 'approved'
    ).scalar() or 0
    
    # Total withdrawals
    total_withdrawals = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.type == 'withdrawal',
        Transaction.status == 'approved'
    ).scalar() or 0
    
    # Pending withdrawals
    pending_withdrawals = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.type == 'withdrawal',
        Transaction.status == 'pending'
    ).scalar() or 0
    
    # Total payments (revenue)
    total_revenue = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.type == 'payment',
        Transaction.status.in_(['approved', 'completed'])
    ).scalar() or 0
    
    return jsonify({
        'success': True,
        'summary': {
            'total_deposits': total_deposits,
            'total_withdrawals': total_withdrawals,
            'pending_withdrawals': pending_withdrawals,
            'total_revenue': total_revenue,
            'net_balance': total_deposits - total_withdrawals
        }
    }), 200

# ==================== PLATFORM CONFIGURATION ====================

@admin_bp.route('/api/admin/config', methods=['GET'])
@require_admin
def get_platform_config(admin_user):
    """Get all platform configuration"""
    configs = PlatformConfig.query.all()
    
    config_dict = {c.key: c.value for c in configs}
    
    return jsonify({
        'success': True,
        'config': config_dict
    }), 200

@admin_bp.route('/api/admin/config', methods=['PUT'])
@require_admin
def update_platform_config(admin_user):
    """Update platform configuration"""
    data = request.get_json()
    
    for key, value in data.items():
        config = PlatformConfig.query.filter_by(key=key).first()
        
        if config:
            config.value = str(value)
            config.updated_by = admin_user.id
            config.updated_at = datetime.utcnow()
        else:
            config = PlatformConfig(
                key=key,
                value=str(value),
                updated_by=admin_user.id
            )
            db.session.add(config)
    
    db.session.commit()
    
    log_admin_action(admin_user.id, 'platform_config_updated', details=f"Updated {len(data)} settings")
    
    return jsonify({
        'success': True,
        'message': 'Configuration mise à jour'
    }), 200

# ==================== DASHBOARD & ANALYTICS ====================

@admin_bp.route('/api/admin/dashboard/stats', methods=['GET'])
@require_admin
def get_dashboard_stats(admin_user):
    """Get key metrics for admin dashboard"""
    
    # User statistics
    total_users = User.query.count()
    active_users = User.query.filter_by(is_suspended=False).count()
    admin_users = User.query.filter_by(role='admin').count()
    
    # Challenge statistics
    total_challenges = Challenge.query.count()
    active_challenges = Challenge.query.filter_by(status='active').count()
    funded_challenges = Challenge.query.filter_by(status='funded').count()
    
    # Transaction statistics
    pending_transactions = Transaction.query.filter_by(status='pending').count()
    
    # Recent user growth (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_30d = User.query.filter(User.created_at >= thirty_days_ago).count()
    
    # Trading volume (total equity in active challenges)
    total_trading_volume = db.session.query(func.sum(Challenge.current_equity)).filter(
        Challenge.status == 'active'
    ).scalar() or 0
    
    return jsonify({
        'success': True,
        'stats': {
            'users': {
                'total': total_users,
                'active': active_users,
                'admins': admin_users,
                'new_30d': new_users_30d
            },
            'challenges': {
                'total': total_challenges,
                'active': active_challenges,
                'funded': funded_challenges
            },
            'transactions': {
                'pending': pending_transactions
            },
            'trading_volume': total_trading_volume
        }
    }), 200

@admin_bp.route('/api/admin/logs', methods=['GET'])
@require_admin
def get_admin_logs(admin_user):
    """Get admin activity logs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    pagination = AdminLog.query.order_by(desc(AdminLog.timestamp)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    logs = [{
        'id': log.id,
        'admin': User.query.get(log.admin_id).username if User.query.get(log.admin_id) else 'Unknown',
        'action': log.action,
        'target_type': log.target_type,
        'target_id': log.target_id,
        'details': log.details,
        'ip_address': log.ip_address,
        'timestamp': log.timestamp.isoformat()
    } for log in pagination.items]
    
    return jsonify({
        'success': True,
        'logs': logs,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200
# ==================== BVC STOCKS (BOURSE DE CASABLANCA) ====================

@admin_bp.route('/api/admin/bvc-stocks', methods=['GET'])
@require_admin
def get_bvc_stocks(admin_user):
    """
    Récupère les cotations de la Bourse de Casablanca
    
    Query params:
        - symbols: Liste de symboles séparés par virgules (ex: IAM,ATW,BCP)
        - all: Si true, récupère toutes les actions disponibles
    """
    try:
        scraper = BVCScraper()
        
        # Récupérer les paramètres
        symbols_param = request.args.get('symbols')
        get_all = request.args.get('all', 'false').lower() == 'true'
        
        if get_all:
            # Récupérer toutes les actions disponibles
            stocks_data = scraper.get_all_available_stocks()
            
        elif symbols_param:
            # Récupérer les actions spécifiques
            symbols = [s.strip() for s in symbols_param.split(',')]
            stocks_data = scraper.get_multiple_stocks(symbols)
            
        else:
            # Par défaut, récupérer les principales actions
            default_symbols = ['IAM', 'ATW', 'BCP', 'CIH', 'BOA', 'LHM', 'ADH']
            stocks_data = scraper.get_multiple_stocks(default_symbols)
        
        # Formatter les données pour la réponse
        stocks_list = []
        for symbol, data in stocks_data.items():
            stocks_list.append({
                'symbol': symbol,
                'name': symbol, 
                'price': data.get('price', 0),
                'currency': data.get('currency', 'MAD'),
                'source': data.get('source', 'BVC'),
                'timestamp': data.get('timestamp', datetime.now().isoformat()),
                'status': 'success' if data.get('price', 0) > 0 else 'error'
            })
        
        log_admin_action(
            admin_user.id, 
            'bvc_stocks_fetched', 
            details=f"Fetched {len(stocks_list)} BVC stocks"
        )
        
        return jsonify({
            'success': True,
            'count': len(stocks_list),
            'stocks': stocks_list,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}',
            'stocks': []
        }), 500

@admin_bp.route('/api/admin/bvc-stocks/<symbol>', methods=['GET'])
@require_admin
def get_bvc_stock_detail(admin_user, symbol):
    """Récupère les détails d'une action BVC spécifique"""
    try:
        scraper = BVCScraper()
        stock_data = scraper.get_stock_price(symbol.upper())
        
        if stock_data and stock_data.get('price', 0) > 0:
            return jsonify({'success': True, 'stock': stock_data}), 200
        else:
            return jsonify({'success': False, 'message': f'Action {symbol} non trouvée'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
