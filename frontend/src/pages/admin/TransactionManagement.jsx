import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchTransactions();
        fetchPending();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/admin/transactions?status=${filter === 'all' ? '' : filter}`,
                { headers: { 'X-User-ID': user.id } }
            );

            if (response.data.success) {
                setTransactions(response.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPending = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/admin/transactions/pending',
                { headers: { 'X-User-ID': user.id } }
            );

            if (response.data.success) {
                setPending(response.data.pending_transactions);
            }
        } catch (error) {
            console.error('Error fetching pending:', error);
        }
    };

    const handleApprove = async (transactionId) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/transactions/${transactionId}/approve`,
                {},
                { headers: { 'X-User-ID': user.id } }
            );
            fetchTransactions();
            fetchPending();
        } catch (error) {
            alert('Erreur lors de l\'approbation');
        }
    };

    const handleReject = async (transactionId) => {
        const reason = prompt('Raison du rejet:');
        if (!reason) return;

        try {
            await axios.put(
                `http://localhost:5000/api/admin/transactions/${transactionId}/reject`,
                { reason },
                { headers: { 'X-User-ID': user.id } }
            );
            fetchTransactions();
            fetchPending();
        } catch (error) {
            alert('Erreur lors du rejet');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-jetbrains text-white">
                        Gestion des Transactions
                    </h2>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-black/50 border border-white/10 text-white px-4 py-2 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-green"
                    >
                        <option value="all">Toutes</option>
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvées</option>
                        <option value="rejected">Rejetées</option>
                    </select>
                </div>

                {/* Pending Transactions Alert */}
                {pending.length > 0 && (
                    <div className="bg-neon-red/10 border border-neon-red/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-neon-red" />
                            <span className="text-neon-red font-jetbrains font-semibold">
                                {pending.length} transaction(s) en attente d'approbation
                            </span>
                        </div>
                    </div>
                )}

                {/* Transactions Table */}
                <div className="glassmorphism-dark rounded-lg border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Utilisateur</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Montant</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Statut</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400 font-jetbrains">
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400 font-jetbrains">
                                            Aucune transaction trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-jetbrains text-sm">{t.id}</td>
                                            <td className="px-6 py-4 text-white font-jetbrains font-semibold">{t.user}</td>
                                            <td className="px-6 py-4 text-neon-green font-jetbrains font-bold">
                                                ${t.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-jetbrains font-bold bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                                                    {t.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-jetbrains font-bold ${t.status === 'approved' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' :
                                                        t.status === 'rejected' ? 'bg-neon-red/20 text-neon-red border border-neon-red/30' :
                                                            'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                                    }`}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-jetbrains text-sm">
                                                {new Date(t.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {t.status === 'pending' && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprove(t.id)}
                                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                                            title="Approuver"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-neon-green" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(t.id)}
                                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                                            title="Rejeter"
                                                        >
                                                            <XCircle className="w-4 h-4 text-neon-red" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TransactionManagement;

