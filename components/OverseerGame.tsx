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
        <div className="min-h-screen bg-black text-white">
            {/* Header with Phase Info - Mobile optimized */}
            <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm border-b border-green-500/30">
                <div className="px-3 py-3 md:px-6 md:py-4">
                    <div className="flex flex-col gap-3">
                        {/* Title and Exit */}
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 truncate" style={{ fontFamily: 'monospace' }}>
                                    👁️ THE OVERSEER
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-400 truncate">
                                    Week {phaseInfo.weekNumber} • {phaseInfo.phase.toUpperCase().replace('_', ' ')}
                                </p>
                            </div>
                            <button
                                onClick={onExit}
                                className="bg-red-500 active:bg-red-600 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm min-h-[44px] transition-colors"
                            >
                                EXIT
                            </button>
                        </div>

                        {/* Quick Stats - Horizontal scroll on mobile */}
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 snap-x snap-mandatory scrollbar-hide">
                            <div className="flex-shrink-0 bg-gray-900/80 rounded-lg p-3 min-w-[280px] sm:min-w-0 sm:flex-1 snap-start border border-gray-700/50">
                                <p className="text-gray-400 text-xs mb-1">Current Phase</p>
                                <p className="text-lg sm:text-xl font-bold text-green-400 mb-1">
                                    {phaseInfo.icon} {phaseInfo.phase.toUpperCase().replace('_', ' ')}
                                </p>
                                <p className="text-xs text-gray-400 mb-1 line-clamp-2">{phaseInfo.description}</p>
                                <p className="text-xs sm:text-sm text-green-300 font-mono">
                                    {formatTime(
                                        phaseInfo.timeRemaining.hours,
                                        phaseInfo.timeRemaining.minutes,
                                        phaseInfo.timeRemaining.seconds
                                    )}
                                </p>
                            </div>

                            <div className="flex-shrink-0 bg-gray-900/80 rounded-lg p-3 min-w-[200px] sm:min-w-0 sm:flex-1 snap-start border border-gray-700/50">
                                <p className="text-gray-400 text-xs mb-1">Your Stats</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-400">{player.grit}</p>
                                <p className="text-xs text-gray-500">GRIT</p>
                                <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                                    <p>Items: {player.ownedItems.length} • Equipped: {player.equippedItems.length}/3</p>
                                    <p>Power-Ups: {player.activePowerUps.length}</p>
                                </div>
                            </div>

                            <div className="flex-shrink-0 bg-gray-900/80 rounded-lg p-3 min-w-[200px] sm:min-w-0 sm:flex-1 snap-start border border-gray-700/50">
                                <p className="text-gray-400 text-xs mb-1">This Week</p>
                                <div className="text-xs text-gray-300 space-y-1">
                                    <p className="flex justify-between">
                                        <span>Wagered:</span>
                                        <span className="text-gray-400">{player.weeklyStats.gritWagered}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Won:</span>
                                        <span className="text-green-400">+{player.weeklyStats.gritWon}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Lost:</span>
                                        <span className="text-red-400">-{player.weeklyStats.gritLost}</span>
                                    </p>
                                    <p className="flex justify-between font-semibold">
                                        <span>Win Rate:</span>
                                        <span>{player.weeklyStats.betsPlaced > 0 
                                            ? Math.round((player.weeklyStats.betsWon / player.weeklyStats.betsPlaced) * 100)
                                            : 0}%</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation - Bottom tabs on mobile */}
                <div className="border-t border-gray-800">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setCurrentView('main')}
                            className={`flex-1 min-w-[100px] px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                currentView === 'main'
                                    ? 'bg-green-500/20 text-green-400 border-green-500'
                                    : 'text-gray-400 border-transparent active:bg-gray-800'
                            }`}
                        >
                            <span className="block">📊</span>
                            <span className="block text-[10px] sm:text-xs mt-0.5">DASHBOARD</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('tribunal')}
                            className={`flex-1 min-w-[100px] px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                currentView === 'tribunal'
                                    ? 'bg-purple-500/20 text-purple-400 border-purple-500'
                                    : 'text-gray-400 border-transparent active:bg-gray-800'
                            }`}
                        >
                            <span className="block">⚖️</span>
                            <span className="block text-[10px] sm:text-xs mt-0.5">TRIBUNAL</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('bodega')}
                            className={`flex-1 min-w-[100px] px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                currentView === 'bodega'
                                    ? 'bg-green-500/20 text-green-400 border-green-500'
                                    : 'text-gray-400 border-transparent active:bg-gray-800'
                            }`}
                        >
                            <span className="block">🛍️</span>
                            <span className="block text-[10px] sm:text-xs mt-0.5">BODEGA</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('trading')}
                            className={`flex-1 min-w-[100px] px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                currentView === 'trading'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                                    : 'text-gray-400 border-transparent active:bg-gray-800'
                            }`}
                        >
                            <span className="block">🏪</span>
                            <span className="block text-[10px] sm:text-xs mt-0.5">TRADING</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-3 py-4 md:px-6 pb-safe">
                {currentView === 'main' && (
                    <div className="space-y-4">
                        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 md:p-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Week {phaseInfo.weekNumber} Overview</h2>
                            <p className="text-sm md:text-base text-gray-400 mb-4">
                                The Overseer is analyzing chat history and generating betting lines.
                            </p>
                            
                            {/* Weekly Schedule */}
                            <div className="space-y-2">
                                {weeklyScheduleService.getWeeklySchedule().map((phase, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg transition-colors ${
                                            phase.phase === phaseInfo.phase
                                                ? 'bg-green-900/50 border border-green-500'
                                                : 'bg-gray-800/50'
                                        }`}
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
