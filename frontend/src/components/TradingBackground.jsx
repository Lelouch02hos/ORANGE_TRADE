import React from 'react';

const TradingBackground = ({ opacity = 0.7 }) => {
    return (
        <div
            className="absolute inset-0"
            style={{
                backgroundImage: 'url(/stock-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: opacity,
                filter: 'blur(1.5px)'
            }}
        />
    );
};

export default TradingBackground;
