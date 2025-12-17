/**
 * Waiver Wire Service
 * 
 * Handles blind-bid liquidations for mystery box items:
 * - Users list items on waivers instead of quick-selling
 * - Other users place hidden bids (blind bidding)
 * - After 24 hours, highest bidder wins
 * - Original owner gets 50% of winning bid, 50% is burned
 */

import { WaiverListing, WaiverBid, LoreItem, OverseerPlayerState } from '../types';

class WaiverWireService {
    private readonly WAIVER_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
    private readonly OWNER_PAYOUT_RATE = 0.50; // 50% to original owner
    private readonly BURN_RATE = 0.50; // 50% burned by Commish

    /**
     * List an item on the Waiver Wire
     */
    listItemOnWaivers(
        itemId: string,
        ownerId: string,
        ownerName: string
    ): WaiverListing {
        const now = Date.now();
        
        const listing: WaiverListing = {
            id: `waiver_${now}_${Math.random().toString(36).substring(2, 11)}`,
            itemId,
            originalOwnerId: ownerId,
            originalOwnerName: ownerName,
            listedAt: now,
            expiresAt: now + this.WAIVER_DURATION_MS,
            status: 'active'
        };

        return listing;
    }

    /**
     * Place a blind bid on a waiver listing
     * Bid amount is hidden from everyone until resolution
     */
    placeBid(
        listing: WaiverListing,
        bidderId: string,
        bidderName: string,
        bidAmount: number,
        bidderGrit: number
    ): WaiverBid {
        if (listing.status !== 'active') {
            throw new Error('Waiver listing is not active');
        }

        if (Date.now() >= listing.expiresAt) {
            throw new Error('Waiver window has closed');
        }

        if (bidAmount > bidderGrit) {
            throw new Error('Insufficient grit for bid');
        }

        if (bidderId === listing.originalOwnerId) {
            throw new Error('Cannot bid on your own waiver listing');
        }

        if (bidAmount <= 0) {
            throw new Error('Bid amount must be positive');
        }

        const bid: WaiverBid = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            waiverListingId: listing.id,
            bidderId,
            bidderName,
            bidAmount, // This stays hidden in client until resolution
            placedAt: Date.now()
        };

        return bid;
    }

    /**
     * Resolve a waiver listing (atomic transaction)
     * Returns winning bid and payout info
     */
    resolveWaiver(
        listing: WaiverListing,
        allBids: WaiverBid[],
        players: OverseerPlayerState[],
        item: LoreItem
    ): {
        winningBid: WaiverBid | null;
        ownerPayout: number;
        burnedAmount: number;
        winner: OverseerPlayerState | null;
        originalOwner: OverseerPlayerState | null;
    } {
        if (listing.status !== 'active') {
            throw new Error('Waiver already resolved');
        }

        if (Date.now() < listing.expiresAt) {
            throw new Error('Waiver window has not closed yet');
        }

        const bidsForListing = allBids.filter(bid => bid.waiverListingId === listing.id);

        // No bids - item stays with original owner
        if (bidsForListing.length === 0) {
            listing.status = 'resolved';
            return {
                winningBid: null,
                ownerPayout: 0,
                burnedAmount: 0,
                winner: null,
                originalOwner: players.find(p => p.id === listing.originalOwnerId) || null
            };
        }

        // Find highest bid
        const winningBid = bidsForListing.reduce((highest, current) => 
            current.bidAmount > highest.bidAmount ? current : highest
        );

        winningBid.won = true;

        // Mark all other bids as lost
        bidsForListing.forEach(bid => {
            if (bid.id !== winningBid.id) {
                bid.won = false;
            }
        });

        // Calculate payouts
        const winningBidAmount = winningBid.bidAmount;
        const ownerPayout = Math.floor(winningBidAmount * this.OWNER_PAYOUT_RATE);
        const burnedAmount = winningBidAmount - ownerPayout;

        // Find players
        const winner = players.find(p => p.id === winningBid.bidderId);
        const originalOwner = players.find(p => p.id === listing.originalOwnerId);

        if (!winner || !originalOwner) {
            throw new Error('Player not found');
        }

        // Atomic transaction: Transfer grit and item
        // Deduct bid from winner
        winner.grit -= winningBidAmount;
        
        // Pay original owner
        originalOwner.grit += ownerPayout;
        
        // Transfer item
        originalOwner.ownedItems = originalOwner.ownedItems.filter(i => i.id !== item.id);
        winner.ownedItems.push(item);

        // Update listing
        listing.status = 'resolved';
        listing.winningBid = winningBid;

        return {
            winningBid,
            ownerPayout,
            burnedAmount,
            winner,
            originalOwner
        };
    }

    /**
     * Cancel a waiver listing (only if no bids placed)
     */
    cancelWaiver(
        listing: WaiverListing,
        allBids: WaiverBid[]
    ): void {
        const bidsForListing = allBids.filter(bid => bid.waiverListingId === listing.id);

        if (bidsForListing.length > 0) {
            throw new Error('Cannot cancel waiver with active bids');
        }

        listing.status = 'cancelled';
    }

    /**
     * Get time remaining for waiver
     */
    getTimeRemaining(listing: WaiverListing): {
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    } {
        const now = Date.now();
        const remaining = listing.expiresAt - now;

        if (remaining <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }

        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

        return { hours, minutes, seconds, isExpired: false };
    }

    /**
     * Check if user can bid on waiver
     */
    canBid(listing: WaiverListing, userId: string, userGrit: number, bidAmount: number): {
        canBid: boolean;
        reason?: string;
    } {
        if (listing.status !== 'active') {
            return { canBid: false, reason: 'Waiver is not active' };
        }

        if (Date.now() >= listing.expiresAt) {
            return { canBid: false, reason: 'Waiver window has closed' };
        }

        if (userId === listing.originalOwnerId) {
            return { canBid: false, reason: 'Cannot bid on your own listing' };
        }

        if (bidAmount > userGrit) {
            return { canBid: false, reason: 'Insufficient grit' };
        }

        if (bidAmount <= 0) {
            return { canBid: false, reason: 'Bid must be positive' };
        }

        return { canBid: true };
    }
}

export const waiverWireService = new WaiverWireService();
