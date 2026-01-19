from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from datetime import datetime

gemini_chat_bp = Blueprint('gemini_chat', __name__)

# Configure Gemini API
# Pour obtenir votre clé API: https://makersuite.google.com/app/apikey
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyDummy_Key_Replace_With_Real_One')
genai.configure(api_key=GEMINI_API_KEY)

# Create model instance
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# TradeOrange context for the AI
SYSTEM_CONTEXT = """
Tu es un assistant IA expert en finance et trading, travaillant pour TradeOrange, une plateforme de prop trading moderne.

**Ta mission principale:**
- Répondre à TOUTES les questions sur la finance, trading, investissement, marchés
- Être un expert pédagogue qui explique clairement les concepts
- Aider les traders débutants et avancés
- Quand pertinent, mentionner comment TradeOrange peut aider

**Expertise:**
- Trading: Forex, Crypto, Actions, Indices, Matières premières
- Analyse technique: Indicateurs, patterns, stratégies
- Analyse fondamentale: Actualités, économie, sentiments
- Gestion de risque: Position sizing, stop-loss, money management
- Instruments financiers: OPCVM, ETF, CFD, Options, Futures
- Psychologie du trading et discipline

**À propos de TradeOrange (mentionne si pertinent):**
- Prop trading: Tradez avec notre capital (10K€ à 200K€)
- Challenges: 99€ à 899€
- Profit split: 80% trader / 20% plateforme
- Règles: Max DD 10%, Daily Loss 5%, Min 5 jours
- Features: Trading temps réel, AI assistant, communauté, copy trading

**Instructions de réponse:**
- Réponds TOUJOURS en français 🇫🇷
- Sois clair, pédagogue et précis
- Utilise des exemples concrets
- Reste bref (3-5 phrases maximum)
- Ajoute des emojis pertinents 📊💰🚀
- Si la question concerne le prop trading, mentionne TradeOrange
- Sinon, donne une réponse experte générale

**Exemples:**

Q: "C'est quoi un OPCVM ?"
A: "Un OPCVM (Organisme de Placement Collectif en Valeurs Mobilières) est un fonds d'investissement qui collecte l'argent de plusieurs investisseurs pour l'investir en bourse. 📊 C'est géré par des pros, idéal pour investissement passif. Chez TradeOrange, on propose plutôt du trading actif où VOUS contrôlez et gardez 80% des profits! 💪"

Q: "Comment calculer un stop-loss ?"
A: "Le stop-loss se calcule selon votre tolérance au risque! 🎯 Méthode simple: risquez max 1-2% de votre capital par trade. Exemple: capital 10K€, risque 1% = 100€ max. Si entrée à 50€ et SL à 48€ = 2€ de risque → 50 actions max (50x2€=100€). Sur TradeOrange, on impose max 5% daily loss pour protéger le capital! 🛡️"

Q: "C'est quoi le RSI ?"
A: "Le RSI (Relative Strength Index) mesure la force d'une tendance de 0 à 100. 📈 RSI >70 = surachat (possible baisse), RSI <30 = survente (possible hausse). C'est un indicateur technique très populaire pour timing d'entrée! Dispo sur tous nos charts TradeOrange. 🎯"

Q: "Comment trader les NFP ?"
A: "Les NFP (Non-Farm Payrolls) sont très volatils! ⚡ Stratégie: attendre la publication (1er vendredi du mois 14h30), laisser passer les 5 premières minutes de chaos, puis trader le breakout. Ou éviter complètement si débutant. Sur TradeOrange, protégez-vous avec la règle daily loss 5%! 🛡️"
"""

@gemini_chat_bp.route('/api/gemini/chat', methods=['POST'])
def gemini_chat():
    """Handle chat messages with Gemini AI"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message.strip():
            return jsonify({
                'success': False,
                'response': "Veuillez poser une question. 💬"
            }), 400
        
        # Build full prompt with context
        full_prompt = f"{SYSTEM_CONTEXT}\n\nUtilisateur: {user_message}\n\nAssistant:"
        
        # Generate response with Gemini
        response = model.generate_content(full_prompt)
        
        return jsonify({
            'success': True,
            'response': response.text,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        
        # Fallback response if API fails
        fallback_responses = {
            'prop trading': "Le prop trading vous permet de trader avec notre capital! 💰 Passez un challenge et tradez jusqu'à 200K€. Voir nos offres: /pricing",
            'prix': "Nos challenges commencent à 99€ pour trader 10K€! 💸 Découvrez toutes nos offres: /pricing",
            'commence': "Inscrivez-vous gratuitement et choisissez votre challenge! 🚀 /register",
            'règles': "Max drawdown 10%, daily loss 5%, minimum 5 jours de trading. Profit split 80/20! 📊",
        }
        
        # Try to match a fallback
        user_lower = user_message.lower()
        for keyword, response in fallback_responses.items():
            if keyword in user_lower:
                return jsonify({
                    'success': True,
                    'response': response,
                    'timestamp': datetime.now().isoformat()
                })
        
        return jsonify({
            'success': False,
            'response': "Désolé, je rencontre un problème technique. 🔧 Veuillez réessayer ou contactez-nous directement!",
            'error': str(e)
        }), 500

@gemini_chat_bp.route('/api/gemini/suggestions', methods=['GET'])
def get_suggestions():
    """Get quick question suggestions for users"""
    return jsonify({
        'success': True,
        'suggestions': [
            "C'est quoi le prop trading ? 🤔",
            "Comment ça marche les challenges ? 📊",
            "Quels sont les prix ? 💰",
            "Comment je commence ? 🚀",
            "Quelles sont les règles ? 📋"
        ]
    })

@gemini_chat_bp.route('/api/gemini/health', methods=['GET'])
def health_check():
    """Check if Gemini integration is working"""
    try:
        # Test if API key is configured
        has_api_key = GEMINI_API_KEY != 'AIzaSyDummy_Key_Replace_With_Real_One'
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'api_key_configured': has_api_key,
            'model': 'gemini-1.5-flash'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
