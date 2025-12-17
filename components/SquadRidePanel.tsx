/**
 * Squad Ride Component
 * 
 * Co-op parlay system where one player creates a parlay
 * and others can "squad ride" for a multiplier bonus
 */

import React, { useState } from 'react';
import { SquadRideParlay, ParlayLeg, OverseerPlayerState } from '../types';

interface SquadRideProps {
    player: OverseerPlayerState;
    activeParlay?: SquadRideParlay;
    onCreateParlay: (legs: Omit<ParlayLeg, 'id' | 'isResolved' | 'won'>[]) => void;
    onJoinSquadRide: (wager: number) => void;
    isOpen: boolean;
}

export const SquadRidePanel: React.FC<SquadRideProps> = ({
    player,
    activeParlay,
    onCreateParlay,
    onJoinSquadRide,
    isOpen
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [legs, setLegs] = useState<Omit<ParlayLeg, 'id' | 'isResolved' | 'won'>[]>([
        { game: '', pick: '', odds: 100 }
    ]);
    const [wager, setWager] = useState<number>(50);

    const handleAddLeg = () => {
        if (legs.length < 3) {
            setLegs([...legs, { game: '', pick: '', odds: 100 }]);
        }
    };

    const handleRemoveLeg = (index: number) => {
        if (legs.length > 1) {
            setLegs(legs.filter((_, i) => i !== index));
        }
    };

    const handleLegChange = (index: number, field: string, value: string | number) => {
        const newLegs = [...legs];
        newLegs[index] = { ...newLegs[index], [field]: value };
        setLegs(newLegs);
    };

    const calculateTotalOdds = (): number => {
        let decimalMultiplier = 1.0;

        for (const leg of legs) {
            const decimal = leg.odds > 0 
                ? (leg.odds / 100) + 1 
                : (100 / Math.abs(leg.odds)) + 1;
            decimalMultiplier *= decimal;
        }

        return Math.floor((decimalMultiplier - 1) * 100);
    };

    const handleCreateParlay = () => {
        const validLegs = legs.filter(leg => leg.game && leg.pick && leg.odds);
        
        if (validLegs.length < 3) {
            alert('Please add 3 legs to create the parlay');
            return;
        }

        onCreateParlay(validLegs);
        setIsCreating(false);
        setLegs([{ game: '', pick: '', odds: 100 }]);
    };

    const handleJoin = () => {
        if (wager < 10) {
            alert('Minimum wager is 10 grit');
            return;
        }

        if (wager > player.grit) {
            alert('Insufficient grit');
            return;
        }

        onJoinSquadRide(wager);
        setWager(50);
    };

    const calculatePotentialPayout = (wagerAmount: number, odds: number): number => {
        return Math.floor(wagerAmount + (wagerAmount * odds / 100));
    };

    const getRiderMultiplier = (riderCount: number): number => {
        return 1.0 + (riderCount * 0.1);
    };

    return (
        <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-6">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-blue-400 mb-2">
                    🚀 THE SQUAD RIDE
                </h2>
                <p className="text-gray-400">
                    Co-op Parlay System • More Riders = Higher Multiplier
                </p>
                <div className="mt-2">
                    <span className={`text-sm font-bold ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
                        {isOpen ? '● OPEN' : '● CLOSED'}
                    </span>
                </div>
            </div>

            {/* Active Parlay */}
            {activeParlay && (
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-gray-800 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                This Week's Parlay
                            </h3>
                            <p className="text-sm text-gray-400">
                                Created by {activeParlay.creatorName}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-green-400 text-2xl font-bold">
                                +{activeParlay.totalOdds}
                            </p>
                            <p className="text-xs text-gray-400">Total Odds</p>
                        </div>
                    </div>

                    {/* Parlay Legs */}
                    <div className="space-y-2 mb-4">
                        {activeParlay.legs.map((leg, index) => (
                            <div
                                key={leg.id}
                                className={`p-3 rounded ${
                                    leg.isResolved
                                        ? leg.won
                                            ? 'bg-green-900 border-2 border-green-500'
                                            : 'bg-red-900 border-2 border-red-500'
                                        : 'bg-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">
                                            Leg {index + 1}: {leg.game}
                                        </p>
                                        <p className="text-sm text-gray-300">{leg.pick}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-400 font-bold">
                                            {leg.odds > 0 ? '+' : ''}{leg.odds}
                                        </p>
                                        {leg.isResolved && (
                                            <p className="text-xs">
                                                {leg.won ? '✓ WON' : '✗ LOST'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Riders */}
                    <div className="mb-4">
                        <h4 className="text-lg font-bold text-white mb-2">
                            Squad Riders ({activeParlay.riders.length})
                        </h4>
                        {activeParlay.riders.length === 0 ? (
                            <p className="text-gray-400 text-sm">No riders yet. Be the first!</p>
                        ) : (
                            <div className="space-y-1">
                                {activeParlay.riders.map(rider => (
                                    <div
                                        key={rider.playerId}
                                        className="flex justify-between items-center text-sm bg-gray-700 p-2 rounded"
                                    >
                                        <span className="text-white">{rider.playerName}</span>
                                        <div className="text-right">
                                            <span className="text-gray-400">{rider.wager} grit</span>
                                            <span className="text-blue-400 ml-2">
                                                (x{rider.multiplier.toFixed(1)})
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Join Squad Ride */}
                    {isOpen && activeParlay.status === 'open' && activeParlay.creatorId !== player.id && (
                        <div className="border-t-2 border-gray-700 pt-4">
                            <h4 className="text-lg font-bold text-white mb-3">Join the Squad</h4>
                            
                            <div className="mb-3">
                                <label className="block text-gray-300 mb-2">Your Wager (grit):</label>
                                <input
                                    type="number"
                                    value={wager}
                                    onChange={(e) => setWager(parseInt(e.target.value) || 0)}
                                    min={10}
                                    max={player.grit}
                                    className="w-full p-3 bg-gray-700 text-white rounded"
                                />
                            </div>

                            <div className="mb-4 p-3 bg-gray-700 rounded">
                                <p className="text-gray-400 text-sm">Your Multiplier:</p>
                                <p className="text-blue-400 text-xl font-bold">
                                    x{getRiderMultiplier(activeParlay.riders.length).toFixed(1)}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">Potential Payout:</p>
                                <p className="text-green-400 text-2xl font-bold">
                                    {Math.floor(
                                        calculatePotentialPayout(wager, activeParlay.totalOdds) *
                                        getRiderMultiplier(activeParlay.riders.length)
                                    )} GRIT
                                </p>
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={wager > player.grit || wager < 10}
                                className={`w-full py-3 rounded font-bold ${
                                    wager > player.grit || wager < 10
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                SQUAD RIDE
                            </button>
                        </div>
                    )}

                    {/* Status Display */}
                    {activeParlay.status !== 'open' && (
                        <div className={`text-center py-3 rounded font-bold ${
                            activeParlay.status === 'won'
                                ? 'bg-green-900 text-green-400'
                                : activeParlay.status === 'lost'
                                ? 'bg-red-900 text-red-400'
                                : 'bg-gray-700 text-gray-400'
                        }`}>
                            {activeParlay.status.toUpperCase()}
                        </div>
                    )}
                </div>
            )}

            {/* Create New Parlay */}
            {!activeParlay && isOpen && (
                <div>
                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold text-lg"
                        >
                            CREATE THIS WEEK'S PARLAY
                        </button>
                    ) : (
                        <div className="border-2 border-blue-500 rounded-lg p-4 bg-gray-800">
                            <h3 className="text-xl font-bold text-white mb-4">Build Your 3-Leg Parlay</h3>
                            
                            {legs.map((leg, index) => (
                                <div key={index} className="mb-4 p-3 bg-gray-700 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white">Leg {index + 1}</h4>
                                        {legs.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveLeg(index)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Game (e.g., Cowboys vs Eagles)"
                                        value={leg.game}
                                        onChange={(e) => handleLegChange(index, 'game', e.target.value)}
                                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Pick (e.g., Cowboys -3.5)"
                                        value={leg.pick}
                                        onChange={(e) => handleLegChange(index, 'pick', e.target.value)}
                                        className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
                                    />

                                    <input
                                        type="number"
                                        placeholder="Odds (e.g., -110)"
                                        value={leg.odds}
                                        onChange={(e) => handleLegChange(index, 'odds', parseInt(e.target.value) || 0)}
                                        className="w-full p-2 bg-gray-600 text-white rounded"
                                    />
                                </div>
                            ))}

                            {legs.length < 3 && (
                                <button
                                    onClick={handleAddLeg}
                                    className="w-full py-2 mb-4 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold"
                                >
                                    + ADD LEG
                                </button>
                            )}

                            <div className="mb-4 p-3 bg-gray-900 rounded">
                                <p className="text-gray-400 text-sm">Total Parlay Odds:</p>
                                <p className="text-green-400 text-2xl font-bold">
                                    +{calculateTotalOdds()}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateParlay}
                                    disabled={legs.filter(l => l.game && l.pick).length < 3}
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold disabled:bg-gray-700 disabled:text-gray-500"
                                >
                                    CREATE PARLAY
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setLegs([{ game: '', pick: '', odds: 100 }]);
                                    }}
                                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!activeParlay && !isOpen && (
                <div className="text-center py-8 text-gray-500">
                    <p>Squad Ride is not available in this phase.</p>
                    <p className="text-sm mt-2">Wait for the Lines Drop phase (Thursday).</p>
                </div>
            )}
        </div>
    );
};
