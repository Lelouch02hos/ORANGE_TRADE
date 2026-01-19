import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'neon-green' }) => {
    return (
        <div className="glassmorphism-dark p-6 rounded-lg border border-white/10">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-gray-400 text-sm font-jetbrains uppercase tracking-wider">{title}</p>
                    <h3 className={`text-3xl font-bold font-jetbrains mt-2 text-${color}`}>
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-lg bg-${color}/10 border border-${color}/30`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                </div>
            </div>

            {trend && (
                <div className="flex items-center gap-2">
                    {trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-jetbrains ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {trendValue}
                    </span>
                    <span className="text-gray-500 text-sm font-jetbrains">vs mois dernier</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
