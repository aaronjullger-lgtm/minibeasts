/**
 * Payday Notification Component
 * 
 * Displays when the subject wins a Subject-Takes-All payout
 * Uses Off-White palette with Bright Red text
 */

import React, { useEffect, useState } from 'react';
import { PaydayNotification } from '../types';

interface PaydayScreenProps {
    notification: PaydayNotification;
    onClose: () => void;
}

export const PaydayScreen: React.FC<PaydayScreenProps> = ({ notification, onClose }) => {
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setShowAnimation(true), 100);

        // Auto-close after 5 seconds
        const timeout = setTimeout(onClose, 5000);
        return () => clearTimeout(timeout);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div 
                className={`max-w-3xl w-full mx-4 transition-all duration-700 ${
                    showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
            >
                {/* Vault Transfer Card */}
                <div className="bg-board-off-white border-8 border-board-red rounded-2xl p-8 md:p-12 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-block bg-board-red text-board-off-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            🏦 VAULT TRANSFER
                        </div>
                        <h1 className="text-5xl md:text-7xl font-board-header italic text-board-red mb-2 animate-pulse">
                            PAYDAY
                        </h1>
                    </div>

                    {/* Main Message */}
                    <div className="bg-gray-900 rounded-xl p-6 md:p-8 mb-6">
                        <p className="text-xl md:text-3xl font-bold text-board-red text-center leading-tight">
                            {notification.message}
                        </p>
                    </div>

                    {/* Amount Display */}
                    <div className="text-center mb-6">
                        <div className="text-sm text-gray-600 uppercase tracking-wider mb-2">
                            Total Collected
                        </div>
                        <div className="text-6xl md:text-8xl font-board-grit font-bold text-board-red animate-bounce">
                            +{notification.amount.toLocaleString()}
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-700 mt-2">
                            GRIT
                        </div>
                    </div>

                    {/* Flavor Text */}
                    <div className="text-center space-y-2">
                        <p className="text-lg md:text-xl font-bold text-gray-800">
                            💰 THE BOYS TRIED TO AMBUSH YOU
                        </p>
                        <p className="text-base md:text-lg text-gray-600">
                            You proved them wrong. The entire pot is yours.
                        </p>
                        <p className="text-sm text-gray-500 italic">
                            (5% Commish Cut already deducted)
                        </p>
                    </div>

                    {/* Close Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={onClose}
                            className="bg-board-red hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
                        >
                            COLLECT GRIT
                        </button>
                    </div>
                </div>

                {/* Floating Grit Icons */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-4xl animate-float-grit"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        >
                            💰
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes float-grit {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                .animate-float-grit {
                    animation: float-grit 5s linear infinite;
                }
            `}</style>
        </div>
    );
};
