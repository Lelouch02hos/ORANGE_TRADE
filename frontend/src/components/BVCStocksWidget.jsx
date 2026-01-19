import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Landmark } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BVCStocksWidget = ({ onStockClick }) => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStocks();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchStocks, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/bvc-stocks');

            if (response.data.success) {
                setStocks(response.data.stocks);
            }
        } catch (error) {
            console.error('Error fetching BVC stocks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStocks();
    };

    if (loading) {
        return (
            <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                <div className="text-white font-jetbrains">Chargement des actions BVC...</div>
            </div>
        );
    }

    return (
        <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Landmark className="w-6 h-6 text-neon-green" />
                    <div>
                        <h3 className="text-xl font-bold text-white font-jetbrains">
                            Bourse de Casablanca
                        </h3>
                        <p className="text-xs text-gray-400 font-jetbrains">
                            Actions Marocaines
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 rounded transition-all disabled:opacity-50"
                    title="Actualiser"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocks.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 font-jetbrains py-8">
                        Aucune donnée disponible
                    </div>
                ) : (
                    stocks.map((stock) => (
                        <div
                            key={stock.symbol}
                            onClick={() => onStockClick && onStockClick(stock.symbol)}
                            className="bg-black/30 p-4 rounded-lg border border-white/5 hover:border-neon-green/30 transition-all group cursor-pointer"
                        >
                            {/* Symbol & Status */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-white font-jetbrains group-hover:text-neon-green transition-colors">
                                    {stock.symbol}
                                </span>
                                {stock.status === 'success' ? (
                                    <TrendingUp className="w-4 h-4 text-neon-green" />
                                ) : (
                                    <span className="text-xs text-neon-red font-jetbrains">N/A</span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-neon-green font-jetbrains">
                                        {stock.price > 0 ? stock.price.toFixed(2) : '-'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-jetbrains">
                                        {stock.currency}
                                    </span>
                                </div>
                            </div>

                            {/* Source */}
                            <div className="text-xs text-gray-500 font-jetbrains">
                                {stock.source}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Footer */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 font-jetbrains">
                    💡 Prix en temps réel depuis la Bourse de Casablanca • Actualisation toutes les 5 minutes
                </p>
            </div>
        </div>
    );
};

export default BVCStocksWidget;

