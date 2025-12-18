/**
 * Commish Logic Service - The Judgment Algorithms
 * 
 * The Commish acts as the antagonist. It calculates "Cowardice" and "Delusion"
 * to fuel the roasts in Phase 5. This service provides the core AI logic for
 * judging player behavior and generating receipts tags.
 */

import { OverseerPlayerState, SportsbookBet, TribunalBet, AmbushBet } from '../types';

export interface RoastResult {
    message: string;
    severity: 'mild' | 'medium' | 'brutal';
}

/**
 * Calculate if a bet displays cowardice (betting on heavy favorites)
 * @param bet - Any bet with odds property
 * @returns TRUE if user bets on odds worse than -200 (e.g., -500 favorites)
 */
export function calculateCowardice(bet: { odds: number }): boolean {
    // Negative odds indicate favorites
    // Worse than -200 means heavily favored (e.g., -300, -500)
    // More negative = bigger favorite = more cowardice
    if (bet.odds < 0 && bet.odds < -200) {
        return true;
    }
    return false;
}

/**
 * Calculate if a user shows delusion (losing parlays repeatedly)
 * @param userHistory - Player state with bet history
 * @returns TRUE if user has lost >3 Parlays in a row
 */
export function calculateDelusion(userHistory: OverseerPlayerState): boolean {
    // Get all resolved bets
    const allBets = [
        ...userHistory.tribunalBets,
        ...userHistory.sportsbookBets,
        ...userHistory.ambushBets
    ];

    // Filter to only resolved bets and sort by resolution time (most recent first)
    const resolvedBets = allBets
        .filter(bet => bet.isResolved)
        .sort((a, b) => {
            const aTime = 'resolvedAt' in a ? (a.resolvedAt || 0) : 0;
            const bTime = 'resolvedAt' in b ? (b.resolvedAt || 0) : 0;
            return bTime - aTime;
        });

    // Check for parlays specifically
    // In this system, we'll consider tribunal bets with multiple nominees or
    // sportsbook bets of type 'prop' as parlay-like behavior
    // For simplicity, we'll check recent losses in general
    
    // Get the last 3+ bets
    const recentBets = resolvedBets.slice(0, 4);
    
    if (recentBets.length < 3) {
        return false; // Not enough data
    }

    // Check if last 3+ are all losses
    const lossStreak = recentBets.slice(0, 3).every(bet => bet.won === false);
    
    return lossStreak;
}

/**
 * Generate a roast based on user's recent performance
 * @param user - Player state to analyze
 * @returns A string roast based on their stats
 */
export function generateRoast(user: OverseerPlayerState): RoastResult {
    const allBets = [
        ...user.tribunalBets,
        ...user.sportsbookBets,
        ...user.ambushBets
    ];

    const resolvedBets = allBets.filter(bet => bet.isResolved);
    
    if (resolvedBets.length === 0) {
        return {
            message: `${user.name} is statistically irrelevant.`,
            severity: 'mild'
        };
    }

    // Calculate win rate
    const wins = resolvedBets.filter(bet => bet.won === true).length;
    const winRate = (wins / resolvedBets.length) * 100;

    // Check for cowardice
    const cowardBets = resolvedBets.filter(bet => calculateCowardice(bet));
    const cowardiceRate = (cowardBets.length / resolvedBets.length) * 100;

    // Check for delusion
    const isDelusional = calculateDelusion(user);

    // Generate roast based on performance
    if (winRate < 30) {
        return {
            message: `Fade this man immediately. ${user.name} is ${winRate.toFixed(0)}% on the season.`,
            severity: 'brutal'
        };
    }

    if (isDelusional) {
        return {
            message: `FRAUD ALERT: ${user.name} has lost 3+ in a row. Delusion detected.`,
            severity: 'brutal'
        };
    }

    if (cowardiceRate > 50) {
        return {
            message: `${user.name} only bets heavy favorites. COWARD detected.`,
            severity: 'medium'
        };
    }

    if (winRate < 45) {
        return {
            message: `${user.name} is barely treading water at ${winRate.toFixed(0)}%. Mediocre.`,
            severity: 'medium'
        };
    }

    if (winRate > 60) {
        return {
            message: `${user.name} is cooking at ${winRate.toFixed(0)}%. Respect.`,
            severity: 'mild'
        };
    }

    return {
        message: `${user.name} is exactly average. Unremarkable.`,
        severity: 'mild'
    };
}

/**
 * Tag a bet slip with "COWARD" stamp if it meets cowardice criteria
 * @param bet - Bet to evaluate
 * @returns Tag string or null
 */
export function tagBetSlip(bet: { odds: number }): string | null {
    if (calculateCowardice(bet)) {
        return 'COWARD';
    }
    return null;
}

/**
 * Generate weekly edict based on league state
 * @param weekNumber - Current week number
 * @param volatility - League volatility level (0-100)
 * @returns Edict object with rule and description
 */
export function generateWeeklyEdict(weekNumber: number, volatility: number = 50): {
    header: string;
    rule: string;
    description: string;
} {
    // Pool of possible edicts
    const edicts = [
        {
            rule: 'MANDATORY UNDERDOGS',
            description: 'All bets must be +100 or higher. No favorites allowed.'
        },
        {
            rule: 'TRIBUNAL ONLY PROTOCOL',
            description: 'Sportsbook betting is suspended. Social betting only.'
        },
        {
            rule: 'HIGH VOLATILITY MODE',
            description: 'Minimum bet requirement increased to 100 Grit.'
        },
        {
            rule: 'PARLAY PROHIBITION',
            description: 'Multi-leg bets are forbidden. Single bets only.'
        },
        {
            rule: 'SHADOW LOCK SURVEILLANCE',
            description: 'All Ambush bets will be audited within 24 hours.'
        },
        {
            rule: 'MERCY RULE ACTIVE',
            description: 'Players below 200 Grit are eligible for predatory loans.'
        },
        {
            rule: 'NO RESTRICTIONS',
            description: 'The Commish is feeling generous. Bet freely... for now.'
        }
    ];

    // Select edict based on week and volatility
    // Higher volatility = stricter rules
    let edictIndex;
    if (volatility > 70) {
        // High volatility - strict rules
        edictIndex = Math.floor(Math.random() * 5); // First 5 are restrictive
    } else if (volatility < 30) {
        // Low volatility - lenient
        edictIndex = 6; // No restrictions
    } else {
        // Medium volatility - random
        edictIndex = Math.floor(Math.random() * edicts.length);
    }

    const edict = edicts[edictIndex];

    return {
        header: `WEEK ${weekNumber} PROTOCOL`,
        rule: edict.rule,
        description: edict.description
    };
}
