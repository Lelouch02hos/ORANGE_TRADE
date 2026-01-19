import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/admin/login', formData);

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cyberpunk flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-neon-red/10 border border-neon-red/30 rounded-full mb-4">
                        <Shield className="w-12 h-12 text-neon-red" />
                    </div>
                    <h1 className="text-4xl font-black font-jetbrains mb-2">
                        <span className="text-white">ADMIN</span>
                        <span className="text-neon-red">PANEL</span>
                    </h1>
                    <p className="text-gray-400 font-jetbrains text-sm">
                        Accès réservé aux administrateurs
                    </p>
                </div>

                {/* Login Form */}
                <div className="glassmorphism-dark p-8 rounded-lg border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red px-4 py-3 rounded font-jetbrains text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-jetbrains text-gray-400 mb-2 uppercase tracking-wider">
                                Identifiant Admin
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    className="w-full bg-black/50 border border-white/10 text-white px-10 py-3 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-red transition-all"
                                    placeholder="admin"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-jetbrains text-gray-400 mb-2 uppercase tracking-wider">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="w-full bg-black/50 border border-white/10 text-white px-10 py-3 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-red transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neon-red hover:bg-neon-red/80 text-white font-jetbrains font-bold py-3 px-6 rounded transition-all disabled:opacity-50"
                        >
                            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
                        </button>
                    </form>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-xs font-jetbrains">
                        🔒 Connexion sécurisée - Accès restreint
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;

