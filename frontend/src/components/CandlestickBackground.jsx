import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CandlestickBackground = ({ opacity = 0.15 }) => {
    // Generate random candlestick data
    const candlesticks = useMemo(() => {
        const candles = [];
        const numCandles = 30;

        for (let i = 0; i < numCandles; i++) {
            const open = 100 + Math.random() * 50;
            const close = open + (Math.random() - 0.5) * 20;
            const high = Math.max(open, close) + Math.random() * 10;
            const low = Math.min(open, close) - Math.random() * 10;
            const isBullish = close > open;

            candles.push({
                x: (i / numCandles) * 100,
                open,
                close,
                high,
                low,
                isBullish,
                delay: Math.random() * 2,
                duration: 3 + Math.random() * 3
            });
        }

        return candles;
    }, []);

    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ opacity }}
        >
            <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                {candlesticks.map((candle, i) => {
                    const bodyTop = Math.min(candle.open, candle.close);
                    const bodyHeight = Math.abs(candle.close - candle.open);
                    const color = candle.isBullish ? '#00ff9d' : '#ff0055';

                    return (
                        <motion.g
                            key={i}
                            animate={{
                                y: [0, -2, 0, 2, 0],
                            }}
                            transition={{
                                duration: candle.duration,
                                delay: candle.delay,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {/* High-Low Wick */}
                            <line
                                x1={candle.x}
                                y1={100 - candle.high}
                                x2={candle.x}
                                y2={100 - candle.low}
                                stroke={color}
                                strokeWidth="0.1"
                                strokeOpacity="0.6"
                            />

                            {/* Body */}
                            <rect
                                x={candle.x - 0.8}
                                y={100 - bodyTop - bodyHeight}
                                width="1.6"
                                height={bodyHeight || 0.3}
                                fill={color}
                                fillOpacity={candle.isBullish ? "0.8" : "1"}
                                stroke={color}
                                strokeWidth="0.1"
                            />
                        </motion.g>
                    );
                })}
            </svg>
        </div>
    );
};

export default CandlestickBackground;
