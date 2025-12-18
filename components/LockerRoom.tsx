/**
 * The Locker Room - Mystery Box Storefront
 * The central economy hub for purchasing mystery boxes
 * 
 * Features:
 * - Three mystery box tiers with Elite Noir styling
 * - Hidden "Syndicate" backdoor trigger (3-second hold on grit balance)
 * - Tactile button feedback
 * - Integration with CrateOpenAnimation
 */

import React, { useState, useRef, useEffect } from 'react';
import { LoreItem, OverseerPlayerState } from '../types';
import { mysteryBoxService } from '../services/mysteryBoxService';
import { CrateOpenAnimation } from './CrateOpenAnimation';

interface LockerRoomProps {
    player: OverseerPlayerState;
    onPurchase: (tierId: string, cost: number, pulledItem: LoreItem) => void;
    onClose: () => void;
}

interface MysteryBoxTier {
    id: 'clearance' | 'standard' | 'grail';
    name: string;
    description: string;
    cost: number;
    emoji: string;
    borderColor: string;
    bgOpacity: string;
    glowEffect: string;
    textColor: string;
}

export const LockerRoom: React.FC<LockerRoomProps> = ({ player, onPurchase, onClose }) => {
    const [pulledItem, setPulledItem] = useState<LoreItem | null>(null);
    const [isOpening, setIsOpening] = useState(false);
    const [showSyndicate, setShowSyndicate] = useState(false);
    
    // Hidden trigger state
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const holdStartTimeRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const HOLD_DURATION = 3000; // 3 seconds in milliseconds

    // Mystery Box Tiers
    const tiers: MysteryBoxTier[] = [
        {
            id: 'clearance',
            name: 'The Clearance Rack',
            description: 'Budget finds. Mostly towels and socks. Maybe something decent.',
            cost: 100,
            emoji: '🛍️',
            borderColor: 'border-board-muted-blue',
            bgOpacity: 'bg-board-muted-blue/10',
            glowEffect: 'hover:shadow-[0_0_15px_rgba(30,41,59,0.5)]',
            textColor: 'text-board-muted-blue'
        },
        {
            id: 'standard',
            name: 'Standard Issue',
            description: 'The everyday grind. Solid gear for the committed.',
            cost: 500,
            emoji: '📦',
            borderColor: 'border-board-off-white',
            bgOpacity: 'bg-board-off-white/5',
            glowEffect: 'hover:shadow-[0_0_20px_rgba(225,231,245,0.3)]',
            textColor: 'text-board-off-white'
        },
        {
            id: 'grail',
            name: 'The Grail Crate',
            description: 'Legends only. Pure gold. Championship dreams.',
            cost: 2500,
            emoji: '🗄️',
            borderColor: 'border-board-red',
            bgOpacity: 'bg-board-red/5',
            glowEffect: 'shadow-[0_0_30px_rgba(255,51,51,0.6)] animate-pulse-glow',
            textColor: 'text-board-red'
        }
    ];

    const handlePurchase = (tier: MysteryBoxTier) => {
        if (player.grit < tier.cost) {
            alert(`Not enough Grit! You need ${tier.cost} but only have ${player.grit}.`);
            return;
        }

        setIsOpening(true);
        
        // TODO: Play Sound - Purchase/coin sound
        
        // Simulate opening delay
        setTimeout(() => {
            const item = mysteryBoxService.openMysteryBoxByTier(tier.id);
            setPulledItem(item);
            onPurchase(tier.id, tier.cost, item);
        }, 100);
    };

    const handleAnimationComplete = () => {
        setPulledItem(null);
        setIsOpening(false);
    };

    // Hidden Syndicate Trigger Handlers
    const handleHoldStart = () => {
        holdStartTimeRef.current = Date.now();
        
        // Update progress bar
        progressIntervalRef.current = setInterval(() => {
            if (holdStartTimeRef.current) {
                const elapsed = Date.now() - holdStartTimeRef.current;
                const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
                setHoldProgress(progress);
            }
        }, 50);

        // Set timer for full hold
        holdTimerRef.current = setTimeout(() => {
            setShowSyndicate(true);
            setHoldProgress(0);
            // TODO: Play Sound - Secret unlock sound
        }, HOLD_DURATION);
    };

    const handleHoldEnd = () => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        holdStartTimeRef.current = null;
        setHoldProgress(0);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            handleHoldEnd();
        };
    }, []);

    return (
        <>
            <div className="fixed inset-0 bg-board-navy overflow-y-auto z-50">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-board-navy border-b-2 border-board-muted-blue shadow-lg">
                    <div className="flex justify-between items-center p-4 md:p-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-board-header font-bold italic text-board-off-white">
                                🔓 THE LOCKER ROOM
                            </h1>
                            <p className="text-board-muted-blue text-sm md:text-base mt-1">
                                Central Economy Hub • Mystery Boxes
                            </p>
                        </div>
                        
                        {/* Grit Balance with Hidden Trigger */}
                        <div className="relative">
                            <div
                                className="select-none cursor-pointer"
                                onMouseDown={handleHoldStart}
                                onMouseUp={handleHoldEnd}
                                onMouseLeave={handleHoldEnd}
                                onTouchStart={handleHoldStart}
                                onTouchEnd={handleHoldEnd}
                                onTouchCancel={handleHoldEnd}
                            >
                                <div className="text-right">
                                    <p className="text-xs md:text-sm text-board-muted-blue uppercase tracking-wider">
                                        Your Grit
                                    </p>
                                    <p className="text-2xl md:text-3xl font-board-grit font-bold text-board-gold">
                                        {player.grit.toLocaleString()}
                                    </p>
                                </div>
                                
                                {/* Progress indicator for hidden trigger */}
                                {holdProgress > 0 && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-board-red transition-all duration-100"
                                         style={{ width: `${holdProgress}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    {/* Mystery Box Tiers */}
                    <div className="space-y-6">
                        {tiers.map((tier, index) => (
                            <div
                                key={tier.id}
                                className={`relative ${tier.bgOpacity} ${tier.borderColor} border-4 rounded-lg p-6 md:p-8 transition-all ${tier.glowEffect}`}
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                    {/* Box Emoji */}
                                    <div className="text-6xl md:text-8xl flex-shrink-0">
                                        {tier.emoji}
                                    </div>

                                    {/* Box Info */}
                                    <div className="flex-grow text-center md:text-left">
                                        <h2 className={`text-2xl md:text-3xl font-board-header font-bold ${tier.textColor} mb-2`}>
                                            {tier.name}
                                        </h2>
                                        <p className="text-board-off-white/80 mb-4">
                                            {tier.description}
                                        </p>
                                        
                                        {/* Cost Display */}
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                            <span className="text-board-gold font-board-grit text-xl md:text-2xl font-bold">
                                                {tier.cost.toLocaleString()} GRIT
                                            </span>
                                            {player.grit < tier.cost && (
                                                <span className="text-board-red text-sm">(Insufficient funds)</span>
                                            )}
                                        </div>

                                        {/* Rarity Hints */}
                                        <div className="text-xs text-board-muted-blue space-y-1">
                                            {tier.id === 'clearance' && (
                                                <p>💡 Common items, occasional Heat drop</p>
                                            )}
                                            {tier.id === 'standard' && (
                                                <p>💡 Heat items, rare Grail chance</p>
                                            )}
                                            {tier.id === 'grail' && (
                                                <p>⭐ Guaranteed Grail rarity</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Purchase Button */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => handlePurchase(tier)}
                                            disabled={player.grit < tier.cost || isOpening}
                                            className={`px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all transform ${
                                                player.grit >= tier.cost && !isOpening
                                                    ? `${tier.borderColor.replace('border-', 'bg-')} text-white hover:scale-105 active:scale-95 shadow-lg`
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                            }`}
                                            style={{
                                                transition: 'transform 0.1s ease'
                                            }}
                                        >
                                            {isOpening ? 'OPENING...' : 'BUY'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Close Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-board-muted-blue text-board-off-white rounded-lg font-bold hover:bg-board-muted-blue/80 transition-all transform active:scale-95"
                        >
                            ← BACK TO GAME
                        </button>
                    </div>
                </div>

                {/* Custom Animations */}
                <style>{`
                    @keyframes pulse-glow {
                        0%, 100% {
                            box-shadow: 0 0 20px rgba(255, 51, 51, 0.4);
                        }
                        50% {
                            box-shadow: 0 0 40px rgba(255, 51, 51, 0.8);
                        }
                    }

                    .animate-pulse-glow {
                        animation: pulse-glow 2s ease-in-out infinite;
                    }
                `}</style>
            </div>

            {/* Crate Opening Animation Overlay */}
            {pulledItem && (
                <CrateOpenAnimation
                    item={pulledItem}
                    onComplete={handleAnimationComplete}
                />
            )}

            {/* Syndicate Access Modal */}
            {showSyndicate && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90">
                    <div className="bg-board-navy border-4 border-board-gold rounded-lg p-8 max-w-md mx-4 animate-fade-in">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🔓</div>
                            <h2 className="text-3xl font-board-header font-bold text-board-gold mb-4 animate-shimmer-text">
                                ACCESS GRANTED
                            </h2>
                            <p className="text-board-off-white mb-6">
                                You've found the backdoor to the Syndicate.
                                <br />
                                <span className="text-board-muted-blue text-sm italic">
                                    (Admin panel coming in Phase 3)
                                </span>
                            </p>
                            <button
                                onClick={() => setShowSyndicate(false)}
                                className="px-6 py-3 bg-board-gold text-board-navy font-bold rounded-lg hover:bg-yellow-500 transition-all transform active:scale-95"
                            >
                                UNDERSTOOD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
