from functools import wraps
from flask import request, jsonify
from models import User, AdminLog
from extensions import db

def require_admin(f):
    """Decorator to protect admin routes - requires user to be logged in with admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user ID from request (assuming it's passed in headers or session)
        user_id = request.headers.get('X-User-ID') or request.json.get('user_id') if request.json else None
        
        if not user_id:
            return jsonify({'success': False, 'message': 'Authentication requise'}), 401
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
        
        if user.role != 'admin':
            return jsonify({'success': False, 'message': 'Accès interdit - Droits administrateur requis'}), 403
        
        if user.is_suspended:
            return jsonify({'success': False, 'message': 'Compte suspendu'}), 403
        
        # Pass the admin user to the route function
        return f(admin_user=user, *args, **kwargs)
    
    return decorated_function

def log_admin_action(admin_id, action, target_type=None, target_id=None, details=None):
    """Log admin actions for audit trail"""
    try:
        ip_address = request.remote_addr if request else None
        
        log = AdminLog(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address
        )
        
        db.session.add(log)
        db.session.commit()
        
        return True
    except Exception as e:
        print(f"Error logging admin action: {str(e)}")
        return False
