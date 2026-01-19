import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { TrendingUp, RefreshCw, Landmark } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BVCStocks = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/bvc-stocks', {
                headers: { 'X-User-ID': user.id }
            });

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

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-jetbrains text-white flex items-center gap-3">
                            <Landmark className="w-8 h-8 text-neon-green" />
                            Bourse de Casablanca
                        </h2>
                        <p className="text-gray-400 text-sm font-jetbrains mt-1">
                            Actions Marocaines en temps réel
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-neon-green hover:bg-neon-green/80 text-black font-jetbrains font-bold py-2 px-6 rounded transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>

                {/* Stocks Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-white font-jetbrains">Chargement des cotations...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {stocks.map((stock) => (
                            <div
                                key={stock.symbol}
                                className="glassmorphism-dark p-6 rounded-lg border border-white/10 hover:border-neon-green/50 transition-all"
                            >
                                {/* Symbol */}
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold font-jetbrains text-white">
                                        {stock.symbol}
                                    </h3>
                                    {stock.status === 'success' ? (
                                        <TrendingUp className="w-5 h-5 text-neon-green" />
                                    ) : (
                                        <span className="text-xs text-neon-red font-jetbrains">Erreur</span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-neon-green font-jetbrains">
                                            {stock.price > 0 ? stock.price.toFixed(2) : 'N/A'}
                                        </span>
                                        <span className="text-gray-400 text-sm font-jetbrains">
                                            {stock.currency}
                                        </span>
                                    </div>
                                </div>

                                {/* Source & Timestamp */}
                                <div className="pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between text-xs text-gray-500 font-jetbrains">
                                        <span>Source: {stock.source}</span>
                                        <span>{new Date(stock.timestamp).toLocaleTimeString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info */}
                <div className="glassmorphism-dark p-4 rounded-lg border border-white/10">
                    <div className="flex items-start gap-3">
                        <Landmark className="w-5 h-5 text-neon-blue mt-0.5" />
                        <div className="text-sm text-gray-400 font-jetbrains">
                            <p className="mb-2">
                                <strong className="text-white">Principales actions marocaines</strong> : IAM (Maroc Telecom), ATW (Attijariwafa Bank), BCP (Banque Populaire), CIH (Crédit Immobilier), BOA (Bank of Africa), LHM (LafargeHolcim Maroc), ADH (Douja Prom Addoha)
                            </p>
                            <p>
                                Les prix sont récupérés en temps réel depuis différentes sources et peuvent inclure un léger délai.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BVCStocks;

