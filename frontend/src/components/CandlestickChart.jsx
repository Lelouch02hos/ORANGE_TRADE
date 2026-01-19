import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend
} from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    CandlestickController,
    CandlestickElement,
    Tooltip,
    Legend
);

const CandlestickChart = ({ data = [], symbol = 'BTC-USD', height = 400 }) => {
    const chartRef = useRef(null);

    // Generate sample candlestick data if none provided
    const generateSampleData = () => {
        const now = Date.now();
        const samples = [];
        let basePrice = 43000;

        for (let i = 50; i >= 0; i--) {
            const timestamp = now - (i * 15 * 60 * 1000); // 15 min intervals
            const volatility = Math.random() * 500;

            const open = basePrice + (Math.random() - 0.5) * volatility;
            const close = open + (Math.random() - 0.5) * volatility;
            const high = Math.max(open, close) + Math.random() * (volatility / 2);
            const low = Math.min(open, close) - Math.random() * (volatility / 2);

            samples.push({
                x: timestamp,
                o: open,
                h: high,
                l: low,
                c: close
            });

            basePrice = close; // Next candle starts where this one ended
        }

        return samples;
    };

    const candlestickData = data.length > 0 ? data : generateSampleData();

    const chartData = {
        datasets: [{
            label: symbol,
            data: candlestickData,
            borderColor: {
                up: '#00FF00',      // Bright green for bullish
                down: '#FF0000',    // Bright red for bearish
                unchanged: '#999'
            },
            backgroundColor: {
                up: 'rgba(0, 255, 0, 0.3)',
                down: 'rgba(255, 0, 0, 0.3)',
                unchanged: 'rgba(153, 153, 153, 0.3)'
            },
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#000',
                titleColor: '#00FF00',
                bodyColor: '#FFF',
                borderColor: '# 333',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const date = new Date(context[0].parsed.x);
                        return date.toLocaleString();
                    },
                    label: (context) => {
                        const point = context.raw;
                        return [
                            `Open:  $${point.o.toFixed(2)}`,
                            `High:  $${point.h.toFixed(2)}`,
                            `Low:   $${point.l.toFixed(2)}`,
                            `Close: $${point.c.toFixed(2)}`,
                            ``,
                            `Change: ${point.c > point.o ? '+' : ''}${(point.c - point.o).toFixed(2)}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    stepSize: 15,
                    displayFormats: {
                        minute: 'HH:mm',
                        hour: 'HH:mm'
                    }
                },
                grid: {
                    color: '#333',
                    drawBorder: false
                },
                ticks: {
                    color: '#00FF00',
                    font: {
                        family: 'monospace',
                        size: 11
                    }
                },
                border: {
                    color: '#333'
                }
            },
            y: {
                position: 'right',
                grid: {
                    color: '#333',
                    drawBorder: false
                },
                ticks: {
                    color: '#00FF00',
                    font: {
                        family: 'monospace',
                        size: 11
                    },
                    callback: (value) => `$${value.toFixed(0)}`
                },
                border: {
                    color: '#333'
                }
            }
        }
    };

    return (
        <div style={{ height: `${height}px`, backgroundColor: '#000', padding: '10px', border: '1px solid #333' }}>
            <Chart ref={chartRef} type='candlestick' data={chartData} options={options} />
        </div>
    );
};

export default CandlestickChart;
