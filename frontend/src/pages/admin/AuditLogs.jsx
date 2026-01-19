import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FileText, Search } from 'lucide-react';
import axios from 'axios';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/logs', {
                headers: { 'X-User-ID': user.id }
            });

            if (response.data.success) {
                setLogs(response.data.logs);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.admin.toLowerCase().includes(search.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
    );

    const getActionColor = (action) => {
        if (action.includes('delete') || action.includes('reject') || action.includes('suspend')) {
            return 'text-neon-red';
        } else if (action.includes('approve') || action.includes('create')) {
            return 'text-neon-green';
        } else {
            return 'text-neon-blue';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-jetbrains text-white">
                        Journal d'Audit
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher dans les logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black/50 border border-white/10 text-white pl-10 pr-4 py-2 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-green w-64"
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="glassmorphism-dark rounded-lg border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Date/Heure</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Admin</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Action</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Cible</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">Détails</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-jetbrains">
                                            Chargement des logs...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-jetbrains">
                                            Aucun log trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-gray-400 font-jetbrains text-sm">
                                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 text-white font-jetbrains font-semibold">
                                                {log.admin}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-jetbrains font-semibold ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-jetbrains text-sm">
                                                {log.target_type && log.target_id ? (
                                                    <span>{log.target_type} #{log.target_id}</span>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-jetbrains text-sm max-w-xs truncate">
                                                {log.details || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-jetbrains text-xs">
                                                {log.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info */}
                <div className="glassmorphism-dark p-4 rounded-lg border border-white/10">
                    <p className="text-gray-400 font-jetbrains text-sm">
                        📝 Toutes les actions administratives sont enregistrées automatiquement pour assurer la traçabilité et la sécurité.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AuditLogs;
