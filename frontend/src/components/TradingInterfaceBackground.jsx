import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Add these keyframes to your global CSS or styles
const styles = `
@keyframes scroll-vertical {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
}
`;

const TradingInterfaceBackground = ({ opacity = 0.3 }) => {
    // Generate candlestick data for the chart
    const candlestickData = useMemo(() => {
        const candles = [];
        let lastClose = 42000;

        for (let i = 0; i < 60; i++) {
            const open = lastClose;
            const change = (Math.random() - 0.5) * 800;
            const close = open + change;
            const high = Math.max(open, close) + Math.random() * 300;
            const low = Math.min(open, close) - Math.random() * 300;
            const isBullish = close > open;

            candles.push({
                x: i,
                open,
                close,
                high,
                low,
                isBullish,
                volume: Math.random() * 100
            });

            lastClose = close;
        }

        return candles;
    }, []);

    // Generate order book data
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

    // Generate random grid flickers
    const [flickers, setFlickers] = useState([]);
    useEffect(() => {
        const interval = setInterval(() => {
            const newFlickers = Array.from({ length: 5 }, () => ({
                id: Math.random(),
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 10),
                duration: Math.random() * 0.5 + 0.1
            }));
            setFlickers(newFlickers);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const generateOrderBook = () => {
            const basePrice = 42567.89;
            const bids = Array.from({ length: 15 }, (_, i) => ({
                id: Math.random(),
                price: (basePrice - i * (Math.random() * 5 + 2)).toFixed(2),
                amount: (Math.random() * 2 + 0.1).toFixed(4),
                total: (Math.random() * 85000).toFixed(0),
                depth: Math.random() * 100
            }));

            const asks = Array.from({ length: 15 }, (_, i) => ({
                id: Math.random(),
                price: (basePrice + i * (Math.random() * 5 + 2)).toFixed(2),
                amount: (Math.random() * 2 + 0.1).toFixed(4),
                total: (Math.random() * 85000).toFixed(0),
                depth: Math.random() * 100
            }));

            setOrderBook({ bids, asks });
        };

        generateOrderBook();
        const interval = setInterval(generateOrderBook, 1500);
        return () => clearInterval(interval);
    }, []);

    // Calculate chart dimensions
    const chartWidth = 70; // percentage
    const chartHeight = 100;
    const candleWidth = chartWidth / candlestickData.length;

    // Get min/max for scaling
    const allPrices = candlestickData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    const scaleY = (price) => {
        return ((maxPrice - price) / priceRange) * 80 + 10; // 10% top margin, 10% bottom margin
    };

    // Generate waveform path
    const waveformPath = useMemo(() => {
        return candlestickData.map((c, i) => {
            const x = (i / candlestickData.length) * chartWidth * 10;
            const y = scaleY((c.open + c.close) / 2);
            return `${i === 0 ? 'M' : 'L'} ${x + candleWidth * 5} ${y}`;
        }).join(' ');
    }, [candlestickData, candleWidth, chartWidth]);

    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ opacity }}
        >
            <style>{styles}</style>

            {/* Scrolling Data Background */}
            <div className="absolute inset-0 opacity-[0.03] overflow-hidden font-jetbrains text-[8px] leading-tight text-neon-green">
                <div style={{ animation: 'scroll-vertical 60s linear infinite' }}>
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="whitespace-nowrap">
                            {Array.from({ length: 20 }).map((_, j) => (
                                <span key={j} className="mx-2">
                                    0x{Math.random().toString(16).substr(2, 8).toUpperCase()}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-full relative z-10">
                {/* Candlestick Chart Section (Left 70%) */}
                <svg
                    className="absolute left-0 top-0"
                    style={{ width: `${chartWidth}%`, height: '100%' }}
                    viewBox={`0 0 ${chartWidth * 10} ${chartHeight}`}
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
                    {[...Array(10)].map((_, i) => (
                        <line
                            key={`h-grid-${i}`}
                            x1="0"
                            y1={i * 10}
                            x2={chartWidth * 10}
                            y2={i * 10}
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="0.1"
                        />
                    ))}
                    {[...Array(20)].map((_, i) => (
                        <line
                            key={`v-grid-${i}`}
                            x1={i * (chartWidth * 10 / 20)}
                            y1="0"
                            x2={i * (chartWidth * 10 / 20)}
                            y2={chartHeight}
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="0.1"
                        />
                    ))}

                    {/* Grid Intersection Flickers */}
                    {flickers.map((flicker) => (
                        <motion.rect
                            key={flicker.id}
                            x={flicker.x * (chartWidth * 10 / 20) - 1} // Align to grid
                            y={flicker.y * 10 - 1} // Align to grid
                            width="2"
                            height="2"
                            fill="#00ff9d"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: flicker.duration }}
                        />
                    ))}

                    {/* Waveform Line */}
                    <motion.path
                        d={waveformPath}
                        fill="none"
                        stroke="#00ff9d"
                        strokeWidth="0.5"
                        strokeOpacity="0.2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    {/* Second delayed waveform for effect */}
                    <motion.path
                        d={waveformPath}
                        fill="none"
                        stroke="#00ff9d"
                        strokeWidth="0.2"
                        strokeOpacity="0.1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.1 }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                        style={{ filter: 'blur(2px)' }}
                    />

                    {/* Candlesticks */}
                    {candlestickData.map((candle, i) => {
                        const x = (i / candlestickData.length) * chartWidth * 10;
                        const bodyTop = Math.min(scaleY(candle.open), scaleY(candle.close));
                        const bodyHeight = Math.abs(scaleY(candle.close) - scaleY(candle.open)) || 0.5;
                        const color = candle.isBullish ? '#00ff9d' : '#ff0055';

                        return (
                            <g key={i}>
                                {/* Wick (High-Low line) */}
                                <line
                                    x1={x + candleWidth * 5}
                                    y1={scaleY(candle.high)}
                                    x2={x + candleWidth * 5}
                                    y2={scaleY(candle.low)}
                                    stroke={color}
                                    strokeWidth="0.2"
                                    strokeOpacity="0.8"
                                />

                                {/* Body */}
                                <rect
                                    x={x + candleWidth * 2}
                                    y={bodyTop}
                                    width={candleWidth * 6}
                                    height={bodyHeight}
                                    fill={candle.isBullish ? color : 'transparent'}
                                    stroke={color}
                                    strokeWidth="0.3"
                                    fillOpacity={candle.isBullish ? '0.8' : '0'}
                                />

                                {/* Volume bars at bottom */}
                                <rect
                                    x={x + candleWidth * 2}
                                    y={85 + (15 - (candle.volume / 100) * 15)}
                                    width={candleWidth * 6}
                                    height={(candle.volume / 100) * 15}
                                    fill={color}
                                    fillOpacity="0.3"
                                />
                            </g>
                        );
                    })}

                    {/* Glowing effect on recent candles */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Order Book Section (Right 30%) */}
                <div
                    className="absolute right-0 top-0 h-full"
                    style={{ width: '30%' }}
                >
                    {/* Order Book Header */}
                    <div className="bg-black/60 border-l border-b border-neon-green/20 px-4 py-3">
                        <div className="font-jetbrains text-[11px] text-neon-green uppercase tracking-wider font-bold">
                            Order Book • BTC/USD
                        </div>
                    </div>

                    {/* Order Book Content */}
                    <div className="h-full flex flex-col bg-black/40">
                        {/* Column Headers */}
                        <div className="grid grid-cols-3 gap-2 px-4 py-2 border-l border-b border-white/10 bg-black/50">
                            <div className="font-jetbrains text-[9px] text-gray-400 font-semibold">PRICE</div>
                            <div className="font-jetbrains text-[9px] text-gray-400 text-right font-semibold">SIZE</div>
                            <div className="font-jetbrains text-[9px] text-gray-400 text-right font-semibold">TOTAL</div>
                        </div>

                        {/* Asks (Red) */}
                        <div className="flex-1 overflow-hidden border-l border-white/10 bg-black/30">
                            {orderBook.asks.slice(0, 10).reverse().map((ask) => (
                                <motion.div
                                    key={ask.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative grid grid-cols-3 gap-2 px-4 py-1"
                                >
                                    {/* Depth bar */}
                                    <div
                                        className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-transparent to-neon-red/25"
                                        style={{ width: `${ask.depth}%` }}
                                    />

                                    <div className="font-jetbrains text-[10px] text-neon-red relative z-10 font-semibold">
                                        {ask.price}
                                    </div>
                                    <div className="font-jetbrains text-[10px] text-gray-300 text-right relative z-10">
                                        {ask.amount}
                                    </div>
                                    <div className="font-jetbrains text-[9px] text-gray-400 text-right relative z-10">
                                        {ask.total}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Current Price */}
                        <div className="bg-black/70 border-l border-y border-neon-green/30 px-4 py-3">
                            <div className="font-jetbrains text-[13px] text-neon-green font-bold">
                                ↑ $42,567.89
                            </div>
                            <div className="font-jetbrains text-[9px] text-gray-400">
                                +2.47%
                            </div>
                        </div>

                        {/* Bids (Green) */}
                        <div className="flex-1 overflow-hidden border-l border-white/10 bg-black/30">
                            {orderBook.bids.slice(0, 10).map((bid) => (
                                <motion.div
                                    key={bid.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative grid grid-cols-3 gap-2 px-4 py-1"
                                >
                                    {/* Depth bar */}
                                    <div
                                        className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-transparent to-neon-green/25"
                                        style={{ width: `${bid.depth}%` }}
                                    />

                                    <div className="font-jetbrains text-[10px] text-neon-green relative z-10 font-semibold">
                                        {bid.price}
                                    </div>
                                    <div className="font-jetbrains text-[10px] text-gray-300 text-right relative z-10">
                                        {bid.amount}
                                    </div>
                                    <div className="font-jetbrains text-[9px] text-gray-400 text-right relative z-10">
                                        {bid.total}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Market Depth Visualization */}
                        <div className="border-l border-t border-white/10 bg-black/50 px-4 py-3">
                            <div className="font-jetbrains text-[9px] text-gray-400 mb-2 font-semibold">MARKET DEPTH</div>
                            <svg width="100%" height="40" viewBox="0 0 100 40">
                                {/* Bid depth area (green) */}
                                <path
                                    d={`M 0 40 ${orderBook.bids.map((bid, i) =>
                                        `L ${(i / 8) * 50} ${40 - (bid.depth / 100) * 35}`
                                    ).join(' ')} L 50 40 Z`}
                                    fill="url(#bidGradient)"
                                    opacity="0.5"
                                />

                                {/* Ask depth area (red) */}
                                <path
                                    d={`M 50 40 ${orderBook.asks.map((ask, i) =>
                                        `L ${50 + (i / 8) * 50} ${40 - (ask.depth / 100) * 35}`
                                    ).join(' ')} L 100 40 Z`}
                                    fill="url(#askGradient)"
                                    opacity="0.5"
                                />

                                <defs>
                                    <linearGradient id="bidGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#00ff9d" stopOpacity="0.1" />
                                    </linearGradient>
                                    <linearGradient id="askGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#ff0055" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#ff0055" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Scanline effect overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.1) 3px)',
                        mixBlendMode: 'overlay'
                    }}
                />
            </div>
        </div>
    );
};

export default TradingInterfaceBackground;
