import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Calendar,
    Trophy,
    TrendingUp,
    DollarSign,
    Target,
    Award,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    Zap
} from 'lucide-react';
import axios from 'axios';
import AuthNavbar from '../components/AuthNavbar';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalChallenges: 0,
        activeChallenges: 0,
        fundedChallenges: 0,
        totalProfit: 0,
        winRate: 0,
        totalTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
        fetchUserData(JSON.parse(storedUser).id);
    }, [navigate]);

    const fetchUserData = async (userId) => {
        try {
            const [challengesRes, transactionsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/api/user/${userId}/challenges`),
                axios.get(`${API_URL}/api/user/${userId}/transactions`),
                axios.get(`${API_URL}/api/user/${userId}/stats`)
            ]);

            setChallenges(challengesRes.data);
            setTransactions(transactionsRes.data);
            setStats({
                ...statsRes.data,
                // Add mock enriched data
                totalTrades: 124,
                avgWin: 425.50,
                avgLoss: 187.30,
                bestTrade: 1250,
                worstTrade: -345,
                profitFactor: 2.27
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cyberpunk flex items-center justify-center">
                <div className="text-white text-2xl font-jetbrains">LOADING...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cyberpunk text-white">
            <AuthNavbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-5xl font-black font-jetbrains mb-3 text-white">
                        MON <span className="text-neon-green">PROFIL</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-jetbrains">
                        Gérez vos informations et suivez vos performances
                    </p>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - User Info */}
                    <div className="col-span-4 space-y-6">
                        {/* User Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glassmorphism-dark p-6 border border-white/10"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center text-4xl font-bold mb-4 text-neon-green font-jetbrains">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold mb-1 font-jetbrains">{user?.username}</h2>
                                <p className="text-gray-400 text-sm mb-6 font-jetbrains">{user?.email}</p>

                                <div className="w-full space-y-3">
                                    <div className="flex items-center justify-between text-sm glassmorphism p-3">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <User className="w-4 h-4" />
                                            <span className="font-jetbrains">RÔLE</span>
                                        </div>
                                        <span className="font-jetbrains font-bold text-neon-green capitalize">
                                            {user?.role || 'Trader'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm glassmorphism p-3">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-jetbrains">MEMBRE DEPUIS</span>
                                        </div>
                                        <span className="font-jetbrains font-bold text-white">Déc 2025</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm glassmorphism p-3">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Zap className="w-4 h-4" />
                                            <span className="font-jetbrains">STATUT</span>
                                        </div>
                                        <span className="font-jetbrains font-bold text-neon-green flex items-center gap-1">
                                            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                                            ACTIF
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glassmorphism-dark p-6 border border-white/10"
                        >
                            <h3 className="font-jetbrains text-xs text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Statistiques Rapides
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-jetbrains text-gray-400">Total Trades</span>
                                    <span className="text-lg font-jetbrains font-bold text-white">{stats.totalTrades}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-jetbrains text-gray-400">Win Rate</span>
                                    <span className="text-lg font-jetbrains font-bold text-neon-green">{stats.winRate || '0'}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-jetbrains text-gray-400">Profit Factor</span>
                                    <span className="text-lg font-jetbrains font-bold text-neon-green">{stats.profitFactor}</span>
                                </div>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-jetbrains text-gray-400">Avg Win</span>
                                    <span className="text-sm font-jetbrains font-bold text-neon-green">+${stats.avgWin}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-jetbrains text-gray-400">Avg Loss</span>
                                    <span className="text-sm font-jetbrains font-bold text-red-500">-${stats.avgLoss}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Stats & Challenges */}
                    <div className="col-span-8 space-y-6">
                        {/* Performance Cards */}
                        <div className="grid grid-cols-4 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glassmorphism-dark p-4 border border-white/10"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="w-5 h-5 text-neon-green" />
                                    <span className="text-[10px] font-jetbrains text-gray-400 uppercase">Challenges</span>
                                </div>
                                <div className="text-3xl font-bold font-jetbrains text-white">{stats.totalChallenges}</div>
                                <div className="text-xs font-jetbrains text-gray-500 mt-1">Total</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glassmorphism-dark p-4 border border-neon-green/30 bg-neon-green/5"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-neon-green" />
                                    <span className="text-[10px] font-jetbrains text-gray-400 uppercase">Actifs</span>
                                </div>
                                <div className="text-3xl font-bold font-jetbrains text-neon-green">{stats.activeChallenges}</div>
                                <div className="text-xs font-jetbrains text-gray-500 mt-1">En cours</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glassmorphism-dark p-4 border border-yellow-500/30 bg-yellow-500/5"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-5 h-5 text-yellow-500" />
                                    <span className="text-[10px] font-jetbrains text-gray-400 uppercase">Financés</span>
                                </div>
                                <div className="text-3xl font-bold font-jetbrains text-yellow-500">{stats.fundedChallenges}</div>
                                <div className="text-xs font-jetbrains text-gray-500 mt-1">Comptes</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glassmorphism-dark p-4 border border-neon-green/30 bg-neon-green/5"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-neon-green" />
                                    <span className="text-[10px] font-jetbrains text-gray-400 uppercase">Profit</span>
                                </div>
                                <div className="text-3xl font-bold font-jetbrains text-neon-green">
                                    ${stats.totalProfit.toFixed(0)}
                                </div>
                                <div className="text-xs font-jetbrains text-gray-500 mt-1">Total</div>
                            </motion.div>
                        </div>

                        {/* Performance Metrics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glassmorphism-dark p-6 border border-white/10"
                        >
                            <h3 className="font-jetbrains text-xs text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Performance Détaillée
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-jetbrains text-gray-400">Meilleur Trade</span>
                                        <span className="text-lg font-jetbrains font-bold text-neon-green">
                                            +${stats.bestTrade}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-neon-green rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-jetbrains text-gray-400">Pire Trade</span>
                                        <span className="text-lg font-jetbrains font-bold text-red-500">
                                            ${stats.worstTrade}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Challenges Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glassmorphism-dark p-6 border border-white/10"
                        >
                            <h3 className="font-jetbrains text-xs text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                                <Target className="w-4 h-4" /> Mes Challenges
                            </h3>
                            {challenges.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-gray-400 font-jetbrains text-[10px] uppercase">ID</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-jetbrains text-[10px] uppercase">Statut</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-jetbrains text-[10px] uppercase">Balance</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-jetbrains text-[10px] uppercase">Équité</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-jetbrains text-[10px] uppercase">P&L</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-jetbrains text-[10px] uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {challenges.map((challenge) => (
                                                <tr
                                                    key={challenge.id}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="py-3 px-4 font-jetbrains text-sm">#{challenge.id}</td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-3 py-1 text-[10px] font-jetbrains font-bold uppercase ${challenge.status === 'active'
                                                                ? 'bg-neon-green/20 text-neon-green'
                                                                : challenge.status === 'funded'
                                                                    ? 'bg-yellow-500/20 text-yellow-500'
                                                                    : 'bg-red-500/20 text-red-500'
                                                                }`}
                                                        >
                                                            {challenge.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-jetbrains text-sm">
                                                        ${challenge.start_balance.toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4 font-jetbrains text-sm">
                                                        ${challenge.current_equity.toFixed(2)}
                                                    </td>
                                                    <td
                                                        className={`py-3 px-4 font-jetbrains font-bold text-sm ${challenge.current_equity - challenge.start_balance >= 0
                                                            ? 'text-neon-green'
                                                            : 'text-red-500'
                                                            }`}
                                                    >
                                                        {challenge.current_equity - challenge.start_balance >= 0 ? '+' : ''}
                                                        ${(challenge.current_equity - challenge.start_balance).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-400 font-jetbrains text-xs">
                                                        {new Date(challenge.start_date).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 font-jetbrains text-sm mb-4">
                                        Vous n'avez pas encore de challenges
                                    </p>
                                    <Link
                                        to="/pricing"
                                        className="inline-block px-6 py-3 bg-neon-green text-black hover:bg-neon-green/90 font-jetbrains text-xs font-bold transition-all"
                                    >
                                        DÉMARRER UN CHALLENGE
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                        {/* Transactions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="glassmorphism-dark p-6 border border-white/10"
                        >
                            <h3 className="font-jetbrains text-xs text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Historique des Transactions
                            </h3>
                            {transactions.length > 0 ? (
                                <div className="space-y-3">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'payment'
                                                        ? 'bg-blue-500/20'
                                                        : 'bg-neon-green/20'
                                                        }`}
                                                >
                                                    {transaction.type === 'payment' ? (
                                                        <DollarSign className="w-5 h-5 text-blue-400" />
                                                    ) : (
                                                        <TrendingUp className="w-5 h-5 text-neon-green" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-jetbrains text-sm font-bold">
                                                        {transaction.type === 'payment' ? 'Paiement Challenge' : 'Retrait'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-jetbrains">
                                                        {new Date(transaction.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-jetbrains font-bold text-lg">
                                                    ${transaction.amount.toFixed(2)}
                                                </div>
                                                <div
                                                    className={`text-[10px] font-jetbrains uppercase ${transaction.status === 'completed'
                                                        ? 'text-neon-green'
                                                        : transaction.status === 'pending'
                                                            ? 'text-yellow-400'
                                                            : 'text-red-400'
                                                        }`}
                                                >
                                                    {transaction.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 font-jetbrains text-sm">
                                    Aucune transaction pour le moment.
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

