import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Trophy, User, LogOut } from 'lucide-react';

const AuthNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'DASHBOARD', icon: BarChart3 },
        { path: '/macro', label: 'MACRO', icon: TrendingUp },
        { path: '/community', label: 'COMMUNAUTÉ', icon: Users },
        { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
        { path: '/profile', label: 'PROFILE', icon: User }
    ];

    return (
        <nav className="border-b border-white/10 backdrop-blur-sm bg-black/30 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/dashboard"
                        className="text-2xl font-black font-jetbrains hover:scale-105 transition-transform"
                    >
                        <span className="text-white">TRADE</span>
                        <span className="text-neon-green">ORANGE</span>
                    </Link>

                    {/* Navigation Items */}
                    <div className="flex items-center space-x-2">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 flex items-center gap-2 transition-all font-jetbrains text-xs tracking-wider ${location.pathname === item.path
                                            ? 'bg-neon-green/20 text-neon-green border-b-2 border-neon-green'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-400 transition-all font-jetbrains text-xs flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        DÉCONNEXION
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AuthNavbar;
