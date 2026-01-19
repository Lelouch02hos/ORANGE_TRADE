import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Send,
    ThumbsUp,
    Eye,
    Users,
    TrendingUp,
    Clock,
    Plus,
    ArrowLeft,
    Filter,
    Hash
} from 'lucide-react';
import axios from 'axios';
import AuthNavbar from '../components/AuthNavbar';

const Community = () => {
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', category: 'General' });
    const [newMessage, setNewMessage] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: 'all', label: 'Tous', icon: Hash },
        { id: 'General', label: 'Général', icon: MessageSquare },
        { id: 'Trading', label: 'Trading', icon: TrendingUp },
        { id: 'Analysis', label: 'Analyses', icon: Filter },
        { id: 'Help', label: 'Aide', icon: Users }
    ];

    useEffect(() => {
        fetchDiscussions();
        fetchStats();
    }, [activeCategory, sortBy]);

    const fetchDiscussions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/community/discussions', {
                params: { category: activeCategory, sort: sortBy }
            });
            if (response.data.success) {
                setDiscussions(response.data.discussions);
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/community/stats');
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchDiscussion = async (discussionId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/community/discussions/${discussionId}`);
            if (response.data.success) {
                setSelectedDiscussion(response.data.discussion);
            }
        } catch (error) {
            console.error('Error fetching discussion:', error);
        }
    };

    const createDiscussion = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));

        try {
            const response = await axios.post('http://localhost:5000/api/community/discussions', {
                ...newDiscussion,
                user_id: user.id
            });

            if (response.data.success) {
                setNewDiscussion({ title: '', content: '', category: 'General' });
                setShowNewDiscussionForm(false);
                fetchDiscussions();
                alert('✅ Discussion créée avec succès !');
            }
        } catch (error) {
            console.error('Error creating discussion:', error);
            alert('❌ Erreur lors de la création de la discussion');
        }
    };

    const addMessage = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));

        try {
            const response = await axios.post(
                `http://localhost:5000/api/community/discussions/${selectedDiscussion.id}/messages`,
                {
                    content: newMessage,
                    user_id: user.id
                }
            );

            if (response.data.success) {
                setNewMessage('');
                fetchDiscussion(selectedDiscussion.id);
            }
        } catch (error) {
            console.error('Error adding message:', error);
            alert('❌ Erreur lors de l\'ajout du message');
        }
    };

    const likeDiscussion = async (discussionId) => {
        try {
            await axios.post(`http://localhost:5000/api/community/discussions/${discussionId}/like`);
            if (selectedDiscussion && selectedDiscussion.id === discussionId) {
                fetchDiscussion(discussionId);
            }
            fetchDiscussions();
        } catch (error) {
            console.error('Error liking discussion:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('fr-FR');
    };

    if (loading) {
        return (
            <>
                <AuthNavbar />
                <div className="min-h-screen bg-cyberpunk text-white flex items-center justify-center">
                    <div className="text-2xl font-jetbrains">LOADING COMMUNITY...</div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-cyberpunk text-white">
            <AuthNavbar />

            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-5xl font-black font-jetbrains mb-3">
                            <span className="text-white">TRADE</span>
                            <span className="text-neon-green">VELOCITY</span> COMMUNITY
                        </h1>
                        <p className="text-gray-400 font-jetbrains text-sm">
                            Échangez avec d'autres traders et partagez vos stratégies
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewDiscussionForm(!showNewDiscussionForm)}
                        className="px-6 py-3 bg-neon-green text-black hover:bg-neon-green/90 font-jetbrains text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> NOUVELLE DISCUSSION
                    </button>
                </motion.div>

                {/* Stats Bar */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        <div className="glassmorphism-dark p-4 border border-white/10 text-center">
                            <div className="text-3xl font-bold font-jetbrains text-neon-green">{stats.total_discussions}</div>
                            <div className="text-xs text-gray-400 font-jetbrains uppercase tracking-wider">Discussions</div>
                        </div>
                        <div className="glassmorphism-dark p-4 border border-white/10 text-center">
                            <div className="text-3xl font-bold font-jetbrains text-neon-green">{stats.total_messages}</div>
                            <div className="text-xs text-gray-400 font-jetbrains uppercase tracking-wider">Messages</div>
                        </div>
                        <div className="glassmorphism-dark p-4 border border-white/10 text-center">
                            <div className="text-3xl font-bold font-jetbrains text-neon-green">{stats.total_users}</div>
                            <div className="text-xs text-gray-400 font-jetbrains uppercase tracking-wider">Membres</div>
                        </div>
                    </motion.div>
                )}

                {/* New Discussion Form */}
                {showNewDiscussionForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 glassmorphism-dark p-6 border border-neon-green/30"
                    >
                        <h3 className="text-xl font-bold font-jetbrains mb-4">CRÉER UNE NOUVELLE DISCUSSION</h3>
                        <form onSubmit={createDiscussion}>
                            <div className="mb-4">
                                <label className="block text-xs font-jetbrains font-bold mb-2 uppercase text-gray-400">Titre</label>
                                <input
                                    type="text"
                                    value={newDiscussion.title}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                    className="w-full bg-black/50 text-white p-3 border border-white/10 font-jetbrains text-sm focus:border-neon-green outline-none"
                                    placeholder="Ex: Ma stratégie pour trader le BTC"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-jetbrains font-bold mb-2 uppercase text-gray-400">Catégorie</label>
                                <select
                                    value={newDiscussion.category}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                                    className="w-full bg-black/50 text-white p-3 border border-white/10 font-jetbrains text-sm focus:border-neon-green outline-none"
                                >
                                    <option value="General">Général</option>
                                    <option value="Trading">Trading</option>
                                    <option value="Analysis">Analyses</option>
                                    <option value="Help">Aide</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-jetbrains font-bold mb-2 uppercase text-gray-400">Contenu</label>
                                <textarea
                                    value={newDiscussion.content}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                                    className="w-full bg-black/50 text-white p-3 border border-white/10 font-jetbrains text-sm focus:border-neon-green outline-none h-32"
                                    placeholder="Partagez vos idées..."
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="px-6 py-2 bg-neon-green text-black font-jetbrains text-xs font-bold">
                                    PUBLIER
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewDiscussionForm(false)}
                                    className="px-6 py-2 bg-red-500/20 text-red-500 font-jetbrains text-xs font-bold"
                                >
                                    ANNULER
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar - Categories */}
                    <div className="col-span-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glassmorphism-dark p-4 border border-white/10 sticky top-24"
                        >
                            <h3 className="font-jetbrains text-xs font-bold mb-4 uppercase text-gray-400">Catégories</h3>
                            {categories.map((cat) => {
                                const IconComponent = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full p-3 mb-2 text-left transition-all font-jetbrains text-sm flex items-center gap-2 ${activeCategory === cat.id
                                                ? 'bg-neon-green/20 text-neon-green border-l-2 border-neon-green'
                                                : 'hover:bg-white/5 text-gray-400'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                );
                            })}

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h3 className="font-jetbrains text-xs font-bold mb-4 uppercase text-gray-400">Trier par</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-black/50 text-white p-2 border border-white/10 font-jetbrains text-xs focus:border-neon-green outline-none"
                                >
                                    <option value="recent">Plus récent</option>
                                    <option value="popular">Plus populaire</option>
                                    <option value="views">Plus consulté</option>
                                </select>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-9">
                        {!selectedDiscussion ? (
                            // Liste des discussions
                            <div className="space-y-4">
                                {discussions.map((disc, idx) => (
                                    <motion.div
                                        key={disc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.05 }}
                                        className="glassmorphism-dark p-6 border border-white/10 hover:border-neon-green/30 transition-all cursor-pointer"
                                        onClick={() => fetchDiscussion(disc.id)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-[10px] font-jetbrains font-bold uppercase">
                                                        {disc.category}
                                                    </span>
                                                    <span className="text-gray-400 text-xs font-jetbrains">
                                                        par {disc.author.username}
                                                    </span>
                                                    <span className="text-gray-500 text-xs font-jetbrains">
                                                        • {formatDate(disc.created_at)}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold font-jetbrains mb-2">{disc.title}</h3>
                                                <p className="text-gray-300 text-sm font-jetbrains">{disc.content}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-xs text-gray-400 font-jetbrains">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    likeDiscussion(disc.id);
                                                }}
                                                className="flex items-center gap-1 hover:text-neon-green transition-colors"
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>{disc.likes}</span>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>{disc.replies} réponses</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                <span>{disc.views} vues</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {discussions.length === 0 && (
                                    <div className="glassmorphism-dark p-12 border border-white/10 text-center">
                                        <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-jetbrains text-sm mb-4">
                                            Aucune discussion dans cette catégorie
                                        </p>
                                        <button
                                            onClick={() => setShowNewDiscussionForm(true)}
                                            className="px-6 py-2 bg-neon-green text-black font-jetbrains text-xs font-bold"
                                        >
                                            CRÉER LA PREMIÈRE DISCUSSION
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Détail de la discussion
                            <div>
                                <button
                                    onClick={() => setSelectedDiscussion(null)}
                                    className="mb-4 text-neon-green hover:text-neon-green/80 transition-colors font-jetbrains text-sm flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> RETOUR AUX DISCUSSIONS
                                </button>

                                {/* Discussion Header */}
                                <div className="glassmorphism-dark p-6 border border-white/10 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-[10px] font-jetbrains font-bold uppercase">
                                            {selectedDiscussion.category}
                                        </span>
                                        <span className="text-gray-400 text-xs font-jetbrains">
                                            par {selectedDiscussion.author.username}
                                        </span>
                                        <span className="text-gray-500 text-xs font-jetbrains">
                                            • {formatDate(selectedDiscussion.created_at)}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold font-jetbrains mb-4">{selectedDiscussion.title}</h2>
                                    <p className="text-gray-300 mb-4 font-jetbrains text-sm">{selectedDiscussion.content}</p>
                                    <div className="flex items-center gap-6 text-xs text-gray-400 font-jetbrains">
                                        <button
                                            onClick={() => likeDiscussion(selectedDiscussion.id)}
                                            className="flex items-center gap-1 hover:text-neon-green transition-colors"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>{selectedDiscussion.likes} J'aime</span>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{selectedDiscussion.views} vues</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="space-y-4 mb-6">
                                    <h3 className="text-xl font-bold font-jetbrains">
                                        RÉPONSES ({selectedDiscussion.messages.length})
                                    </h3>
                                    {selectedDiscussion.messages.map((msg) => (
                                        <div key={msg.id} className="glassmorphism-dark p-4 border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center font-bold font-jetbrains text-neon-green">
                                                        {msg.author.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold font-jetbrains text-sm">{msg.author.username}</div>
                                                        <div className="text-[10px] text-gray-500 font-jetbrains">
                                                            {formatDate(msg.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-neon-green transition-colors text-xs font-jetbrains flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" /> {msg.likes}
                                                </button>
                                            </div>
                                            <p className="text-gray-300 font-jetbrains text-sm">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* New Message Form */}
                                <div className="glassmorphism-dark p-6 border border-white/10">
                                    <h3 className="font-bold mb-4 font-jetbrains uppercase text-xs text-gray-400">
                                        Ajouter une réponse
                                    </h3>
                                    <form onSubmit={addMessage}>
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="w-full bg-black/50 text-white p-3 border border-white/10 focus:border-neon-green outline-none h-24 mb-4 font-jetbrains text-sm"
                                            placeholder="Votre réponse..."
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-neon-green text-black font-jetbrains text-xs font-bold flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" /> ENVOYER
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;
