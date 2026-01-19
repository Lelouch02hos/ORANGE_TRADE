import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Edit, Trash2, UserX, UserCheck, Key } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/users?search=${search}`, {
                headers: { 'X-User-ID': user.id }
            });

            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendUser = async (userId, suspend) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/users/${userId}`,
                { is_suspended: suspend },
                { headers: { 'X-User-ID': user.id } }
            );
            fetchUsers();
        } catch (error) {
            alert('Erreur lors de la suspension');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/admin/users/${userId}`,
                { headers: { 'X-User-ID': user.id } }
            );
            fetchUsers();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Réinitialiser le mot de passe à "123456" ?')) return;

        try {
            const response = await axios.post(
                `http://localhost:5000/api/admin/users/${userId}/reset-password`,
                {},
                { headers: { 'X-User-ID': user.id } }
            );
            if (response.data.success) {
                alert(`Mot de passe réinitialisé : ${response.data.new_password}`);
            }
        } catch (error) {
            alert('Erreur lors de la réinitialisation');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-jetbrains text-white">
                        Gestion des Utilisateurs
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black/50 border border-white/10 text-white pl-10 pr-4 py-2 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-green w-64"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="glassmorphism-dark rounded-lg border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase tracking-wider">Utilisateur</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase tracking-wider">Rôle</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-left text-xs font-jetbrains text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-jetbrains">
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-jetbrains">
                                            Aucun utilisateur trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-jetbrains text-sm">{u.id}</td>
                                            <td className="px-6 py-4 text-white font-jetbrains font-semibold">{u.username}</td>
                                            <td className="px-6 py-4 text-gray-400 font-jetbrains text-sm">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-jetbrains font-bold ${u.role === 'admin' ? 'bg-neon-red/20 text-neon-red border border-neon-red/30' :
                                                        u.role === 'support' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' :
                                                            'bg-neon-green/20 text-neon-green border border-neon-green/30'
                                                    }`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_suspended ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-jetbrains font-bold bg-neon-red/20 text-neon-red border border-neon-red/30">
                                                        SUSPENDU
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-jetbrains font-bold bg-neon-green/20 text-neon-green border border-neon-green/30">
                                                        ACTIF
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSuspendUser(u.id, !u.is_suspended)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title={u.is_suspended ? 'Activer' : 'Suspendre'}
                                                    >
                                                        {u.is_suspended ? (
                                                            <UserCheck className="w-4 h-4 text-neon-green" />
                                                        ) : (
                                                            <UserX className="w-4 h-4 text-neon-red" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(u.id)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title="Réinitialiser mot de passe"
                                                    >
                                                        <Key className="w-4 h-4 text-neon-blue" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-neon-red" />
                                                    </button>
                                                </div>
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

export default UserManagement;

