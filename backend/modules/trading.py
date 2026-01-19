from flask import Blueprint, request, jsonify
from extensions import db
from models import Trade, Challenge
import yfinance as yf
from datetime import datetime
from modules.bvc_scraper import get_bvc_price, BVCScraper

trading_bp = Blueprint('trading', __name__)

# Instance du scraper BVC
bvc_scraper = BVCScraper()

def get_live_price(symbol):
    """
    Récupère le prix en temps réel d'une action
    Supporte:
    - Actions marocaines (BVC) : IAM, ATW, BCP, etc.
    - Cryptos : BTC-USD, ETH-USD
    - Actions US : AAPL, TSLA, etc.
    """
    
    # 1. Actions marocaines (Bourse de Casablanca)
    if symbol.endswith('.MA'):
        # Retirer le suffixe .MA
        clean_symbol = symbol.replace('.MA', '')
        price_data = bvc_scraper.get_stock_price(clean_symbol)
        if price_data:
            return price_data['price']
        return None
    
    # Si le symbole est directement une action marocaine connue
    moroccan_stocks = ['IAM', 'ATW', 'BCP', 'CIH', 'GAZ', 'LHM', 'MNG', 'ONA', 'SAM', 'SNI', 'TQM', 'WAA']
    if symbol.upper() in moroccan_stocks:
        price_data = bvc_scraper.get_stock_price(symbol)
        if price_data:
            return price_data['price']
        return None
    
    # 2. Cryptos et actions US/internationales (via yfinance)
    try:
        ticker = yf.Ticker(symbol)
        # fast_info is faster than history
        price = ticker.fast_info['last_price']
        return price
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

@trading_bp.route('/api/trade', methods=['POST'])
def place_trade():
    data = request.json
    challenge_id = data.get('challenge_id')
    symbol = data.get('symbol')
    trade_type = data.get('type') # buy/sell
    position = data.get('position', 'long')  # long/short - default long
    quantity = float(data.get('quantity'))
    
    challenge = Challenge.query.get(challenge_id)
    if not challenge or challenge.status != 'active':
        return jsonify({"error": "Challenge not active"}), 400

    current_price = get_live_price(symbol)
    if not current_price:
        return jsonify({"error": "Invalid symbol or price unavailable"}), 400

    # Execute Trade
    # For MVP, we execute immediately at current price
    trade = Trade(
        challenge_id=challenge_id,
        symbol=symbol,
        type=trade_type,
        position=position,  # Store position (long/short)
        quantity=quantity,
        open_price=current_price,
        status='open'
    )
    
    # Update Equity (simplified: spread/commission ignored)
    # In a real prop firm, we track Balance vs Equity. 
    # Buying doesn't change Balance immediately, but changes Equity based on price.
    # For this MVP, let's just log the trade. 
    # The background task or a separate 'update_equity' function should calculate P&L.
    
    db.session.add(trade)
    db.session.commit()
    
    return jsonify({
        "message": "Trade executed", 
        "price": current_price, 
        "trade_id": trade.id,
        "position": position
    })

@trading_bp.route('/api/trade/close/<int:trade_id>', methods=['POST'])
def close_trade(trade_id):
    trade = Trade.query.get(trade_id)
    if not trade or trade.status != 'open':
        return jsonify({"error": "Invalid trade"}), 400
        
    current_price = get_live_price(trade.symbol)
    
    trade.close_price = current_price
    trade.status = 'closed'
    trade.timestamp = datetime.utcnow()
    
    # Calculate Profit based on position (Long or Short)
    position = getattr(trade, 'position', 'long')  # Default to long if not set
    
    if position == 'long':
        # Long position: profit when price goes up
        trade.profit = (current_price - trade.open_price) * trade.quantity
    else:  # short
        # Short position: profit when price goes down
        trade.profit = (trade.open_price - current_price) * trade.quantity
        
    # Update Challenge Balance/Equity
    challenge = Challenge.query.get(trade.challenge_id)
    challenge.current_equity += trade.profit
    # Note: In a real system, we'd update balance only on close, but equity updates live.
    # Here we update equity on close.
    
    db.session.commit()
    
    return jsonify({
        "message": "Trade closed", 
        "profit": trade.profit,
        "close_price": current_price,
        "position": position
    })

@trading_bp.route('/api/trades/open/<int:challenge_id>', methods=['GET'])
def get_open_trades(challenge_id):
    """Get all open trades for a challenge"""
    trades = Trade.query.filter_by(challenge_id=challenge_id, status='open').all()
    
    trades_data = []
    for trade in trades:
        current_price = get_live_price(trade.symbol)
        position = getattr(trade, 'position', 'long')
        
        # Calculate unrealized P&L
        if position == 'long':
            unrealized_pnl = (current_price - trade.open_price) * trade.quantity if current_price else 0
        else:
            unrealized_pnl = (trade.open_price - current_price) * trade.quantity if current_price else 0
        
        trades_data.append({
            'id': trade.id,
            'symbol': trade.symbol,
            'type': trade.type,
            'position': position,
            'quantity': trade.quantity,
            'open_price': trade.open_price,
            'current_price': current_price,
            'unrealized_pnl': unrealized_pnl,
            'timestamp': trade.timestamp.isoformat() if trade.timestamp else None
        })
    
    return jsonify(trades_data)

@trading_bp.route('/api/bvc/stocks', methods=['GET'])
def get_bvc_stocks():
    """
    Récupère la liste des actions marocaines disponibles avec leurs prix
    """
    try:
        # Récupérer toutes les actions BVC disponibles
        stocks_data = bvc_scraper.get_all_available_stocks()
        
        # Formater pour le frontend
        stocks_list = []
        for symbol, data in stocks_data.items():
            stocks_list.append({
                'symbol': data['symbol'],
                'name': get_stock_name(symbol),
                'price': data['price'],
                'currency': data['currency'],
                'source': data['source'],
                'timestamp': data['timestamp']
            })
        
        return jsonify({
            'status': 'success',
            'count': len(stocks_list),
            'stocks': stocks_list
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@trading_bp.route('/api/bvc/price/<symbol>', methods=['GET'])
def get_bvc_stock_price(symbol):
    """
    Récupère le prix d'une action marocaine spécifique
    """
    try:
        price_data = bvc_scraper.get_stock_price(symbol.upper())
        
        if price_data:
            return jsonify({
                'status': 'success',
                'data': {
                    'symbol': price_data['symbol'],
                    'name': get_stock_name(price_data['symbol']),
                    'price': price_data['price'],
                    'currency': price_data['currency'],
                    'source': price_data['source'],
                    'timestamp': price_data['timestamp']
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Stock {symbol} not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def get_stock_name(symbol):
    """Retourne le nom complet de l'action"""
    names = {
        'IAM': 'Maroc Telecom',
        'ATW': 'Attijariwafa Bank',
        'BCP': 'Banque Centrale Populaire',
        'CIH': 'CIH Bank',
        'GAZ': 'Afriquia Gaz',
        'LHM': 'LafargeHolcim Maroc',
        'MNG': 'Managem',
        'ONA': 'ONA',
        'SAM': 'Samir',
        'SNI': 'SNI',
        'TQM': 'Taqa Morocco',
        'WAA': 'Wafa Assurance'
    }
    return names.get(symbol, symbol)
