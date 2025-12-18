/**
 * Asset Service
 * 
 * Handles "The Asset Exchange" - A tactical spy-themed marketplace:
 * - Sealed Bid System (Blind Auctions)
 * - Handshake Protocol (P2P Trading)
 */

import { WaiverListing, WaiverBid, LoreItem, OverseerPlayerState } from '../types';

class AssetService {
    /**
     * Submit a sealed bid on an item
     * The bid is "sealed" - hidden from other players until resolution
     */
    submitSealedBid(
        itemId: string,
        amount: number,
        bidderId: string,
        bidderName: string,
        bidderGrit: number
    ): { success: boolean; bid?: WaiverBid; error?: string } {
        if (amount < 1) {
            return { success: false, error: 'Bid amount must be at least 1 grit' };
        }

        if (amount > bidderGrit) {
            return { success: false, error: 'Insufficient grit for bid' };
        }

        const bid: WaiverBid = {
            id: crypto.randomUUID ? crypto.randomUUID() : `sealed_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            waiverListingId: itemId,
            bidderId,
            bidderName,
            bidAmount: amount,
            placedAt: Date.now()
        };

        return { success: true, bid };
    }

    /**
     * Execute a handshake (P2P trade)
     * Both parties must have authorized the transfer
     */
    executeHandshake(
        playerA: OverseerPlayerState,
        itemsA: LoreItem[],
        playerB: OverseerPlayerState,
        itemsB: LoreItem[]
    ): {
        success: boolean;
        playerA?: OverseerPlayerState;
        playerB?: OverseerPlayerState;
        error?: string;
    } {
        // Validation
        if (itemsA.length === 0 || itemsB.length === 0) {
            return { success: false, error: 'Both sides must offer at least one item' };
        }

        if (itemsA.length > 5 || itemsB.length > 5) {
            return { success: false, error: 'Maximum 5 items per side' };
        }

        // Verify ownership
        for (const item of itemsA) {
            if (!playerA.ownedItems.some(i => i.id === item.id)) {
                return { success: false, error: `Player A does not own: ${item.name}` };
            }
        }

        for (const item of itemsB) {
            if (!playerB.ownedItems.some(i => i.id === item.id)) {
                return { success: false, error: `Player B does not own: ${item.name}` };
            }
        }

        // Execute atomic swap
        const itemAIds = itemsA.map(i => i.id);
        const itemBIds = itemsB.map(i => i.id);

        playerA.ownedItems = playerA.ownedItems.filter(i => !itemAIds.includes(i.id));
        playerA.ownedItems.push(...itemsB);

        playerB.ownedItems = playerB.ownedItems.filter(i => !itemBIds.includes(i.id));
        playerB.ownedItems.push(...itemsA);

        return {
            success: true,
            playerA,
            playerB
        };
    }

    /**
     * Generate a unique transaction ID for tracking
     */
    generateTransactionId(): string {
        return crypto.randomUUID ? crypto.randomUUID() : `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Calculate time remaining for a sealed bid window
     */
    getTimeRemaining(expiresAt: number): {
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    } {
        const now = Date.now();
        const remaining = expiresAt - now;

        if (remaining <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }

        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

        return { hours, minutes, seconds, isExpired: false };
    }
}

export const assetService = new AssetService();
