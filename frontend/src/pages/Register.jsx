import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import CandlestickBackground from '../components/CandlestickBackground';
import GlowingButton from '../components/GlowingButton';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                alert('🎉 Inscription réussie! Vous pouvez maintenant vous connecter.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cyberpunk flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated Candlestick Background */}
            <CandlestickBackground opacity={0.08} />

            {/* Back to Home Link */}
            <Link
                to="/"
                className="absolute top-6 left-6 z-50 font-jetbrains text-xs text-gray-400 hover:text-neon-green transition-colors"
            >
                ← RETOUR
            </Link>

            {/* Register Form Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-4xl font-black font-jetbrains inline-block mb-6">
                        <span className="text-white">TRADE</span>
                        <span className="text-neon-green">ORANGE</span>
                    </Link>
                    <h2 className="text-3xl font-bold mb-3 font-jetbrains text-white">
                        CRÉER UN COMPTE
                    </h2>
                    <p className="text-gray-400 font-jetbrains text-sm">
                        Rejoignez la plateforme de trading avancée
                    </p>
                </div>

                {/* Registration Form */}
                <div className="glassmorphism-dark p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-jetbrains text-gray-400 mb-2 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/50 border border-white/10 text-white px-10 py-3 rounded font-jetbrains text-sm focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="john@example.com"
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
                            <p className="text-xs text-gray-500 mt-1 font-jetbrains">Minimum 6 caractères</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-jetbrains text-gray-400 mb-2 uppercase tracking-wider">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
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
                                icon={loading ? <span className="animate-spin">⏳</span> : <UserPlus className="w-5 h-5" />}
                            >
                                {loading ? 'INSCRIPTION EN COURS...' : 'S\'INSCRIRE'}
                            </GlowingButton>
                        </div>

                        {/* Login Link */}
                        <div className="text-center text-gray-400 font-jetbrains text-sm">
                            Vous avez déjà un compte?{' '}
                            <Link
                                to="/login"
                                className="text-neon-green hover:underline font-semibold"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Terms */}
                <p className="text-center text-xs text-gray-500 mt-6 font-jetbrains glassmorphism p-4 rounded">
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link to="/terms" className="text-neon-green hover:underline">
                        Conditions d'utilisation
                    </Link>
                    {' '}et notre{' '}
                    <Link to="/privacy" className="text-neon-green hover:underline">
                        Politique de confidentialité
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
