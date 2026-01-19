from flask import Blueprint, request, jsonify
import random
from datetime import datetime

ai_chat_bp = Blueprint('ai_chat', __name__)

def generate_ai_response(user_message, symbol=None):
    """
    Simulate AI responses based on user input
    In production, this would connect to OpenAI, Claude, or another LLM
    """
    message_lower = user_message.lower()
    
    # Greetings
    if any(word in message_lower for word in ['bonjour', 'salut', 'hello', 'hi']):
        return {
            'message': f"Bonjour! 👋 Je suis votre assistant de trading IA. Je peux vous aider avec des analyses de marché, des recommandations de trading, et répondre à vos questions. Comment puis-je vous aider aujourd'hui?",
            'type': 'greeting'
        }
    
    # Analysis request
    if any(word in message_lower for word in ['analyse', 'analyser', 'analysis']):
        if symbol:
            trend = random.choice(['haussière', 'baissière', 'latérale'])
            confidence = random.randint(70, 95)
            return {
                'message': f"📊 **Analyse de {symbol}**\n\nTendance actuelle: **{trend}** ({confidence}% de confiance)\n\n**Indicateurs techniques:**\n• RSI: 45 (Zone neutre)\n• MACD: Signal haussier\n• Bandes de Bollinger: Prix proche de la bande inférieure\n\n**Recommandation:** {'Achat' if trend == 'haussière' else 'Attendre' if trend == 'latérale' else 'Prudence'}\n\nVoulez-vous plus de détails sur cette analyse?",
                'type': 'analysis'
            }
        return {
            'message': "Pour effectuer une analyse, veuillez sélectionner un symbole dans le sélecteur en haut du dashboard, puis demandez-moi à nouveau.",
            'type': 'info'
        }
    
    # Buy/Sell recommendation
    if any(word in message_lower for word in ['acheter', 'buy', 'achat']):
        return {
            'message': f"💡 **Opportunité d'achat détectée!**\n\nBasé sur l'analyse technique actuelle, voici mes recommandations:\n\n**Point d'entrée:** Prix actuel + 2%\n**Stop Loss:** -5% du prix d'entrée\n**Take Profit:** +8% du prix d'entrée\n**Risk/Reward Ratio:** 1:1.6\n\n⚠️ N'oubliez pas de toujours utiliser un stop loss et de ne jamais risquer plus de 2% de votre capital par trade!",
            'type': 'recommendation'
        }
    
    if any(word in message_lower for word in ['vendre', 'sell', 'vente']):
        return {
            'message': f"📉 **Analyse de vente**\n\nLes indicateurs montrent:\n• Volume de vente en augmentation\n• RSI en zone de surachat\n• Résistance majeure atteinte\n\nSi vous détenez cette position, envisagez de sécuriser vos profits. Si vous envisagez une vente à découvert, attendez une confirmation supplémentaire.",
            'type': 'recommendation'
        }
    
    # Strategy questions
    if any(word in message_lower for word in ['stratégie', 'strategy', 'comment']):
        return {
            'message': f"📚 **Stratégies de trading recommandées:**\n\n1. **Day Trading:** Profitez des mouvements intraday\n2. **Swing Trading:** Positions de 2-7 jours\n3. **Scalping:** Trades rapides (minutes)\n\n**Conseils clés:**\n✅ Toujours utiliser un stop loss\n✅ Ne pas risquer plus de 2% par trade\n✅ Suivre un plan de trading\n✅ Gérer vos émotions\n\nQuelle stratégie vous intéresse le plus?",
            'type': 'education'
        }
    
    # Risk management
    if any(word in message_lower for word in ['risque', 'risk', 'protection']):
        return {
            'message': f"🛡️ **Gestion des risques**\n\n**Règles d'or:**\n1. Risque max par trade: 2% du capital\n2. Utiliser TOUJOURS un stop loss\n3. Ratio Risk/Reward minimum: 1:2\n4. Diversifier vos positions\n5. Ne jamais trader sous le coup de l'émotion\n\n**Votre capital actuel:** $5,000\n**Risque recommandé par trade:** $100 (2%)\n\nVoulez-vous que je calcule le sizing optimal pour votre prochain trade?",
            'type': 'education'
        }
    
    # Market sentiment
    if any(word in message_lower for word in ['sentiment', 'marché', 'market']):
        sentiments = ['Très bullish 🚀', 'Bullish 📈', 'Neutre ⚖️', 'Bearish 📉', 'Très bearish 💔']
        sentiment = random.choice(sentiments)
        return {
            'message': f"🌐 **Sentiment du marché global**\n\nActuellement: **{sentiment}**\n\n**Facteurs influents:**\n• Actualités économiques\n• Volume de transactions\n• Indices de peur/cupidité\n• Tendances sociales\n\n💡 Le sentiment peut changer rapidement. Restez informé!",
            'type': 'analysis'
        }
    
    # Cryptocurrency questions
    if any(word in message_lower for word in ['bitcoin', 'btc', 'crypto', 'ethereum', 'eth']):
        return {
            'message': f"₿ **Analyse Crypto**\n\nLe marché crypto est hautement volatil.\n\n**Points clés:**\n• Bitcoin domine le marché avec 45% de dominance\n• Les altcoins suivent généralement Bitcoin\n• Attention aux nouvelles réglementaires\n• La volatilité = opportunités ET risques\n\n**Conseil:** Commencez avec de petites positions et augmentez progressivement votre exposition.",
            'type': 'analysis'
        }
    
    # Default response
    return {
        'message': f"Je suis là pour vous aider! 🤖\n\nVoici ce que je peux faire:\n• 📊 Analyser n'importe quel symbole\n• 💡 Fournir des recommandations de trading\n• 📚 Expliquer des stratégies\n• 🛡️ Conseils sur la gestion des risques\n• 🌐 Analyser le sentiment du marché\n\nPosez-moi une question spécifique ou demandez une analyse!",
        'type': 'help'
    }

@ai_chat_bp.route('/api/ai/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    symbol = data.get('symbol', None)
    
    if not user_message:
        return jsonify({'success': False, 'message': 'Message requis'}), 400
    
    # Generate AI response
    ai_response = generate_ai_response(user_message, symbol)
    
    return jsonify({
        'success': True,
        'response': ai_response['message'],
        'type': ai_response['type'],
        'timestamp': datetime.utcnow().isoformat()
    })

@ai_chat_bp.route('/api/ai/quick-analysis/<symbol>', methods=['GET'])
def quick_analysis(symbol):
    """Quick analysis endpoint for a specific symbol"""
    analysis = {
        'symbol': symbol,
        'recommendation': random.choice(['BUY', 'SELL', 'HOLD']),
        'confidence': random.randint(70, 95),
        'target_price': random.randint(150, 200),
        'stop_loss': random.randint(100, 140),
        'analysis': 'Analyse technique complète disponible via le chat.'
    }
    
    return jsonify({
        'success': True,
        'analysis': analysis
    })
