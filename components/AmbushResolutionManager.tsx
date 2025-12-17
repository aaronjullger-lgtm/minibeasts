/**
 * Ambush Resolution Manager Component
 * 
 * Handles the complete resolution flow for Ambush bets during Judgment Day:
 * - Activity checking for anti-ghosting
 * - Subject-Takes-All payout logic
 * - Payday/Bankrupt notifications
 * - Evidence linking
 */

import React, { useState } from 'react';
import { OverseerPlayerState, AmbushResolutionResult, ChatMessage } from '../types';
import { bettingService } from '../services/bettingService';
import { activityMonitoringService } from '../services/activityMonitoringService';
import { PaydayScreen } from './PaydayScreen';
import { BankruptScreen } from './BankruptScreen';

interface AmbushResolutionManagerProps {
    targetPlayerId: string;
    allPlayers: OverseerPlayerState[];
    chatHistory: ChatMessage[];
    surveillanceStart: number; // Mon-Wed surveillance phase start
    surveillanceEnd: number;   // Mon-Wed surveillance phase end
    bettingWindowStart: number; // Fri-Sun betting window start
    bettingWindowEnd: number;   // Fri-Sun betting window end
    onResolutionComplete: (result: AmbushResolutionResult) => void;
}

export const AmbushResolutionManager: React.FC<AmbushResolutionManagerProps> = ({
    targetPlayerId,
    allPlayers,
    chatHistory,
    surveillanceStart,
    surveillanceEnd,
    bettingWindowStart,
    bettingWindowEnd,
    onResolutionComplete
}) => {
    const [showPayday, setShowPayday] = useState(false);
    const [showBankrupt, setShowBankrupt] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<any>(null);
    const [resolutionResult, setResolutionResult] = useState<AmbushResolutionResult | null>(null);

    const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);

    /**
     * Resolve ambush with AI confirmation
     */
    const handleResolve = (bettorsWon: boolean, evidence: string[]) => {
        if (!targetPlayer) return;

        try {
            // Step 1: Establish baseline activity
            activityMonitoringService.establishBaseline(
                targetPlayerId,
                chatHistory,
                surveillanceStart,
                surveillanceEnd
            );

            // Step 2: Check for ghosting
            const activityCheck = activityMonitoringService.checkForGhosting(
                targetPlayerId,
                chatHistory,
                bettingWindowStart,
                bettingWindowEnd
            );

            // Step 3: Resolve the ambush (atomic operation)
            const result = bettingService.resolveAmbush(
                targetPlayerId,
                allPlayers,
                bettorsWon,
                evidence,
                activityCheck
            );

            setResolutionResult(result);

            // Step 4: Show appropriate notifications
            if (result.ghostingDetected) {
                // Show ghosting penalty message
                alert(`⚠️ GHOSTING DETECTED\n\nActivity dropped by ${activityCheck.activityDropPercentage.toFixed(1)}%\n\n50% returned to bettors\nSocial Tax applied to ${targetPlayer.name}`);
            } else if (!result.bettorsWon && result.subjectPayout) {
                // Subject won - show Payday
                const paydayNotif = bettingService.generatePaydayNotification(result, targetPlayer);
                setCurrentNotification(paydayNotif);
                setShowPayday(true);
            } else if (result.bettorsWon) {
                // Bettors won - show success
                alert(`✅ BETTORS WIN\n\nBehavior confirmed by The Commish\nPayouts distributed based on odds`);
            }

            // Step 5: Generate Bankrupt notifications for losers (if subject won)
            if (!result.bettorsWon && !result.ghostingDetected) {
                const losingBettors = allPlayers.filter(p => 
                    p.ambushBets.some(bet => 
                        bet.targetUserId === targetPlayerId && 
                        bet.isResolved && 
                        !bet.won
                    )
                );

                if (losingBettors.length > 0) {
                    const bankruptNotifs = bettingService.generateBankruptNotifications(
                        result,
                        targetPlayer,
                        losingBettors
                    );

                    // Show first bankrupt notification
                    if (bankruptNotifs.length > 0) {
                        setTimeout(() => {
                            setCurrentNotification(bankruptNotifs[0]);
                            setShowBankrupt(true);
                        }, 1000);
                    }
                }
            }

            // Notify parent component
            onResolutionComplete(result);

        } catch (error) {
            alert(`Resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="space-y-4">
            {/* Resolution Controls */}
            <div className="bg-gray-900 border-2 border-board-muted-blue rounded-lg p-6">
                <h3 className="text-xl font-bold text-board-off-white mb-4">
                    🏛️ Judgment Day Resolution
                </h3>

                <div className="space-y-4">
                    {/* Activity Status */}
                    <div className="bg-black/40 rounded p-4">
                        <p className="text-sm text-gray-400 mb-2">Activity Monitor</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Surveillance:</span>
                                <span className="text-board-off-white ml-2">
                                    {new Date(surveillanceStart).toLocaleDateString()} - {new Date(surveillanceEnd).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Betting Window:</span>
                                <span className="text-board-off-white ml-2">
                                    {new Date(bettingWindowStart).toLocaleDateString()} - {new Date(bettingWindowEnd).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Resolution Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleResolve(true, ['AI confirmed trigger phrase detected'])}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                        >
                            ✅ BETTORS WIN<br/>
                            <span className="text-xs opacity-80">Behavior occurred</span>
                        </button>
                        <button
                            onClick={() => handleResolve(false, ['Behavior did not occur - Subject wins'])}
                            className="flex-1 bg-board-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                        >
                            🎯 SUBJECT WINS<br/>
                            <span className="text-xs opacity-80">Subject-Takes-All</span>
                        </button>
                    </div>

                    {/* Evidence Input */}
                    <div className="bg-black/40 rounded p-4">
                        <p className="text-sm text-gray-400 mb-2">📸 Evidence Required</p>
                        <p className="text-xs text-gray-500">
                            Link to Locker Room receipts (screenshots/chat logs) required for resolution
                        </p>
                    </div>
                </div>
            </div>

            {/* Resolution Result Display */}
            {resolutionResult && (
                <div className="bg-gray-900 border-2 border-green-600 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-green-400 mb-3">✅ Resolution Complete</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Pot:</span>
                            <span className="text-board-off-white font-bold">{resolutionResult.totalPot.toLocaleString()} GRIT</span>
                        </div>
                        {resolutionResult.commishCut > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Commish Cut (5%):</span>
                                <span className="text-yellow-400 font-bold">-{resolutionResult.commishCut.toLocaleString()} GRIT</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">Net Payout:</span>
                            <span className="text-green-400 font-bold">{resolutionResult.netPayout.toLocaleString()} GRIT</span>
                        </div>
                        {resolutionResult.ghostingDetected && (
                            <div className="bg-red-900/20 border border-red-600 rounded p-2 mt-2">
                                <p className="text-red-400 text-xs">⚠️ Ghosting detected - Penalty applied</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payday Screen */}
            {showPayday && currentNotification && (
                <PaydayScreen
                    notification={currentNotification}
                    onClose={() => setShowPayday(false)}
                />
            )}

            {/* Bankrupt Screen */}
            {showBankrupt && currentNotification && (
                <BankruptScreen
                    notification={currentNotification}
                    onClose={() => setShowBankrupt(false)}
                />
            )}
        </div>
    );
};
