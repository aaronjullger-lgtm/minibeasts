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

    const getMessageColor = (type: ActionFeedMessage['type']): string => {
        switch (type) {
            case 'whale':
                return 'text-yellow-400';
            case 'commish':
                return 'text-purple-400';
            case 'ambush':
                return 'text-board-red';
            case 'tribunal':
                return 'text-blue-400';
            default:
                return 'text-gray-300';
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

    return (
        <div className="w-full bg-board-navy border-b-2 border-board-red overflow-hidden">
            <div className="bg-gradient-to-r from-board-navy via-gray-900 to-board-navy py-2 px-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-board-red rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-board-red uppercase tracking-wider">
                            LIVE FEED
                        </span>
                    </div>
                </div>
                <div 
                    ref={scrollRef}
                    className="overflow-x-auto scrollbar-hide"
                    style={{
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <div className="flex gap-8 animate-scroll-slow">
                        {displayMessages.length === 0 ? (
                            <span className="text-gray-500 text-sm whitespace-nowrap">
                                Waiting for action...
                            </span>
                        ) : (
                            displayMessages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span className="text-lg">{getMessageIcon(msg.type)}</span>
                                    <span className={`text-sm font-medium ${getMessageColor(msg.type)}`}>
                                        {msg.message}
                                    </span>
                                    <span className="text-xs text-gray-600">
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
                
                @keyframes scroll-slow {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                
                .animate-scroll-slow {
                    animation: scroll-slow 60s linear infinite;
                }
                
                .animate-scroll-slow:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

// Helper function to create action feed messages
export const createActionFeedMessage = (
    message: string,
    type: ActionFeedMessage['type'] = 'general'
): ActionFeedMessage => {
    return {
        id: `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message,
        timestamp: Date.now(),
        type
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

    return createActionFeedMessage(message, type);
};

export const generateCommishUpdate = (playerName: string, action: string): ActionFeedMessage => {
    return createActionFeedMessage(
        `The Commish just ${action} on ${playerName}`,
        'commish'
    );
};
