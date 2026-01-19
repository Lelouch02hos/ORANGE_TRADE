import React, { useState } from 'react';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PaymentModal = ({ isOpen, onClose, tier, amount, balance }) => {
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        // Card details
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        // PayPal
        paypalEmail: '',
        // Billing Address
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'Morocco'
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const grouped = cleaned.match(/.{1,4}/g);
        return grouped ? grouped.join(' ') : cleaned;
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\s/g, '');
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setPaymentData(prev => ({
                ...prev,
                cardNumber: formatCardNumber(value)
            }));
        }
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        if (value.length <= 5) {
            setPaymentData(prev => ({
                ...prev,
                expiryDate: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = localStorage.getItem('user_id') || 1;

            const response = await axios.post(`${API_URL}/api/payment/process`, {
                user_id: userId,
                amount: amount,
                method: selectedMethod,
                tier: tier,
                payment_details: {
                    ...paymentData,
                    // Don't send sensitive card data in production - use payment gateway tokens
                    cardNumber: selectedMethod === 'card' ? paymentData.cardNumber.replace(/\s/g, '').slice(-4) : null
                }
            });

            if (response.data.status === 'success') {
                alert('✅ Paiement réussi! Votre challenge est activé.');
                onClose();
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error("Payment failed", error);
            alert('❌ Échec du paiement. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-secondary border-b border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Finaliser le Paiement</h2>
                        <p className="text-gray-400 text-sm mt-1">Pack {tier} - {amount} DH</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Order Summary */}
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white mb-3">Résumé de la commande</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Challenge {tier}</span>
                            <span className="text-white font-bold">${balance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Montant à payer</span>
                            <span className="text-white font-bold">{amount} DH</span>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Méthode de paiement</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setSelectedMethod('card')}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedMethod === 'card'
                                ? 'border-accent bg-accent/10'
                                : 'border-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="text-3xl mb-2">💳</div>
                            <div className="text-sm font-bold text-white">Carte</div>
                        </button>
                        <button
                            onClick={() => setSelectedMethod('paypal')}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedMethod === 'paypal'
                                ? 'border-accent bg-accent/10'
                                : 'border-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="text-3xl mb-2">🅿️</div>
                            <div className="text-sm font-bold text-white">PayPal</div>
                        </button>
                        <button
                            onClick={() => setSelectedMethod('cmi')}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedMethod === 'cmi'
                                ? 'border-accent bg-accent/10'
                                : 'border-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="text-3xl mb-2">🏦</div>
                            <div className="text-sm font-bold text-white">CMI</div>
                        </button>
                    </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Card Payment Form */}
                    {selectedMethod === 'card' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Informations de carte</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Numéro de carte
                                </label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={paymentData.cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder="1234 5678 9012 3456"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Nom sur la carte
                                </label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={paymentData.cardName}
                                    onChange={handleInputChange}
                                    placeholder="JEAN DUPONT"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Date d'expiration
                                    </label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={paymentData.expiryDate}
                                        onChange={handleExpiryChange}
                                        placeholder="MM/YY"
                                        required
                                        className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={paymentData.cvv}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 4 && /^\d*$/.test(value)) {
                                                handleInputChange(e);
                                            }
                                        }}
                                        placeholder="123"
                                        required
                                        className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PayPal Form */}
                    {selectedMethod === 'paypal' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Compte PayPal</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Email PayPal
                                </label>
                                <input
                                    type="email"
                                    name="paypalEmail"
                                    value={paymentData.paypalEmail}
                                    onChange={handleInputChange}
                                    placeholder="votre.email@example.com"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                />
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    ℹ️ Vous serez redirigé vers PayPal pour finaliser le paiement
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CMI Form */}
                    {selectedMethod === 'cmi' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Paiement CMI</h3>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <p className="text-sm text-green-400">
                                    ℹ️ Vous serez redirigé vers la plateforme CMI pour finaliser le paiement
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Billing Information */}
                    <div className="space-y-4 border-t border-white/10 pt-6">
                        <h3 className="text-lg font-bold text-white">Informations de facturation</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={paymentData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={paymentData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+212 6XX XXX XXX"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Adresse
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={paymentData.address}
                                onChange={handleInputChange}
                                placeholder="123 Rue Example"
                                required
                                className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={paymentData.city}
                                    onChange={handleInputChange}
                                    placeholder="Casablanca"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Code postal
                                </label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={paymentData.zipCode}
                                    onChange={handleInputChange}
                                    placeholder="20000"
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Pays
                                </label>
                                <select
                                    name="country"
                                    value={paymentData.country}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-primary text-white p-3 rounded-lg border border-white/10 focus:border-accent outline-none"
                                >
                                    <option value="Morocco">Maroc</option>
                                    <option value="France">France</option>
                                    <option value="Belgium">Belgique</option>
                                    <option value="Switzerland">Suisse</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">🔒</span>
                            <div>
                                <p className="text-sm text-green-400 font-bold mb-1">Paiement sécurisé</p>
                                <p className="text-xs text-gray-400">
                                    Vos informations sont cryptées et sécurisées. Nous ne stockons pas vos données de carte bancaire.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-lg transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-accent hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Traitement...' : `Payer ${amount} DH`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;

