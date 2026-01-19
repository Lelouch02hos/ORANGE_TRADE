import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.subscribers = new Map(); // symbol -> array of callbacks
        this.isConnected = false;
    }

    connect() {
        if (this.socket?.connected) {
            console.log('⚡ WebSocket already connected');
            return;
        }

        console.log('🔌 Connecting to WebSocket...');

        this.socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            timeout: 20000
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected:', this.socket.id);
            this.isConnected = true;

            // Resubscribe to all symbols after reconnection
            this.subscribers.forEach((callbacks, symbol) => {
                this.socket.emit('subscribe', { symbol });
            });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connection_response', (data) => {
            console.log('📡 Connection response:', data);
        });

        this.socket.on('price_update', (data) => {
            const callbacks = this.subscribers.get(data.symbol) || [];
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in price update callback:', error);
                }
            });
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔴 WebSocket connection error:', error);
        });

        this.socket.on('error', (error) => {
            console.error('🔴 WebSocket error:', error);
        });
    }

    subscribe(symbol, callback) {
        if (!this.socket) {
            console.warn('Socket not initialized, connecting first...');
            this.connect();
        }

        // Add callback to subscribers
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, []);
        }

        const callbacks = this.subscribers.get(symbol);
        if (!callbacks.includes(callback)) {
            callbacks.push(callback);
        }

        // Send subscribe event to server
        if (this.isConnected) {
            this.socket.emit('subscribe', { symbol });
            console.log(`📊 Subscribed to ${symbol}`);
        }
    }

    unsubscribe(symbol, callback) {
        const callbacks = this.subscribers.get(symbol);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }

            // If no more callbacks for this symbol, unsubscribe from server
            if (callbacks.length === 0) {
                this.subscribers.delete(symbol);
                if (this.socket && this.isConnected) {
                    this.socket.emit('unsubscribe', { symbol });
                    console.log(`❌ Unsubscribed from ${symbol}`);
                }
            }
        }
    }

    unsubscribeAll(symbol) {
        if (this.subscribers.has(symbol)) {
            this.subscribers.delete(symbol);
            if (this.socket && this.isConnected) {
                this.socket.emit('unsubscribe', { symbol });
                console.log(`❌ Unsubscribed all from ${symbol}`);
            }
        }
    }

    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting WebSocket...');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.subscribers.clear();
        }
    }

    ping() {
        if (this.socket && this.isConnected) {
            this.socket.emit('ping');
        }
    }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
