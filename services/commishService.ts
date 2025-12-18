/**
 * Commish Service - The AI Overlord Logic Brain
 * 
 * The Commish is a ruthless AI that watches every bet and enforces its will.
 * This service handles:
 * - Auto-Roast: Public shaming for 3 consecutive losses
 * - The Mercy Rule: Predatory loans for players with low grit
 * - The Audit: Random Shadow Lock verification
 * - Loan tracking and enforcement
 */

import { OverseerPlayerState } from '../types';
import { ActionFeedMessage } from '../components/ActionFeed';

export interface CommishLoan {
    id: string;
    playerId: string;
    playerName: string;
    principal: number; // Amount borrowed
    interestRate: number; // Decimal (e.g., 1.0 = 100%)
    totalOwed: number; // Principal * (1 + interestRate)
    issuedAt: number;
    dueDate: number; // Sunday deadline
    isPaid: boolean;
    isDefaulted: boolean;
}

export interface CommishState {
    isActive: boolean; // AI is watching
    volatility: number; // 0-100, affects odds and behavior
    loans: CommishLoan[];
    lastAuditTime: number;
    roastedPlayers: Set<string>; // Players who have been roasted this session
}

class CommishService {
    private state: CommishState = {
        isActive: true,
        volatility: 50,
        loans: [],
        lastAuditTime: Date.now(),
        roastedPlayers: new Set()
    };

    private readonly MERCY_THRESHOLD = 100; // Grit threshold for mercy offer
    private readonly LOAN_AMOUNT = 500; // Standard loan amount
    private readonly INTEREST_RATE = 1.0; // 100% interest (predatory)
    private readonly LOAN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    private readonly AUDIT_COOLDOWN = 60 * 60 * 1000; // 1 hour between audits

    /**
     * Check if player has lost 3 bets in a row and trigger auto-roast
     */
    checkForAutoRoast(player: OverseerPlayerState): ActionFeedMessage | null {
        // Calculate recent bet streak
        const recentBets = [...player.tribunalBets, ...player.sportsbookBets, ...player.ambushBets]
            .filter(bet => bet.isResolved)
            .sort((a, b) => {
                const aTime = 'resolvedAt' in a ? (a.resolvedAt || 0) : 0;
                const bTime = 'resolvedAt' in b ? (b.resolvedAt || 0) : 0;
                return bTime - aTime;
            })
            .slice(0, 3);

        if (recentBets.length < 3) return null;

        const allLosses = recentBets.every(bet => bet.won === false);
        
        if (allLosses && !this.state.roastedPlayers.has(player.id)) {
            this.state.roastedPlayers.add(player.id);
            
            const roasts = [
                `PATHETIC. ${player.name} just hit the HAT TRICK OF SHAME. 3 straight Ls.`,
                `${player.name} is COOKED. Three bets, three failures. THE COMMISH IS WATCHING.`,
                `ALERT: ${player.name} has achieved MAXIMUM INCOMPETENCE. 3-bet losing streak detected.`,
                `${player.name} should retire. Three straight losses. This is not a coincidence.`,
                `THE COMMISH HAS FLAGGED ${player.name} FOR INVESTIGATION. Three consecutive failures.`
            ];

            return {
                id: `roast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                message: roasts[Math.floor(Math.random() * roasts.length)],
                timestamp: Date.now(),
                type: 'commish',
                direction: 'down',
                isWhale: false
            };
        }

        return null;
    }

    /**
     * Check if player qualifies for mercy rule and needs a loan offer
     */
    checkMercyRule(player: OverseerPlayerState): boolean {
        if (player.grit >= this.MERCY_THRESHOLD) return false;
        
        // Check if player already has an active loan
        const hasActiveLoan = this.state.loans.some(
            loan => loan.playerId === player.id && !loan.isPaid && !loan.isDefaulted
        );
        
        if (hasActiveLoan) return false;

        // Player qualifies for mercy (predatory loan offer)
        return true;
    }

    /**
     * Issue a predatory loan to a struggling player
     */
    issueLoan(player: OverseerPlayerState): CommishLoan {
        const loan: CommishLoan = {
            id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: player.id,
            playerName: player.name,
            principal: this.LOAN_AMOUNT,
            interestRate: this.INTEREST_RATE,
            totalOwed: this.LOAN_AMOUNT * (1 + this.INTEREST_RATE),
            issuedAt: Date.now(),
            dueDate: Date.now() + this.LOAN_DURATION,
            isPaid: false,
            isDefaulted: false
        };

        this.state.loans.push(loan);
        return loan;
    }

    /**
     * Process loan repayment
     */
    repayLoan(player: OverseerPlayerState, loanId: string): { success: boolean; message: string } {
        const loan = this.state.loans.find(l => l.id === loanId);
        
        if (!loan) {
            return { success: false, message: 'Loan not found.' };
        }

        if (loan.isPaid) {
            return { success: false, message: 'Loan already paid.' };
        }

        if (player.grit < loan.totalOwed) {
            return { success: false, message: `Insufficient grit. Need ${loan.totalOwed}, have ${player.grit}.` };
        }

        loan.isPaid = true;
        return { success: true, message: `Loan repaid. THE COMMISH is satisfied... for now.` };
    }

    /**
     * Check for overdue loans and trigger Gulag
     */
    checkOverdueLoans(player: OverseerPlayerState): CommishLoan | null {
        const overdueLoan = this.state.loans.find(
            loan => loan.playerId === player.id && 
                   !loan.isPaid && 
                   !loan.isDefaulted && 
                   Date.now() > loan.dueDate
        );

        if (overdueLoan) {
            overdueLoan.isDefaulted = true;
            return overdueLoan;
        }

        return null;
    }

    /**
     * The Audit - Randomly verify Shadow Locks
     * Returns true if an audit should trigger
     */
    shouldTriggerAudit(): boolean {
        const timeSinceLastAudit = Date.now() - this.state.lastAuditTime;
        
        if (timeSinceLastAudit < this.AUDIT_COOLDOWN) return false;

        // 10% chance to trigger audit
        const shouldTrigger = Math.random() < 0.1;
        
        if (shouldTrigger) {
            this.state.lastAuditTime = Date.now();
        }

        return shouldTrigger;
    }

    /**
     * Perform audit on a player's ambush bets
     */
    auditAmbushBet(player: OverseerPlayerState): { 
        bet: any | null; 
        autoResolved: boolean;
        message: ActionFeedMessage | null;
    } {
        // Find an unresolved ambush bet
        const unresolvedBets = player.ambushBets.filter(bet => !bet.isResolved);
        
        if (unresolvedBets.length === 0) {
            return { bet: null, autoResolved: false, message: null };
        }

        // Pick a random bet to audit
        const bet = unresolvedBets[Math.floor(Math.random() * unresolvedBets.length)];

        // For now, we'll just create a message. Actual verification would need evidence
        const message: ActionFeedMessage = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: `THE COMMISH is auditing a Shadow Lock on ${bet.targetUserName}. Evidence required.`,
            timestamp: Date.now(),
            type: 'commish',
            direction: 'neutral'
        };

        return { bet, autoResolved: false, message };
    }

    /**
     * Update volatility based on global betting patterns
     */
    updateVolatility(delta: number): void {
        this.state.volatility = Math.max(0, Math.min(100, this.state.volatility + delta));
    }

    /**
     * Get current AI state
     */
    getState(): CommishState {
        return { ...this.state };
    }

    /**
     * Get all active loans for a player
     */
    getPlayerLoans(playerId: string): CommishLoan[] {
        return this.state.loans.filter(
            loan => loan.playerId === playerId && !loan.isPaid && !loan.isDefaulted
        );
    }

    /**
     * Generate thought process ticker messages
     */
    generateThoughtProcess(): string[] {
        const thoughts = [
            'SCANNING GRIT RESERVES...',
            'DETECTING WEAKNESS...',
            'CALCULATING ODDS...',
            'ANALYZING BETTING PATTERNS...',
            'MONITORING SQUAD RIDES...',
            'EVALUATING TRIBUNAL EXPOSURE...',
            'PROCESSING SHADOW LOCKS...',
            'ASSESSING BANKRUPTCY RISK...',
            'TRACKING LOAN DEFAULTS...',
            'MEASURING VOLATILITY...'
        ];

        // Return 3 random thoughts
        const shuffled = [...thoughts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }

    /**
     * Check if Red Phone should trigger for a player
     */
    shouldTriggerRedPhone(player: OverseerPlayerState): {
        trigger: boolean;
        reason: 'low_grit' | 'winstreak' | 'paranoia' | null;
    } {
        // Low grit trigger
        if (player.grit < this.MERCY_THRESHOLD && this.checkMercyRule(player)) {
            return { trigger: true, reason: 'low_grit' };
        }

        // High winstreak trigger (5+ wins in a row)
        const recentWins = [...player.tribunalBets, ...player.sportsbookBets, ...player.ambushBets]
            .filter(bet => bet.isResolved)
            .sort((a, b) => {
                const aTime = 'resolvedAt' in a ? (a.resolvedAt || 0) : 0;
                const bTime = 'resolvedAt' in b ? (b.resolvedAt || 0) : 0;
                return bTime - aTime;
            })
            .slice(0, 5);

        if (recentWins.length === 5 && recentWins.every(bet => bet.won === true)) {
            return { trigger: true, reason: 'winstreak' };
        }

        // Random paranoia check (5% chance)
        if (Math.random() < 0.05) {
            return { trigger: true, reason: 'paranoia' };
        }

        return { trigger: false, reason: null };
    }

    /**
     * Reset roasted players list (call at start of new week)
     */
    resetRoastList(): void {
        this.state.roastedPlayers.clear();
    }
}

export const commishService = new CommishService();
