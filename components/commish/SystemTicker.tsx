/**
 * System Ticker Component
 * 
 * A subtle UI element for the Dashboard (Phase 1).
 * Displays live commentary from The Commish AI in a scrolling marquee style.
 * 
 * Placement: Just below the Top Bar
 * Visual: Stock ticker style scrolling marquee
 * Animation: Smooth, infinite scroll
 * Style: Monospace font, board-red or board-text depending on mood
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface SystemTickerProps {
    messages?: string[];
    mood?: 'alert' | 'neutral' | 'active';
    speed?: number; // Duration in seconds for one complete scroll
}

const defaultMessages = [
    'SCANNING FOR FRAUD...',
    'MARKET VOLATILITY: HIGH.',
    'MONITORING BETTING PATTERNS...',
    'ANALYZING GRIT RESERVES...',
    'DETECTING COWARDICE...',
    'EVALUATING SHADOW LOCKS...',
    'PROCESSING TRIBUNAL DATA...',
    'TRACKING DEGENERATE BEHAVIOR...',
];

export const SystemTicker: React.FC<SystemTickerProps> = ({
    messages = defaultMessages,
    mood = 'neutral',
    speed = 30
}) => {
    const [tickerMessages, setTickerMessages] = useState<string[]>([]);

    useEffect(() => {
        // Duplicate messages to create seamless loop
        setTickerMessages([...messages, ...messages]);
    }, [messages]);

    // Determine color based on mood
    const getTextColor = () => {
        switch (mood) {
            case 'alert':
                return 'text-board-red';
            case 'active':
                return 'text-board-gold';
            case 'neutral':
            default:
                return 'text-board-text';
        }
    };

    const textColor = getTextColor();

    return (
        <div className="relative w-full bg-board-surface border-b border-board-highlight overflow-hidden py-2">
            {/* Gradient Fade on Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-board-surface to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-board-surface to-transparent z-10 pointer-events-none" />

            {/* Scrolling Content */}
            <div className="relative overflow-hidden">
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{
                        x: [0, -50 + '%']
                    }}
                    transition={{
                        x: {
                            duration: speed,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatType: 'loop'
                        }
                    }}
                >
                    {tickerMessages.map((message, index) => (
                        <div
                            key={`${message}-${index}`}
                            className={`inline-flex items-center font-board-grit text-sm ${textColor} px-6`}
                        >
                            <span className="mr-2">▪</span>
                            <span>{message}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

/**
 * SystemTickerWithPlayerData Component
 * 
 * Enhanced version that can inject player-specific commentary
 */
export interface SystemTickerWithPlayerDataProps {
    playerNames?: string[];
    baseMessages?: string[];
    mood?: 'alert' | 'neutral' | 'active';
    speed?: number;
}

export const SystemTickerWithPlayerData: React.FC<SystemTickerWithPlayerDataProps> = ({
    playerNames = [],
    baseMessages = defaultMessages,
    mood = 'neutral',
    speed = 30
}) => {
    const [dynamicMessages, setDynamicMessages] = useState<string[]>(baseMessages);

    useEffect(() => {
        // Generate player-specific messages
        const playerMessages: string[] = [];
        
        playerNames.forEach((name) => {
            const variations = [
                `${name.toUpperCase()} HAS BEEN FLAGGED FOR POOR PERFORMANCE.`,
                `MONITORING ${name.toUpperCase()}'S BETTING ACTIVITY.`,
                `${name.toUpperCase()} UNDER INVESTIGATION.`,
                `ALERT: ${name.toUpperCase()} SHOWING SUSPICIOUS PATTERNS.`
            ];
            
            // Pick random variation
            const message = variations[Math.floor(Math.random() * variations.length)];
            playerMessages.push(message);
        });

        // Combine base messages with player messages
        const combined = [...baseMessages];
        
        // Insert player messages at intervals
        playerMessages.forEach((msg, idx) => {
            const insertPos = Math.floor((combined.length / playerMessages.length) * (idx + 1));
            combined.splice(insertPos, 0, msg);
        });

        setDynamicMessages(combined);
    }, [playerNames, baseMessages]);

    return <SystemTicker messages={dynamicMessages} mood={mood} speed={speed} />;
};
