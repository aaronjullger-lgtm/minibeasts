/**
 * The Tribunal Component
 * 
 * Social betting on AI-generated superlatives
 * Players vote on who wins each category
 */

import React, { useState } from 'react';
import { TribunalSuperlative, TribunalBet, OverseerPlayerState } from '../types';
import { bettingService } from '../services/bettingService';

interface TribunalProps {
    superlatives: TribunalSuperlative[];
    player: OverseerPlayerState;
    onPlaceBet: (superlativeId: string, nomineeId: string, wager: number, odds: number) => void;
    onVote: (superlativeId: string, nomineeId: string) => void;
    votingOpen: boolean;
    bettingOpen: boolean;
}

export const TribunalPanel: React.FC<TribunalProps> = ({
    superlatives,
    player,
    onPlaceBet,
    onVote,
    votingOpen,
    bettingOpen
}) => {
    const [selectedSuperlative, setSelectedSuperlative] = useState<TribunalSuperlative | null>(null);
    const [betAmount, setBetAmount] = useState<number>(50);
    const [selectedNominee, setSelectedNominee] = useState<string>('');

    const handlePlaceBet = () => {
        if (!selectedSuperlative || !selectedNominee) {
            alert('Please select a nominee');
            return;
        }

        const nominee = selectedSuperlative.nominees.find(n => n.playerId === selectedNominee);
        if (!nominee) return;

        if (betAmount < 10) {
            alert('Minimum bet is 10 grit');
            return;
        }

        if (betAmount > player.grit) {
            alert('Insufficient grit');
            return;
        }

        onPlaceBet(selectedSuperlative.id, selectedNominee, betAmount, nominee.odds);
        setSelectedSuperlative(null);
        setSelectedNominee('');
        setBetAmount(50);
    };

    const handleVote = (superlativeId: string, nomineeId: string) => {
        if (!votingOpen) {
            alert('Voting is not open yet');
            return;
        }

        onVote(superlativeId, nomineeId);
    };

    const getOddsLabel = (odds: number): string => {
        return odds > 0 ? `+${odds}` : `${odds}`;
    };

    const calculatePayout = (wager: number, odds: number): number => {
        if (odds > 0) {
            return Math.floor(wager + (wager * odds / 100));
        } else {
            return Math.floor(wager + (wager * 100 / Math.abs(odds)));
        }
    };

    return (
        <div className="bg-gray-900/80 border border-purple-500 rounded-lg p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
                    ⚖️ THE TRIBUNAL
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                    Social Betting • AI-Generated Superlatives • Vote on Winners
                </p>
                <div className="mt-2 flex gap-3 md:gap-4 flex-wrap">
                    <span className={`text-xs md:text-sm font-bold ${bettingOpen ? 'text-green-400' : 'text-red-400'}`}>
                        {bettingOpen ? '● BETTING OPEN' : '● BETTING CLOSED'}
                    </span>
                    <span className={`text-xs md:text-sm font-bold ${votingOpen ? 'text-green-400' : 'text-red-400'}`}>
                        {votingOpen ? '● VOTING OPEN' : '● VOTING CLOSED'}
                    </span>
                </div>
            </div>

            {/* Superlatives List */}
            <div className="space-y-3 md:space-y-4">
                {superlatives.map(superlative => {
                    const hasVoted = !!superlative.votes[player.id];
                    const votedFor = superlative.votes[player.id];
                    const hasBet = player.tribunalBets.some(b => b.superlativeId === superlative.id);

                    return (
                        <div
                            key={superlative.id}
                            className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800"
                        >
                            <div className="flex justify-between items-start mb-3 gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                                        {superlative.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{superlative.description}</p>
                                </div>
                                {superlative.isResolved && (
                                    <span className="bg-green-500 text-black px-2 md:px-3 py-1 rounded font-bold text-xs md:text-sm whitespace-nowrap">
                                        RESOLVED
                                    </span>
                                )}
                            </div>

                            {/* Nominees */}
                            <div className="space-y-2 mb-3">
                                {superlative.nominees.map(nominee => {
                                    const isWinner = superlative.winner === nominee.playerId;
                                    const voteCount = Object.values(superlative.votes).filter(
                                        v => v === nominee.playerId
                                    ).length;

                                    return (
                                        <div
                                            key={nominee.playerId}
                                            className={`p-2 md:p-3 rounded ${
                                                isWinner
                                                    ? 'bg-green-900/50 border border-green-500'
                                                    : votedFor === nominee.playerId
                                                    ? 'bg-blue-900/50 border border-blue-500'
                                                    : 'bg-gray-700'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-white text-sm md:text-base">
                                                            {nominee.playerName}
                                                        </span>
                                                        <span className="text-green-400 font-bold text-sm md:text-base">
                                                            {getOddsLabel(nominee.odds)}
                                                        </span>
                                                        {isWinner && (
                                                            <span className="text-yellow-400">👑 WINNER</span>
                                                        )}
                                                    </div>
                                                    {nominee.evidence.length > 0 && (
                                                        <p className="text-xs text-gray-400 mt-1 italic">
                                                            "{nominee.evidence[0]}"
                                                        </p>
                                                    )}
                                                    {votingOpen && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {voteCount} vote{voteCount !== 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    {bettingOpen && !superlative.isResolved && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSuperlative(superlative);
                                                                setSelectedNominee(nominee.playerId);
                                                            }}
                                                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-bold text-sm"
                                                        >
                                                            BET
                                                        </button>
                                                    )}
                                                    {votingOpen && !superlative.isResolved && (
                                                        <button
                                                            onClick={() => handleVote(superlative.id, nominee.playerId)}
                                                            disabled={hasVoted}
                                                            className={`px-4 py-2 rounded font-bold text-sm ${
                                                                votedFor === nominee.playerId
                                                                    ? 'bg-blue-500 text-white'
                                                                    : hasVoted
                                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-green-500 hover:bg-green-600 text-black'
                                                            }`}
                                                        >
                                                            {votedFor === nominee.playerId ? 'VOTED' : 'VOTE'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {hasBet && (
                                <div className="text-sm text-blue-400">
                                    ✓ You have bets on this superlative
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Betting Modal */}
            {selectedSuperlative && selectedNominee && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border-4 border-purple-500 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-white mb-4">Place Bet</h3>
                        
                        <div className="mb-4">
                            <p className="text-gray-300 mb-2">
                                <span className="font-bold">{selectedSuperlative.title}</span>
                            </p>
                            <p className="text-white text-lg">
                                Betting on: <span className="text-purple-400 font-bold">
                                    {selectedSuperlative.nominees.find(n => n.playerId === selectedNominee)?.playerName}
                                </span>
                            </p>
                            <p className="text-green-400 text-xl font-bold mt-1">
                                {getOddsLabel(selectedSuperlative.nominees.find(n => n.playerId === selectedNominee)?.odds || 0)}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Wager (grit):</label>
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                                min={10}
                                max={player.grit}
                                className="w-full p-3 bg-gray-700 text-white rounded"
                            />
                            <p className="text-sm text-gray-400 mt-2">
                                Available: {player.grit} grit
                            </p>
                        </div>

                        <div className="mb-6 p-3 bg-gray-900 rounded">
                            <p className="text-gray-400 text-sm">Potential Payout:</p>
                            <p className="text-green-400 text-2xl font-bold">
                                {calculatePayout(
                                    betAmount,
                                    selectedSuperlative.nominees.find(n => n.playerId === selectedNominee)?.odds || 0
                                )} GRIT
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handlePlaceBet}
                                className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded font-bold"
                            >
                                PLACE BET
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedSuperlative(null);
                                    setSelectedNominee('');
                                }}
                                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {superlatives.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No superlatives available yet.</p>
                    <p className="text-sm mt-2">The Overseer will generate them on Thursday.</p>
                </div>
            )}
        </div>
    );
};
