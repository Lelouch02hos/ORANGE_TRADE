import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/leaderboard`);
                setLeaders(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-primary text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[20%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[120px]"></div>
            </div>

            <nav className="relative z-10 flex items-center justify-between px-10 py-6">
                <Link to="/" className="text-2xl font-bold tracking-tighter">
                    TradeSense <span className="text-accent">AI</span>
                </Link>
                <Link to="/" className="text-gray-300 hover:text-white">Back to Home</Link>
            </nav>

            <div className="relative z-10 container mx-auto px-4 py-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4">Top Traders</h1>
                    <p className="text-xl text-gray-400">The best performers of the month.</p>
                </div>

                <div className="max-w-5xl mx-auto glass-panel overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-300 uppercase font-bold text-sm tracking-wider">
                            <tr>
                                <th className="p-6">Rank</th>
                                <th className="p-6">Trader</th>
                                <th className="p-6">Profit %</th>
                                <th className="p-6 text-right">Equity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leaders.map((leader, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 font-bold text-xl w-24">
                                        {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : <span className="text-gray-500">#{index + 1}</span>}
                                    </td>
                                    <td className="p-6 font-semibold flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3"></div>
                                        {leader.username}
                                    </td>
                                    <td className={`p-6 font-bold ${leader.profit_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {leader.profit_pct > 0 ? '+' : ''}{leader.profit_pct}%
                                    </td>
                                    <td className="p-6 text-right font-mono text-gray-300">${leader.equity.toLocaleString()}</td>
                                </tr>
                            ))}
                            {leaders.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-500 italic">No traders found yet. Be the first!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

