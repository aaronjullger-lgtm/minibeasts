/**
 * The Black Ledger Service - "Operations" Control
 * Handles corruption mechanics with the new "Tactical Luxury" terminology
 * Updated from Syndicate terminology to Military/Spy Operations
 */

import { OverseerPlayerState } from '../types';

// Costs for operations (in Grit)
export const OPERATION_COSTS = {
  INTERCEPT: 2000,      // View hidden odds (formerly WIRETAP)
  JAM_COMMS: 1500,      // Silence user (formerly GAG_ORDER)
  FIX_MATCH: 3000,      // Adjust line (formerly FRAME_UP - increased cost for match fixing)
} as const;

export type OperationType = keyof typeof OPERATION_COSTS;

export interface Operation {
  id: OperationType;
  name: string;
  description: string;
  cost: number;
}

export interface InterceptPurchase {
  playerId: string;
  targetBetId: string;
  purchasedAt: number;
}

export interface CommJam {
  targetPlayerId: string;
  appliedAt: number;
  expiresAt: number;
}

export interface MatchFix {
  targetPlayerId: string;
  adjustmentType: string;
  appliedAt: number;
}

class LedgerService {
  private intercepts: InterceptPurchase[] = [];
  private commJams: CommJam[] = [];
  private matchFixes: MatchFix[] = [];

  /**
   * Get available operations
   */
  getOperations(): Operation[] {
    return [
      {
        id: 'INTERCEPT',
        name: 'Wiretap',
        description: 'View hidden odds and insider intel',
        cost: OPERATION_COSTS.INTERCEPT,
      },
      {
        id: 'JAM_COMMS',
        name: 'Silence',
        description: 'Suppress rival communications',
        cost: OPERATION_COSTS.JAM_COMMS,
      },
      {
        id: 'FIX_MATCH',
        name: 'Bribe',
        description: 'Influence line movement',
        cost: OPERATION_COSTS.FIX_MATCH,
      },
    ];
  }

  /**
   * Execute INTERCEPT operation
   * @throws Error if insufficient funds
   */
  executeIntercept(playerId: string, targetBetId: string, playerGrit: number): InterceptPurchase {
    if (playerGrit < OPERATION_COSTS.INTERCEPT) {
      throw new Error('INSUFFICIENT FUNDS FOR OPERATION');
    }

    const purchase: InterceptPurchase = {
      playerId,
      targetBetId,
      purchasedAt: Date.now(),
    };

    this.intercepts.push(purchase);
    this.saveToLocalStorage('intercepts', this.intercepts);

    return purchase;
  }

  /**
   * Execute JAM_COMMS operation
   * @throws Error if insufficient funds
   */
  executeJamComms(targetPlayerId: string, playerGrit: number): CommJam {
    if (playerGrit < OPERATION_COSTS.JAM_COMMS) {
      throw new Error('INSUFFICIENT FUNDS FOR OPERATION');
    }

    const jam: CommJam = {
      targetPlayerId,
      appliedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    this.commJams.push(jam);

    // Store in localStorage for persistence
    const jammedPlayers = this.getJammedPlayers();
    jammedPlayers[targetPlayerId] = jam.expiresAt;
    localStorage.setItem('ledger_jammed_players', JSON.stringify(jammedPlayers));

    this.saveToLocalStorage('commJams', this.commJams);

    return jam;
  }

  /**
   * Execute FIX_MATCH operation
   * @throws Error if insufficient funds
   */
  executeFixMatch(targetPlayerId: string, adjustmentType: string, playerGrit: number): MatchFix {
    if (playerGrit < OPERATION_COSTS.FIX_MATCH) {
      throw new Error('INSUFFICIENT FUNDS FOR OPERATION');
    }

    const fix: MatchFix = {
      targetPlayerId,
      adjustmentType,
      appliedAt: Date.now(),
    };

    this.matchFixes.push(fix);

    // Store fix in localStorage for the target
    const fixesForTarget = this.getFixesForPlayer(targetPlayerId);
    fixesForTarget.push(fix);
    localStorage.setItem(`ledger_fixes_${targetPlayerId}`, JSON.stringify(fixesForTarget));

    this.saveToLocalStorage('matchFixes', this.matchFixes);

    return fix;
  }

  /**
   * Check if a player has an active intercept for a specific bet
   */
  hasIntercept(playerId: string, targetBetId: string): boolean {
    return this.intercepts.some(
      (i) => i.playerId === playerId && i.targetBetId === targetBetId
    );
  }

  /**
   * Check if a player is currently jammed
   */
  isPlayerJammed(playerId: string): boolean {
    const jammedPlayers = this.getJammedPlayers();
    const jamExpiry = jammedPlayers[playerId];

    if (!jamExpiry) return false;

    // Check if jam has expired
    if (Date.now() > jamExpiry) {
      delete jammedPlayers[playerId];
      localStorage.setItem('ledger_jammed_players', JSON.stringify(jammedPlayers));
      return false;
    }

    return true;
  }

  /**
   * Get all fixes applied to a specific player
   */
  getFixesForPlayer(targetPlayerId: string): MatchFix[] {
    const stored = localStorage.getItem(`ledger_fixes_${targetPlayerId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get jammed players from localStorage
   */
  private getJammedPlayers(): { [playerId: string]: number } {
    const stored = localStorage.getItem('ledger_jammed_players');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save data to localStorage
   */
  private saveToLocalStorage<T>(key: string, data: T): void {
    localStorage.setItem(`ledger_${key}`, JSON.stringify(data));
  }

  /**
   * Load data from localStorage
   */
  private loadFromLocalStorage<T>(key: string): T | null {
    const stored = localStorage.getItem(`ledger_${key}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Initialize service by loading persisted data
   */
  initialize(): void {
    const storedIntercepts = this.loadFromLocalStorage('intercepts');
    const storedCommJams = this.loadFromLocalStorage('commJams');
    const storedMatchFixes = this.loadFromLocalStorage('matchFixes');

    if (storedIntercepts) this.intercepts = storedIntercepts;
    if (storedCommJams) this.commJams = storedCommJams;
    if (storedMatchFixes) this.matchFixes = storedMatchFixes;
  }

  /**
   * Get player's intercept purchases
   */
  getPlayerIntercepts(playerId: string): InterceptPurchase[] {
    return this.intercepts.filter((i) => i.playerId === playerId);
  }

  /**
   * Get all active comm jams
   */
  getActiveCommJams(): CommJam[] {
    const now = Date.now();
    return this.commJams.filter((j) => j.expiresAt > now);
  }
}

// Export singleton instance
export const ledgerService = new LedgerService();

// Initialize on module load
ledgerService.initialize();
