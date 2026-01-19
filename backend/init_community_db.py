"""
Script d'initialisation de la base de données pour la communauté
"""

from app import app, db
from modules.community import Discussion, Message

with app.app_context():
    try:
        # Créer les tables
        db.create_all()
        print("✅ Tables de la communauté créées avec succès!")
        
        # Vérifier les tables
        tables = db.engine.table_names()
        print(f"📋 Tables dans la base: {', '.join(tables)}")
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
