import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Zap, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AIChat = ({ symbol }) => {
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            content: "Bonjour! 👋 Je suis votre assistant de trading IA TradeVelocity. Comment puis-je vous aider aujourd'hui?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            type: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post(`${API_URL}/api/ai/chat`, {
                message: input,
                symbol: symbol
            });

            // Add AI response
            const aiMessage = {
                type: 'ai',
                content: response.data.response,
                responseType: response.data.type,
                timestamp: response.data.timestamp
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                type: 'ai',
                content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const quickQuestions = [
        { text: "Analyse ce symbole", icon: BarChart3 },
        { text: "Stratégie recommandée", icon: TrendingUp },
        { text: "Gestion des risques", icon: Shield },
        { text: "Sentiment du marché", icon: Zap }
    ];

    const handleQuickQuestion = (question) => {
        setInput(question);
    };

    return (
        <div className="flex flex-col h-full glassmorphism-dark border border-white/10">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center">
                        <Bot className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                        <div className="font-bold text-sm font-jetbrains text-white">TRADEVELOCITY AI</div>
                        <div className="text-[10px] text-gray-400 font-jetbrains uppercase tracking-wider">Assistant de Trading</div>
                    </div>
                    <div className="ml-auto">
                        <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-[10px] font-jetbrains font-bold uppercase flex items-center gap-1">
                            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                            ACTIF
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'user'
                                ? 'bg-neon-green/20 text-white border border-neon-green/30'
                                : 'bg-white/5 text-gray-100 border border-white/10'
                                }`}>
                                <div className="text-sm font-jetbrains whitespace-pre-line">{msg.content}</div>
                                <div className="text-[10px] text-gray-500 mt-1 font-jetbrains">
                                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-3">
                <div className="text-[10px] text-gray-500 mb-2 font-jetbrains uppercase tracking-wider">Questions Rapides</div>
                <div className="grid grid-cols-2 gap-2">
                    {quickQuestions.map((question, index) => {
                        const IconComponent = question.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleQuickQuestion(question.text)}
                                className="text-xs px-3 py-2 bg-white/5 hover:bg-neon-green/20 text-gray-300 hover:text-neon-green border border-white/10 hover:border-neon-green/50 transition-all font-jetbrains flex items-center gap-2"
                            >
                                <IconComponent className="w-3 h-3" />
                                {question.text}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="flex-1 bg-black/50 text-white p-3 border border-white/10 focus:border-neon-green outline-none text-sm font-jetbrains"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="bg-neon-green hover:bg-neon-green/90 text-black px-4 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChat;

