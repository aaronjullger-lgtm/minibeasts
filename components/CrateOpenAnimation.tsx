/**
 * Crate Breach Animation - Cinematic Mystery Box Opening
 * Uses CSS animations to create a video-game style reveal
 * 
 * Stages:
 * 1. The Shake (0s - 1.5s): Box rattles violently
 * 2. The Breach (1.5s - 1.7s): Flash and scale up
 * 3. The Reveal (1.7s+): Item card fades in with rarity effects
 */

import React, { useState, useEffect } from 'react';
import { LoreItem } from '../types';

interface CrateOpenAnimationProps {
    item: LoreItem;
    onComplete: () => void;
}

export const CrateOpenAnimation: React.FC<CrateOpenAnimationProps> = ({ item, onComplete }) => {
    const [stage, setStage] = useState<'shake' | 'breach' | 'reveal'>('shake');

    useEffect(() => {
        // Stage 1: Shake (0s - 1.5s)
        // TODO: Play Sound - Rattling/shaking sound
        
        const shakeTimer = setTimeout(() => {
            // Stage 2: Breach (1.5s - 1.7s)
            // TODO: Play Sound - Explosion/breach sound
            setStage('breach');
        }, 1500);

        const revealTimer = setTimeout(() => {
            // Stage 3: Reveal (1.7s+)
            // TODO: Play Sound - Fanfare/reveal sound (louder for Grail)
            setStage('reveal');
        }, 1700);

        return () => {
            clearTimeout(shakeTimer);
            clearTimeout(revealTimer);
        };
    }, []);

    const isGrail = item.rarity === 'grail';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-board-navy">
            {/* Stage 1: The Shake */}
            {stage === 'shake' && (
                <div className="animate-shake">
                    <div className="text-[120px] sm:text-[180px] md:text-[240px]">
                        📦
                    </div>
                </div>
            )}

            {/* Stage 2: The Breach - White Flash */}
            {stage === 'breach' && (
                <>
                    <div className="absolute inset-0 bg-white animate-breach-flash" />
                    <div className="text-[180px] sm:text-[240px] md:text-[320px] animate-breach-scale">
                        📦
                    </div>
                </>
            )}

            {/* Stage 3: The Reveal */}
            {stage === 'reveal' && (
                <div className="animate-fade-in flex flex-col items-center justify-center p-4 max-w-lg w-full">
                    {/* Item Card */}
                    <div 
                        className={`relative bg-gray-900 border-4 rounded-lg p-6 sm:p-8 w-full ${
                            isGrail 
                                ? 'border-board-gold shadow-[0_0_40px_rgba(212,175,55,0.6)]' 
                                : item.rarity === 'heat'
                                ? 'border-board-red shadow-[0_0_20px_rgba(255,51,51,0.4)]'
                                : 'border-board-muted-blue'
                        }`}
                    >
                        {/* Rarity Badge */}
                        <div className={`text-center mb-4 ${isGrail ? 'animate-shimmer' : ''}`}>
                            <span 
                                className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    isGrail 
                                        ? 'bg-board-gold text-board-navy'
                                        : item.rarity === 'heat'
                                        ? 'bg-board-red text-white'
                                        : item.rarity === 'mid'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-500 text-white'
                                }`}
                            >
                                {item.rarity === 'grail' ? '⭐ GRAIL ⭐' : item.rarity === 'heat' ? '🔥 HEAT' : item.rarity === 'mid' ? '📦 MID' : '🧱 BRICK'}
                            </span>
                        </div>

                        {/* Item Emoji/Image */}
                        <div className="text-center mb-6">
                            <div className={`text-[80px] sm:text-[100px] ${isGrail ? 'animate-float-slow' : ''}`}>
                                {item.name.split(' ')[0]}
                            </div>
                        </div>

                        {/* Item Name */}
                        <h2 
                            className={`text-2xl sm:text-3xl font-board-header font-bold text-center mb-3 ${
                                isGrail 
                                    ? 'text-board-gold animate-shimmer-text' 
                                    : 'text-board-off-white'
                            }`}
                        >
                            {item.name.split(' ').slice(1).join(' ')}
                        </h2>

                        {/* Item Description */}
                        <p className="text-board-off-white text-center mb-4 opacity-80">
                            {item.description}
                        </p>

                        {/* Item Lore */}
                        <p className="text-board-muted-blue text-center text-sm italic mb-6 px-2">
                            "{item.lore}"
                        </p>

                        {/* Stats/Bonuses */}
                        {item.passiveBonus && (
                            <div className="bg-board-navy border border-board-muted-blue rounded p-3 mb-6">
                                <p className="text-board-off-white text-sm text-center">
                                    {item.passiveBonus.payoutMultiplier && (
                                        <span className="font-bold text-board-gold">
                                            +{((item.passiveBonus.payoutMultiplier - 1) * 100).toFixed(0)}% Grit Earnings
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Stash Button */}
                        <button
                            onClick={onComplete}
                            className={`w-full py-4 px-6 rounded font-bold text-lg uppercase tracking-wider transition-all transform active:scale-95 ${
                                isGrail
                                    ? 'bg-board-gold text-board-navy hover:bg-yellow-500 shadow-lg shadow-board-gold/50'
                                    : 'bg-board-red text-white hover:bg-red-600'
                            }`}
                            style={{ 
                                transition: 'transform 0.1s ease',
                            }}
                        >
                            🎒 STASH ITEM
                        </button>
                    </div>

                    {/* Grail Effects - Particles/Sparkles */}
                    {isGrail && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-board-gold rounded-full animate-sparkle"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${2 + Math.random() * 2}s`
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add custom animations to global styles */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    10% { transform: translateX(-10px) rotate(-5deg); }
                    20% { transform: translateX(10px) rotate(5deg); }
                    30% { transform: translateX(-10px) rotate(-5deg); }
                    40% { transform: translateX(10px) rotate(5deg); }
                    50% { transform: translateX(-10px) rotate(-5deg); }
                    60% { transform: translateX(10px) rotate(5deg); }
                    70% { transform: translateX(-10px) rotate(-5deg); }
                    80% { transform: translateX(10px) rotate(5deg); }
                    90% { transform: translateX(-10px) rotate(-5deg); }
                }

                @keyframes breach-flash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @keyframes breach-scale {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.5); }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes shimmer {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes shimmer-text {
                    0%, 100% { 
                        text-shadow: 0 0 10px rgba(212, 175, 55, 0.8),
                                     0 0 20px rgba(212, 175, 55, 0.6),
                                     0 0 30px rgba(212, 175, 55, 0.4);
                    }
                    50% { 
                        text-shadow: 0 0 20px rgba(212, 175, 55, 1),
                                     0 0 30px rgba(212, 175, 55, 0.8),
                                     0 0 40px rgba(212, 175, 55, 0.6);
                    }
                }

                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes sparkle {
                    0%, 100% { 
                        opacity: 0; 
                        transform: translateY(0) scale(0);
                    }
                    50% { 
                        opacity: 1; 
                        transform: translateY(-50px) scale(1);
                    }
                }

                .animate-shake {
                    animation: shake 1.5s ease-in-out;
                }

                .animate-breach-flash {
                    animation: breach-flash 0.2s ease-out;
                }

                .animate-breach-scale {
                    animation: breach-scale 0.2s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }

                .animate-shimmer-text {
                    animation: shimmer-text 2s ease-in-out infinite;
                }

                .animate-float-slow {
                    animation: float-slow 3s ease-in-out infinite;
                }

                .animate-sparkle {
                    animation: sparkle 3s ease-out infinite;
                }
            `}</style>
        </div>
    );
};
