"""
Community Module - Forum de discussion et messagerie
Permet aux traders de partager leurs idées et stratégies
"""

from flask import Blueprint, request, jsonify
from models import db, User
from datetime import datetime
from sqlalchemy import desc

community_bp = Blueprint('community', __name__)

# Modèle pour les discussions
class Discussion(db.Model):
    __tablename__ = 'discussions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='General')  # General, Trading, Analysis, Help
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    user = db.relationship('User', backref='discussions')
    messages = db.relationship('Message', backref='discussion', cascade='all, delete-orphan')

# Modèle pour les messages
class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    discussion_id = db.Column(db.Integer, db.ForeignKey('discussions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    user = db.relationship('User', backref='messages')

@community_bp.route('/api/community/discussions', methods=['GET'])
def get_discussions():
    """Récupère toutes les discussions"""
    try:
        category = request.args.get('category', None)
        sort_by = request.args.get('sort', 'recent')  # recent, popular, views
        
        query = Discussion.query
        
        if category and category != 'all':
            query = query.filter_by(category=category)
        
        # Tri
        if sort_by == 'popular':
            query = query.order_by(desc(Discussion.likes))
        elif sort_by == 'views':
            query = query.order_by(desc(Discussion.views))
        else:  # recent
            query = query.order_by(desc(Discussion.created_at))
        
        discussions = query.all()
        
        discussions_data = []
        for disc in discussions:
            user = User.query.get(disc.user_id)
            discussions_data.append({
                'id': disc.id,
                'title': disc.title,
                'content': disc.content[:200] + '...' if len(disc.content) > 200 else disc.content,
                'category': disc.category,
                'author': {
                    'id': user.id if user else None,
                    'username': user.username if user else 'Unknown'
                },
                'likes': disc.likes,
                'views': disc.views,
                'replies': len(disc.messages),
                'created_at': disc.created_at.isoformat(),
                'updated_at': disc.updated_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'discussions': discussions_data,
            'total': len(discussions_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@community_bp.route('/api/community/discussions', methods=['POST'])
def create_discussion():
    """Crée une nouvelle discussion"""
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('title') or not data.get('content') or not data.get('user_id'):
            return jsonify({
                'success': False,
                'error': 'Titre, contenu et user_id requis'
            }), 400
        
        # Créer la discussion
        discussion = Discussion(
            user_id=data['user_id'],
            title=data['title'],
            content=data['content'],
            category=data.get('category', 'General')
        )
        
        db.session.add(discussion)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'discussion': {
                'id': discussion.id,
                'title': discussion.title,
                'created_at': discussion.created_at.isoformat()
            },
            'message': 'Discussion créée avec succès'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@community_bp.route('/api/community/discussions/<int:discussion_id>', methods=['GET'])
def get_discussion(discussion_id):
    """Récupère une discussion spécifique avec tous ses messages"""
    try:
        discussion = Discussion.query.get(discussion_id)
        
        if not discussion:
            return jsonify({
                'success': False,
                'error': 'Discussion non trouvée'
            }), 404
        
        # Incrémenter les vues
        discussion.views += 1
        db.session.commit()
        
        # Récupérer l'auteur
        author = User.query.get(discussion.user_id)
        
        # Récupérer les messages
        messages_data = []
        for msg in discussion.messages:
            msg_user = User.query.get(msg.user_id)
            messages_data.append({
                'id': msg.id,
                'content': msg.content,
                'author': {
                    'id': msg_user.id if msg_user else None,
                    'username': msg_user.username if msg_user else 'Unknown'
                },
                'likes': msg.likes,
                'created_at': msg.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'discussion': {
                'id': discussion.id,
                'title': discussion.title,
                'content': discussion.content,
                'category': discussion.category,
                'author': {
                    'id': author.id if author else None,
                    'username': author.username if author else 'Unknown'
                },
                'likes': discussion.likes,
                'views': discussion.views,
                'created_at': discussion.created_at.isoformat(),
                'messages': messages_data
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@community_bp.route('/api/community/discussions/<int:discussion_id>/messages', methods=['POST'])
def add_message(discussion_id):
    """Ajoute un message à une discussion"""
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('content') or not data.get('user_id'):
            return jsonify({
                'success': False,
                'error': 'Contenu et user_id requis'
            }), 400
        
        # Vérifier que la discussion existe
        discussion = Discussion.query.get(discussion_id)
        if not discussion:
            return jsonify({
                'success': False,
                'error': 'Discussion non trouvée'
            }), 404
        
        # Créer le message
        message = Message(
            discussion_id=discussion_id,
            user_id=data['user_id'],
            content=data['content']
        )
        
        db.session.add(message)
        
        # Mettre à jour la date de la discussion
        discussion.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Message ajouté avec succès',
            'message_id': message.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@community_bp.route('/api/community/discussions/<int:discussion_id>/like', methods=['POST'])
def like_discussion(discussion_id):
    """Ajoute un like à une discussion"""
    try:
        discussion = Discussion.query.get(discussion_id)
        
        if not discussion:
            return jsonify({
                'success': False,
                'error': 'Discussion non trouvée'
            }), 404
        
        discussion.likes += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'likes': discussion.likes
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@community_bp.route('/api/community/messages/<int:message_id>/like', methods=['POST'])
def like_message(message_id):
    """Ajoute un like à un message"""
    try:
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message non trouvé'
            }), 404
        
        message.likes += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'likes': message.likes
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@community_bp.route('/api/community/stats', methods=['GET'])
def get_community_stats():
    """Récupère les statistiques de la communauté"""
    try:
        total_discussions = Discussion.query.count()
        total_messages = Message.query.count()
        total_users = User.query.count()
        
        # Discussions les plus populaires
        popular = Discussion.query.order_by(desc(Discussion.likes)).limit(5).all()
        popular_data = [{
            'id': d.id,
            'title': d.title,
            'likes': d.likes
        } for d in popular]
        
        return jsonify({
            'success': True,
            'stats': {
                'total_discussions': total_discussions,
                'total_messages': total_messages,
                'total_users': total_users,
                'popular_discussions': popular_data
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
