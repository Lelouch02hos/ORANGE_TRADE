import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ScrambleText = ({ text, className, delay = 0, speed = 0.05 }) => {
    const [displayText, setDisplayText] = useState('');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

    useEffect(() => {
        if (!isInView) return;

        let iteration = 0;
        let interval = null;

        // Start delay
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText(prev =>
                    text
                        .split('')
                        .map((letter, index) => {
                            if (index < iteration) {
                                return text[index];
                            }
                            return chars[Math.floor(Math.random() * 26)];
                        })
                        .join('')
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3; // Slower resolve for effect
            }, 30);
        }, delay * 1000);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [text, isInView, delay]);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay }}
        >
            {displayText}
        </motion.span>
    );
};

export default ScrambleText;
