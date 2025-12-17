/**
 * The Board Component
 * 
 * Main betting board with:
 * - Stadium lighting gradient background
 * - Action feed ticker
 * - Ambush bets with information asymmetry
 * - All betting types in one view
 */

import React, { useState, useEffect } from 'react';
import { OverseerPlayerState, AmbushBet } from '../types';
import { ActionFeed, ActionFeedMessage, generateBetNotification } from './ActionFeed';
import { AmbushBetCard } from './AmbushBetCard';
import { bettingService } from '../services/bettingService';

interface TheBoardProps {
    player: OverseerPlayerState;
    onPlaceAmbushBet: (
        targetUserId: string,
        targetUserName: string,
        description: string,
        category: 'social' | 'behavior' | 'prop',
        odds: number,
        wager: number
    ) => void;
    allPlayers: OverseerPlayerState[]; // All players for targeting
    globalAmbushBets: AmbushBet[]; // All ambush bets in the system
}

export const TheBoard: React.FC<TheBoardProps> = ({ 
    player, 
    onPlaceAmbushBet,
    allPlayers,
    globalAmbushBets
}) => {
    const [actionFeedMessages, setActionFeedMessages] = useState<ActionFeedMessage[]>([]);
    const [showBetSlip, setShowBetSlip] = useState(false);
    const [betSlipData, setBetSlipData] = useState({
        targetUserId: '',
        targetUserName: '',
        description: '',
        category: 'social' as 'social' | 'behavior' | 'prop',
        odds: 150,
        wager: 50
    });

    // Get filtered ambush bets for current user
    const { bettorBets, targetBets } = bettingService.getAmbushBetsForUser(
        player.id,
        globalAmbushBets
    );

    // Add feed messages when bets are placed
    useEffect(() => {
        if (globalAmbushBets.length > 0) {
            const latestBet = globalAmbushBets[globalAmbushBets.length - 1];
            // Only add if it's a recent bet (within last 10 seconds)
            if (Date.now() - latestBet.createdAt < 10000) {
                const message = generateBetNotification(
                    latestBet.wager,
                    'ambush',
                    latestBet.category
                );
                setActionFeedMessages(prev => [...prev, message]);
            }
        }
    }, [globalAmbushBets]);

    const handlePlaceBet = () => {
        if (!betSlipData.targetUserId || !betSlipData.description) {
            alert('Please select a target and enter a bet description');
            return;
        }

        if (betSlipData.wager > player.grit) {
            alert('Insufficient grit');
            return;
        }

        try {
            onPlaceAmbushBet(
                betSlipData.targetUserId,
                betSlipData.targetUserName,
                betSlipData.description,
                betSlipData.category,
                betSlipData.odds,
                betSlipData.wager
            );

            // Reset bet slip
            setBetSlipData({
                targetUserId: '',
                targetUserName: '',
                description: '',
                category: 'social',
                odds: 150,
                wager: 50
            });
            setShowBetSlip(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to place bet');
        }
    };

    const calculatePotentialPayout = (): number => {
        const { wager, odds } = betSlipData;
        if (odds > 0) {
            return Math.floor(wager + (wager * odds / 100));
        } else {
            return Math.floor(wager + (wager * 100 / Math.abs(odds)));
        }
    };

    return (
        <div className="min-h-screen bg-stadium-gradient">
            {/* Action Feed Ticker */}
            <ActionFeed messages={actionFeedMessages} />

            {/* Main Board Container */}
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-board-header italic text-board-off-white mb-2 tracking-wider">
                        THE BOARD
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        High-stakes betting • Information asymmetry • Real-time action
                    </p>
                    
                    {/* Grit Balance */}
                    <div className="mt-4 inline-block bg-black/60 border-2 border-board-red rounded-lg px-6 py-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Your Balance
                        </div>
                        <div className="text-3xl font-board-grit font-bold text-board-red">
                            {player.grit.toLocaleString()} GRIT
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setShowBetSlip(!showBetSlip)}
                        className="bg-board-red hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all transform hover:scale-105"
                    >
                        🎯 PLACE AMBUSH BET
                    </button>
                </div>

                {/* Bet Slip (Sliding from bottom on mobile) */}
                {showBetSlip && (
                    <div className="fixed inset-x-0 bottom-0 md:relative md:inset-auto z-50 animate-slide-up">
                        <div className="bg-board-off-white border-t-4 md:border-4 border-board-red rounded-t-2xl md:rounded-lg p-6 shadow-2xl max-w-2xl mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-board-header italic text-gray-800">
                                    🎯 Ambush Bet Slip
                                </h3>
                                <button
                                    onClick={() => setShowBetSlip(false)}
                                    className="text-gray-600 hover:text-gray-800 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Target Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        TARGET
                                    </label>
                                    <select
                                        value={betSlipData.targetUserId}
                                        onChange={(e) => {
                                            const selectedPlayer = allPlayers.find(p => p.id === e.target.value);
                                            setBetSlipData({
                                                ...betSlipData,
                                                targetUserId: e.target.value,
                                                targetUserName: selectedPlayer?.name || ''
                                            });
                                        }}
                                        className="w-full border-2 border-board-muted-blue rounded px-3 py-2 bg-white"
                                    >
                                        <option value="">Select a target...</option>
                                        {allPlayers
                                            .filter(p => p.id !== player.id)
                                            .map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        CATEGORY
                                    </label>
                                    <div className="flex gap-2">
                                        {(['social', 'behavior', 'prop'] as const).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setBetSlipData({ ...betSlipData, category: cat })}
                                                className={`px-4 py-2 rounded font-bold text-xs uppercase ${
                                                    betSlipData.category === cat
                                                        ? 'bg-board-red text-white'
                                                        : 'bg-gray-300 text-gray-700'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        SNITCH WIRE (What are you betting on?)
                                    </label>
                                    <textarea
                                        value={betSlipData.description}
                                        onChange={(e) => setBetSlipData({ ...betSlipData, description: e.target.value })}
                                        placeholder="e.g., Will mention the Ravens 3x today?"
                                        className="w-full border-2 border-board-muted-blue rounded px-3 py-2 h-20 resize-none"
                                    />
                                </div>

                                {/* Odds and Wager */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            ODDS
                                        </label>
                                        <input
                                            type="number"
                                            value={betSlipData.odds}
                                            onChange={(e) => setBetSlipData({ ...betSlipData, odds: parseInt(e.target.value) || 0 })}
                                            className="w-full border-2 border-board-muted-blue rounded px-3 py-2 font-board-grit"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            WAGER (GRIT)
                                        </label>
                                        <input
                                            type="number"
                                            value={betSlipData.wager}
                                            onChange={(e) => setBetSlipData({ ...betSlipData, wager: parseInt(e.target.value) || 0 })}
                                            className="w-full border-2 border-board-muted-blue rounded px-3 py-2 font-board-grit"
                                        />
                                    </div>
                                </div>

                                {/* Payout Preview */}
                                <div className="bg-gray-100 rounded p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-700">
                                            Potential Payout:
                                        </span>
                                        <span className="text-lg font-board-grit font-bold text-green-600">
                                            {calculatePotentialPayout().toLocaleString()} GRIT
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handlePlaceBet}
                                    className="w-full bg-board-red hover:bg-red-600 text-white font-bold py-3 rounded-lg text-lg transition-all transform hover:scale-105"
                                >
                                    PLACE BET
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Your Ambush Bets */}
                    <div>
                        <h2 className="text-2xl font-board-header italic text-board-off-white mb-4">
                            🎯 Your Ambush Bets
                        </h2>
                        <div className="space-y-4">
                            {bettorBets.length === 0 ? (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-500">
                                    No ambush bets placed yet
                                </div>
                            ) : (
                                bettorBets.map(bet => (
                                    <AmbushBetCard
                                        key={bet.id}
                                        bet={bet}
                                        isTarget={false}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Shadow Locks (Bets Against You) */}
                    <div>
                        <h2 className="text-2xl font-board-header italic text-board-off-white mb-4">
                            🔒 Shadow Locks
                        </h2>
                        <div className="space-y-4">
                            {targetBets.betCount === 0 || targetBets.bets.length === 0 ? (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-500">
                                    No shadow locks detected
                                </div>
                            ) : (
                                <AmbushBetCard
                                    bet={targetBets.bets[0] as AmbushBet}
                                    isTarget={true}
                                    totalGritAgainstTarget={targetBets.totalGritAgainst}
                                    targetBetCount={targetBets.betCount}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </div>
    );
};
