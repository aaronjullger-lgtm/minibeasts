/**
 * The Board Component
 * 
 * Main betting board with:
 * - Stadium lighting gradient background
 * - Action feed ticker
 * - Ambush bets with information asymmetry
 * - All betting types in one view
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OverseerPlayerState, AmbushBet } from '../types';
import { ActionFeed, ActionFeedMessage, generateBetNotification } from './ActionFeed';
import { AmbushBetCard } from './AmbushBetCard';
import { bettingService } from '../services/bettingService';
import { ThermalReceipt } from './ThermalReceipt';

const DIGIT_HEIGHT = 32;
const ANIMATION_DURATION = 600;
const ANIMATION_SECONDS = ANIMATION_DURATION / 1000;

const OdometerDisplay: React.FC<{ value: number }> = ({ value }) => {
    const digits = value.toLocaleString().split('');

    return (
        <div className="flex items-end gap-[6px] font-board-grit text-board-red">
            {digits.map((char, idx) => char === ',' ? (
                <span key={`comma-${idx}`} className="text-lg text-board-off-white/70">,</span>
            ) : (
                <div key={`digit-${idx}`} className="relative overflow-hidden h-8 w-5 bg-black/50 border border-board-muted-blue/40 rounded-sm">
                    <div
                        className="flex flex-col transition-transform ease-out"
                        style={{ 
                            transform: `translateY(-${Number(char) * DIGIT_HEIGHT}px)`,
                            transitionDuration: `${ANIMATION_DURATION}ms`
                        }}
                    >
                        {Array.from({ length: 10 }).map((_, digit) => (
                            <span
                                key={digit}
                                className="flex items-center justify-center text-lg leading-none text-board-off-white/90"
                                style={{ height: `${DIGIT_HEIGHT}px` }}
                            >
                                {digit}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
            <span className="ml-2 text-sm text-board-off-white/70 tracking-tight">
                GRIT
            </span>
        </div>
    );
};

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
    const [shake, setShake] = useState(false);
    const [showStamp, setShowStamp] = useState(false);
    const timeouts = useRef<number[]>([]);
    const receiptLines = useMemo(() => {
        const stake = Math.max(25, Math.min(player.grit, 1500));
        const potential = Math.max(stake * 3, 500);
        return [
            { label: 'BETTOR', value: player.name || 'OPERATOR' },
            { label: 'TICKET', value: `AMB-${String(bettorBets.length + 1).padStart(3, '0')}` },
            { label: 'STAKE', value: `${stake.toLocaleString()} GRIT` },
            { label: 'ODDS', value: '+750 PARLAY' },
            { label: 'PAYOUT', value: `${potential.toLocaleString()} GRIT` },
        ];
    }, [player.name, player.grit, bettorBets.length]);

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

    useEffect(() => {
        return () => {
            timeouts.current.forEach(clearTimeout);
        };
    }, []);

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

            setShake(true);
            setShowStamp(true);
            timeouts.current.push(window.setTimeout(() => {
                setShake(false);
                setShowStamp(false);
            }, ANIMATION_DURATION));

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
        <div className={`min-h-screen bg-stadium-gradient ${shake ? 'shake-animation' : ''}`}>
            {showStamp && (
                <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
                    <div className="stamp-confirmation">
                        <span className="font-board-grit text-board-off-white tracking-tight text-sm">
                            Bet Stamped
                        </span>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-4 lg:py-8">
                <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border border-white/5 rounded-sm p-4 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-board-off-white/60">COMMAND HUD</div>
                        <button
                            onClick={() => setShowBetSlip(!showBetSlip)}
                            className="hidden md:inline-flex items-center gap-2 bg-board-red text-white px-4 py-2 rounded-sm text-sm font-semibold board-red-glow"
                        >
                            PLACE BET
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-board-off-white">
                        <div className="bg-white/5 border border-white/10 rounded-sm p-3">
                            <div className="text-[9px] uppercase tracking-[0.18em] text-board-off-white/60">USER_ID</div>
                            <div className="text-sm font-board-grit">{player.name || 'Operator'}</div>
                            <div className="text-[11px] text-board-off-white/60 font-board-grit">RANK {player.rank ?? 0}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-right">
                            <div className="text-[9px] uppercase tracking-[0.18em] text-board-off-white/60">PHASE</div>
                            <div className="text-sm font-board-grit">SURVEILLANCE</div>
                            <div className="text-[11px] text-board-off-white/60 font-board-grit">LIVE</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-sm p-3">
                            <div className="text-[9px] uppercase tracking-[0.18em] text-board-off-white/60">TERMINAL_CREDIT</div>
                            <OdometerDisplay value={player.grit} />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-right">
                            <div className="text-[9px] uppercase tracking-[0.18em] text-board-off-white/60">ACTIVE_BETS</div>
                            <div className="text-xl font-board-grit text-board-off-white">
                                {(bettorBets.length + targetBets.betCount).toLocaleString()}
                            </div>
                            <div className="text-[11px] text-board-off-white/60 font-board-grit">AMBUSH GRID</div>
                        </div>
                    </div>
                </div>

                {/* Layout: main board + sidebar */}
                <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bet Slip trigger mobile */}
                        <div className="flex justify-center mb-4 md:hidden">
                            <button
                                onClick={() => setShowBetSlip(!showBetSlip)}
                                className="bg-board-red hover:bg-red-600 text-white font-bold py-3 px-6 rounded-sm text-sm shadow-lg transition-all board-red-glow w-full"
                            >
                                PLACE AMBUSH BET
                            </button>
                        </div>

                        {/* Bet Slip Bottom Sheet */}
                        {showBetSlip && (
                            <div className="fixed inset-x-0 bottom-0 md:relative md:inset-auto z-50 animate-slide-up">
                                <div className="bg-board-off-white border-t-4 md:border-4 border-board-red rounded-t-2xl md:rounded-sm p-6 shadow-2xl max-w-2xl mx-auto">
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
                                                className="w-full border-2 border-board-muted-blue rounded-sm px-3 py-2 bg-white"
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
                                                        className={`px-4 py-2 rounded-sm font-bold text-xs uppercase ${
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
                                                className="w-full border-2 border-board-muted-blue rounded-sm px-3 py-2 h-20 resize-none"
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
                                                    className="w-full border-2 border-board-muted-blue rounded-sm px-3 py-2 font-board-grit"
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
                                                    className="w-full border-2 border-board-muted-blue rounded-sm px-3 py-2 font-board-grit"
                                                />
                                            </div>
                                        </div>

                                        {/* Payout Preview */}
                                        <div className="bg-gray-100 rounded-sm p-3">
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
                                            className="w-full bg-board-red hover:bg-red-600 text-white font-bold py-3 rounded-sm text-lg transition-all board-red-glow"
                                        >
                                            PLACE BET
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bets Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Your Ambush Bets */}
                            <div>
                                <h2 className="text-xl font-board-header text-board-off-white mb-3">
                                    🎯 Your Ambush Bets
                                </h2>
                                <div className="space-y-3">
                                    {bettorBets.length === 0 ? (
                                        <div className="bg-white/5 border border-white/10 rounded-sm p-6 text-center text-gray-400">
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
                                <h2 className="text-xl font-board-header text-board-off-white mb-3">
                                    🔒 Shadow Locks
                                </h2>
                                <div className="space-y-3">
                                    {targetBets.betCount === 0 || targetBets.bets.length === 0 ? (
                                        <div className="bg-white/5 border border-white/10 rounded-sm p-6 text-center text-gray-400">
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

                    {/* Sidebar Action Feed for desktop */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <ActionFeed messages={actionFeedMessages} />
                        </div>
                    </aside>
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                    <h3 className="text-sm uppercase tracking-[0.18em] text-board-off-white/60">🧾 The Thermal Receipt</h3>
                    <ThermalReceipt lines={receiptLines} triggerPhrase="TELL SETH HE'S WASHED" />
                    <p className="text-[11px] text-board-off-white/60">Tap to save the story asset when you hit a massive win.</p>
                </div>
            </div>

            {/* Mobile ticker at bottom */}
            <div className="lg:hidden fixed bottom-16 inset-x-0 z-30">
                <ActionFeed messages={actionFeedMessages} />
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

                @keyframes board-shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-6px); }
                    80% { transform: translateX(6px); }
                }

                .shake-animation {
                    animation: board-shake ${ANIMATION_SECONDS}s ease both;
                }

                @keyframes stamp-in {
                    0% { transform: scale(1.5); opacity: 0; }
                    60% { transform: scale(0.96); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.95; }
                }

                .stamp-confirmation {
                    background: rgba(5, 10, 20, 0.9);
                    border: 2px solid rgba(255, 51, 51, 0.8);
                    padding: 1rem 1.5rem;
                    border-radius: 0.25rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(255, 51, 51, 0.35);
                    animation: stamp-in ${ANIMATION_SECONDS}s ease forwards;
                    transform-origin: center;
                }
            `}</style>
        </div>
    );
};
