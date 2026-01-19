import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const VolumeChart = ({ candlestickData = [], height = 120 }) => {
    // Generate sample volume data if no candlestick data provided
    const generateSampleVolume = () => {
        const samples = [];
        for (let i = 0; i < 50; i++) {
            samples.push({
                volume: Math.random() * 1000 + 500,
                isUp: Math.random() > 0.5
            });
        }
        return samples;
    };

    const volumeData = candlestickData.length > 0
        ? candlestickData.map(candle => ({
            volume: Math.random() * 1000 + 500, // In real app, this would come from data
            isUp: candle.c > candle.o
        }))
        : generateSampleVolume();

    const chartData = {
        labels: volumeData.map((_, i) => ''),
        datasets: [{
            label: 'Volume',
            data: volumeData.map(v => v.volume),
            backgroundColor: volumeData.map(v => v.isUp ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'),
            borderColor: volumeData.map(v => v.isUp ? '#00FF00' : '#FF0000'),
            borderWidth: 1,
            barPercentage: 0.9,
            categoryPercentage: 1.0
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#000',
                titleColor: '#00FF00',
                bodyColor: '#FFF',
                borderColor: '#333',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => `Volume: ${context.parsed.y.toFixed(0)}`
                }
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                position: 'right',
                grid: {
                    color: '#222',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        family: 'monospace',
                        size: 10
                    },
                    maxTicksLimit: 3
                },
                border: {
                    display: false
                }
            }
        }
    };

    return (
        <div style={{ height: `${height}px`, backgroundColor: '#000', padding: '10px 10px 0 10px', border: '1px solid #333', borderTop: 'none' }}>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px', fontFamily: 'monospace' }}>VOLUME</div>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default VolumeChart;
