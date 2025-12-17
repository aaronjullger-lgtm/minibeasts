/**
 * Gulag Lockout Screen
 * 
 * Displays when player hits 0 grit:
 * - Static/noise filter overlay
 * - Disabled betting interfaces
 * - Profile card with "LOCKED" stamp
 * - Hail Mary redemption interface
 * - Bailout option for friends
 */

import React, { useState } from 'react';
import { OverseerPlayerState, GulagBet } from '../types';
import { gulagService } from '../services/gulagService';

interface GulagLockoutScreenProps {
    player: OverseerPlayerState;
    onGenerateHailMary: () => void;
    onExit: () => void;
}

export const GulagLockoutScreen: React.FC<GulagLockoutScreenProps> = ({
    player,
    onGenerateHailMary,
    onExit
}) => {
    const [showRapSheet, setShowRapSheet] = useState(false);
    const lockoutState = gulagService.getLockoutUIState(player);
    const isBanned = gulagService.isBanned(player);

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--deep-navy)' }}>
            {/* Static/Noise Filter Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full animate-static" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                    animation: 'static 0.5s steps(1) infinite'
                }}></div>
            </div>

            {/* Main Content - Centered Card */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    {/* The Cell - Profile Card with LOCKED Stamp */}
                    <div className="bg-gray-900 border-8 border-board-crimson rounded-lg overflow-hidden">
                        {/* LOCKED Stamp */}
                        <div className="relative bg-board-crimson py-6 text-center">
                            <div className="absolute inset-0 opacity-30" style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)'
                            }}></div>
                            <h1 className="text-6xl font-board-header italic text-board-off-white relative animate-pulse">
                                🔒 LOCKED
                            </h1>
                            <p className="text-xl text-board-off-white mt-2 relative">
                                {isBanned ? 'BANNED' : 'THE GULAG'}
                            </p>
                        </div>

                        {/* Profile Info */}
                        <div className="p-8 border-b-4 border-board-crimson bg-gray-800">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-full bg-board-crimson flex items-center justify-center text-4xl">
                                    {player.characterId === 'eric' ? '🦅' : 
                                     player.characterId === 'wyatt' ? '🐦‍⬛' :
                                     player.characterId === 'alex' ? '🦁' :
                                     player.characterId === 'colin' ? '🐻' :
                                     player.characterId === 'spencer' ? '👑' : '🎯'}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-board-off-white">{player.name}</h2>
                                    <p className="text-lg text-gray-400">Prisoner #{player.gulagState?.previousBankruptcies || 0 + 1}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-black/40 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-board-grit font-bold text-board-crimson">
                                        {player.grit}
                                    </div>
                                    <div className="text-xs text-gray-500">GRIT</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-board-grit font-bold text-red-400">
                                        {player.gulagState?.previousBankruptcies || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">BANKRUPTCIES</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-board-grit font-bold text-orange-400">
                                        {isBanned ? lockoutState.banTimeRemaining || 0 : 0}h
                                    </div>
                                    <div className="text-xs text-gray-500">BAN TIME</div>
                                </div>
                            </div>
                        </div>

                        {/* Hail Mary Interface or Ban Message */}
                        <div className="p-8 bg-gray-900">
                            {isBanned ? (
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold text-board-red">
                                        ⏰ SERVING TIME
                                    </h3>
                                    <p className="text-gray-300">
                                        You lost your redemption bet.
                                    </p>
                                    <div className="bg-board-crimson/20 border-2 border-board-crimson rounded-lg p-4">
                                        <p className="text-lg text-board-red font-bold">
                                            Ban Expires In: {lockoutState.banTimeRemaining} hours
                                        </p>
                                        {player.gulagState?.irlPunishment && (
                                            <p className="text-yellow-400 mt-2">
                                                IRL Punishment: {player.gulagState.irlPunishment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-3xl font-board-header italic text-board-off-white mb-2">
                                            THE HAIL MARY
                                        </h3>
                                        <p className="text-gray-400">
                                            Your only way out: Win this high-risk bet
                                        </p>
                                    </div>

                                    {player.gulagState?.gulagBet ? (
                                        <div className="bg-black/60 border-2 border-board-red rounded-lg p-6">
                                            <div className="flex items-start gap-3 mb-4">
                                                <span className="text-3xl">🎯</span>
                                                <div className="flex-1">
                                                    <p className="text-lg text-board-off-white font-semibold mb-2">
                                                        {player.gulagState.gulagBet.description}
                                                    </p>
                                                    <div className="flex gap-4">
                                                        <div>
                                                            <span className="text-sm text-gray-500">Odds:</span>
                                                            <span className="text-lg font-bold text-green-400 ml-2">
                                                                +{player.gulagState.gulagBet.odds}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-500">Win:</span>
                                                            <span className="text-lg font-bold text-yellow-400 ml-2">
                                                                {player.gulagState.gulagBet.redemptionAmount} GRIT + FREEDOM
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 italic">
                                                Awaiting Commish confirmation...
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={onGenerateHailMary}
                                            className="w-full bg-board-red hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105"
                                        >
                                            🎲 GENERATE HAIL MARY
                                        </button>
                                    )}

                                    {/* Bailout Available Notice */}
                                    {lockoutState.bailoutAvailable && (
                                        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 text-center">
                                            <p className="text-sm text-yellow-400">
                                                💰 Friends can bail you out for 2,000+ grit
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rap Sheet */}
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowRapSheet(!showRapSheet)}
                                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded transition-colors text-sm"
                                >
                                    {showRapSheet ? '▼' : '▶'} Rap Sheet (History of Shame)
                                </button>
                                {showRapSheet && (
                                    <div className="mt-2 bg-black/60 rounded p-4 max-h-40 overflow-y-auto">
                                        {player.gulagState?.rapSheet && player.gulagState.rapSheet.length > 0 ? (
                                            <ul className="space-y-1 text-xs text-gray-400">
                                                {player.gulagState.rapSheet.map((entry, i) => (
                                                    <li key={i}>• {entry}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">No previous entries</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Exit Button */}
                            <button
                                onClick={onExit}
                                className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
                            >
                                Exit to Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes static {
                    0% { transform: translate(0, 0); }
                    10% { transform: translate(-5%, -5%); }
                    20% { transform: translate(-10%, 5%); }
                    30% { transform: translate(5%, -10%); }
                    40% { transform: translate(-5%, 15%); }
                    50% { transform: translate(-10%, 5%); }
                    60% { transform: translate(15%, 0); }
                    70% { transform: translate(0, 10%); }
                    80% { transform: translate(-15%, 0); }
                    90% { transform: translate(10%, 5%); }
                    100% { transform: translate(5%, 0); }
                }
                
                .animate-static {
                    animation: static 0.5s steps(1) infinite;
                }
            `}</style>
        </div>
    );
};
