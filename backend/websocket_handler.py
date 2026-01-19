from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import yfinance as yf
import threading
import time

socketio = SocketIO(cors_allowed_origins="*")

# Active subscriptions: {symbol: set(room_ids)}
active_subscriptions = {}
subscription_locks = {}

def get_real_time_price(symbol):
    """Fetch current price from Yahoo Finance"""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period='1d', interval='1m')
        if not data.empty:
            current_price = float(data['Close'].iloc[-1])
            open_price = float(data['Open'].iloc[0])
            change = current_price - open_price
            change_percent = (change / open_price) * 100 if open_price != 0 else 0
            
            return {
                'symbol': symbol,
                'price': round(current_price, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'volume': int(data['Volume'].iloc[-1]) if 'Volume' in data else 0,
                'high': round(float(data['High'].iloc[-1]), 2),
                'low': round(float(data['Low'].iloc[-1]), 2),
                'timestamp': time.time()
            }
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None

def price_stream_worker(symbol):
    """Background worker for streaming prices to all subscribers"""
    print(f"Starting price stream for {symbol}")
    
    while symbol in active_subscriptions and active_subscriptions[symbol]:
        price_data = get_real_time_price(symbol)
        
        if price_data:
            # Emit to all rooms subscribed to this symbol
            rooms = list(active_subscriptions[symbol])
            for room in rooms:
                socketio.emit('price_update', price_data, room=room)
        
        time.sleep(1)  # Update every second
    
    print(f"Stopped price stream for {symbol}")

@socketio.on('connect')
def handle_connect():
    """Handle new client connection"""
    print(f'✅ Client connected: {request.sid}')
    emit('connection_response', {
        'status': 'connected',
        'message': 'WebSocket connection established',
        'clientId': request.sid
    })

@socketio.on('subscribe')
def handle_subscribe(data):
    """Handle client subscription to a symbol"""
    symbol = data.get('symbol', 'BTC-USD')
    room = request.sid
    
    # Join the room
    join_room(room)
    
    # Initialize subscription tracking
    if symbol not in active_subscriptions:
        active_subscriptions[symbol] = set()
        subscription_locks[symbol] = threading.Lock()
    
    with subscription_locks[symbol]:
        # Add client to subscriptions
        was_empty = len(active_subscriptions[symbol]) == 0
        active_subscriptions[symbol].add(room)
        
        # Start worker thread if this is the first subscriber
        if was_empty:
            thread = threading.Thread(target=price_stream_worker, args=(symbol,))
            thread.daemon = True
            thread.start()
    
    # Send immediate price update
    price_data = get_real_time_price(symbol)
    if price_data:
        emit('price_update', price_data, room=room)
    
    print(f'📊 Client {room} subscribed to {symbol} ({len(active_subscriptions[symbol])} total subscribers)')

@socketio.on('unsubscribe')
def handle_unsubscribe(data):
    """Handle client unsubscription from a symbol"""
    symbol = data.get('symbol')
    room = request.sid
    
    if symbol in active_subscriptions:
        with subscription_locks[symbol]:
            active_subscriptions[symbol].discard(room)
            
            # Clean up if no more subscribers
            if not active_subscriptions[symbol]:
                del active_subscriptions[symbol]
                del subscription_locks[symbol]
    
    leave_room(room)
    print(f'❌ Client {room} unsubscribed from {symbol}')

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnect - clean up all subscriptions"""
    room = request.sid
    
    # Clean up all subscriptions for this client
    for symbol in list(active_subscriptions.keys()):
        if symbol in subscription_locks:
            with subscription_locks[symbol]:
                active_subscriptions[symbol].discard(room)
                
                # Clean up if no more subscribers
                if not active_subscriptions[symbol]:
                    del active_subscriptions[symbol]
                    del subscription_locks[symbol]
    
    print(f'🔌 Client disconnected: {room}')

@socketio.on('ping')
def handle_ping():
    """Handle ping for connection keep-alive"""
    emit('pong', {'timestamp': time.time()})
