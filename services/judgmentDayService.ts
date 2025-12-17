/**
 * Judgment Day Recap Service
 * 
 * Generates comprehensive weekly recap data:
 * - Shadow Lock reveals
 * - Receipt reel (evidence)
 * - Stat sheet
 * - Indictment winners
 * - Player-specific performance data
 */

import { JudgmentRecap, OverseerPlayerState, AmbushBet } from '../types';

class JudgmentDayService {
    private recapViewed: Set<string> = new Set(); // Track which players have viewed recap

    /**
     * Generate complete Judgment Day recap for the week
     */
    generateWeeklyRecap(
        weekNumber: number,
        allPlayers: OverseerPlayerState[],
        resolvedAmbushBets: AmbushBet[],
        tribunalResults: any[]
    ): JudgmentRecap {
        // Calculate winners
        const winners = allPlayers
            .map(player => {
                const winnings = this.calculatePlayerWinnings(player, resolvedAmbushBets);
                return {
                    playerId: player.id,
                    playerName: player.name,
                    totalWinnings: winnings.total,
                    biggestWin: winnings.biggest
                };
            })
            .filter(w => w.totalWinnings > 0)
            .sort((a, b) => b.totalWinnings - a.totalWinnings);

        // Calculate losers
        const losers = allPlayers
            .map(player => {
                const losses = this.calculatePlayerLosses(player, resolvedAmbushBets);
                return {
                    playerId: player.id,
                    playerName: player.name,
                    totalLosses: losses.total,
                    worstLoss: losses.worst
                };
            })
            .filter(l => l.totalLosses > 0)
            .sort((a, b) => b.totalLosses - a.totalLosses);

        // Shadow Lock Reveals
        const shadowLockReveals = resolvedAmbushBets.map(bet => ({
            targetName: this.getPlayerName(bet.targetUserId, allPlayers),
            triggerPhrase: bet.description,
            success: bet.won || false,
            bettorCount: 1, // Simplified - in real system would count all bettors
            totalGrit: bet.wager
        }));

        // Receipts (evidence)
        const receipts = resolvedAmbushBets
            .filter(bet => bet.evidence && bet.evidence.length > 0)
            .map(bet => ({
                betId: bet.id,
                evidence: bet.evidence?.[0] || 'No evidence provided', // First evidence string
                outcome: bet.won ? 'CONFIRMED' : 'DENIED',
                timestamp: new Date(bet.resolvedAt || Date.now()).toLocaleString(),
                verdict: bet.won ? 'Trigger phrase confirmed' : 'Behavior did not occur'
            }));

        // Calculate total stats
        const stats = {
            totalGritWagered: resolvedAmbushBets.reduce((sum, bet) => sum + bet.wager, 0),
            totalGritWon: winners.reduce((sum, w) => sum + w.totalWinnings, 0),
            totalGritLost: losers.reduce((sum, l) => sum + l.totalLosses, 0),
            mostPopularBet: this.findMostPopularBet(resolvedAmbushBets),
            biggestUpset: this.findBiggestUpset(resolvedAmbushBets)
        };

        // Whale of the Week (most wagered)
        const whaleOfWeek = this.findWhaleOfWeek(allPlayers, resolvedAmbushBets);

        // Gulag Inmate (player with 0 grit)
        const gulagInmate = allPlayers.find(p => p.grit <= 0 && p.gulagState?.inGulag);

        // Indictment Winners (from tribunal results)
        const indictmentWinners = tribunalResults.map(result => ({
            category: result.category,
            winnerName: result.winnerName,
            votes: result.votes,
            reason: result.reason || 'Voted by the group'
        }));

        return {
            weekNumber,
            winners,
            losers,
            receipts,
            stats,
            shadowLockReveals,
            whaleOfWeek,
            gulagInmate: gulagInmate ? { playerName: gulagInmate.name } : undefined,
            indictmentWinners
        };
    }

    /**
     * Generate player-specific recap data
     */
    generatePlayerRecap(
        playerId: string,
        baseRecap: JudgmentRecap,
        player: OverseerPlayerState,
        previousBalance: number
    ): JudgmentRecap {
        const playerRecap = { ...baseRecap };
        
        // Add player-specific data
        playerRecap.playerNewBalance = player.grit;
        playerRecap.playerItemsPulled = player.ownedItems?.length || 0;

        return playerRecap;
    }

    /**
     * Mark recap as viewed by player
     */
    markRecapViewed(playerId: string, weekNumber: number): void {
        this.recapViewed.add(`${playerId}_${weekNumber}`);
    }

    /**
     * Check if player has viewed recap
     */
    hasViewedRecap(playerId: string, weekNumber: number): boolean {
        return this.recapViewed.has(`${playerId}_${weekNumber}`);
    }

    /**
     * Clear viewed state (for new week)
     */
    clearViewedState(): void {
        this.recapViewed.clear();
    }

    /**
     * Calculate player's total winnings
     */
    private calculatePlayerWinnings(
        player: OverseerPlayerState,
        resolvedBets: AmbushBet[]
    ): { total: number; biggest: any } {
        const playerBets = player.ambushBets.filter(bet => 
            bet.isResolved && bet.won && resolvedBets.some(rb => rb.id === bet.id)
        );

        const total = playerBets.reduce((sum, bet) => {
            const payout = this.calculatePayout(bet.wager, bet.odds);
            return sum + payout;
        }, 0);

        const biggestBet = playerBets.reduce((max, bet) => {
            const payout = this.calculatePayout(bet.wager, bet.odds);
            const maxPayout = max ? this.calculatePayout(max.wager, max.odds) : 0;
            return payout > maxPayout ? bet : max;
        }, null as AmbushBet | null);

        return {
            total,
            biggest: biggestBet ? {
                betId: biggestBet.id,
                description: biggestBet.description,
                payout: this.calculatePayout(biggestBet.wager, biggestBet.odds)
            } : {
                betId: '',
                description: 'No wins this week',
                payout: 0
            }
        };
    }

    /**
     * Calculate player's total losses
     */
    private calculatePlayerLosses(
        player: OverseerPlayerState,
        resolvedBets: AmbushBet[]
    ): { total: number; worst: any } {
        const playerBets = player.ambushBets.filter(bet => 
            bet.isResolved && !bet.won && resolvedBets.some(rb => rb.id === bet.id)
        );

        const total = playerBets.reduce((sum, bet) => sum + bet.wager, 0);

        const worstBet = playerBets.reduce((max, bet) => 
            bet.wager > (max?.wager || 0) ? bet : max
        , null as AmbushBet | null);

        return {
            total,
            worst: worstBet ? {
                betId: worstBet.id,
                description: worstBet.description,
                loss: worstBet.wager
            } : {
                betId: '',
                description: 'No losses this week',
                loss: 0
            }
        };
    }

    /**
     * Calculate payout from wager and odds
     */
    private calculatePayout(wager: number, odds: number): number {
        if (odds > 0) {
            // Positive odds (e.g., +150)
            return wager + (wager * (odds / 100));
        } else {
            // Negative odds (e.g., -110)
            return wager + (wager * (100 / Math.abs(odds)));
        }
    }

    /**
     * Find whale of the week
     */
    private findWhaleOfWeek(
        allPlayers: OverseerPlayerState[],
        resolvedBets: AmbushBet[]
    ): { playerName: string; totalWagered: number } | undefined {
        const wageredByPlayer = allPlayers.map(player => {
            const totalWagered = player.ambushBets
                .filter(bet => resolvedBets.some(rb => rb.id === bet.id))
                .reduce((sum, bet) => sum + bet.wager, 0);
            
            return { playerName: player.name, totalWagered };
        });

        const whale = wageredByPlayer.reduce((max, player) =>
            player.totalWagered > (max?.totalWagered || 0) ? player : max
        , null as any);

        return whale && whale.totalWagered > 0 ? whale : undefined;
    }

    /**
     * Find most popular bet
     */
    private findMostPopularBet(resolvedBets: AmbushBet[]): string {
        if (resolvedBets.length === 0) return 'No bets this week';
        
        // Simplified - just return most recent
        return resolvedBets[0]?.description || 'No bets this week';
    }

    /**
     * Find biggest upset
     */
    private findBiggestUpset(resolvedBets: AmbushBet[]): string {
        const upsets = resolvedBets
            .filter(bet => bet.won && bet.odds > 300)
            .sort((a, b) => b.odds - a.odds);

        return upsets[0]?.description || 'No upsets this week';
    }

    /**
     * Get player name by ID
     */
    private getPlayerName(playerId: string, allPlayers: OverseerPlayerState[]): string {
        return allPlayers.find(p => p.id === playerId)?.name || 'Unknown';
    }

    /**
     * Generate shareable receipt image data
     * TODO: Implement actual canvas-based image generation
     */
    generateShareableReceipt(
        playerName: string,
        profitLoss: number,
        itemsPulled: number,
        weekNumber: number
    ): string {
        // Placeholder: Return 1x1 transparent PNG
        // In production, use canvas to generate styled receipt image
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
    }
}

export const judgmentDayService = new JudgmentDayService();
