import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderBook = () => {
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);

    // Generate initial order book data
    useEffect(() => {
        const basePrice = 42567.89;
        const generateOrders = (isBid, count = 12) => {
            return Array.from({ length: count }, (_, i) => {
                const offset = i * (Math.random() * 5 + 2);
                const price = isBid ? basePrice - offset : basePrice + offset;
                const amount = (Math.random() * 2 + 0.1).toFixed(4);
                const total = (price * parseFloat(amount)).toFixed(2);
                const depth = Math.random();

                return {
                    id: Math.random(),
                    price: price.toFixed(2),
                    amount,
                    total,
                    depth: depth * 100
                };
            });
        };

        setBids(generateOrders(true));
        setAsks(generateOrders(false));

        // Simulate live updates
        const interval = setInterval(() => {
            setBids(prev => {
                const newBids = [...prev];
                const randomIndex = Math.floor(Math.random() * newBids.length);
                newBids[randomIndex] = {
                    ...newBids[randomIndex],
                    id: Math.random(),
                    amount: (Math.random() * 2 + 0.1).toFixed(4),
                    depth: Math.random() * 100
                };
                return newBids;
            });

            setAsks(prev => {
                const newAsks = [...prev];
                const randomIndex = Math.floor(Math.random() * newAsks.length);
                newAsks[randomIndex] = {
                    ...newAsks[randomIndex],
                    id: Math.random(),
                    amount: (Math.random() * 2 + 0.1).toFixed(4),
                    depth: Math.random() * 100
                };
                return newAsks;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    const OrderRow = ({ order, isBid }) => (
        <div
            key={order.id}
            className="relative flex items-center h-5 px-3 text-[10px] font-mono w-full"
        >
            {/* Depth bar background */}
            <div
                className={isBid ? 'bg-neon-green/10' : 'bg-neon-red/10'}
                style={{
                    position: 'absolute',
                    [isBid ? 'left' : 'right']: 0,
                    top: 0,
                    bottom: 0,
                    width: `${order.depth}%`,
                    zIndex: 0,
                    transition: 'width 0.2s linear',
                }}
            />

            {/* Order data */}
            <div className="relative z-10 flex w-full">
                <div className={`${isBid ? 'text-neon-green' : 'text-neon-red'} font-bold w-[33%] text-left`}>
                    {order.price}
                </div>
                <div className="text-gray-400 w-[33%] text-right">
                    {order.amount}
                </div>
                <div className="text-gray-600 w-[34%] text-right">
                    {order.total}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between px-3 py-1 border-b border-white/10 text-[9px] font-jetbrains text-gray-500 uppercase tracking-wider shrink-0">
                <span className="w-[33%] text-left">Price</span>
                <span className="w-[33%] text-right">Size</span>
                <span className="w-[34%] text-right">Total</span>
            </div>

            <div className="flex-1 flex divide-x divide-white/5 min-h-0">
                {/* BIDS (Green - Left) */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div className="absolute top-0 w-full z-10 py-0.5 px-2 text-[9px] font-jetbrains text-neon-green/50 border-b border-white/5 uppercase bg-black/80 backdrop-blur-sm">
                        Bids
                    </div>
                    <div className="pt-6 overflow-hidden">
                        {bids.slice(0, 16).map(order => (
                            <OrderRow key={order.id} order={order} isBid={true} />
                        ))}
                    </div>
                </div>

                {/* ASKS (Red - Right) */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div className="absolute top-0 w-full z-10 py-0.5 px-2 text-[9px] font-jetbrains text-neon-red/50 border-b border-white/5 uppercase bg-black/80 backdrop-blur-sm">
                        Asks
                    </div>
                    <div className="pt-6 overflow-hidden">
                        {asks.slice(0, 16).map(order => (
                            <OrderRow key={order.id} order={order} isBid={false} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderBook;

