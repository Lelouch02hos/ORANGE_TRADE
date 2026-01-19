import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    AlertCircle,
    DollarSign,
    Percent,
    BarChart3,
    Zap,
    Target
} from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MacroSentiment = () => {
    const [indicators, setIndicators] = useState([]);
    const [sentimentScore, setSentimentScore] = useState(null);
    const [correlationData, setCorrelationData] = useState(null);
    const [selectedIndicator, setSelectedIndicator] = useState('^TNX');
    const [historicalData, setHistoricalData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('6mo');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMacroIndicators();
        fetchSentimentScore();
        fetchCorrelation();
    }, []);

    useEffect(() => {
        if (selectedIndicator) {
            fetchHistoricalData(selectedIndicator, selectedPeriod);
        }
    }, [selectedIndicator, selectedPeriod]);

    const fetchMacroIndicators = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/macro/indicators`);
            if (response.data.success) {
                setIndicators(response.data.indicators);
            }
        } catch (error) {
            console.error('Error fetching macro indicators:', error);
        }
    };

    const fetchSentimentScore = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/macro/sentiment-score`);
            if (response.data.success) {
                setSentimentScore(response.data);
            }
        } catch (error) {
            console.error('Error fetching sentiment score:', error);
        }
    };

    const fetchCorrelation = async (period = '6mo') => {
        try {
            const response = await axios.get(`${API_URL}/api/macro/correlation/${period}`);
            if (response.data.success) {
                setCorrelationData(response.data);
            }
        } catch (error) {
            console.error('Error fetching correlation:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoricalData = async (ticker, period) => {
        try {
            const response = await axios.get(`${API_URL}/api/macro/historical/${ticker}/${period}`);
            if (response.data.success) {
                setHistoricalData(response.data);
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    };

    const getCorrelationChartData = () => {
        if (!correlationData) return null;

        return {
            labels: correlationData.spy_data.map(d => d.date),
            datasets: [
                {
                    label: 'S&P 500 (SPY)',
                    data: correlationData.spy_data.map(d => d.value),
                    borderColor: '#00ff9d',
                    backgroundColor: 'rgba(0, 255, 157, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'US 10Y Treasury (TNX)',
                    data: correlationData.tnx_data.map(d => d.value),
                    borderColor: '#ff0055',
                    backgroundColor: 'rgba(255, 0, 85, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    };

    const getHistoricalChartData = () => {
        if (!historicalData) return null;

        return {
            labels: historicalData.data.map(d => d.date),
            datasets: [
                {
                    label: historicalData.name,
                    data: historicalData.data.map(d => d.close),
                    borderColor: '#00ff9d',
                    backgroundColor: 'rgba(0, 255, 157, 0.2)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#9CA3AF',
                    font: { family: 'JetBrains Mono' }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                titleFont: { family: 'JetBrains Mono' },
                bodyFont: { family: 'JetBrains Mono' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#6B7280', font: { family: 'JetBrains Mono', size: 10 } },
                grid: { color: '#1a1a1f' }
            },
            y: {
                ticks: { color: '#6B7280', font: { family: 'JetBrains Mono', size: 10 } },
                grid: { color: '#1a1a1f' }
            }
        }
    };

    if (loading) {
        return (
            <>
                <AuthNavbar />
                <div className="min-h-screen bg-cyberpunk text-white flex items-center justify-center">
                    <div className="text-2xl font-jetbrains">LOADING MACRO DATA...</div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-cyberpunk text-white">
            <AuthNavbar />

            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-5xl font-black font-jetbrains mb-3">
                        MACRO <span className="text-neon-green">&</span> SENTIMENT
                    </h1>
                    <p className="text-gray-400 font-jetbrains text-sm">
                        Indicateurs macro-financiers en temps réel
                    </p>
                </motion.div>

                {/* Sentiment Score */}
                {sentimentScore && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8 glassmorphism-dark p-6 border border-white/10"
                    >
                        <h2 className="font-jetbrains text-xs text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Target className="w-4 h-4" /> Score de Sentiment Global
                        </h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-7xl font-black font-jetbrains mb-2" style={{ color: sentimentScore.color }}>
                                    {sentimentScore.score}
                                    <span className="text-3xl text-gray-500">/100</span>
                                </div>
                                <div className="text-3xl font-bold mb- mb-2 font-jetbrains" style={{ color: sentimentScore.color }}>
                                    {sentimentScore.sentiment} 📈
                                </div>
                                <p className="text-gray-400 font-jetbrains text-sm">{sentimentScore.recommendation}</p>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 mb-3 font-jetbrains uppercase">Composantes:</div>
                                <div className="space-y-3">
                                    <div className="glassmorphism p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-jetbrains text-gray-400">VIX</span>
                                            <span className="text-sm font-jetbrains font-bold text-white">{sentimentScore.components.vix.value}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-green rounded-full" style={{ width: `${sentimentScore.components.vix.score}%` }}></div>
                                        </div>
                                        <div className="text-[10px] font-jetbrains text-neon-green mt-1">{sentimentScore.components.vix.score.toFixed(1)}/100</div>
                                    </div>
                                    <div className="glassmorphism p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-jetbrains text-gray-400">SPY 1M</span>
                                            <span className="text-sm font-jetbrains font-bold text-white">{sentimentScore.components.spy_1m.returns}%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-green rounded-full" style={{ width: `${sentimentScore.components.spy_1m.score}%` }}></div>
                                        </div>
                                        <div className="text-[10px] font-jetbrains text-neon-green mt-1">{sentimentScore.components.spy_1m.score.toFixed(1)}/100</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Indicators Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="font-jetbrains text-xs text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Indicateurs Clés
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {indicators.map((indicator, idx) => (
                            <motion.div
                                key={indicator.ticker}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + idx * 0.05 }}
                                className="glassmorphism-dark p-4 border border-white/10 hover:border-neon-green/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-[10px] text-gray-500 mb-1 font-jetbrains uppercase">{indicator.category}</div>
                                        <div className="text-sm font-bold font-jetbrains">{indicator.name}</div>
                                    </div>
                                    {indicator.change_pct >= 0 ? (
                                        <TrendingUp className="w-6 h-6 text-neon-green" />
                                    ) : (
                                        <TrendingDown className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                                <div className="text-3xl font-bold font-jetbrains mb-1">
                                    {indicator.value}{indicator.unit}
                                </div>
                                <div className={`text-sm font-jetbrains ${indicator.change_pct >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                                    {indicator.change >= 0 ? '+' : ''}{indicator.change} ({indicator.change_pct >= 0 ? '+' : ''}{indicator.change_pct}%)
                                </div>
                                <div className="text-[10px] text-gray-500 mt-2 font-jetbrains">{indicator.description}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Correlation Analysis */}
                {correlationData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8 glassmorphism-dark p-6 border border-white/10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-jetbrains text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Analyse de Corrélation (SPY vs TNX)
                            </h2>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => {
                                    setSelectedPeriod(e.target.value);
                                    fetchCorrelation(e.target.value);
                                }}
                                className="bg-black/50 border border-white/10 text-white px-4 py-2 font-jetbrains text-xs focus:outline-none focus:border-neon-green"
                            >
                                <option value="1mo">1 MOIS</option>
                                <option value="3mo">3 MOIS</option>
                                <option value="6mo">6 MOIS</option>
                                <option value="1y">1 AN</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <div className="text-lg mb-2 font-jetbrains">
                                Corrélation: <span className="font-black text-neon-green">{correlationData.correlation}</span>
                            </div>
                            <div className="text-sm text-gray-400 font-jetbrains">{correlationData.analysis.interpretation}</div>
                            <div className="text-sm mt-1 font-jetbrains">{correlationData.analysis.message}</div>
                        </div>
                        <div className="h-96 bg-black/30 p-4 rounded">
                            {getCorrelationChartData() && (
                                <Line
                                    data={getCorrelationChartData()}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            title: {
                                                display: true,
                                                text: 'PERFORMANCE NORMALISÉE (BASE 100)',
                                                color: '#9CA3AF',
                                                font: { family: 'JetBrains Mono', size: 11, weight: 'bold' }
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Historical Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glassmorphism-dark p-6 border border-white/10"
                >
                    <h2 className="font-jetbrains text-xs text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Historique des Indicateurs
                    </h2>
                    <div className="mb-4 flex gap-4">
                        <select
                            value={selectedIndicator}
                            onChange={(e) => setSelectedIndicator(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/10 text-white px-4 py-2 font-jetbrains text-sm focus:outline-none focus:border-neon-green"
                        >
                            {indicators.map((ind) => (
                                <option key={ind.ticker} value={ind.ticker}>
                                    {ind.name} ({ind.ticker})
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-black/50 border border-white/10 text-white px-4 py-2 font-jetbrains text-sm focus:outline-none focus:border-neon-green"
                        >
                            <option value="1mo">1 MOIS</option>
                            <option value="3mo">3 MOIS</option>
                            <option value="6mo">6 MOIS</option>
                            <option value="1y">1 AN</option>
                            <option value="2y">2 ANS</option>
                        </select>
                    </div>
                    {historicalData && (
                        <>
                            <div className="grid grid-cols-5 gap-4 mb-6">
                                <div className="glassmorphism p-3">
                                    <div className="text-[10px] text-gray-400 font-jetbrains uppercase">Actuel</div>
                                    <div className="text-lg font-bold font-jetbrains">{historicalData.stats.current}</div>
                                </div>
                                <div className="glassmorphism p-3">
                                    <div className="text-[10px] text-gray-400 font-jetbrains uppercase">Min</div>
                                    <div className="text-lg font-bold text-red-400 font-jetbrains">{historicalData.stats.min}</div>
                                </div>
                                <div className="glassmorphism p-3">
                                    <div className="text-[10px] text-gray-400 font-jetbrains uppercase">Max</div>
                                    <div className="text-lg font-bold text-neon-green font-jetbrains">{historicalData.stats.max}</div>
                                </div>
                                <div className="glassmorphism p-3">
                                    <div className="text-[10px] text-gray-400 font-jetbrains uppercase">Moyenne</div>
                                    <div className="text-lg font-bold font-jetbrains">{historicalData.stats.average}</div>
                                </div>
                                <div className="glassmorphism p-3">
                                    <div className="text-[10px] text-gray-400 font-jetbrains uppercase">Volatilité</div>
                                    <div className="text-lg font-bold font-jetbrains">{historicalData.stats.volatility}%</div>
                                </div>
                            </div>
                            <div className="h-96 bg-black/30 p-4 rounded">
                                {getHistoricalChartData() && <Line data={getHistoricalChartData()} options={chartOptions} />}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MacroSentiment;

