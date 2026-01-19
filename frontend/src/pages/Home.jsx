import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Zap,
    Activity,
    Shield,
    Lock,
    BookOpen,
    Users,
    Target,
    Award,
    BarChart,
    LineChart,
    TrendingDown,
    Bell,
    Cpu,
    Globe,
    DollarSign,
    Clock,
    CheckCircle,
    Star
} from 'lucide-react';
import TradingInterfaceBackground from '../components/TradingInterfaceBackground';
import GlowingButton from '../components/GlowingButton';
import TradingNetworkBackground from '../components/TradingNetworkBackground';
import RewindRewriteText from '../components/RewindRewriteText';

const Home = () => {
    return (
        <div className="min-h-screen bg-cyberpunk text-white relative overflow-hidden">
            {/* Sophisticated Trading Interface Background */}
            <TradingInterfaceBackground opacity={0.4} />

            {/* Network Visualization Layer */}
            <div className="absolute inset-0 z-0">
                <TradingNetworkBackground />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/10 backdrop-blur-sm bg-black/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-2xl font-black font-jetbrains">
                            <span className="text-white">TRADE</span>
                            <span className="text-orange-400">ORANGE</span>
                        </Link>
                        <div className="flex items-center space-x-8">
                            <Link
                                to="/pricing"
                                className="font-jetbrains text-xs hover:text-orange-400 transition-colors tracking-wider"
                            >
                                PRICING
                            </Link>
                            <Link
                                to="/login"
                                className="font-jetbrains text-xs border border-white/20 px-4 py-2 hover:border-orange-400 hover:text-orange-400 transition-all"
                            >
                                LOG IN
                            </Link>
                            <Link to="/register">
                                <GlowingButton variant="primary">
                                    START TRADING
                                </GlowingButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                {/* Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 border border-neon-green/30 bg-neon-green/5 font-jetbrains text-xs text-neon-green">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>LIVE MARKET DATA • REAL-TIME EXECUTION • &lt;10MS LATENCY</span>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-8xl font-black mb-6 font-jetbrains leading-none tracking-tight">
                        <span className="block text-white mb-2">TRADE WITH</span>
                        <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">ORANGE POWER</span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto font-jetbrains"
                    >
                        Advanced trading platform with institutional-grade execution.
                        <br />
                        <span className="text-orange-400">Ultra-fast performance</span>. <span className="text-orange-400">Maximum precision</span>. <span className="text-orange-400">Professional tools</span>.
                    </motion.p>
                </motion.div>

                {/* Glassmorphism Hero Container with Order Book */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-5xl mx-auto mb-12"
                >
                    <div className="glassmorphism-dark rounded-lg overflow-hidden border border-white/10 p-8 text-center">
                        {/* Stats Display */}
                        <div className="flex justify-around items-center">
                            <div>
                                <div className="font-jetbrains text-xs text-gray-500 mb-2">
                                    TRADING VOLUME
                                </div>
                                <div className="text-4xl font-bold text-neon-green font-jetbrains">
                                    $2.4B
                                </div>
                            </div>
                            <div>
                                <div className="font-jetbrains text-xs text-gray-500 mb-2">
                                    LAST PRICE
                                </div>
                                <div className="text-4xl font-bold text-neon-green font-jetbrains">
                                    $42,567.89
                                </div>
                            </div>
                            <div>
                                <div className="font-jetbrains text-xs text-gray-500 mb-2">
                                    CHANGE 24H
                                </div>
                                <div className="text-4xl font-bold text-neon-green font-jetbrains">
                                    +2.47%
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-6 justify-center mb-20"
                >
                    <Link to="/register">
                        <GlowingButton variant="primary" icon={<TrendingUp className="w-5 h-5" />}>
                            Open Trading Account
                        </GlowingButton>
                    </Link>
                    <Link to="/pricing">
                        <GlowingButton variant="secondary" icon={<Zap className="w-5 h-5" />}>
                            View Pricing Plans
                        </GlowingButton>
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="grid grid-cols-4 gap-6 mb-32"
                >
                    {[
                        { label: 'ACTIVE TRADERS', value: '12,847', color: 'text-neon-green' },
                        { label: 'DAILY VOLUME', value: '$2.4B', color: 'text-white' },
                        { label: 'AVG LATENCY', value: '<8ms', color: 'text-neon-green' },
                        { label: 'UPTIME', value: '99.99%', color: 'text-white' }
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="glassmorphism p-6 text-center border border-white/10 hover:border-neon-green/30 transition-all"
                        >
                            <div className="font-jetbrains text-[10px] text-gray-500 mb-2 tracking-widest">
                                {stat.label}
                            </div>
                            <div className={`font-jetbrains text-4xl font-bold ${stat.color}`}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4 font-jetbrains text-white">
                            PLATFORM <span className="text-neon-green">FEATURES</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-sm max-w-2xl mx-auto">
                            Professional-grade tools designed for serious traders
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {[
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: 'Lightning Fast',
                                desc: 'Sub-10ms execution with institutional-grade infrastructure'
                            },
                            {
                                icon: <Cpu className="w-8 h-8" />,
                                title: 'Advanced Tools',
                                desc: 'Professional charting, indicators, and automated trading'
                            },
                            {
                                icon: <Shield className="w-8 h-8" />,
                                title: 'Bank-Grade Security',
                                desc: '256-bit encryption, cold storage, 2FA protection'
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                title: '24/7 Support',
                                desc: 'Dedicated support team available around the clock'
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glassmorphism p-8 border border-white/10 hover:border-neon-green/30 transition-all group"
                            >
                                <div className="text-neon-green mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="font-jetbrains text-lg font-bold mb-2 text-white">
                                    {feature.title}
                                </h3>
                                <p className="font-jetbrains text-xs text-gray-400">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Trading Tools Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4 font-jetbrains text-white">
                            TRADING <span className="text-neon-green">TOOLS</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-sm max-w-2xl mx-auto">
                            Everything you need to trade like a professional
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        {[
                            {
                                icon: <LineChart className="w-12 h-12" />,
                                title: 'Advanced Charts',
                                features: ['100+ Technical Indicators', 'Custom Timeframes', 'Drawing Tools', 'Multiple Chart Types']
                            },
                            {
                                icon: <BarChart className="w-12 h-12" />,
                                title: 'Market Analysis',
                                features: ['Real-time Data Feeds', 'Order Book Depth', 'Volume Analytics', 'Price Alerts']
                            },
                            {
                                icon: <Target className="w-12 h-12" />,
                                title: 'Automated Trading',
                                features: ['Custom Algorithms', 'Backtesting Engine', 'API Integration', 'Risk Management']
                            }
                        ].map((tool, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="glassmorphism p-8 border border-white/10 hover:border-neon-green/30 transition-all"
                            >
                                <div className="text-neon-green mb-6">
                                    {tool.icon}
                                </div>
                                <h3 className="font-jetbrains text-2xl font-bold mb-6 text-white">
                                    {tool.title}
                                </h3>
                                <ul className="space-y-3">
                                    {tool.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 font-jetbrains text-sm text-gray-400">
                                            <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Market Overview Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4 font-jetbrains text-white">
                            MARKET <span className="text-neon-green">OVERVIEW</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-sm max-w-2xl mx-auto">
                            Real-time market data from major exchanges
                        </p>
                    </div>

                    <div className="glassmorphism border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-5 bg-black/50 border-b border-white/10 px-6 py-4 font-jetbrains text-[10px] text-gray-500 tracking-widest">
                            <div>PAIR</div>
                            <div className="text-right">PRICE</div>
                            <div className="text-right">24H CHANGE</div>
                            <div className="text-right">24H VOLUME</div>
                            <div className="text-right">MARKET CAP</div>
                        </div>
                        {[
                            { pair: 'BTC/USD', price: '$42,567.89', change: '+2.47%', volume: '$2.4B', cap: '$834B', positive: true },
                            { pair: 'ETH/USD', price: '$2,234.56', change: '+3.21%', volume: '$1.2B', cap: '$268B', positive: true },
                            { pair: 'SOL/USD', price: '$98.45', change: '-1.23%', volume: '$456M', cap: '$42B', positive: false },
                            { pair: 'XRP/USD', price: '$0.5834', change: '+5.67%', volume: '$789M', cap: '$31B', positive: true },
                            { pair: 'ADA/USD', price: '$0.4521', change: '-0.89%', volume: '$234M', cap: '$16B', positive: false }
                        ].map((market, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="grid grid-cols-5 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-all font-jetbrains text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-neon-green/20 to-blue-500/20 rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {market.pair.substring(0, 3)}
                                    </div>
                                    <span className="text-white font-bold">{market.pair}</span>
                                </div>
                                <div className="text-right text-white">{market.price}</div>
                                <div className={`text-right ${market.positive ? 'text-neon-green' : 'text-red-500'} flex items-center justify-end gap-2`}>
                                    {market.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {market.change}
                                </div>
                                <div className="text-right text-gray-400">{market.volume}</div>
                                <div className="text-right text-gray-400">{market.cap}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Why Choose Us Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4 font-jetbrains text-white">
                            WHY <span className="text-neon-green">CHOOSE US</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-sm max-w-2xl mx-auto">
                            Join thousands of traders who trust our platform
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {[
                            {
                                icon: <Globe className="w-10 h-10" />,
                                title: 'Global Liquidity',
                                desc: 'Access to 100+ exchanges and deep liquidity pools for optimal execution',
                                stats: '100+ Exchanges'
                            },
                            {
                                icon: <Clock className="w-10 h-10" />,
                                title: 'Ultra-Low Latency',
                                desc: 'Co-located servers and optimized infrastructure for microsecond execution',
                                stats: '<8ms Average'
                            },
                            {
                                icon: <DollarSign className="w-10 h-10" />,
                                title: 'Competitive Fees',
                                desc: 'Industry-leading fee structure with volume discounts and maker rebates',
                                stats: 'From 0.01%'
                            },
                            {
                                icon: <Award className="w-10 h-10" />,
                                title: 'Proven Track Record',
                                desc: '5+ years of reliable service with 99.99% uptime and zero security breaches',
                                stats: '99.99% Uptime'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glassmorphism p-10 border border-white/10 hover:border-neon-green/30 transition-all group"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="text-neon-green group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-jetbrains text-2xl font-bold mb-3 text-white">
                                            {item.title}
                                        </h3>
                                        <p className="font-jetbrains text-sm text-gray-400 mb-4">
                                            {item.desc}
                                        </p>
                                        <div className="inline-block px-4 py-2 bg-neon-green/10 border border-neon-green/30 font-jetbrains text-xs text-neon-green">
                                            {item.stats}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Security & Reliability Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="glassmorphism border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-2">
                            <div className="p-12 border-r border-white/10">
                                <Lock className="w-12 h-12 text-neon-green mb-6" />
                                <h3 className="font-jetbrains text-3xl font-bold mb-4 text-white">
                                    SECURITY <span className="text-neon-green">FIRST</span>
                                </h3>
                                <p className="text-gray-400 font-jetbrains text-sm mb-8">
                                    Your assets are protected by institutional-grade security measures
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        '256-bit AES encryption',
                                        'Cold storage for 95% of funds',
                                        'Multi-signature wallets',
                                        'Advanced DDoS protection',
                                        'Regular security audits',
                                        'Insurance coverage'
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 font-jetbrains text-sm text-gray-300">
                                            <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-12 bg-black/30">
                                <Shield className="w-12 h-12 text-neon-green mb-6" />
                                <h3 className="font-jetbrains text-3xl font-bold mb-4 text-white">
                                    RELIABILITY <span className="text-neon-green">GUARANTEED</span>
                                </h3>
                                <p className="text-gray-400 font-jetbrains text-sm mb-8">
                                    Built on enterprise infrastructure for maximum uptime
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        '99.99% uptime SLA',
                                        'Redundant server architecture',
                                        'Real-time system monitoring',
                                        'Automated failover systems',
                                        'Global CDN distribution',
                                        '24/7 technical support'
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 font-jetbrains text-sm text-gray-300">
                                            <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Testimonials Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4 font-jetbrains text-white">
                            TRADER <span className="text-neon-green">TESTIMONIALS</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-sm max-w-2xl mx-auto">
                            See what our community has to say
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Sarah Chen',
                                role: 'Day Trader',
                                text: 'The execution speed is incredible. I\'ve tried many platforms, but TradeOrange is by far the fastest.',
                                rating: 5
                            },
                            {
                                name: 'Michael Rodriguez',
                                role: 'Algorithmic Trader',
                                text: 'API is robust and well-documented. Perfect for automated trading strategies.',
                                rating: 5
                            },
                            {
                                name: 'Emily Johnson',
                                role: 'Professional Trader',
                                text: 'Best platform for high-frequency trading. The tools and analytics are top-notch.',
                                rating: 5
                            }
                        ].map((testimonial, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glassmorphism p-8 border border-white/10 hover:border-neon-green/30 transition-all"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, idx) => (
                                        <Star key={idx} className="w-4 h-4 fill-neon-green text-neon-green" />
                                    ))}
                                </div>
                                <p className="font-jetbrains text-sm text-gray-300 mb-6 leading-relaxed">
                                    "{testimonial.text}"
                                </p>
                                <div>
                                    <div className="font-jetbrains text-white font-bold text-sm">
                                        {testimonial.name}
                                    </div>
                                    <div className="font-jetbrains text-xs text-gray-500">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Trading Education Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4 font-jetbrains text-white">
                            TRADING <span className="text-neon-green">EDUCATION</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-sm max-w-2xl mx-auto">
                            Learn from the best and master your trading skills
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {[
                            {
                                icon: <BookOpen className="w-8 h-8" />,
                                title: 'Trading Academy',
                                desc: 'Comprehensive courses from beginner to advanced',
                                link: 'Browse Courses'
                            },
                            {
                                icon: <Bell className="w-8 h-8" />,
                                title: 'Market Updates',
                                desc: 'Daily market analysis and trading signals',
                                link: 'Subscribe Now'
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                title: 'Community',
                                desc: 'Join our active trader community',
                                link: 'Join Community'
                            },
                            {
                                icon: <Activity className="w-8 h-8" />,
                                title: 'Webinars',
                                desc: 'Live trading sessions with experts',
                                link: 'View Schedule'
                            }
                        ].map((edu, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glassmorphism p-8 border border-white/10 hover:border-neon-green/30 transition-all group cursor-pointer"
                            >
                                <div className="text-neon-green mb-4 group-hover:scale-110 transition-transform">
                                    {edu.icon}
                                </div>
                                <h3 className="font-jetbrains text-lg font-bold mb-2 text-white">
                                    {edu.title}
                                </h3>
                                <p className="font-jetbrains text-xs text-gray-400 mb-4">
                                    {edu.desc}
                                </p>
                                <div className="font-jetbrains text-xs text-neon-green hover:underline">
                                    {edu.link} →
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Final CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <div className="glassmorphism border border-neon-green/30 p-16 text-center">
                        <h2 className="text-5xl font-black mb-6 font-jetbrains">
                            READY TO <span className="text-neon-green">START TRADING?</span>
                        </h2>
                        <p className="text-gray-400 font-jetbrains text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of traders executing with <span className="text-orange-400 font-semibold">orange power</span>
                        </p>
                        <div className="flex gap-6 justify-center">
                            <Link to="/register">
                                <GlowingButton variant="primary" icon={<TrendingUp className="w-5 h-5" />}>
                                    Create Free Account
                                </GlowingButton>
                            </Link>
                            <Link to="/pricing">
                                <GlowingButton variant="secondary" icon={<Zap className="w-5 h-5" />}>
                                    View Pricing
                                </GlowingButton>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 mt-20 bg-black/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex justify-between items-center font-jetbrains text-xs">
                        <div className="text-gray-600">
                            © 2026 TradeOrange. Advanced Trading Platform.
                        </div>
                        <div className="flex gap-6">
                            <Link to="/terms" className="text-gray-600 hover:text-orange-400 transition-colors">
                                Terms
                            </Link>
                            <Link to="/privacy" className="text-gray-600 hover:text-orange-400 transition-colors">
                                Privacy
                            </Link>
                            <Link to="/community" className="text-gray-600 hover:text-neon-green transition-colors">
                                Community
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
