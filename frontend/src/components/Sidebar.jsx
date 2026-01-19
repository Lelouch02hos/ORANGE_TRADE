import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Target,
    Settings,
    LogOut,
    Menu,
    X,
    BarChart3,
    MessageSquare,
    User,
    Zap,
    Home
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/macro', label: 'Macro Sentiment', icon: TrendingUp },
        { path: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
        { path: '/community', label: 'Community', icon: Users },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-6 left-6 z-50 md:hidden p-2 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 rounded-lg backdrop-blur-md text-white hover:border-blue-500/60 transition-all"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>

            {/* Backdrop for Mobile */}
            {isOpen && isSmallScreen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: isOpen ? 0 : (isSmallScreen ? -300 : 0) }}
                transition={{ duration: 0.3 }}
                className="fixed left-0 top-0 h-screen w-64 md:w-72 z-40 md:z-10 flex flex-col"
            >
                {/* Glass Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-950/40 backdrop-blur-xl border-r border-blue-500/10" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="mb-8 pt-4">
                        <Link to="/dashboard" className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/50">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-lg text-white">TRADE</span>
                                <span className="text-xs text-orange-400 font-mono">ORANGE</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative group"
                                    onClick={() => isSmallScreen && setIsOpen(false)}
                                >
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                            active
                                                ? 'bg-gradient-to-r from-blue-500/30 to-emerald-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {active && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute right-2 w-2 h-2 bg-emerald-400 rounded-full"
                                                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="border-t border-blue-500/20 pt-4 space-y-2">
                        <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all border border-transparent"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium text-sm">Settings</span>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20 font-medium text-sm"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Offset */}
            <div className={isSmallScreen ? 'md:ml-64' : 'ml-64 lg:ml-72'} />
        </>
    );
};

export default Sidebar;
