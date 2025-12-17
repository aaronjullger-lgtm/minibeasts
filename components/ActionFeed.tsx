/**
 * Action Feed Component
 * 
 * Live scrolling ticker showing anonymous big moves and betting activity
 */

import React, { useState, useEffect, useRef } from 'react';

export interface ActionFeedMessage {
    id: string;
    message: string;
    timestamp: number;
    type: 'whale' | 'commish' | 'ambush' | 'tribunal' | 'general';
    direction?: 'up' | 'down';
    isWhale?: boolean;
}

interface ActionFeedProps {
    messages: ActionFeedMessage[];
}

export const ActionFeed: React.FC<ActionFeedProps> = ({ messages }) => {
    const [displayMessages, setDisplayMessages] = useState<ActionFeedMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Keep only the last 20 messages for performance
        setDisplayMessages(messages.slice(-20));
    }, [messages]);

    useEffect(() => {
        // Auto-scroll to show latest messages
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [displayMessages]);

    const getMessageColor = (type: ActionFeedMessage['type'], isWhale?: boolean): string => {
        if (isWhale) return 'text-board-red';
        switch (type) {
            case 'whale':
                return 'text-yellow-400';
            case 'commish':
                return 'text-purple-300';
            case 'ambush':
                return 'text-board-red';
            case 'tribunal':
                return 'text-green-300';
            default:
                return 'text-board-off-white/80';
        }
    };

    const getMessageIcon = (type: ActionFeedMessage['type']): string => {
        switch (type) {
            case 'whale':
                return '🐋';
            case 'commish':
                return '👑';
            case 'ambush':
                return '🎯';
            case 'tribunal':
                return '⚖️';
            default:
                return '📢';
        }
    };

    const hasWhale = displayMessages.some((msg) => msg.isWhale);

    return (
        <div className="w-full border-b border-board-muted-blue/40 bg-board-navy/70 backdrop-blur-md overflow-hidden">
            <div className="bg-gradient-to-r from-board-navy via-black/70 to-board-navy py-2 px-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-board-red rounded-full board-red-glow animate-pulse"></div>
                        <span className="text-[11px] font-board-grit uppercase tracking-[0.2em] text-board-red">
                            Live Action
                        </span>
                    </div>
                    <div className="h-px flex-1 bg-board-muted-blue/40" />
                </div>
                <div 
                    ref={scrollRef}
                    className="overflow-x-hidden scrollbar-hide"
                    style={{
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <div className={`flex gap-4 ${hasWhale ? 'animate-scroll-fast' : 'animate-scroll-slow'}`}>
                        {displayMessages.length === 0 ? (
                            <span className="text-board-off-white/50 text-sm whitespace-nowrap">
                                Waiting for action...
                            </span>
                        ) : (
                            displayMessages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex items-center gap-3 whitespace-nowrap px-3 py-2 rounded border border-board-muted-blue/60 bg-black/40 ${msg.isWhale ? 'whale-flash' : ''}`}
                                >
                                    <span className={`text-sm font-board-grit ${msg.direction === 'down' ? 'text-board-red' : 'text-green-400'}`}>
                                        {msg.direction === 'down' ? '−' : '+'}
                                    </span>
                                    <span className="text-lg">{getMessageIcon(msg.type)}</span>
                                    <span className={`text-sm font-medium ${getMessageColor(msg.type, msg.isWhale)}`}>
                                        {msg.message}
                                    </span>
                                    <span className="text-[10px] text-board-off-white/60 font-board-grit">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes scroll-marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                
                .animate-scroll-slow {
                    animation: scroll-marquee 60s linear infinite;
                }
                
                .animate-scroll-fast {
                    animation: scroll-marquee 30s linear infinite;
                }
                
                .animate-scroll-slow:hover,
                .animate-scroll-fast:hover {
                    animation-play-state: paused;
                }

                @keyframes whale-flash {
                    0%, 100% { box-shadow: 0 0 0 rgba(255, 51, 51, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.5); }
                }

                .whale-flash {
                    animation: whale-flash 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

// Helper function to create action feed messages
export const createActionFeedMessage = (
    message: string,
    type: ActionFeedMessage['type'] = 'general',
    extras: Partial<ActionFeedMessage> = {}
): ActionFeedMessage => {
    return {
        id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        message,
        timestamp: Date.now(),
        type,
        ...extras
    };
};

// Helper function to generate anonymous bet notifications
export const generateBetNotification = (
    wager: number,
    betType: 'ambush' | 'tribunal' | 'squad_ride' | 'sportsbook',
    category?: string
): ActionFeedMessage => {
    let message = '';
    let type: ActionFeedMessage['type'] = 'general';

    // Determine if it's a "whale" bet (>1000 grit)
    const isWhale = wager >= 1000;
    const extras: Partial<ActionFeedMessage> = {
        isWhale,
        direction: 'down',
    };
    
    if (isWhale) {
        type = 'whale';
    } else if (betType === 'ambush') {
        type = 'ambush';
    } else if (betType === 'tribunal') {
        type = 'tribunal';
    }

    switch (betType) {
        case 'ambush':
            message = `${isWhale ? 'A Whale' : 'Someone'} just dropped ${wager.toLocaleString()} Grit on ${category ? `a [${category.toUpperCase()}]` : 'an'} Ambush`;
            break;
        case 'tribunal':
            message = `${isWhale ? 'A Whale' : 'Someone'} wagered ${wager.toLocaleString()} Grit on The Tribunal`;
            break;
        case 'squad_ride':
            message = `${isWhale ? 'A Whale' : 'A player'} joined the Squad Ride with ${wager.toLocaleString()} Grit`;
            break;
        case 'sportsbook':
            message = `${wager.toLocaleString()} Grit placed on the Sportsbook`;
            break;
    }

    return createActionFeedMessage(message, type, extras);
};

export const generateCommishUpdate = (playerName: string, action: string): ActionFeedMessage => {
    return createActionFeedMessage(
        `The Commish just ${action} on ${playerName}`,
        'commish'
    );
};
