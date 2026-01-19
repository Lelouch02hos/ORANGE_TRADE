import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownLeft,
    Zap
} from 'lucide-react';
import axios from 'axios';
import LivePrice from '../components/LivePrice';
import BVCStocksWidget from '../components/BVCStocksWidget';

const Dashboard = () => {
    const chartContainerRef = useRef();
    const [currentPrice, setCurrentPrice] = useState(null);
    const [symbol, setSymbol] = useState('BTC-USD');
    const [quantity, setQuantity] = useState(1);
    const [challengeId, setChallengeId] = useState(1);
    const [openTrades, setOpenTrades] = useState([]);

    // Portfolio Stats
    const [portfolioStats, setPortfolioStats] = useState({
        balance: 10000,
        equity: 10245.50,
        pnlToday: 245.50,
        pnlTotal: 1245.50,
        winRate: 68.5,
        totalTrades: 47,
        openPositions: 3
    });

    // Watch List
    const [watchList, setWatchList] = useState([
        { symbol: 'BTC-USD', name: 'Bitcoin', price: 43250, change: 2.3, volume: '2.4B', isUp: true },
        { symbol: 'ETH-USD', name: 'Ethereum', price: 2456, change: 1.8, volume: '1.2B', isUp: true },
        { symbol: 'SOL-USD', name: 'Solana', price: 98.45, change: -1.2, volume: '456M', isUp: false },
        { symbol: 'AAPL', name: 'Apple', price: 185.50, change: -0.5, volume: '89M', isUp: false },
        { symbol: 'TSLA', name: 'Tesla', price: 245.30, change: 3.2, volume: '123M', isUp: true }
    ]);

    // Recent Trades
    const [recentTrades, setRecentTrades] = useState([
        { id: 1, symbol: 'BTC-USD', type: 'BUY', quantity: 0.5, price: 42500, pnl: 375, time: '10:45', status: 'closed' },
        { id: 2, symbol: 'ETH-USD', type: 'SELL', quantity: 5, price: 2420, pnl: -120, time: '09:30', status: 'closed' },
        { id: 3, symbol: 'AAPL', type: 'BUY', quantity: 10, price: 182, pnl: 350, time: '08:15', status: 'closed' }
    ]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    useEffect(() => {
        // TradingView Chart
        if (!chartContainerRef.current) return;
        chartContainerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: 'BINANCE:BTCUSDT',
                    interval: '15',
                    timezone: 'Africa/Casablanca',
                    theme: 'dark',
                    style: '1',
                    locale: 'en',
                    toolbar_bg: '#0f172a',
                    enable_publishing: false,
                    container_id: 'tradingview_chart',
                    backgroundColor: '#0f172a',
                    gridColor: '#1a2a47',
                    studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
                    overrides: {
                        'paneProperties.background': '#0f172a',
                        'paneProperties.gridProperties.color': '#1a2a47',
                        'scalesProperties.textColor': '#10b981',
                        'mainSeriesProperties.candleStyle.upColor': '#10b981',
                        'mainSeriesProperties.candleStyle.downColor': '#ef4444',
                    }
                });
            }
        };
        document.head.appendChild(script);
    }, []);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
                    <p className="text-gray-400">Real-time market data & portfolio overview</p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 glass-card"
                >
                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-semibold">Market Open</span>
                </motion.div>
            </motion.div>

            {/* Portfolio Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Balance', value: `$${portfolioStats.balance.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400' },
                    { label: 'Equity', value: `$${portfolioStats.equity.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'P&L Today', value: `$${portfolioStats.pnlToday.toFixed(2)}`, icon: ArrowUpRight, color: 'text-emerald-400', trend: 'up' },
                    { label: 'Win Rate', value: `${portfolioStats.winRate}%`, icon: BarChart3, color: 'text-purple-400' }
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ translateY: -5 }}
                            className="glass-card"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/10 ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {stat.trend === 'up' && <span className="text-xs text-emerald-400 font-semibold">↑ +2.3%</span>}
                            </div>
                            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Main Chart */}
            <motion.div variants={itemVariants} className="glass-card p-0 overflow-hidden h-96">
                <div className="p-6 border-b border-blue-500/20 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Bitcoin Chart</h2>
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="input-glass bg-slate-800/50 py-2 px-4 text-sm"
                    >
                        <option>BTC-USD</option>
                        <option>ETH-USD</option>
                        <option>SOL-USD</option>
                    </select>
                </div>
                <div id="tradingview_chart" ref={chartContainerRef} className="w-full h-full" />
            </motion.div>

            {/* Content Grid - Watch List & Recent Trades */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Watch List */}
                <motion.div whileHover={{ translateY: -2 }} className="glass-card p-0 overflow-hidden">
                    <div className="p-6 border-b border-blue-500/20">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            Watch List
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-700/50">
                        {watchList.map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                className="p-4 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{item.symbol}</p>
                                    <p className="text-xs text-gray-400">{item.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white">${item.price.toFixed(2)}</p>
                                    <p className={`text-xs font-semibold ${item.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {item.isUp ? '↑' : '↓'} {Math.abs(item.change)}%
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Trades */}
                <motion.div whileHover={{ translateY: -2 }} className="glass-card p-0 overflow-hidden">
                    <div className="p-6 border-b border-blue-500/20">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            Recent Trades
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-700/50">
                        {recentTrades.map((trade, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                className="p-4 flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white">{trade.symbol}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            trade.type === 'BUY' 
                                                ? 'bg-emerald-500/20 text-emerald-300' 
                                                : 'bg-red-500/20 text-red-300'
                                        }`}>
                                            {trade.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{trade.time}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {trade.pnl >= 0 ? '+' : ''} ${trade.pnl.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-400">@${trade.price.toFixed(2)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* BVC Stocks Widget */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
                <motion.div whileHover={{ translateY: -2 }}>
                    <BVCStocksWidget />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
