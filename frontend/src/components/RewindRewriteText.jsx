import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RewindRewriteText = ({
    text,
    className,
    highlightWords = [], // Words to glow in the final state
    delay = 0
}) => {
    const [displayedText, setDisplayedText] = useState(text);
    const [phase, setPhase] = useState('waiting'); // waiting, rewinding, pause, typing, done
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        let timeout;
        let interval;

        // Start sequence
        timeout = setTimeout(() => {
            setPhase('rewinding');

            // Phase 1: Rewind (Retract R to L)
            let currentIndex = text.length;
            interval = setInterval(() => {
                currentIndex--;
                if (currentIndex <= 0) {
                    setDisplayedText('');
                    clearInterval(interval);
                    setPhase('pause');

                    // Pause before typing
                    setTimeout(() => {
                        setPhase('typing');
                        startTyping();
                    }, 300);
                } else {
                    setDisplayedText(text.slice(0, currentIndex));
                }
            }, 40); // Speed of rewind (faster)
        }, delay * 1000);

        const startTyping = () => {
            let currentIndex = 0;
            interval = setInterval(() => {
                currentIndex++;
                setDisplayedText(text.slice(0, currentIndex));

                if (currentIndex >= text.length) {
                    clearInterval(interval);
                    setPhase('done');
                }
            }, 25); // Speed of typing (much faster)
        };

        // Cursor blink animation
        const cursorInterval = setInterval(() => {
            setCursorVisible(prev => !prev);
        }, 500);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
            clearInterval(cursorInterval);
        };
    }, [text, delay]);

    // Helper to render text with highlights
    const renderContent = () => {
        if (!displayedText) return <span className="invisible">|</span>;

        // If we are rewinding, show glitch effect
        if (phase === 'rewinding') {
            return (
                <motion.span 
                    className="inline-block opacity-60 blur-sm scale-x-105 tracking-wider text-orange-300"
                    animate={{
                        opacity: [0.6, 0.4, 0.6],
                        x: [-2, 2, -1, 1, 0]
                    }}
                    transition={{
                        duration: 0.1,
                        repeat: Infinity
                    }}
                >
                    {displayedText}
                </motion.span>
            );
        }

        // If typing or done, we need to handle word highlighting
        const currentString = displayedText;
        const words = text.split(' ');
        let charCount = 0;

        return (
            <span>
                {words.map((word, wordIndex) => {
                    const isHighlight = highlightWords.includes(word);
                    // Check how much of this word is visible in the currentString
                    const wordStart = charCount;
                    const wordEnd = wordStart + word.length;

                    // If word is not yet reached by currentString
                    if (currentString.length <= wordStart) {
                        charCount += word.length + 1; // +1 for space
                        return null;
                    }

                    // Calculate visible part of the word
                    const visibleLen = Math.min(word.length, currentString.length - wordStart);
                    const visiblePart = word.slice(0, visibleLen);

                    charCount += word.length + 1; // +1 for space

                    const space = wordIndex < words.length - 1 ? ' ' : '';
                    const spaceVisible = currentString.length >= charCount;

                    return (
                        <React.Fragment key={wordIndex}>
                            <motion.span 
                                className={`${isHighlight && phase !== 'rewinding' ? 'bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent font-bold drop-shadow-[0_0_12px_rgba(255,140,0,0.6)]' : 'text-white'}`}
                                animate={isHighlight && phase === 'done' ? {
                                    textShadow: [
                                        '0 0 10px rgba(255, 140, 0, 0.3)',
                                        '0 0 20px rgba(255, 140, 0, 0.6)',
                                        '0 0 10px rgba(255, 140, 0, 0.3)'
                                    ]
                                } : {}}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            >
                                {visiblePart}
                            </motion.span>
                            {spaceVisible && <span>{space}</span>}
                        </React.Fragment>
                    );
                })}
                {phase === 'typing' && cursorVisible && (
                    <motion.span 
                        className="inline-block w-1 h-[1.2em] bg-gradient-to-b from-orange-400 to-orange-600 ml-1 align-middle rounded-sm"
                        animate={{
                            opacity: [1, 0],
                            boxShadow: ['0 0 8px rgba(255, 140, 0, 0.8)', '0 0 0px rgba(255, 140, 0, 0)']
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity
                        }}
                    />
                )}
            </span>
        );
    };

    return (
        <span className={`${className} min-h-[1.2em] block`}>
            {renderContent()}
        </span>
    );
};

export default RewindRewriteText;
