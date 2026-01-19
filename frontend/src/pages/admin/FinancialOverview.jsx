import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const FinancialOverview = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchFinancialSummary();
    }, []);

    const fetchFinancialSummary = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/financials/summary', {
                headers: { 'X-User-ID': user.id }
            });

            if (response.data.success) {
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.error('Error fetching financial summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-white font-jetbrains">Chargement...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-jetbrains text-white">
                    Vue Financière
                </h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm font-jetbrains uppercase">Total Dépôts</span>
                            <TrendingUp className="w-5 h-5 text-neon-green" />
                        </div>
                        <p className="text-3xl font-bold text-neon-green font-jetbrains">
                            ${(summary?.total_deposits || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm font-jetbrains uppercase">Total Retraits</span>
                            <TrendingDown className="w-5 h-5 text-neon-red" />
                        </div>
                        <p className="text-3xl font-bold text-neon-red font-jetbrains">
                            ${(summary?.total_withdrawals || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm font-jetbrains uppercase">Retraits Pending</span>
                            <DollarSign className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold text-yellow-500 font-jetbrains">
                            ${(summary?.pending_withdrawals || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm font-jetbrains uppercase">Revenus Total</span>
                            <DollarSign className="w-5 h-5 text-neon-green" />
                        </div>
                        <p className="text-3xl font-bold text-neon-green font-jetbrains">
                            ${(summary?.total_revenue || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Balance Net */}
                <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-bold font-jetbrains text-white mb-4">
                        Balance Nette de la Plateforme
                    </h3>
                    <div className="flex items-center gap-4">
                        <DollarSign className="w-12 h-12 text-neon-green" />
                        <div>
                            <p className="text-gray-400 text-sm font-jetbrains">Balance (Dépôts - Retraits)</p>
                            <p className={`text-4xl font-bold font-jetbrains ${(summary?.net_balance || 0) >= 0 ? 'text-neon-green' : 'text-neon-red'
                                }`}>
                                ${(summary?.net_balance || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-bold font-jetbrains text-white mb-4">
                        Informations
                    </h3>
                    <div className="space-y-3 text-gray-400 font-jetbrains text-sm">
                        <p>• Les revenus incluent les paiements de challenges et frais de plateforme</p>
                        <p>• Les retraits pending nécessitent votre approbation dans la section Transactions</p>
                        <p>• La balance nette représente les fonds réels disponibles sur la plateforme</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FinancialOverview;
