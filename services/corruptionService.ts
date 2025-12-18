/**
 * The Corruption Service - "The Syndicate" Black Market
 * Handles illegal actions: Wiretap, Gag Order, Frame Up
 * Deep State mechanics for Mini Beasts
 */

import { OverseerPlayerState } from '../types';

// Costs for illegal actions
export const CORRUPTION_COSTS = {
  WIRETAP: 2000,
  GAG_ORDER: 1500,
  FRAME_UP: 500,
} as const;

export type CorruptionAction = keyof typeof CORRUPTION_COSTS;

export interface WiretapPurchase {
  playerId: string;
  targetBetId: string;
  purchasedAt: number;
}

export interface GagOrder {
  targetPlayerId: string;
  appliedAt: number;
  expiresAt: number;
}

export interface FrameUp {
  targetPlayerId: string;
  message: string;
  sentAt: number;
}

class CorruptionService {
  private wiretaps: WiretapPurchase[] = [];
  private gagOrders: GagOrder[] = [];
  private frameUps: FrameUp[] = [];

  /**
   * Purchase a Wiretap to reveal hidden text/odds
   * @throws Error if insufficient funds
   */
  purchaseWiretap(playerId: string, targetBetId: string, playerGrit: number): WiretapPurchase {
    if (playerGrit < CORRUPTION_COSTS.WIRETAP) {
      throw new Error('INSUFFICIENT FUNDS. THE SYNDICATE DOES NOT WORK ON CREDIT.');
    }

    const purchase: WiretapPurchase = {
      playerId,
      targetBetId,
      purchasedAt: Date.now(),
    };

    this.wiretaps.push(purchase);

    // Store in localStorage for persistence
    this.saveToLocalStorage('wiretaps', this.wiretaps);

    return purchase;
  }

  /**
   * Apply a Gag Order to silence a rival
   * @throws Error if insufficient funds
   */
  applyGagOrder(targetPlayerId: string, playerGrit: number): GagOrder {
    if (playerGrit < CORRUPTION_COSTS.GAG_ORDER) {
      throw new Error('INSUFFICIENT FUNDS. THE SYNDICATE DOES NOT WORK ON CREDIT.');
    }

    const gagOrder: GagOrder = {
      targetPlayerId,
      appliedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    this.gagOrders.push(gagOrder);

    // Store gag order flag in localStorage
    const gaggedPlayers = this.getGaggedPlayers();
    gaggedPlayers[targetPlayerId] = gagOrder.expiresAt;
    localStorage.setItem('syndicate_gagged_players', JSON.stringify(gaggedPlayers));

    this.saveToLocalStorage('gagOrders', this.gagOrders);

    return gagOrder;
  }

  /**
   * Send a fake notification to a rival (Frame Up)
   * @throws Error if insufficient funds
   */
  frameUp(targetPlayerId: string, message: string, playerGrit: number): FrameUp {
    if (playerGrit < CORRUPTION_COSTS.FRAME_UP) {
      throw new Error('INSUFFICIENT FUNDS. THE SYNDICATE DOES NOT WORK ON CREDIT.');
    }

    const frameUp: FrameUp = {
      targetPlayerId,
      message,
      sentAt: Date.now(),
    };

    this.frameUps.push(frameUp);

    // Store frame-up in localStorage for the target to see
    const frameUpsForTarget = this.getFrameUpsForPlayer(targetPlayerId);
    frameUpsForTarget.push(frameUp);
    localStorage.setItem(`syndicate_frameups_${targetPlayerId}`, JSON.stringify(frameUpsForTarget));

    this.saveToLocalStorage('frameUps', this.frameUps);

    return frameUp;
  }

  /**
   * Check if a player has purchased a wiretap for a specific bet
   */
  hasWiretap(playerId: string, targetBetId: string): boolean {
    return this.wiretaps.some(
      (w) => w.playerId === playerId && w.targetBetId === targetBetId
    );
  }

  /**
   * Check if a player is currently gagged
   */
  isPlayerGagged(playerId: string): boolean {
    const gaggedPlayers = this.getGaggedPlayers();
    const gagExpiry = gaggedPlayers[playerId];

    if (!gagExpiry) return false;

    // Check if gag has expired
    if (Date.now() > gagExpiry) {
      delete gaggedPlayers[playerId];
      localStorage.setItem('syndicate_gagged_players', JSON.stringify(gaggedPlayers));
      return false;
    }

    return true;
  }

  /**
   * Get all frame-ups sent to a specific player
   */
  getFrameUpsForPlayer(targetPlayerId: string): FrameUp[] {
    const stored = localStorage.getItem(`syndicate_frameups_${targetPlayerId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Clear a frame-up notification (mark as read)
   */
  clearFrameUp(targetPlayerId: string, frameUpIndex: number): void {
    const frameUps = this.getFrameUpsForPlayer(targetPlayerId);
    frameUps.splice(frameUpIndex, 1);
    localStorage.setItem(`syndicate_frameups_${targetPlayerId}`, JSON.stringify(frameUps));
  }

  /**
   * Get gagged players from localStorage
   */
  private getGaggedPlayers(): { [playerId: string]: number } {
    const stored = localStorage.getItem('syndicate_gagged_players');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save data to localStorage
   */
  private saveToLocalStorage<T>(key: string, data: T): void {
    localStorage.setItem(`syndicate_${key}`, JSON.stringify(data));
  }

  /**
   * Load data from localStorage
   */
  private loadFromLocalStorage<T>(key: string): T | null {
    const stored = localStorage.getItem(`syndicate_${key}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Initialize service by loading persisted data
   */
  initialize(): void {
    const storedWiretaps = this.loadFromLocalStorage('wiretaps');
    const storedGagOrders = this.loadFromLocalStorage('gagOrders');
    const storedFrameUps = this.loadFromLocalStorage('frameUps');

    if (storedWiretaps) this.wiretaps = storedWiretaps;
    if (storedGagOrders) this.gagOrders = storedGagOrders;
    if (storedFrameUps) this.frameUps = storedFrameUps;
  }

  /**
   * Get player's wiretap purchases
   */
  getPlayerWiretaps(playerId: string): WiretapPurchase[] {
    return this.wiretaps.filter((w) => w.playerId === playerId);
  }

  /**
   * Get all active gag orders
   */
  getActiveGagOrders(): GagOrder[] {
    const now = Date.now();
    return this.gagOrders.filter((g) => g.expiresAt > now);
  }
}

// Export singleton instance
export const corruptionService = new CorruptionService();

// Initialize on module load
corruptionService.initialize();
