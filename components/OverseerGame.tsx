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
        <div className="min-h-screen bg-black text-white p-4">
            {/* Header with Phase Info */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-gray-900 border-4 border-green-500 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-green-400 mb-2" style={{ fontFamily: 'monospace' }}>
                                👁️ THE OVERSEER
                            </h1>
                            <p className="text-gray-400">
                                AI-Driven Social Betting Game • Week {phaseInfo.weekNumber}
                            </p>
                        </div>
                        <button
                            onClick={onExit}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        >
                            EXIT
                        </button>
                    </div>

                    {/* Current Phase */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Current Phase</p>
                            <p className="text-2xl font-bold text-green-400">
                                {phaseInfo.icon} {phaseInfo.phase.toUpperCase().replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">{phaseInfo.description}</p>
                            <p className="text-green-300 mt-2">
                                Time Remaining: {formatTime(
                                    phaseInfo.timeRemaining.hours,
                                    phaseInfo.timeRemaining.minutes,
                                    phaseInfo.timeRemaining.seconds
                                )}
                            </p>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Player Stats</p>
                            <p className="text-3xl font-bold text-green-400">{player.grit} GRIT</p>
                            <div className="text-sm text-gray-400 mt-2 space-y-1">
                                <p>Items Owned: {player.ownedItems.length}</p>
                                <p>Items Equipped: {player.equippedItems.length}/3</p>
                                <p>Active Power-Ups: {player.activePowerUps.length}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Weekly Stats</p>
                            <div className="text-sm text-gray-300 space-y-1">
                                <p>Wagered: {player.weeklyStats.gritWagered} grit</p>
                                <p className="text-green-400">Won: {player.weeklyStats.gritWon} grit</p>
                                <p className="text-red-400">Lost: {player.weeklyStats.gritLost} grit</p>
                                <p>Win Rate: {player.weeklyStats.betsPlaced > 0 
                                    ? Math.round((player.weeklyStats.betsWon / player.weeklyStats.betsPlaced) * 100)
                                    : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setCurrentView('main')}
                        className={`px-6 py-3 rounded font-bold whitespace-nowrap ${
                            currentView === 'main'
                                ? 'bg-green-500 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        📊 DASHBOARD
                    </button>
                    <button
                        onClick={() => setCurrentView('tribunal')}
                        className={`px-6 py-3 rounded font-bold whitespace-nowrap ${
                            currentView === 'tribunal'
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        ⚖️ TRIBUNAL
                    </button>
                    <button
                        onClick={() => setCurrentView('bodega')}
                        className={`px-6 py-3 rounded font-bold whitespace-nowrap ${
                            currentView === 'bodega'
                                ? 'bg-green-500 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        🛍️ BODEGA
                    </button>
                    <button
                        onClick={() => setCurrentView('trading')}
                        className={`px-6 py-3 rounded font-bold whitespace-nowrap ${
                            currentView === 'trading'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        🏪 TRADING FLOOR
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {currentView === 'main' && (
                    <div className="space-y-6">
                        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Week {phaseInfo.weekNumber} Overview</h2>
                            <p className="text-gray-400 mb-4">
                                The Overseer is analyzing chat history and generating betting lines.
                            </p>
                            
                            {/* Weekly Schedule */}
                            <div className="space-y-2">
                                {weeklyScheduleService.getWeeklySchedule().map((phase, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded ${
                                            phase.phase === phaseInfo.phase
                                                ? 'bg-green-900 border-2 border-green-500'
                                                : 'bg-gray-800'
                                        }`}
                                    >
                                        <p className="font-bold text-white">{phase.day}</p>
                                        <p className="text-sm text-gray-400">{phase.description}</p>
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
