import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Settings, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlatformSettings = () => {
    const [config, setConfig] = useState({
        maintenance_mode: 'false',
        min_deposit: '100',
        max_deposit: '100000',
        withdrawal_fee_percent: '0',
        trading_enabled: 'true'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/config', {
                headers: { 'X-User-ID': user.id }
            });

            if (response.data.success) {
                setConfig(response.data.config);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.put(
                `${API_URL}/api/admin/config',
                config,
                { headers: { 'X-User-ID': user.id } }
            );

            if (response.data.success) {
                alert('Configuration sauvegardée avec succès !');
            }
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const toggleBoolean = (key) => {
        setConfig({
            ...config,
            [key]: config[key] === 'true' ? 'false' : 'true'
        });
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
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-jetbrains text-white">
                        Configuration de la Plateforme
                    </h2>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-neon-green hover:bg-neon-green/80 text-black font-jetbrains font-bold py-2 px-6 rounded transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>

                {/* Settings */}
                <div className="glassmorphism-dark p-6 rounded-lg border border-white/10 space-y-6">
                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <h3 className="text-white font-jetbrains font-semibold mb-1">Mode Maintenance</h3>
                            <p className="text-gray-400 text-sm font-jetbrains">
                                Désactiver temporairement l'accès à la plateforme
                            </p>
                        </div>
                        <button
                            onClick={() => toggleBoolean('maintenance_mode')}
                            className="flex items-center gap-2"
                        >
                            {config.maintenance_mode === 'true' ? (
                                <ToggleRight className="w-12 h-12 text-neon-green" />
                            ) : (
                                <ToggleLeft className="w-12 h-12 text-gray-500" />
                            )}
                        </button>
                    </div>

                    {/* Trading Enabled */}
                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <h3 className="text-white font-jetbrains font-semibold mb-1">Trading Activé</h3>
                            <p className="text-gray-400 text-sm font-jetbrains">
                                Autoriser les utilisateurs à trader
                            </p>
                        </div>
                        <button
                            onClick={() => toggleBoolean('trading_enabled')}
                            className="flex items-center gap-2"
                        >
                            {config.trading_enabled === 'true' ? (
                                <ToggleRight className="w-12 h-12 text-neon-green" />
                            ) : (
                                <ToggleLeft className="w-12 h-12 text-gray-500" />
                            )}
                        </button>
                    </div>

                    {/* Min Deposit */}
                    <div className="py-4 border-b border-white/5">
                        <label className="block text-white font-jetbrains font-semibold mb-2">
                            Dépôt Minimum ($)
                        </label>
                        <input
                            type="number"
                            value={config.min_deposit}
                            onChange={(e) => setConfig({ ...config, min_deposit: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded font-jetbrains focus:outline-none focus:border-neon-green"
                        />
                    </div>

                    {/* Max Deposit */}
                    <div className="py-4 border-b border-white/5">
                        <label className="block text-white font-jetbrains font-semibold mb-2">
                            Dépôt Maximum ($)
                        </label>
                        <input
                            type="number"
                            value={config.max_deposit}
                            onChange={(e) => setConfig({ ...config, max_deposit: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded font-jetbrains focus:outline-none focus:border-neon-green"
                        />
                    </div>

                    {/* Withdrawal Fee */}
                    <div className="py-4">
                        <label className="block text-white font-jetbrains font-semibold mb-2">
                            Frais de Retrait (%)
                        </label>
                        <input
                            type="number"
                            value={config.withdrawal_fee_percent}
                            onChange={(e) => setConfig({ ...config, withdrawal_fee_percent: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded font-jetbrains focus:outline-none focus:border-neon-green"
                        />
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-neon-red/10 border border-neon-red/30 rounded-lg p-4">
                    <p className="text-neon-red font-jetbrains text-sm">
                        ⚠️ Les modifications de configuration prennent effet immédiatement. Soyez prudent !
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PlatformSettings;

