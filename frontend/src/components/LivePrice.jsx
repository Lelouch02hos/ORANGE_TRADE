import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import websocketService from '../services/websocket';

const LivePrice = ({ symbol }) => {
    const [priceData, setPriceData] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Connect WebSocket
        websocketService.connect();

        // Price update handler
        const handlePriceUpdate = (data) => {
            setPriceData(data);
            setIsLoading(false);

            // Update price history for sparkline (keep last 30 points)
            setPriceHistory(prev => {
                const updated = [...prev, data.price];
                return updated.slice(-30);
            });
        };

        // Subscribe to symbol
        websocketService.subscribe(symbol, handlePriceUpdate);

        // Cleanup on unmount
        return () => {
            websocketService.unsubscribe(symbol, handlePriceUpdate);
        };
    }, [symbol]);

    if (isLoading || !priceData) {
        return (
            <div className="glassmorphism-dark p-4 border border-white/10">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/10 rounded w-20"></div>
                    <div className="h-8 bg-white/10 rounded w-32"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                </div>
            </div>
        );
    }

    const isPositive = priceData.change >= 0;

    // Generate sparkline points
    const generateSparkline = () => {
        if (priceHistory.length < 2) return '';

        const width = 100;
        const height = 40;
        const minPrice = Math.min(...priceHistory);
        const maxPrice = Math.max(...priceHistory);
        const priceRange = maxPrice - minPrice || 1;

        const points = priceHistory.map((price, i) => {
            const x = (i / (priceHistory.length - 1)) * width;
            const y = height - ((price - minPrice) / priceRange) * height;
            return `${x},${y}`;
        }).join(' ');

        return points;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphism-dark p-4 border border-white/10 hover:border-neon-green/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="font-jetbrains text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {symbol}
                </span>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-jetbrains text-gray-500 uppercase tracking-wider">LIVE</span>
                </div>
            </div>

            {/* Price & Change */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="text-3xl font-black font-jetbrains mb-1 text-white">
                        ${priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`flex items-center gap-1.5 ${isPositive ? 'text-neon-green' : 'text-red-500'}`}>
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-jetbrains text-sm font-bold">
                            {isPositive ? '+' : ''}{priceData.change.toFixed(2)}
                        </span>
                        <span className="font-jetbrains text-xs">
                            ({isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                {/* Mini Sparkline */}
                {priceHistory.length > 1 && (
                    <svg width="100" height="40" className="opacity-60">
                        <polyline
                            fill="none"
                            stroke={isPositive ? '#00ff9d' : '#ff0055'}
                            strokeWidth="2"
                            points={generateSparkline()}
                        />
                    </svg>
                )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div>
                    <div className="text-[9px] font-jetbrains text-gray-500 uppercase">High</div>
                    <div className="text-xs font-jetbrains font-bold text-neon-green">
                        ${priceData.high?.toFixed(2) || '-'}
                    </div>
                </div>
                <div>
                    <div className="text-[9px] font-jetbrains text-gray-500 uppercase">Low</div>
                    <div className="text-xs font-jetbrains font-bold text-red-500">
                        ${priceData.low?.toFixed(2) || '-'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LivePrice;
