import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, DollarSign,
    Settings, FileText, LogOut, Menu, X, Landmark
} from 'lucide-react';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
        { path: '/admin/financials', icon: DollarSign, label: 'Finances' },
        { path: '/admin/bvc-stocks', icon: Landmark, label: 'BVC' },
        { path: '/admin/settings', icon: Settings, label: 'Configuration' },
        { path: '/admin/logs', icon: FileText, label: 'Logs' }
    ];

    return (
        <div className="min-h-screen bg-cyberpunk">
            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-black/90 border-r border-white/10 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && (
                            <div className="font-jetbrains font-black text-xl">
                                <span className="text-white">ADMIN</span>
                                <span className="text-neon-red">PANEL</span>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded transition-all font-jetbrains ${isActive
                                    ? 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="text-sm">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-neon-red/10 hover:text-neon-red rounded transition-all font-jetbrains"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="text-sm">Déconnexion</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <div className="bg-black/50 border-b border-white/10 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold font-jetbrains text-white">
                            Administration
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-400 font-jetbrains">Connecté en tant que</p>
                                <p className="text-white font-jetbrains font-semibold">{user.username}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-neon-red/20 border border-neon-red flex items-center justify-center">
                                <span className="text-neon-red font-jetbrains font-bold">
                                    {user.username?.[0]?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
