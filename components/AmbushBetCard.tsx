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
            <div className="relative noir-card border border-board-crimson/60 rounded-xl p-4 overflow-hidden shadow-lg locked-glitch">
                <div className="absolute inset-0 bg-gradient-to-b from-board-crimson/10 via-board-navy/60 to-board-navy/90" />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-board-red rounded-full board-red-glow animate-pulse" />
                            <h3 className="text-lg font-board-header text-board-off-white uppercase tracking-wider">
                                🎯 Shadow Lock Detected
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-board-grit text-board-red">
                            <svg className="w-5 h-5 text-board-red surveillance-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M1.5 12s3.5-6.5 10.5-6.5S22.5 12 22.5 12s-3.5 6.5-10.5 6.5S1.5 12 1.5 12Z" />
                                <circle cx="12" cy="12" r="3.5" />
                            </svg>
                            <span className="text-board-off-white/90">
                                {bet.targetUserName || 'YOU'}
                            </span>
                        </div>
                    </div>

                    <div className="relative noir-card border border-board-crimson/30 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-board-navy/70 backdrop-blur-xl" />
                        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 redaction-bar text-white font-board-grit text-xs text-center py-2 uppercase">
                            DATABASE_LOCKED
                        </div>
                        <p className="relative z-10 text-board-off-white/70 text-xs md:text-sm text-center px-4 py-8">
                            {bet.description || 'SNITCH WIRE REDACTED'}
                        </p>
                    </div>

                    {/* Paranoia Meter */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-board-off-white/80">
                            <span className="text-xs font-bold uppercase">
                                Paranoia Meter
                            </span>
                            <span className="text-xs font-board-grit text-board-red">
                                {paranoiaInfo.level}
                            </span>
                        </div>
                        
                        <div className="w-full bg-board-navy/80 border border-board-crimson/40 rounded-full h-4 overflow-hidden">
                            <div 
                                className={`h-full ${paranoiaInfo.color} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: paranoiaInfo.width }}
                            >
                                <span className="text-[10px] font-board-grit text-white">
                                    {totalGritAgainstTarget}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-board-off-white/80">
                            <span>Total Grit Wagered Against You</span>
                            <span className="font-board-grit text-board-crimson">
                                {totalGritAgainstTarget.toLocaleString()} GRIT
                            </span>
                        </div>
                        
                        <div className="text-xs text-center text-board-off-white/70">
                            Active Ambush Bets: <span className="font-board-grit text-board-crimson">{targetBetCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render for BETTOR user (full details - "Snitch Wire")
    return (
        <div className="relative noir-card border border-board-muted-blue rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-2 right-3 text-board-muted-blue/80 text-lg">
                📎
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-board-grit text-white ${getCategoryColor(bet.category)}`}>
                        {bet.category.toUpperCase()}
                    </span>
                    <div>
                        <p className="text-xs uppercase text-board-muted-blue/80">Dossier</p>
                        <h3 className="text-base font-board-header text-board-off-white leading-tight">
                            Ambush on {bet.targetUserName}
                        </h3>
                    </div>
                </div>

                {bet.isResolved && (
                    <span className={`px-3 py-1 text-xs font-board-grit rounded-none border ${bet.won ? 'bg-green-600 text-white border-green-400' : 'bg-board-crimson text-white border-board-crimson/70'}`}>
                        {bet.won ? '✓ WON' : '✗ LOST'}
                    </span>
                )}
            </div>

            {/* Snitch Wire Logic */}
            <div className="noir-card border border-white/5 rounded-lg p-3 mb-3">
                <p className="text-sm text-board-off-white/90 font-medium mb-2">
                    <span className="font-board-grit text-board-red">📡 SNITCH WIRE:</span> {bet.description}
                </p>
                
                <div className="flex items-center gap-6 text-xs text-board-off-white/70">
                    <div className="flex flex-col">
                        <span className="font-bold">Odds</span>
                        <span className="font-board-grit text-board-red">
                            {getOddsLabel(bet.odds)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold">Wagered</span>
                        <span className="font-board-grit">
                            {bet.wager.toLocaleString()} GRIT
                        </span>
                    </div>
                </div>
            </div>

            {/* Payout Info */}
            <div className="flex justify-between items-center bg-board-navy/60 border border-board-muted-blue/50 rounded-lg px-3 py-2">
                <div className="text-xs text-board-off-white/70 uppercase">
                    Potential Payout
                </div>
                <div className="text-lg font-board-grit text-green-400">
                    {bet.potentialPayout.toLocaleString()} GRIT
                </div>
            </div>

            {/* Evidence (if resolved) */}
                    {bet.isResolved && bet.evidence && bet.evidence.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-board-muted-blue/50">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="btn-evidence"
                            >
                                {showDetails ? '▼ Hide' : '▶ Evidence'} ({bet.evidence.length})
                            </button>
                    
                    {showDetails && (
                        <div className="mt-2 space-y-2">
                            {bet.evidence.map((ev, idx) => (
                                <div key={idx} className="text-xs text-board-off-white/80 bg-board-navy/60 border border-board-muted-blue/40 p-2 rounded">
                                    {ev}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Timestamp */}
            <div className="mt-3 text-[11px] text-board-off-white/60 flex items-center justify-between">
                <span>Created: {new Date(bet.createdAt).toLocaleString()}</span>
                <span className="font-board-grit text-board-muted-blue">
                    Bettor: {bet.bettorName}
                </span>
            </div>
        </div>
    );
};
