import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HomeAIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            content: "Bonjour! 👋 Je suis l'assistant TradeVelocity. Comment puis-je vous aider aujourd'hui?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/gemini/suggestions');
            if (response.data.success) {
                setSuggestions(response.data.suggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim()) return;

        const userMessage = {
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post(`${API_URL}/api/gemini/chat', {
                message: messageText
            });

            if (response.data.success) {
                const aiMessage = {
                    type: 'ai',
                    content: response.data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                type: 'ai',
                content: "Désolé, une erreur s'est produite. Veuillez réessayer. 🔧",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        // Remove emoji from suggestion before sending
        const cleanSuggestion = suggestion.replace(/[^\w\s?]/gi, '').trim();
        sendMessage(cleanSuggestion);
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-neon-green to-emerald-400 rounded-full shadow-2xl flex items-center justify-center z-50 group cursor-pointer"
                    >
                        <Sparkles className="w-5 h-5 text-black" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                        />

                        {/* Tooltip */}
                        <div className="absolute right-20 bg-black/90 text-white px-4 py-2 rounded-lg font-jetbrains text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Besoin d'aide ? 🤖
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`fixed bottom-6 right-6 w-80 glassmorphism-dark border-2 border-neon-green/30 shadow-2xl z-50 flex flex-col ${isMinimized ? 'h-14' : 'h-[450px]'
                            } transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-neon-green/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-neon-green" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm font-jetbrains text-white">Assistant TradeVelocity</div>
                                    <div className="text-[10px] text-gray-400 font-jetbrains flex items-center gap-1">
                                        <motion.span
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="w-2 h-2 bg-neon-green rounded-full"
                                        />
                                        Powered by Gemini
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded transition-colors"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages - Only show when not minimized */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] rounded-lg p-3 ${msg.type === 'user'
                                                ? 'bg-neon-green/20 text-white border border-neon-green/30'
                                                : 'bg-white/5 text-gray-100 border border-white/10'
                                                }`}>
                                                <div className="text-sm font-jetbrains whitespace-pre-line">{msg.content}</div>
                                                <div className="text-[9px] text-gray-500 mt-1 font-jetbrains">
                                                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                <div className="flex space-x-2">
                                                    <motion.div
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                                        className="w-2 h-2 bg-neon-green rounded-full"
                                                    />
                                                    <motion.div
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                                        className="w-2 h-2 bg-neon-green rounded-full"
                                                    />
                                                    <motion.div
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                                        className="w-2 h-2 bg-neon-green rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Suggestions */}
                                {messages.length === 1 && suggestions.length > 0 && (
                                    <div className="px-4 pb-2 border-t border-white/5 pt-2">
                                        <div className="text-[10px] text-gray-500 mb-2 font-jetbrains uppercase tracking-wider">Questions Rapides</div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.slice(0, 3).map((suggestion, index) => (
                                                <motion.button
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="text-xs px-3 py-2 bg-white/5 hover:bg-neon-green/20 text-gray-300 hover:text-neon-green border border-white/10 hover:border-neon-green/50 transition-all font-jetbrains rounded-full"
                                                >
                                                    {suggestion}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input */}
                                <div className="p-4 border-t border-white/10">
                                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Posez votre question..."
                                            className="flex-1 bg-black/50 text-white p-3 border border-white/10 focus:border-neon-green outline-none text-sm font-jetbrains rounded"
                                            disabled={isTyping}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            disabled={!input.trim() || isTyping}
                                            className="bg-neon-green hover:bg-neon-green/90 text-black px-4 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center rounded"
                                        >
                                            <Send className="w-5 h-5" />
                                        </motion.button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 157, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 157, 0.5);
                }
            `}</style>
        </>
    );
};

export default HomeAIChat;

