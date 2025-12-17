/**
 * Demo/Test utilities for The Board
 * 
 * Helper functions to demonstrate features with mock data
 */

import { OverseerPlayerState, AmbushBet } from '../types';
import { characterData } from '../constants';

/**
 * Create mock players for testing
 */
export const createMockPlayers = (): OverseerPlayerState[] => {
    const characterIds = ['eric', 'wyatt', 'alex', 'colin', 'spencer'];
    
    return characterIds.map(id => {
        const character = characterData[id];
        return {
            ...character,
            grit: 500,
            loveLife: 50,
            fandom: 50,
            uniqueStatValue: 50,
            energy: 3,
            happiness: 75,
            paSchoolStress: 50,
            insecurity: 50,
            liberalGfSuspicion: 50,
            truckMaintenance: 50,
            ego: 50,
            parlayAddiction: 50,
            commishPower: 50,
            clout: 50,
            unlockedAchievements: [],
            ownedItems: [],
            equippedItems: [],
            activePowerUps: [],
            tradeOffers: [],
            tribunalBets: [],
            squadRideBets: [],
            sportsbookBets: [],
            ambushBets: [],
            ambushTargetBets: [],
            weeklyStats: {
                gritWagered: 0,
                gritWon: 0,
                gritLost: 0,
                betsPlaced: 0,
                betsWon: 0
            }
        };
    });
};

/**
 * Create mock ambush bets for demonstration
 */
export const createMockAmbushBets = (targetPlayerId: string, targetPlayerName: string): AmbushBet[] => {
    return [
        {
            id: 'demo_ambush_1',
            bettorId: 'wyatt',
            bettorName: 'Wyatt',
            targetUserId: targetPlayerId,
            targetUserName: targetPlayerName,
            description: 'Will mention the Ravens at least 3 times in the group chat today',
            category: 'social',
            odds: 150,
            wager: 500,
            potentialPayout: 1250,
            isResolved: false,
            createdAt: Date.now() - 3600000 // 1 hour ago
        },
        {
            id: 'demo_ambush_2',
            bettorId: 'alex',
            bettorName: 'Alex',
            targetUserId: targetPlayerId,
            targetUserName: targetPlayerName,
            description: 'Will defend their team in an argument within 24 hours',
            category: 'behavior',
            odds: 200,
            wager: 1000,
            potentialPayout: 3000,
            isResolved: false,
            createdAt: Date.now() - 7200000 // 2 hours ago
        },
        {
            id: 'demo_ambush_3',
            bettorId: 'colin',
            bettorName: 'Colin',
            targetUserId: targetPlayerId,
            targetUserName: targetPlayerName,
            description: 'Will make a delusional prediction about their favorite player',
            category: 'social',
            odds: 125,
            wager: 750,
            potentialPayout: 1687,
            isResolved: false,
            createdAt: Date.now() - 1800000 // 30 minutes ago
        }
    ];
};
