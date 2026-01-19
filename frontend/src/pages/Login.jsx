import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Shield } from 'lucide-react';
import axios from 'axios';
import TradingInterfaceBackground from '../components/TradingInterfaceBackground';
import GlowingButton from '../components/GlowingButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                username: formData.username,
                password: formData.password
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cyberpunk flex items-center justify-center px-4 relative overflow-hidden">
            {/* Sophisticated Trading Interface Background */}
            <TradingInterfaceBackground opacity={0.4} />

            {/* Back to Home Link */}
            <Link
                to="/"
                className="absolute top-6 left-6 z-50 font-jetbrains text-xs text-gray-400 hover:text-neon-green transition-colors tracking-wider"
            >
                ← RETOUR
            </Link>

            {/* Login Form Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-4xl font-black font-jetbrains inline-block mb-6">
                        <span className="text-white">TRADE</span>
                        <span className="text-neon-green">ORANGE</span>
                    </Link>
                    <h2 className="text-3xl font-bold mb-3 font-jetbrains text-white">
                        BIENVENUE DE RETOUR
                    </h2>
                    <p className="text-gray-400 font-jetbrains text-sm">
                        Accédez à votre compte de trading
                    </p>
                </div>

                {/* Login Form */}
                <div className="glassmorphism-dark p-8 rounded-lg border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-neon-red/10 border border-neon-red/30 text-neon-red px-4 py-3 rounded flex items-center gap-2 font-jetbrains text-sm"
                            >
                                <span>⚠️</span>
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-jetbrains text-gray-400 mb-2 uppercase tracking-wider">
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border border-white/10 text-white px-10 py-3 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="JohnTrader"
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border border-white/10 text-white px-10 py-3 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <GlowingButton
                                variant="primary"
                                className="w-full"
                                icon={loading ? <span className="animate-spin">⏳</span> : <LogIn className="w-5 h-5" />}
                                disabled={loading}
                            >
                                {loading ? 'CONNEXION EN COURS...' : 'SE CONNECTER'}
                            </GlowingButton>
                        </div>

                        {/* Register Link */}
                        <div className="text-center text-gray-400 font-jetbrains text-sm">
                            Vous n'avez pas de compte?{' '}
                            <Link
                                to="/register"
                                className="text-neon-green hover:underline font-semibold"
                            >
                                S'inscrire maintenant
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Security Info */}
                <div className="mt-6">
                    <div className="glassmorphism p-4 rounded border border-white/10">
                        <p className="text-neon-green text-sm flex items-center justify-center gap-2 font-jetbrains">
                            <Shield className="w-4 h-4" />
                            <span>Connexion sécurisée avec cryptage SSL</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
