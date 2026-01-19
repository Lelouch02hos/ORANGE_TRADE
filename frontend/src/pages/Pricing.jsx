import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Target, Award, Shield, CheckCircle, Clock } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import TradingInterfaceBackground from '../components/TradingInterfaceBackground';
import GlowingButton from '../components/GlowingButton';

const Pricing = () => {
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPack, setSelectedPack] = useState(null);

    const handlePayment = (tier, amount, balance) => {
        setSelectedPack({ tier, amount, balance });
        setShowPaymentModal(true);
    };

    const PricingCard = ({ title, price, balance, features, recommended, tier, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ y: -8 }}
            className={`relative glassmorphism p-8 border transition-all ${recommended
                    ? 'border-neon-green shadow-neon scale-105'
                    : 'border-white/10 hover:border-neon-green/50'
                }`}
        >
            {recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="px-6 py-2 bg-neon-green/20 border border-neon-green font-jetbrains text-xs text-neon-green font-bold animate-pulse">
                        ⭐ MOST POPULAR
                    </div>
                </div>
            )}

            <div className="text-center mb-6">
                <h3 className="text-3xl font-black mb-2 font-jetbrains text-white">
                    {title}
                </h3>
                <div className="text-6xl font-black mb-2 font-jetbrains text-white">
                    {price}
                    <span className="text-xl text-gray-400 font-normal ml-2">DH</span>
                </div>
                <div className="text-neon-green font-bold text-2xl font-jetbrains">
                    ${balance.toLocaleString()}
                    <span className="text-sm text-gray-400 ml-2">Balance</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 group">
                        <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-300 font-jetbrains text-sm group-hover:text-white transition-colors">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => handlePayment(tier, parseInt(price), balance)}
                disabled={loading}
                className={`w-full ${recommended
                        ? 'bg-neon-green text-black hover:bg-neon-green/90'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-neon-green/50'
                    } px-6 py-4 font-jetbrains text-sm font-bold transition-all disabled:opacity-50`}
            >
                {loading ? 'Processing...' : '🚀 Choose This Plan'}
            </button>

            {recommended && (
                <div className="mt-4 text-center text-xs text-gray-400 font-jetbrains">
                    <span className="text-neon-green">💡</span> Best value for serious traders
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-cyberpunk text-white relative overflow-hidden">
            {/* Sophisticated Trading Interface Background */}
            <TradingInterfaceBackground opacity={0.4} />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/10 backdrop-blur-sm bg-black/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-2xl font-black font-jetbrains">
                            <span className="text-white">TRADE</span>
                            <span className="text-neon-green">ORANGE</span>
                        </Link>
                        <Link
                            to="/"
                            className="font-jetbrains text-xs text-gray-400 hover:text-neon-green transition-colors tracking-wider"
                        >
                            ← BACK TO HOME
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 border border-neon-green/30 bg-neon-green/5 font-jetbrains text-xs text-neon-green mb-8">
                        <Award className="w-4 h-4" />
                        <span>💰 FUNDING CHALLENGES</span>
                    </div>

                    <h1 className="text-6xl font-black mb-6 font-jetbrains leading-none">
                        CHOOSE YOUR <span className="text-neon-green">PATH TO SUCCESS</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto font-jetbrains leading-relaxed">
                        Select a challenge size and start your journey to becoming a{' '}
                        <span className="text-neon-green font-semibold">funded trader</span>.
                        All plans include real-time data, advanced tools, and priority support.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <PricingCard
                        title="STARTER"
                        price="200"
                        balance={5000}
                        tier="starter"
                        index={0}
                        features={[
                            'Profit Target: 10%',
                            'Max Loss: 10%',
                            'Daily Loss Limit: 5%',
                            'Standard Support',
                            'Basic Analytics'
                        ]}
                    />
                    <PricingCard
                        title="PRO"
                        price="500"
                        balance={10000}
                        tier="pro"
                        index={1}
                        recommended={true}
                        features={[
                            'Profit Target: 10%',
                            'Max Loss: 10%',
                            'Daily Loss Limit: 5%',
                            'Priority Support',
                            'AI Signals Access',
                            'Advanced Analytics'
                        ]}
                    />
                    <PricingCard
                        title="ELITE"
                        price="1000"
                        balance={25000}
                        tier="elite"
                        index={2}
                        features={[
                            'Profit Target: 10%',
                            'Max Loss: 10%',
                            'Daily Loss Limit: 5%',
                            'VIP Support 24/7',
                            'Full AI Suite Access',
                            'Pro Analytics & Reports',
                            'Priority Funding Review'
                        ]}
                    />
                </div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glassmorphism border border-white/10 p-12"
                >
                    <h3 className="text-3xl font-black mb-10 text-center font-jetbrains">
                        WHY CHOOSE <span className="text-neon-green">TRADEORANGE</span>?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-green/10 border border-neon-green/30 mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8 text-neon-green" />
                            </div>
                            <h4 className="font-bold mb-2 font-jetbrains text-lg">Instant Activation</h4>
                            <p className="text-gray-400 text-sm font-jetbrains">
                                Start trading within minutes of payment confirmation
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-green/10 border border-neon-green/30 mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8 text-neon-green" />
                            </div>
                            <h4 className="font-bold mb-2 font-jetbrains text-lg">Secure Payments</h4>
                            <p className="text-gray-400 text-sm font-jetbrains">
                                Bank-grade encryption for all transactions
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-green/10 border border-neon-green/30 mb-4 group-hover:scale-110 transition-transform">
                                <Target className="w-8 h-8 text-neon-green" />
                            </div>
                            <h4 className="font-bold mb-2 font-jetbrains text-lg">No Hidden Fees</h4>
                            <p className="text-gray-400 text-sm font-jetbrains">
                                Transparent pricing with no surprises
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-20 text-center"
                >
                    <div className="glassmorphism border border-neon-green/30 p-12">
                        <h2 className="text-4xl font-black mb-6 font-jetbrains">
                            READY TO <span className="text-neon-green">START YOUR JOURNEY?</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of traders executing at institutional speed
                        </p>
                        <Link to="/register">
                            <GlowingButton variant="primary" icon={<TrendingUp className="w-5 h-5" />}>
                                Create Free Account
                            </GlowingButton>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Payment Modal */}
            {selectedPack && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    tier={selectedPack.tier}
                    amount={selectedPack.amount}
                    balance={selectedPack.balance}
                />
            )}

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 mt-20 bg-black/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="text-center font-jetbrains text-xs text-gray-600">
                        © 2026 TradeOrange. Advanced Trading Platform. | Secure Payment Processing
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
