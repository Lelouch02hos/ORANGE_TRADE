from flask import Flask, jsonify, request
from dotenv import load_dotenv
load_dotenv()
from flask_cors import CORS
from flask_restful import Api
from apscheduler.schedulers.background import BackgroundScheduler
import os
import atexit
import logging
from extensions import db
from websocket_handler import socketio
from datetime import datetime # Added for BVC stocks endpoint

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))

# Get database configuration from environment variables
db_type = os.getenv('DB_TYPE', 'sqlite')

if db_type == 'postgresql':
    # PostgreSQL Configuration
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'tradeorange_db')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    logger.info(f"Using PostgreSQL database: {db_name} at {db_host}:{db_port}")
else:
    # SQLite Configuration (fallback)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'tradesense.db')
    logger.info("Using SQLite database: tradesense.db")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Extensions
db.init_app(app)
api = Api(app)

# Initialize SocketIO
socketio.init_app(app, cors_allowed_origins="*", async_mode='threading')

# Import Models
from models import User, Challenge, Trade, Transaction

# Register Blueprints
from modules.challenge import challenge_bp, evaluate_all_challenges
from modules.trading import trading_bp
from modules.payment import payment_bp
from modules.leaderboard import leaderboard_bp
from modules.auth import auth_bp
from modules.profile import profile_bp
from modules.ai_chat import ai_chat_bp
from modules.macro_sentiment import macro_sentiment_bp
from modules.gemini_chat import gemini_chat_bp
from modules.admin import admin_bp
# from modules.community import community_bp  # Temporairement désactivé - nécessite création tables

app.register_blueprint(challenge_bp)
app.register_blueprint(trading_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(leaderboard_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(ai_chat_bp)
app.register_blueprint(macro_sentiment_bp)
app.register_blueprint(gemini_chat_bp)
app.register_blueprint(admin_bp)
# app.register_blueprint(community_bp)  # Temporairement désactivé

# Background Scheduler
def run_schedule():
    with app.app_context():
        evaluate_all_challenges()

scheduler = BackgroundScheduler()
scheduler.add_job(func=run_schedule, trigger="interval", seconds=60)
scheduler.start()

# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())

# Create Database Tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return {"message": "TradeOrange Backend is Running", "version": "2.0", "status": "active"}

@app.route('/api/market-data/<symbol>', methods=['GET'])
def get_market_data(symbol):
    """Get market data for a specific symbol"""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        data = ticker.history(period='1d', interval='1m')
        
        return jsonify({
            'success': True,
            'data': data.to_dict('records') if not data.empty else []
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== BVC STOCKS (PUBLIC) ====================
@app.route('/api/bvc-stocks', methods=['GET'])
def get_bvc_stocks():
    """Get Moroccan stocks from Bourse de Casablanca (public endpoint)"""
    try:
        from modules.bvc_scraper import BVCScraper
        
        scraper = BVCScraper()
        symbols_param = request.args.get('symbols')
        
        if symbols_param:
            symbols = [s.strip() for s in symbols_param.split(',')]
            stocks_data = scraper.get_multiple_stocks(symbols)
        else:
            # Default main Moroccan stocks
            default_symbols = ['IAM', 'ATW', 'BCP', 'CIH', 'BOA', 'LHM', 'ADH']
            stocks_data = scraper.get_multiple_stocks(default_symbols)
        
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
        
        return jsonify({
            'success': True,
            'count': len(stocks_list),
            'stocks': stocks_list
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching BVC stocks: {e}")
        return jsonify({
            'success': False,
            'message': str(e),
            'stocks': []
        }), 500

@app.route('/api/health')
def health():
    return {'status': 'healthy', 'websocket': 'enabled'}

if __name__ == '__main__':
    print("🚀 TradeOrange Backend Starting...")
    print("📡 WebSocket server enabled on port 5000")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
