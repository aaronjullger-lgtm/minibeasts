/**
 * Live Wire Component
 * 
 * Real-time Contextual Chat for High-Stakes Bets.
 * Features:
 * - Player-to-player chat
 * - AI (Commish) interruptions with glitchy text and red background
 * - Reaction stamps: WASHED, COOKED, CAP
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverseerPlayerState } from '../types';

export interface LiveWireMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
    isAI?: boolean;
    reactions?: { [playerId: string]: 'WASHED' | 'COOKED' | 'CAP' };
}

interface LiveWireProps {
    player: OverseerPlayerState;
    messages: LiveWireMessage[];
    onSendMessage: (text: string) => void;
    onReact?: (messageId: string, reaction: 'WASHED' | 'COOKED' | 'CAP') => void;
    betContext?: string; // Context for what bet is being discussed
}

export const LiveWire: React.FC<LiveWireProps> = ({
    player,
    messages,
    onSendMessage,
    onReact,
    betContext
}) => {
    const [inputText, setInputText] = useState('');
    const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim() && onSendMessage) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReaction = (messageId: string, reaction: 'WASHED' | 'COOKED' | 'CAP') => {
        if (onReact) {
            onReact(messageId, reaction);
        }
        setShowReactionMenu(null);
    };

    const getReactionEmoji = (reaction: 'WASHED' | 'COOKED' | 'CAP') => {
        switch (reaction) {
            case 'WASHED': return '🧼';
            case 'COOKED': return '🔥';
            case 'CAP': return '🧢';
            default: return '';
        }
    };

    const getReactionCount = (message: LiveWireMessage, reaction: 'WASHED' | 'COOKED' | 'CAP') => {
        if (!message.reactions) return 0;
        return Object.values(message.reactions).filter(r => r === reaction).length;
    };

    return (
        <div className="flex flex-col h-full bg-board-navy">
            {/* Header */}
            <div className="flex-shrink-0 bg-board-muted-blue border-b border-board-off-white/10 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-board-off-white font-board-header text-lg">
                            LIVE WIRE
                        </h2>
                        {betContext && (
                            <p className="text-board-off-white/60 font-board-grit text-xs mt-1">
                                {betContext}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-board-red animate-pulse" />
                        <span className="text-board-red font-board-grit text-xs">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="relative group"
                        >
                            {message.isAI ? (
                                // AI Commish Message
                                <motion.div
                                    className="bg-board-red border-2 border-board-red p-3 rounded relative overflow-hidden"
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                        boxShadow: '0 0 20px rgba(255, 51, 51, 0.5)'
                                    }}
                                >
                                    {/* Glitch Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-black/20"
                                        animate={{
                                            opacity: [0, 0.3, 0, 0.5, 0],
                                            x: [-2, 2, -1, 1, 0]
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            repeatDelay: 2
                                        }}
                                    />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-black font-board-grit text-xs font-bold">
                                                ⚠️ THE COMMISH
                                            </span>
                                            <span className="text-black/60 font-board-grit text-xs">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <motion.p
                                            className="text-black font-board-header font-bold"
                                            animate={{
                                                x: [0, -1, 1, 0],
                                            }}
                                            transition={{
                                                duration: 0.2,
                                                repeat: Infinity,
                                                repeatDelay: 3
                                            }}
                                        >
                                            {message.text}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ) : (
                                // Regular Player Message
                                <div
                                    className={`p-3 rounded ${
                                        message.senderId === player.id
                                            ? 'bg-blue-600/20 border border-blue-500/30 ml-8'
                                            : 'bg-board-muted-blue border border-board-off-white/10 mr-8'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-board-off-white font-board-grit text-sm font-bold">
                                                {message.senderName}
                                            </span>
                                            <span className="text-board-off-white/40 font-board-grit text-xs">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        
                                        {/* Reaction Button */}
                                        <button
                                            onClick={() => setShowReactionMenu(
                                                showReactionMenu === message.id ? null : message.id
                                            )}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-board-off-white/60 hover:text-board-off-white text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <p className="text-board-off-white font-board-grit text-sm">
                                        {message.text}
                                    </p>

                                    {/* Reactions */}
                                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {(['WASHED', 'COOKED', 'CAP'] as const).map((reaction) => {
                                                const count = getReactionCount(message, reaction);
                                                if (count === 0) return null;
                                                
                                                return (
                                                    <div
                                                        key={reaction}
                                                        className="flex items-center gap-1 bg-board-navy/50 px-2 py-1 rounded-full"
                                                    >
                                                        <span>{getReactionEmoji(reaction)}</span>
                                                        <span className="text-board-off-white/70 text-xs">
                                                            {count}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Reaction Menu */}
                                    <AnimatePresence>
                                        {showReactionMenu === message.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 top-full mt-1 bg-board-navy border border-board-off-white/20 rounded-lg shadow-xl p-2 flex gap-2 z-10"
                                            >
                                                {(['WASHED', 'COOKED', 'CAP'] as const).map((reaction) => (
                                                    <button
                                                        key={reaction}
                                                        onClick={() => handleReaction(message.id, reaction)}
                                                        className="flex flex-col items-center gap-1 px-3 py-2 hover:bg-board-muted-blue rounded transition-colors"
                                                    >
                                                        <span className="text-2xl">
                                                            {getReactionEmoji(reaction)}
                                                        </span>
                                                        <span className="text-board-off-white/70 font-board-grit text-xs">
                                                            {reaction}
                                                        </span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-board-off-white/10 p-4">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-board-muted-blue border border-board-off-white/20 rounded px-4 py-2 text-board-off-white font-board-grit text-sm focus:outline-none focus:border-board-red transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="bg-board-red hover:bg-red-600 disabled:bg-board-muted-blue disabled:opacity-50 text-white font-board-header px-6 py-2 rounded transition-colors"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Generate AI interruption messages
 */
export const generateCommishInterruption = (): string[] => {
    const messages = [
        'SETTLEMENT IMMINENT',
        'YOU ARE ALL WRONG',
        'WITNESSING',
        'ODDS RECALCULATED',
        'VOLATILITY SPIKE DETECTED',
        'TRIBUNAL CLOSING SOON',
        'THE HOUSE IS WATCHING',
        'BANKRUPTCY IMMINENT',
        'GULAG CAPACITY EXPANDING',
        'LOAN DEFAULTS DETECTED'
    ];

    return messages;
};
