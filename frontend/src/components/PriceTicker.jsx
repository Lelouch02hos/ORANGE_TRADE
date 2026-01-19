import React, { useEffect, useState } from 'react';

const PriceTicker = ({ symbol = 'BTC-USD', initialPrice = 43250 }) => {
    const [price, setPrice] = useState(initialPrice);
    const [previousPrice, setPreviousPrice] = useState(initialPrice);
    const [priceChange, setPriceChange] = useState(0);
    const [priceChangePercent, setPriceChangePercent] = useState(0);
    const [dayHigh, setDayHigh] = useState(initialPrice * 1.05);
    const [dayLow, setDayLow] = useState(initialPrice * 0.95);
    const [volume, setVolume] = useState(12456789);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        // Simulate real-time price updates
        const interval = setInterval(() => {
            setPreviousPrice(price);
            const change = (Math.random() - 0.5) * 100;
            const newPrice = price + change;
            setPrice(newPrice);
            setPriceChange(newPrice - initialPrice);
            setPriceChangePercent(((newPrice - initialPrice) / initialPrice) * 100);

            // Update high/low
            if (newPrice > dayHigh) setDayHigh(newPrice);
            if (newPrice < dayLow) setDayLow(newPrice);

            // Flash effect
            setFlash(true);
            setTimeout(() => setFlash(false), 200);
        }, 2000);

        return () => clearInterval(interval);
    }, [price, initialPrice, dayHigh, dayLow]);

    const isUp = price >= previousPrice;
    const isPositive = priceChange >= 0;
    const priceColor = isPositive ? '#00FF00' : '#FF0000';

    return (
        <div style={{
            backgroundColor: '#000',
            border: '1px solid #333',
            padding: '15px',
            fontFamily: 'monospace'
        }}>
            {/* Symbol */}
            <div style={{ color: '#FF6600', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                {symbol}
            </div>

            {/* Current Price */}
            <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: priceColor,
                marginBottom: '5px',
                transition: 'all 0.2s',
                transform: flash ? 'scale(1.05)' : 'scale(1)'
            }}>
                ${price.toFixed(2)}
            </div>

            {/* Price Change */}
            <div style={{
                fontSize: '16px',
                color: priceColor,
                marginBottom: '15px'
            }}>
                {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '11px',
                borderTop: '1px solid #333',
                paddingTop: '10px'
            }}>
                <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>24H HIGH</div>
                    <div style={{ color: '#00FF00', fontWeight: 'bold' }}>${dayHigh.toFixed(2)}</div>
                </div>
                <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>24H LOW</div>
                    <div style={{ color: '#FF0000', fontWeight: 'bold' }}>${dayLow.toFixed(2)}</div>
                </div>
                <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>VOLUME</div>
                    <div style={{ color: '#FFF', fontWeight: 'bold' }}>{(volume / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>STATUS</div>
                    <div style={{ color: '#00FF00', fontWeight: 'bold' }}>● LIVE</div>
                </div>
            </div>
        </div>
    );
};

export default PriceTicker;
