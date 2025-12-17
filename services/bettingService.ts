/**
 * Betting Service
 * 
 * Handles all betting operations:
 * - The Tribunal (social betting with superlatives)
 * - The Squad Ride (co-op parlay system)
 * - The Sportsbook (standard NFL betting)
 * - The Ambush System (information asymmetry betting)
 * - Subject-Takes-All payouts with anti-ghosting
 * - Bet resolution and payout calculation
 */

import {
    TribunalBet,
    TribunalSuperlative,
    SquadRideParlay,
    SquadRider,
    ParlayLeg,
    SportsbookBet,
    AmbushBet,
    AmbushBetsFilteredView,
    AmbushResolutionResult,
    PlayerActivityCheck,
    PaydayNotification,
    BankruptNotification,
    OverseerPlayerState
} from '../types';
import { activityMonitoringService } from './activityMonitoringService';

class BettingService {
    private readonly COMMISH_CUT_RATE = 0.05; // 5% league fee
    private readonly GHOSTING_PENALTY_RATE = 0.50; // 50% returned to bettors on ghosting

    /**
     * Place a bet on The Tribunal
     */
    placeTribunalBet(
        player: OverseerPlayerState,
        superlativeId: string,
        nomineeId: string,
        wager: number,
        odds: number
    ): TribunalBet {
        if (player.grit < wager) {
            throw new Error('Insufficient grit');
        }

        const bet: TribunalBet = {
            id: `tribunal_bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            superlativeId,
            playerId: player.id,
            nomineeId,
            wager,
            odds,
            potentialPayout: this.calculatePayout(wager, odds),
            isResolved: false
        };

        // Deduct grit
        player.grit -= wager;
        player.tribunalBets.push(bet);
        player.weeklyStats.gritWagered += wager;
        player.weeklyStats.betsPlaced++;

        return bet;
    }

    /**
     * Cast a vote in The Tribunal
     */
    voteInTribunal(
        superlative: TribunalSuperlative,
        voterId: string,
        nomineeId: string
    ): void {
        // Check if voting is still open
        if (Date.now() > superlative.votingClosesAt) {
            throw new Error('Voting has closed');
        }

        superlative.votes[voterId] = nomineeId;
    }

    /**
     * Resolve The Tribunal and determine winners
     */
    resolveTribunal(superlative: TribunalSuperlative): string {
        if (superlative.isResolved) {
            throw new Error('Already resolved');
        }

        // Count votes
        const voteCounts: { [nomineeId: string]: number } = {};
        
        for (const nomineeId of Object.values(superlative.votes)) {
            voteCounts[nomineeId] = (voteCounts[nomineeId] || 0) + 1;
        }

        // Find winner (most votes)
        let winnerId = '';
        let maxVotes = 0;

        for (const [nomineeId, count] of Object.entries(voteCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                winnerId = nomineeId;
            }
        }

        superlative.winner = winnerId;
        superlative.isResolved = true;

        return winnerId;
    }

    /**
     * Payout tribunal bets
     */
    payoutTribunalBets(
        players: OverseerPlayerState[],
        superlative: TribunalSuperlative
    ): void {
        if (!superlative.isResolved || !superlative.winner) {
            throw new Error('Tribunal not resolved');
        }

        for (const player of players) {
            for (const bet of player.tribunalBets) {
                if (bet.superlativeId !== superlative.id || bet.isResolved) {
                    continue;
                }

                bet.isResolved = true;
                bet.won = bet.nomineeId === superlative.winner;

                if (bet.won) {
                    const payout = bet.potentialPayout;
                    player.grit += payout;
                    player.weeklyStats.gritWon += payout;
                    player.weeklyStats.betsWon++;
                } else {
                    player.weeklyStats.gritLost += bet.wager;
                }
            }
        }
    }

    /**
     * Create a Squad Ride parlay
     */
    createSquadRideParlay(
        creatorId: string,
        creatorName: string,
        legs: Omit<ParlayLeg, 'isResolved' | 'won'>[],
        weekNumber: number,
        minOdds: number = 150,
        maxOdds: number = 1000
    ): SquadRideParlay {
        // Calculate total odds
        const totalOdds = this.calculateParlayOdds(legs.map(l => l.odds));

        if (totalOdds < minOdds) {
            throw new Error(`Total odds must be at least +${minOdds}`);
        }

        if (totalOdds > maxOdds) {
            throw new Error(`Total odds cannot exceed +${maxOdds}`);
        }

        const parlay: SquadRideParlay = {
            id: `squad_ride_${weekNumber}_${Date.now()}`,
            weekNumber,
            creatorId,
            creatorName,
            legs: legs.map((leg, index) => ({
                ...leg,
                id: `leg_${index}`,
                isResolved: false
            })),
            totalOdds,
            minOdds,
            maxOdds,
            riders: [],
            status: 'open'
        };

        return parlay;
    }

    /**
     * Join a Squad Ride parlay
     */
    joinSquadRide(
        player: OverseerPlayerState,
        parlay: SquadRideParlay,
        wager: number
    ): SquadRider {
        if (parlay.status !== 'open') {
            throw new Error('Squad Ride is not open');
        }

        if (player.grit < wager) {
            throw new Error('Insufficient grit');
        }

        // Check if already riding
        if (parlay.riders.some(r => r.playerId === player.id)) {
            throw new Error('Already riding this parlay');
        }

        // Calculate multiplier (more riders = higher multiplier)
        const baseMultiplier = 1.0;
        const riderBonus = parlay.riders.length * 0.1; // +10% per existing rider
        const multiplier = baseMultiplier + riderBonus;

        const rider: SquadRider = {
            playerId: player.id,
            playerName: player.name,
            wager,
            multiplier
        };

        // Deduct grit
        player.grit -= wager;
        parlay.riders.push(rider);
        player.squadRideBets.push(rider);
        player.weeklyStats.gritWagered += wager;
        player.weeklyStats.betsPlaced++;

        return rider;
    }

    /**
     * Resolve a Squad Ride parlay
     */
    resolveSquadRide(
        players: OverseerPlayerState[],
        parlay: SquadRideParlay,
        results: boolean[] // True for won legs, false for lost
    ): void {
        if (parlay.status === 'won' || parlay.status === 'lost') {
            throw new Error('Already resolved');
        }

        // Update leg results
        parlay.legs.forEach((leg, index) => {
            leg.isResolved = true;
            leg.won = results[index];
        });

        // Check if all legs won
        const allWon = parlay.legs.every(leg => leg.won);
        parlay.status = allWon ? 'won' : 'lost';
        parlay.resolvedAt = Date.now();

        // Payout if won
        if (allWon) {
            for (const rider of parlay.riders) {
                const player = players.find(p => p.id === rider.playerId);
                if (!player) continue;

                const basePayout = this.calculatePayout(rider.wager, parlay.totalOdds);
                const payout = Math.floor(basePayout * rider.multiplier);

                player.grit += payout;
                player.weeklyStats.gritWon += payout;
                player.weeklyStats.betsWon++;
            }
        } else {
            // Update losses
            for (const rider of parlay.riders) {
                const player = players.find(p => p.id === rider.playerId);
                if (player) {
                    player.weeklyStats.gritLost += rider.wager;
                }
            }
        }
    }

    /**
     * Place a sportsbook bet
     */
    placeSportsbookBet(
        player: OverseerPlayerState,
        type: 'spread' | 'moneyline' | 'over_under' | 'prop',
        description: string,
        pick: string,
        odds: number,
        wager: number,
        game?: string
    ): SportsbookBet {
        if (player.grit < wager) {
            throw new Error('Insufficient grit');
        }

        const bet: SportsbookBet = {
            id: `sportsbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: player.id,
            type,
            game,
            description,
            pick,
            odds,
            wager,
            potentialPayout: this.calculatePayout(wager, odds),
            isResolved: false
        };

        player.grit -= wager;
        player.sportsbookBets.push(bet);
        player.weeklyStats.gritWagered += wager;
        player.weeklyStats.betsPlaced++;

        return bet;
    }

    /**
     * Resolve a sportsbook bet
     */
    resolveSportsbookBet(
        player: OverseerPlayerState,
        betId: string,
        won: boolean
    ): void {
        const bet = player.sportsbookBets.find(b => b.id === betId);
        
        if (!bet) {
            throw new Error('Bet not found');
        }

        if (bet.isResolved) {
            throw new Error('Bet already resolved');
        }

        bet.isResolved = true;
        bet.won = won;

        if (won) {
            player.grit += bet.potentialPayout;
            player.weeklyStats.gritWon += bet.potentialPayout;
            player.weeklyStats.betsWon++;
        } else {
            player.weeklyStats.gritLost += bet.wager;
        }
    }

    /**
     * Calculate payout from American odds
     */
    private calculatePayout(wager: number, odds: number): number {
        if (odds > 0) {
            // Positive odds (underdog)
            return Math.floor(wager + (wager * odds / 100));
        } else {
            // Negative odds (favorite)
            return Math.floor(wager + (wager * 100 / Math.abs(odds)));
        }
    }

    /**
     * Calculate combined parlay odds
     */
    private calculateParlayOdds(individualOdds: number[]): number {
        let decimalMultiplier = 1.0;

        for (const odds of individualOdds) {
            const decimal = odds > 0 
                ? (odds / 100) + 1 
                : (100 / Math.abs(odds)) + 1;
            
            decimalMultiplier *= decimal;
        }

        // Convert back to American odds
        if (decimalMultiplier >= 2.0) {
            return Math.floor((decimalMultiplier - 1) * 100);
        } else {
            return Math.floor(-100 / (decimalMultiplier - 1));
        }
    }

    /**
     * Get odds probability (for display purposes)
     */
    getOddsProbability(odds: number): number {
        if (odds > 0) {
            return 100 / (odds + 100);
        } else {
            return Math.abs(odds) / (Math.abs(odds) + 100);
        }
    }

    /**
     * Place an Ambush bet (betting on another player's behavior)
     * @param bettor - The player placing the bet
     * @param targetUserId - The player being bet on
     * @param targetUserName - The name of the target player
     * @param description - Description of what is being bet on
     * @param category - Category of the ambush bet
     * @param odds - American odds
     * @param wager - Amount of grit to wager
     */
    placeAmbushBet(
        bettor: OverseerPlayerState,
        targetUserId: string,
        targetUserName: string,
        description: string,
        category: 'social' | 'behavior' | 'prop',
        odds: number,
        wager: number
    ): AmbushBet {
        if (bettor.grit < wager) {
            throw new Error('Insufficient grit');
        }

        if (bettor.id === targetUserId) {
            throw new Error('Cannot place ambush bet on yourself');
        }

        const bet: AmbushBet = {
            id: `ambush_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            bettorId: bettor.id,
            bettorName: bettor.name,
            targetUserId,
            targetUserName,
            description,
            category,
            odds,
            wager,
            potentialPayout: this.calculatePayout(wager, odds),
            isResolved: false,
            createdAt: Date.now()
        };

        // Deduct grit from bettor
        bettor.grit -= wager;
        bettor.ambushBets.push(bet);
        bettor.weeklyStats.gritWagered += wager;
        bettor.weeklyStats.betsPlaced++;

        return bet;
    }

    /**
     * Get ambush bets for a specific user with redaction applied
     * - If user is the bettor: return full details
     * - If user is the target: return redacted (only show total grit wagered against them)
     */
    getAmbushBetsForUser(
        currentUserId: string,
        allAmbushBets: AmbushBet[]
    ): AmbushBetsFilteredView {
        // Bets where current user is the bettor (full details)
        const bettorBets = allAmbushBets.filter(bet => bet.bettorId === currentUserId);

        // Bets where current user is the target (redacted)
        const targetBets = allAmbushBets.filter(bet => bet.targetUserId === currentUserId);
        
        const totalGritAgainst = targetBets.reduce((sum, bet) => sum + bet.wager, 0);
        
        // Redact sensitive information from target bets
        const redactedTargetBets = targetBets.map(bet => ({
            id: bet.id,
            bettorId: 'REDACTED',
            bettorName: 'ANONYMOUS',
            targetUserId: bet.targetUserId,
            targetUserName: bet.targetUserName,
            // description and category are intentionally omitted (redacted)
            odds: 0, // Hidden
            wager: 0, // Hidden per-bet, only show total
            potentialPayout: 0, // Hidden
            isResolved: bet.isResolved,
            won: bet.won,
            createdAt: bet.createdAt,
            resolvedAt: bet.resolvedAt
        }));

        return {
            bettorBets,
            targetBets: {
                totalGritAgainst,
                betCount: targetBets.length,
                bets: redactedTargetBets
            }
        };
    }

    /**
     * Resolve an Ambush bet
     */
    resolveAmbushBet(
        bettor: OverseerPlayerState,
        betId: string,
        won: boolean,
        evidence?: string[]
    ): void {
        const bet = bettor.ambushBets.find(b => b.id === betId);
        
        if (!bet) {
            throw new Error('Bet not found');
        }

        if (bet.isResolved) {
            throw new Error('Bet already resolved');
        }

        bet.isResolved = true;
        bet.won = won;
        bet.resolvedAt = Date.now();
        
        if (evidence) {
            bet.evidence = evidence;
        }

        if (won) {
            bettor.grit += bet.potentialPayout;
            bettor.weeklyStats.gritWon += bet.potentialPayout;
            bettor.weeklyStats.betsWon++;
        } else {
            bettor.weeklyStats.gritLost += bet.wager;
        }
    }

    /**
     * Resolve Ambush bets with Subject-Takes-All logic
     * Executes during "Judgment Day" recap
     * 
     * @param targetPlayerId - The subject (person being bet on)
     * @param allPlayers - All players in the game
     * @param bettorsWon - True if behavior occurred (bettors win), false if not (subject wins)
     * @param evidence - Links to receipts in Locker Room
     * @param activityCheck - Optional activity check for anti-ghosting
     * @returns Resolution result with payouts
     */
    resolveAmbush(
        targetPlayerId: string,
        allPlayers: OverseerPlayerState[],
        bettorsWon: boolean,
        evidence: string[],
        activityCheck?: PlayerActivityCheck
    ): AmbushResolutionResult {
        // Find the target player
        const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);
        if (!targetPlayer) {
            throw new Error('Target player not found');
        }

        // Collect all ambush bets on this target
        const allAmbushBets: AmbushBet[] = [];
        const bettorPlayers: OverseerPlayerState[] = [];

        for (const player of allPlayers) {
            const betsOnTarget = player.ambushBets.filter(
                bet => bet.targetUserId === targetPlayerId && !bet.isResolved
            );
            allAmbushBets.push(...betsOnTarget);
            if (betsOnTarget.length > 0) {
                bettorPlayers.push(player);
            }
        }

        if (allAmbushBets.length === 0) {
            throw new Error('No active ambush bets found for this target');
        }

        // Calculate total pot
        const totalPot = allAmbushBets.reduce((sum, bet) => sum + bet.wager, 0);

        // Check for ghosting
        const ghostingDetected = activityCheck?.isGhosting || false;

        let result: AmbushResolutionResult;

        if (ghostingDetected) {
            // GHOSTING PENALTY: Return 50% to bettors, subject gets social tax
            const returnAmount = totalPot * this.GHOSTING_PENALTY_RATE;
            const perBettorReturn = returnAmount / bettorPlayers.length;

            // Return grit to bettors
            const payouts = bettorPlayers.map(bettor => {
                bettor.grit += perBettorReturn;
                return {
                    playerId: bettor.id,
                    playerName: bettor.name,
                    amount: perBettorReturn
                };
            });

            // Apply social tax to subject (lose the other 50%)
            const socialTax = totalPot - returnAmount;
            targetPlayer.grit = Math.max(0, targetPlayer.grit - socialTax);

            // Mark all bets as resolved (voided)
            for (const bet of allAmbushBets) {
                bet.isResolved = true;
                bet.won = false; // Nobody won due to ghosting
                bet.resolvedAt = Date.now();
                bet.evidence = ['GHOSTING DETECTED - BET VOIDED'];
            }

            result = {
                betId: allAmbushBets[0].id,
                bettorsWon: false,
                totalPot,
                commishCut: 0,
                netPayout: returnAmount,
                payouts,
                ghostingDetected: true,
                evidence: ['Activity dropped >70% - Ghosting penalty applied'],
                resolvedAt: Date.now()
            };
        } else if (bettorsWon) {
            // SCENARIO A: BETTORS WIN
            // Distribute grit to successful bettors based on American odds
            const payouts = [];

            for (const bet of allAmbushBets) {
                const bettor = allPlayers.find(p => p.id === bet.bettorId);
                if (!bettor) continue;

                // Calculate payout based on American odds
                const payout = bet.potentialPayout;
                bettor.grit += payout;
                bettor.weeklyStats.gritWon += payout;
                bettor.weeklyStats.betsWon++;

                payouts.push({
                    playerId: bettor.id,
                    playerName: bettor.name,
                    amount: payout
                });

                // Mark bet as resolved
                bet.isResolved = true;
                bet.won = true;
                bet.resolvedAt = Date.now();
                bet.evidence = evidence;
            }

            const totalPayout = payouts.reduce((sum, p) => sum + p.amount, 0);

            result = {
                betId: allAmbushBets[0].id,
                bettorsWon: true,
                totalPot,
                commishCut: 0,
                netPayout: totalPayout,
                payouts,
                ghostingDetected: false,
                evidence,
                resolvedAt: Date.now()
            };
        } else {
            // SCENARIO B: SUBJECT WINS (Subject-Takes-All)
            // Apply 5% Commish Cut, then transfer entire pot to subject
            const commishCut = totalPot * this.COMMISH_CUT_RATE;
            const netPayout = totalPot - commishCut;

            // Transfer grit to subject
            targetPlayer.grit += netPayout;
            targetPlayer.weeklyStats.gritWon += netPayout;

            // Mark all bets as resolved (lost)
            for (const bet of allAmbushBets) {
                const bettor = allPlayers.find(p => p.id === bet.bettorId);
                if (bettor) {
                    bettor.weeklyStats.gritLost += bet.wager;
                }

                bet.isResolved = true;
                bet.won = false;
                bet.resolvedAt = Date.now();
                bet.evidence = evidence;
            }

            result = {
                betId: allAmbushBets[0].id,
                bettorsWon: false,
                totalPot,
                commishCut,
                netPayout,
                payouts: [{
                    playerId: targetPlayer.id,
                    playerName: targetPlayer.name,
                    amount: netPayout
                }],
                subjectPayout: netPayout,
                ghostingDetected: false,
                evidence,
                resolvedAt: Date.now()
            };
        }

        return result;
    }

    /**
     * Generate Payday notification for subject who won
     */
    generatePaydayNotification(
        resolution: AmbushResolutionResult,
        targetPlayer: OverseerPlayerState
    ): PaydayNotification {
        return {
            type: 'VAULT_TRANSFER',
            recipientId: targetPlayer.id,
            recipientName: targetPlayer.name,
            amount: resolution.subjectPayout || 0,
            message: `YOU JUST TAXED THE BOYS FOR ${resolution.subjectPayout?.toLocaleString()} GRIT.`,
            timestamp: Date.now()
        };
    }

    /**
     * Generate Bankrupt notifications for losers
     */
    generateBankruptNotifications(
        resolution: AmbushResolutionResult,
        targetPlayer: OverseerPlayerState,
        losingBettors: OverseerPlayerState[]
    ): BankruptNotification[] {
        return losingBettors.map(bettor => {
            // Calculate actual amount lost by this specific bettor
            const bettorLoss = bettor.ambushBets
                .filter(bet => bet.targetUserId === targetPlayer.id && bet.isResolved && !bet.won)
                .reduce((sum, bet) => sum + bet.wager, 0);

            return {
                type: 'AMBUSH_LOSS',
                loserId: bettor.id,
                loserName: bettor.name,
                amount: bettorLoss,
                subjectId: targetPlayer.id,
                subjectName: targetPlayer.name,
                message: `YOU GOT AMBUSHED. ${targetPlayer.name.toUpperCase()} TOOK YOUR GRIT.`,
                timestamp: Date.now()
            };
        });
    }
}

export const bettingService = new BettingService();
