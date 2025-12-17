/**
 * Overseer Game Mode - Main Screen
 * 
 * The AI-driven social betting game with weekly phases
 */

import React, { useState, useEffect } from 'react';
import { OverseerPlayerState, TribunalSuperlative, SquadRideParlay, TradeOffer, LoreItem } from '../types';
import { weeklyScheduleService } from '../services/weeklyScheduleService';
import { overseerService } from '../services/overseerService';
import { bettingService } from '../services/bettingService';
import { mysteryBoxService } from '../services/mysteryBoxService';
import { gulagService } from '../services/gulagService';
import { BodegaShop } from './BodegaShop';
import { TradingFloor } from './TradingFloor';
import { TribunalPanel } from './TribunalPanel';

interface OverseerGameProps {
    initialPlayer: OverseerPlayerState;
    onExit: () => void;
}

export const OverseerGame: React.FC<OverseerGameProps> = ({ initialPlayer, onExit }) => {
    const [player, setPlayer] = useState<OverseerPlayerState>(initialPlayer);
    const [currentView, setCurrentView] = useState<'main' | 'bodega' | 'trading' | 'tribunal'>('main');
    const [phaseInfo, setPhaseInfo] = useState(weeklyScheduleService.getPhaseInfo());
    const [superlatives, setSuperlatives] = useState<TribunalSuperlative[]>([]);
    const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);

    // Update phase info every second
    useEffect(() => {
        const interval = setInterval(() => {
            setPhaseInfo(weeklyScheduleService.getPhaseInfo());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Check for bankruptcy
    useEffect(() => {
        if (gulagService.checkBankruptcy(player)) {
            alert('💀 BANKRUPT! You have been sent to THE GULAG!');
        }
    }, [player.grit]);

    // Handle phase transitions
    useEffect(() => {
        const checkPhase = async () => {
            if (phaseInfo.phase === 'lines_drop') {
                // Generate superlatives on Thursday
                const generated = await overseerService.generateWeeklySuperlatives(phaseInfo.weekNumber);
                setSuperlatives(generated);
            }
        };

        checkPhase();
    }, [phaseInfo.phase]);

    const handlePurchaseBox = (boxId: string, pulledItem: LoreItem) => {
        const box = mysteryBoxService.openMysteryBox(boxId);
        if (box) {
            setPlayer(prev => ({
                ...prev,
                grit: prev.grit - 50, // Cost deducted
                ownedItems: [...prev.ownedItems, pulledItem]
            }));
        }
    };

    const handleListItem = (itemId: string, price: number) => {
        const offer = mysteryBoxService.listItemForTrade(
            player.id,
            player.name,
            itemId,
            price
        );
        
        setTradeOffers(prev => [...prev, offer]);
        
        // Remove from player inventory (it's listed now)
        setPlayer(prev => ({
            ...prev,
            ownedItems: prev.ownedItems.filter(i => i.id !== itemId)
        }));
    };

    const handlePurchaseItem = (offerId: string) => {
        const result = mysteryBoxService.purchaseFromTradingFloor(offerId, player.id, player.grit);
        
        if (result.success) {
            const offer = tradeOffers.find(o => o.id === offerId);
            if (offer) {
                const item = mysteryBoxService.getItemById(offer.itemId);
                if (item) {
                    setPlayer(prev => ({
                        ...prev,
                        grit: prev.grit - (offer.price + result.houseTax),
                        ownedItems: [...prev.ownedItems, item]
                    }));
                }
            }
        }
    };

    const handleCancelListing = (offerId: string) => {
        const cancelled = mysteryBoxService.cancelTradeListing(offerId, player.id);
        if (cancelled) {
            setTradeOffers(prev => prev.filter(o => o.id !== offerId));
        }
    };

    const handlePlaceTribunalBet = (superlativeId: string, nomineeId: string, wager: number, odds: number) => {
        try {
            bettingService.placeTribunalBet(player, superlativeId, nomineeId, wager, odds);
            setPlayer({ ...player });
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to place bet');
        }
    };

    const handleVote = (superlativeId: string, nomineeId: string) => {
        const superlative = superlatives.find(s => s.id === superlativeId);
        if (superlative) {
            try {
                bettingService.voteInTribunal(superlative, player.id, nomineeId);
                setSuperlatives([...superlatives]);
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Failed to vote');
            }
        }
    };

    const formatTime = (hours: number, minutes: number, seconds: number): string => {
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Check if player is in Gulag
    const inGulag = gulagService.isInGulag(player);
    const isBanned = gulagService.isBanned(player);

    if (inGulag || isBanned) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-gray-900 border-4 border-red-500 rounded-lg p-8 text-center">
                    <h1 className="text-6xl font-bold text-red-500 mb-4">
                        ⛓️ THE GULAG ⛓️
                    </h1>
                    <p className="text-2xl text-white mb-6">
                        You went bankrupt and have been imprisoned.
                    </p>
                    
                    {isBanned ? (
                        <div>
                            <p className="text-xl text-gray-400 mb-4">
                                You lost your redemption bet.
                            </p>
                            <p className="text-lg text-red-400 mb-4">
                                Ban Time Remaining: {gulagService.getRemainingBanTime(player)} hours
                            </p>
                            {player.gulagState?.gulagBet?.irlPunishment && (
                                <p className="text-yellow-400 mb-4">
                                    IRL Punishment: {player.gulagState.gulagBet.irlPunishment}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-xl text-gray-400 mb-6">
                                Your only way out: Win the Gulag Bet
                            </p>
                            <button
                                onClick={async () => {
                                    const bet = await gulagService.generateGulagBet(player);
                                    alert(`Your Gulag Bet: ${bet.description}\nOdds: +${bet.odds}\nWin to earn ${bet.redemptionAmount} grit and freedom!`);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded text-xl"
                            >
                                GENERATE GULAG BET
                            </button>
                        </div>
                    )}

                    <button
                        onClick={onExit}
                        className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded"
                    >
                        Exit to Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            {/* Cinematic Clean Professional Header with Glassmorphism */}
            <div className="sticky top-0 z-20 glass-card border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title Bar - Cinematic Entry */}
                    <div className="flex justify-between items-center py-4 cinematic-enter">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg glow-green">
                                <span className="text-2xl sm:text-3xl">👁️</span>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white">
                                    The Overseer
                                </h1>
                                <p className="text-xs text-gray-400">
                                    Week {phaseInfo.weekNumber} • {phaseInfo.phase.toUpperCase().replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onExit}
                            className="btn-glow focus-ring px-4 py-2 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all min-h-[44px] border border-gray-700/50"
                        >
                            Menu
                        </button>
                    </div>

                    {/* Stats Cards - Cinematic with Glassmorphism and Staggered Entry */}
                    <div className="grid grid-cols-3 gap-3 pb-4">
                        <div className="glass-card rounded-lg p-3 border border-gray-700/50 cinematic-enter cinematic-enter-delay-1 glow-green">
                            <p className="text-xs text-gray-500 mb-1">Phase</p>
                            <p className="text-sm font-bold text-green-400">{phaseInfo.icon} {phaseInfo.phase.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                                {formatTime(
                                    phaseInfo.timeRemaining.hours,
                                    phaseInfo.timeRemaining.minutes,
                                    phaseInfo.timeRemaining.seconds
                                )}
                            </p>
                        </div>

                        <div className="glass-card rounded-lg p-3 border border-gray-700/50 cinematic-enter cinematic-enter-delay-2 glow-blue">
                            <p className="text-xs text-gray-500 mb-1">Grit</p>
                            <p className="text-2xl font-bold text-green-400">{player.grit}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {player.ownedItems.length} items
                            </p>
                        </div>

                        <div className="glass-card rounded-lg p-3 border border-gray-700/50 cinematic-enter cinematic-enter-delay-3 glow-purple">
                            <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {player.weeklyStats.betsPlaced > 0 
                                    ? Math.round((player.weeklyStats.betsWon / player.weeklyStats.betsPlaced) * 100)
                                    : 0}%
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {player.weeklyStats.betsPlaced} bets
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs - Cinematic with Smooth Transitions */}
                    <div className="flex border-t border-gray-800/50 cinematic-enter cinematic-enter-delay-4">
                        <button
                            onClick={() => setCurrentView('main')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring ${
                                currentView === 'main'
                                    ? 'text-green-400 border-b-2 border-green-500 glow-green'
                                    : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
                            }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setCurrentView('tribunal')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring ${
                                currentView === 'tribunal'
                                    ? 'text-purple-400 border-b-2 border-purple-500 glow-purple'
                                    : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
                            }`}
                        >
                            Tribunal
                        </button>
                        <button
                            onClick={() => setCurrentView('bodega')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring ${
                                currentView === 'bodega'
                                    ? 'text-blue-400 border-b-2 border-blue-500 glow-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
                            }`}
                        >
                            Bodega
                        </button>
                        <button
                            onClick={() => setCurrentView('trading')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring ${
                                currentView === 'trading'
                                    ? 'text-orange-400 border-b-2 border-orange-500 glow-orange'
                                    : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'
                            }`}
                        >
                            Trading
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content with Cinematic Animations */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {currentView === 'main' && (
                    <div className="space-y-4">
                        <div className="glass-card rounded-lg p-4 md:p-6 border border-gray-700/50 cinematic-enter cinematic-enter-delay-5">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Week {phaseInfo.weekNumber} Overview</h2>
                            <p className="text-sm md:text-base text-gray-400 mb-4">
                                The Overseer is analyzing chat history and generating betting lines.
                            </p>
                            
                            {/* Weekly Schedule with Staggered Animations */}
                            <div className="space-y-2">
                                {weeklyScheduleService.getWeeklySchedule().map((phase, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg transition-all glass-card btn-glow cinematic-enter ${
                                            phase.phase === phaseInfo.phase
                                                ? 'border-green-500 glow-green'
                                                : 'border-gray-700/30'
                                        }`}
                                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                                    >
                                        <p className="text-sm md:text-base font-semibold text-white">{phase.day}</p>
                                        <p className="text-xs md:text-sm text-gray-400 mt-1">{phase.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'tribunal' && (
                    <TribunalPanel
                        superlatives={superlatives}
                        player={player}
                        onPlaceBet={handlePlaceTribunalBet}
                        onVote={handleVote}
                        votingOpen={phaseInfo.phase === 'climax'}
                        bettingOpen={phaseInfo.phase === 'action' || phaseInfo.phase === 'climax'}
                    />
                )}
            </div>

            {/* Modals */}
            {currentView === 'bodega' && (
                <BodegaShop
                    player={player}
                    onPurchase={handlePurchaseBox}
                    onClose={() => setCurrentView('main')}
                />
            )}

            {currentView === 'trading' && (
                <TradingFloor
                    player={player}
                    allOffers={tradeOffers}
                    onListItem={handleListItem}
                    onPurchaseItem={handlePurchaseItem}
                    onCancelListing={handleCancelListing}
                    onClose={() => setCurrentView('main')}
                />
            )}
        </div>
    );
};
