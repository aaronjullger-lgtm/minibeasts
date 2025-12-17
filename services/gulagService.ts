/**
 * Gulag Service
 * 
 * Handles the punishment system for bankrupt players:
 * - Detects bankruptcy (0 grit)
 * - Sends players to The Gulag
 * - Generates high-risk redemption bets
 * - Manages 7-day bans
 * - Tracks IRL punishments
 */

import { GulagState, GulagBet, OverseerPlayerState } from '../types';
import { GULAG_CONFIG } from '../constants-overseer';
import { geminiService } from './geminiService';

class GulagService {
    private gulagPlayers: Map<string, GulagState> = new Map();

    /**
     * Check if a player should be sent to The Gulag
     */
    checkBankruptcy(player: OverseerPlayerState): boolean {
        if (player.grit <= 0 && !player.gulagState?.inGulag) {
            this.sendToGulag(player);
            return true;
        }
        return false;
    }

    /**
     * Send a player to The Gulag
     */
    private sendToGulag(player: OverseerPlayerState): void {
        const gulagState: GulagState = {
            playerId: player.id,
            playerName: player.name,
            inGulag: true,
            gulagStartedAt: Date.now(),
            previousBankruptcies: player.gulagState?.previousBankruptcies || 0
        };

        player.gulagState = gulagState;
        this.gulagPlayers.set(player.id, gulagState);

        console.log(`${player.name} has been sent to The Gulag for bankruptcy!`);
    }

    /**
     * Generate a high-risk Gulag bet for redemption
     */
    async generateGulagBet(player: OverseerPlayerState): Promise<GulagBet> {
        if (!player.gulagState?.inGulag) {
            throw new Error('Player is not in The Gulag');
        }

        // Generate a creative, high-risk bet using AI
        const prompt = `Generate a high-risk, creative NFL bet for a player who went bankrupt and needs redemption. 
        
Player: ${player.name}
Previous bankruptcies: ${player.gulagState.previousBankruptcies}

The bet should:
1. Be extremely difficult but not impossible (+${GULAG_CONFIG.minOdds} to +${GULAG_CONFIG.maxOdds} odds)
2. Be entertaining/funny given their situation
3. Be specific and measurable
4. Reference their personality or betting history

Examples:
- "Bet on all 3 division rivals to lose this week" (+600)
- "Pick a 5-leg parlay of only underdogs" (+850)
- "Correctly predict the exact final score of one game" (+1200)

Respond with JSON:
{
  "description": "The bet description",
  "odds": 600 (number between ${GULAG_CONFIG.minOdds} and ${GULAG_CONFIG.maxOdds})
}`;

        try {
            const response = await geminiService.generateText(prompt);
            const data = JSON.parse(response);

            // Clamp odds to allowed range
            const odds = Math.max(
                GULAG_CONFIG.minOdds,
                Math.min(GULAG_CONFIG.maxOdds, data.odds)
            );

            const gulagBet: GulagBet = {
                id: `gulag_bet_${Date.now()}_${player.id}`,
                playerId: player.id,
                description: data.description,
                odds,
                wager: GULAG_CONFIG.redemptionBetAmount,
                isResolved: false,
                redemptionAmount: GULAG_CONFIG.redemptionReward
            };

            player.gulagState.gulagBet = gulagBet;

            return gulagBet;
        } catch (error) {
            console.error('Error generating Gulag bet:', error);
            
            // Fallback bet
            const fallbackBet: GulagBet = {
                id: `gulag_bet_${Date.now()}_${player.id}`,
                playerId: player.id,
                description: 'Pick a 3-leg parlay of underdogs and win all three',
                odds: 500,
                wager: GULAG_CONFIG.redemptionBetAmount,
                isResolved: false,
                redemptionAmount: GULAG_CONFIG.redemptionReward
            };

            player.gulagState.gulagBet = fallbackBet;
            return fallbackBet;
        }
    }

    /**
     * Resolve a Gulag bet
     */
    resolveGulagBet(player: OverseerPlayerState, won: boolean): void {
        if (!player.gulagState?.gulagBet) {
            throw new Error('No active Gulag bet');
        }

        const bet = player.gulagState.gulagBet;
        bet.isResolved = true;
        bet.won = won;

        if (won) {
            // Redemption! Player gets grit and is released
            player.grit = bet.redemptionAmount || GULAG_CONFIG.redemptionReward;
            this.releaseFromGulag(player);
            
            console.log(`${player.name} won their Gulag bet and is FREE! +${player.grit} grit`);
        } else {
            // Failed redemption - 7 day ban or IRL punishment
            this.applyPunishment(player);
            
            console.log(`${player.name} lost their Gulag bet. Punishment incoming...`);
        }
    }

    /**
     * Apply punishment for failing Gulag bet
     */
    private applyPunishment(player: OverseerPlayerState): void {
        if (!player.gulagState) return;

        // Escalating punishments based on previous bankruptcies
        const bankruptcies = player.gulagState.previousBankruptcies;

        if (bankruptcies === 0) {
            // First time: 7-day ban
            player.gulagState.banExpiresAt = Date.now() + GULAG_CONFIG.banDuration;
            player.gulagState.gulagBet!.irlPunishment = '7-day ban from the game';
        } else if (bankruptcies === 1) {
            // Second time: 7-day ban + IRL punishment
            player.gulagState.banExpiresAt = Date.now() + GULAG_CONFIG.banDuration;
            player.gulagState.gulagBet!.irlPunishment = '7-day ban + buy a round of drinks';
        } else {
            // Third+ time: Longer ban + worse IRL punishment
            player.gulagState.banExpiresAt = Date.now() + (GULAG_CONFIG.banDuration * 2);
            player.gulagState.gulagBet!.irlPunishment = '14-day ban + wear a dunce cap to the next game';
        }
    }

    /**
     * Release a player from The Gulag
     */
    private releaseFromGulag(player: OverseerPlayerState): void {
        if (!player.gulagState) return;

        player.gulagState.inGulag = false;
        player.gulagState.previousBankruptcies++;
        
        // Keep the state for history but mark as released
        this.gulagPlayers.delete(player.id);
    }

    /**
     * Check if a player's ban has expired
     */
    checkBanExpiry(player: OverseerPlayerState): boolean {
        if (!player.gulagState?.banExpiresAt) {
            return false;
        }

        if (Date.now() >= player.gulagState.banExpiresAt) {
            // Ban expired, release them
            this.releaseFromGulag(player);
            player.grit = 50; // Start with minimal grit
            return true;
        }

        return false;
    }

    /**
     * Get remaining ban time in hours
     */
    getRemainingBanTime(player: OverseerPlayerState): number {
        if (!player.gulagState?.banExpiresAt) {
            return 0;
        }

        const remaining = player.gulagState.banExpiresAt - Date.now();
        return Math.max(0, Math.floor(remaining / (1000 * 60 * 60))); // Convert to hours
    }

    /**
     * Check if a player is currently in The Gulag
     */
    isInGulag(player: OverseerPlayerState): boolean {
        return player.gulagState?.inGulag || false;
    }

    /**
     * Check if a player is currently banned
     */
    isBanned(player: OverseerPlayerState): boolean {
        if (!player.gulagState?.banExpiresAt) {
            return false;
        }

        return Date.now() < player.gulagState.banExpiresAt;
    }

    /**
     * Get all players currently in The Gulag
     */
    getGulagPlayers(): GulagState[] {
        return Array.from(this.gulagPlayers.values());
    }

    /**
     * Manual override to release a player (admin function)
     */
    forceRelease(player: OverseerPlayerState, startingGrit: number = 50): void {
        if (player.gulagState) {
            player.gulagState.inGulag = false;
            player.gulagState.banExpiresAt = undefined;
            this.gulagPlayers.delete(player.id);
        }
        
        player.grit = startingGrit;
        console.log(`${player.name} has been force-released from The Gulag with ${startingGrit} grit`);
    }

    /**
     * Get Gulag statistics for a player
     */
    getGulagStats(player: OverseerPlayerState): {
        totalBankruptcies: number;
        currentlyInGulag: boolean;
        currentlyBanned: boolean;
        banHoursRemaining: number;
    } {
        return {
            totalBankruptcies: player.gulagState?.previousBankruptcies || 0,
            currentlyInGulag: this.isInGulag(player),
            currentlyBanned: this.isBanned(player),
            banHoursRemaining: this.getRemainingBanTime(player)
        };
    }

    /**
     * Reset all Gulag states (for new season)
     */
    resetAllGulag(): void {
        this.gulagPlayers.clear();
    }
}

export const gulagService = new GulagService();
