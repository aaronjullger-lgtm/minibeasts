/**
 * Ambush Bet Card Component
 * 
 * Displays ambush bets with information asymmetry:
 * - For bettors: shows full details with "Snitch Wire" logic
 * - For targets: shows redacted "SHADOW LOCK DETECTED" message with Paranoia Meter
 */

import React, { useState } from 'react';
import { AmbushBet } from '../types';

interface AmbushBetCardProps {
    bet: AmbushBet;
    isTarget: boolean; // Is the current user the target of this bet?
    totalGritAgainstTarget?: number; // Only shown to targets
    targetBetCount?: number; // Number of bets against target
}

export const AmbushBetCard: React.FC<AmbushBetCardProps> = ({ 
    bet, 
    isTarget, 
    totalGritAgainstTarget = 0,
    targetBetCount = 0
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const getOddsLabel = (odds: number): string => {
        return odds > 0 ? `+${odds}` : `${odds}`;
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'social':
                return 'bg-purple-600';
            case 'behavior':
                return 'bg-blue-600';
            case 'prop':
                return 'bg-green-600';
            default:
                return 'bg-gray-600';
        }
    };

    const getParanoiaLevel = (totalGrit: number): { level: string; color: string; width: string } => {
        if (totalGrit >= 2000) {
            return { level: 'CRITICAL', color: 'bg-red-600', width: 'w-full' };
        } else if (totalGrit >= 1000) {
            return { level: 'HIGH', color: 'bg-orange-500', width: 'w-3/4' };
        } else if (totalGrit >= 500) {
            return { level: 'MODERATE', color: 'bg-yellow-500', width: 'w-1/2' };
        } else if (totalGrit >= 100) {
            return { level: 'LOW', color: 'bg-blue-500', width: 'w-1/4' };
        } else {
            return { level: 'MINIMAL', color: 'bg-green-500', width: 'w-1/12' };
        }
    };

    // Render for TARGET user (redacted with Shadow Lock)
    if (isTarget) {
        const paranoiaInfo = getParanoiaLevel(totalGritAgainstTarget);
        
        return (
            <div className="relative bg-board-off-white border border-board-crimson rounded-lg p-4 overflow-hidden shadow-lg">
                {/* Crimson blur overlay */}
                <div className="absolute inset-0 bg-board-crimson opacity-20 backdrop-blur-sm rounded-lg"></div>
                
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-board-crimson rounded-full animate-pulse"></div>
                            <h3 className="text-lg font-board-header italic text-board-crimson uppercase tracking-wider">
                                🎯 Shadow Lock Detected
                            </h3>
                        </div>
                    </div>

                    <div className="bg-black/80 rounded p-4 mb-4">
                        <p className="text-board-red font-bold text-center text-sm md:text-base mb-2">
                            ⚠️ YOU ARE THE TARGET ⚠️
                        </p>
                        <p className="text-gray-300 text-xs md:text-sm text-center">
                            Someone is watching. Details have been redacted for your protection.
                        </p>
                    </div>

                    {/* Paranoia Meter */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 uppercase">
                                Paranoia Meter
                            </span>
                            <span className="text-xs font-bold text-board-crimson">
                                {paranoiaInfo.level}
                            </span>
                        </div>
                        
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div 
                                className={`h-full ${paranoiaInfo.color} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: paranoiaInfo.width }}
                            >
                                <span className="text-xs font-bold text-white">
                                    {totalGritAgainstTarget}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Total Grit Wagered Against You</span>
                            <span className="font-board-grit font-bold text-board-crimson">
                                {totalGritAgainstTarget.toLocaleString()} GRIT
                            </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 text-center">
                            Active Ambush Bets: <span className="font-bold text-board-crimson">{targetBetCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render for BETTOR user (full details - "Snitch Wire")
    return (
        <div className="bg-board-off-white border border-board-muted-blue rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getCategoryColor(bet.category)}`}>
                        {bet.category.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">
                        Ambush on {bet.targetUserName}
                    </h3>
                </div>
                
                {bet.isResolved && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${bet.won ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {bet.won ? '✓ WON' : '✗ LOST'}
                    </span>
                )}
            </div>

            {/* Snitch Wire Logic */}
            <div className="bg-gray-100 rounded p-3 mb-3">
                <p className="text-sm text-gray-800 font-medium mb-2">
                    <span className="font-bold text-board-red">📡 SNITCH WIRE:</span> {bet.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-700">
                    <div>
                        <span className="font-bold">Odds:</span>{' '}
                        <span className="font-board-grit text-board-red font-bold">
                            {getOddsLabel(bet.odds)}
                        </span>
                    </div>
                    <div>
                        <span className="font-bold">Wagered:</span>{' '}
                        <span className="font-board-grit font-bold">
                            {bet.wager.toLocaleString()} GRIT
                        </span>
                    </div>
                </div>
            </div>

            {/* Payout Info */}
            <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">
                    Potential Payout
                </div>
                <div className="text-sm font-board-grit font-bold text-green-600">
                    {bet.potentialPayout.toLocaleString()} GRIT
                </div>
            </div>

            {/* Evidence (if resolved) */}
            {bet.isResolved && bet.evidence && bet.evidence.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                    >
                        {showDetails ? '▼' : '▶'} Evidence ({bet.evidence.length})
                    </button>
                    
                    {showDetails && (
                        <div className="mt-2 space-y-1">
                            {bet.evidence.map((ev, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded">
                                    {ev}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Timestamp */}
            <div className="mt-2 text-xs text-gray-500">
                Created: {new Date(bet.createdAt).toLocaleString()}
            </div>
        </div>
    );
};
