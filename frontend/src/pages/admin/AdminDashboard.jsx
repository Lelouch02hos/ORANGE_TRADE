import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
                headers: { 'X-User-ID': user.id }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Utilisateurs"
                        value={stats?.users?.total || 0}
                        icon={Users}
                        color="neon-green"
                        trend="up"
                        trendValue={`+${stats?.users?.new_30d || 0}`}
                    />
                    <StatCard
                        title="Challenges Actifs"
                        value={stats?.challenges?.active || 0}
                        icon={TrendingUp}
                        color="neon-blue"
                    />
                    <StatCard
                        title="Volume Trading"
                        value={`$${(stats?.trading_volume || 0).toLocaleString()}`}
                        icon={DollarSign}
                        color="neon-green"
                    />
                    <StatCard
                        title="Transactions Pending"
                        value={stats?.transactions?.pending || 0}
                        icon={AlertCircle}
                        color="neon-red"
                    />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Stats */}
                    <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                        <h3 className="text-xl font-bold font-jetbrains text-white mb-4">
                            Statistiques Utilisateurs
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 font-jetbrains text-sm">Utilisateurs actifs</span>
                                <span className="text-white font-jetbrains font-semibold">{stats?.users?.active || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 font-jetbrains text-sm">Administrateurs</span>
                                <span className="text-white font-jetbrains font-semibold">{stats?.users?.admins || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400 font-jetbrains text-sm">Nouveaux (30j)</span>
                                <span className="text-neon-green font-jetbrains font-semibold">{stats?.users?.new_30d || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Challenge Stats */}
                    <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                        <h3 className="text-xl font-bold font-jetbrains text-white mb-4">
                            Statistiques Challenges
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 font-jetbrains text-sm">Total challenges</span>
                                <span className="text-white font-jetbrains font-semibold">{stats?.challenges?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400 font-jetbrains text-sm">Actifs</span>
                                <span className="text-neon-blue font-jetbrains font-semibold">{stats?.challenges?.active || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400 font-jetbrains text-sm">Financés</span>
                                <span className="text-neon-green font-jetbrains font-semibold">{stats?.challenges?.funded || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-bold font-jetbrains text-white mb-4">
                        Actions Rapides
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/users'}
                            className="bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 font-jetbrains font-semibold py-3 px-6 rounded transition-all"
                        >
                            Gérer Utilisateurs
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin/transactions'}
                            className="bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 font-jetbrains font-semibold py-3 px-6 rounded transition-all"
                        >
                            Voir Transactions
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin/logs'}
                            className="bg-neon-red/10 border border-neon-red/30 text-neon-red hover:bg-neon-red/20 font-jetbrains font-semibold py-3 px-6 rounded transition-all"
                        >
                            Consulter Logs
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
