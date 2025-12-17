/**
 * Bankrupt Notification Component
 * 
 * Displays when a bettor loses an ambush bet and the subject takes their grit
 * Dark theme with red accents
 */

import React, { useEffect, useState } from 'react';
import { BankruptNotification } from '../types';

interface BankruptScreenProps {
    notification: BankruptNotification;
    onClose: () => void;
}

export const BankruptScreen: React.FC<BankruptScreenProps> = ({ notification, onClose }) => {
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setShowAnimation(true), 100);

        // Auto-close after 5 seconds
        const timeout = setTimeout(onClose, 5000);
        return () => clearTimeout(timeout);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <div 
                className={`max-w-3xl w-full mx-4 transition-all duration-700 ${
                    showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
            >
                {/* Bankrupt Card */}
                <div className="bg-gray-900 border-8 border-board-crimson rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    {/* Diagonal Warning Stripes */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-repeat" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, #8b0000 35px, #8b0000 70px)'
                        }}></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-block bg-board-crimson text-board-off-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4 animate-pulse">
                                ⚠️ AMBUSH DETECTED
                            </div>
                            <h1 className="text-5xl md:text-7xl font-board-header italic text-board-red mb-2">
                                YOU GOT HIT
                            </h1>
                        </div>

                        {/* Main Message */}
                        <div className="bg-black/60 rounded-xl p-6 md:p-8 mb-6 border-2 border-board-crimson">
                            <p className="text-xl md:text-3xl font-bold text-board-red text-center leading-tight">
                                {notification.message}
                            </p>
                        </div>

                        {/* Loss Display */}
                        <div className="text-center mb-6">
                            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                                Grit Lost
                            </div>
                            <div className="text-6xl md:text-8xl font-board-grit font-bold text-board-crimson">
                                -{notification.amount.toLocaleString()}
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-gray-500 mt-2">
                                GRIT
                            </div>
                        </div>

                        {/* Subject Info */}
                        <div className="bg-board-crimson/20 border-2 border-board-crimson rounded-lg p-4 mb-6">
                            <div className="text-center space-y-2">
                                <p className="text-lg md:text-xl font-bold text-board-red">
                                    💀 {notification.subjectName.toUpperCase()} COLLECTED THE POT
                                </p>
                                <p className="text-base md:text-lg text-gray-300">
                                    The ambush backfired. Your bet failed.
                                </p>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="text-center space-y-2 mb-6">
                            <p className="text-lg text-gray-400">
                                🎯 SUBJECT-TAKES-ALL ACTIVATED
                            </p>
                            <p className="text-sm text-gray-500 italic">
                                All losing wagers transferred to the target
                            </p>
                        </div>

                        {/* Close Button */}
                        <div className="text-center">
                            <button
                                onClick={onClose}
                                className="bg-board-crimson hover:bg-red-900 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
                            >
                                ACCEPT LOSS
                            </button>
                        </div>
                    </div>
                </div>

                {/* Falling Skulls Animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-4xl animate-fall-skull opacity-50"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            💀
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fall-skull {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.5;
                    }
                    90% {
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateY(100vh) rotate(180deg);
                        opacity: 0;
                    }
                }
                
                .animate-fall-skull {
                    animation: fall-skull 4s ease-in infinite;
                }
            `}</style>
        </div>
    );
};
