import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const TechnicalIndicators = ({ candlestickData = [] }) => {
    const [rsi, setRsi] = useState(67.4);
    const [macdValue, setMacdValue] = useState(125.5);
    const [macdSignal, setMacdSignal] = useState(118.2);
    const [bollingerUpper, setBollingerUpper] = useState(null);
    const [bollingerMiddle, setBollingerMiddle] = useState(null);
    const [bollingerLower, setBollingerLower] = useState(null);

    // Generate sample RSI data
    const generateRSIData = () => {
        const data = [];
        for (let i = 0; i < 50; i++) {
            data.push(30 + Math.random() * 40); // RSI between 30-70
        }
        return data;
    };

    // Generate sample MACD data
    const generateMACDData = () => {
        const macd = [];
        const signal = [];
        const histogram = [];

        for (let i = 0; i < 50; i++) {
            const m = (Math.random() - 0.5) * 200;
            const s = m + (Math.random() - 0.5) * 50;
            macd.push(m);
            signal.push(s);
            histogram.push(m - s);
        }

        return { macd, signal, histogram };
    };

    const rsiData = generateRSIData();
    const macdData = generateMACDData();

    // RSI Chart Data
    const rsiChartData = {
        labels: rsiData.map((_, i) => ''),
        datasets: [{
            label: 'RSI',
            data: rsiData,
            borderColor: '#0088FF',
            backgroundColor: 'rgba(0, 136, 255, 0.1)',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: true
        }]
    };

    const rsiOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: {
                min: 0,
                max: 100,
                position: 'right',
                grid: {
                    color: (context) => {
                        if (context.tick.value === 70) return '#FF0000';
                        if (context.tick.value === 30) return '#00FF00';
                        return '#222';
                    },
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: { family: 'monospace', size: 10 },
                    callback: (value) => {
                        if (value === 70 || value === 30 || value === 50) return value;
                        return '';
                    }
                },
                border: { display: false }
            }
        }
    };

    // MACD Chart Data
    const macdChartData = {
        labels: macdData.macd.map((_, i) => ''),
        datasets: [
            {
                label: 'MACD',
                data: macdData.macd,
                borderColor: '#0088FF',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                pointRadius: 0,
                type: 'line'
            },
            {
                label: 'Signal',
                data: macdData.signal,
                borderColor: '#FF6600',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                pointRadius: 0,
                type: 'line'
            },
            {
                label: 'Histogram',
                data: macdData.histogram,
                backgroundColor: macdData.histogram.map(v => v >= 0 ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'),
                borderWidth: 0,
                type: 'bar',
                barPercentage: 0.9,
                categoryPercentage: 1.0
            }
        ]
    };

    const macdOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: {
                position: 'right',
                grid: {
                    color: (context) => context.tick.value === 0 ? '#666' : '#222',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: { family: 'monospace', size: 10 },
                    maxTicksLimit: 4
                },
                border: { display: false }
            }
        }
    };

    const rsiColor = rsi > 70 ? '#FF0000' : rsi < 30 ? '#00FF00' : '#FFA500';
    const macdTrend = macdValue > macdSignal ? 'BULLISH' : 'BEARISH';
    const macdColor = macdValue > macdSignal ? '#00FF00' : '#FF0000';

    return (
        <div style={{ backgroundColor: '#000', border: '1px solid #333', borderTop: 'none' }}>
            {/* RSI Panel */}
            <div style={{ padding: '10px', borderBottom: '1px solid #333' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                }}>
                    <span style={{ color: '#666' }}>RSI (14)</span>
                    <span style={{ color: rsiColor, fontWeight: 'bold' }}>
                        {rsi.toFixed(1)}
                        {rsi > 70 && ' ⚠ OVERBOUGHT'}
                        {rsi < 30 && ' ⚠ OVERSOLD'}
                    </span>
                </div>
                <div style={{ height: '80px' }}>
                    <Line data={rsiChartData} options={rsiOptions} />
                </div>
            </div>

            {/* MACD Panel */}
            <div style={{ padding: '10px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                }}>
                    <span style={{ color: '#666' }}>MACD (12, 26, 9)</span>
                    <span style={{ color: macdColor, fontWeight: 'bold' }}>
                        {macdTrend} ● {macdValue.toFixed(1)}
                    </span>
                </div>
                <div style={{ height: '80px' }}>
                    <Line data={macdChartData} options={macdOptions} />
                </div>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginTop: '8px',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: '#666'
                }}>
                    <span><span style={{ color: '#0088FF' }}>●</span> MACD: {macdValue.toFixed(1)}</span>
                    <span><span style={{ color: '#FF6600' }}>●</span> Signal: {macdSignal.toFixed(1)}</span>
                    <span><span style={{ color: macdColor }}>●</span> Hist: {(macdValue - macdSignal).toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
};

export default TechnicalIndicators;
