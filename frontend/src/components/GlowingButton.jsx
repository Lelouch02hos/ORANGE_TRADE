import React from 'react';
import { motion } from 'framer-motion';

const GlowingButton = ({
    children,
    variant = 'primary',
    onClick,
    className = '',
    icon
}) => {
    const variants = {
        primary: 'bg-black border-2 border-neon-green text-neon-green hover:shadow-[0_0_30px_-5px_rgba(0,255,157,0.4)] hover:bg-neon-green/10',
        secondary: 'bg-black border border-white/20 text-white hover:border-neon-green hover:text-neon-green hover:shadow-[0_0_20px_-5px_rgba(0,255,157,0.2)]',
        danger: 'bg-black border-2 border-neon-red text-neon-red hover:shadow-[0_0_30px_-5px_rgba(255,0,85,0.4)] hover:bg-neon-red/10'
    };

    return (
        <motion.button
            onClick={onClick}
            className={`
                px-8 py-4 font-jetbrains font-bold text-sm
                transition-all duration-300 uppercase tracking-wider
                ${variants[variant]}
                ${className}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <span className="flex items-center gap-2 justify-center">
                {icon && <span>{icon}</span>}
                {children}
            </span>
        </motion.button>
    );
};

export default GlowingButton;
