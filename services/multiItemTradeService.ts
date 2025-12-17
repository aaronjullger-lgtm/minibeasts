/**
 * Multi-Item Trade Service
 * 
 * Handles complex multi-item bartering:
 * - Users can trade up to 5 items for 5 items
 * - NO raw Grit transfers allowed (items only)
 * - Two-step lock: Accept → Confirm (both parties must confirm)
 * - Transaction history logged to Locker Room feed
 */

import { MultiItemTrade, LoreItem, OverseerPlayerState } from '../types';

class MultiItemTradeService {
    private readonly MAX_ITEMS_PER_SIDE = 5;

    /**
     * Propose a multi-item trade
     */
    proposeTrade(
        proposerId: string,
        proposerName: string,
        proposerItems: LoreItem[],
        recipientId: string,
        recipientName: string,
        recipientItems: LoreItem[]
    ): MultiItemTrade {
        // Validation
        if (proposerItems.length === 0 || recipientItems.length === 0) {
            throw new Error('Both sides must offer at least one item');
        }

        if (proposerItems.length > this.MAX_ITEMS_PER_SIDE) {
            throw new Error(`Maximum ${this.MAX_ITEMS_PER_SIDE} items per side`);
        }

        if (recipientItems.length > this.MAX_ITEMS_PER_SIDE) {
            throw new Error(`Maximum ${this.MAX_ITEMS_PER_SIDE} items per side`);
        }

        if (proposerId === recipientId) {
            throw new Error('Cannot trade with yourself');
        }

        const trade: MultiItemTrade = {
            id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            proposerId,
            proposerName,
            proposerItems: proposerItems.map(item => item.id),
            recipientId,
            recipientName,
            recipientItems: recipientItems.map(item => item.id),
            proposedAt: Date.now(),
            status: 'pending'
        };

        return trade;
    }

    /**
     * Accept trade (first step of two-step lock)
     */
    acceptTrade(
        trade: MultiItemTrade,
        acceptingUserId: string
    ): void {
        if (trade.status !== 'pending') {
            throw new Error('Trade is not pending');
        }

        if (acceptingUserId !== trade.recipientId) {
            throw new Error('Only the recipient can accept the trade');
        }

        trade.status = 'accepted';
        trade.acceptedAt = Date.now();
    }

    /**
     * Confirm trade (second step of two-step lock)
     * Both parties must confirm after initial acceptance
     */
    confirmTrade(
        trade: MultiItemTrade,
        confirmingUserId: string,
        players: OverseerPlayerState[],
        allItems: LoreItem[]
    ): {
        success: boolean;
        proposer: OverseerPlayerState;
        recipient: OverseerPlayerState;
    } {
        if (trade.status !== 'accepted') {
            throw new Error('Trade must be accepted before confirmation');
        }

        // Both parties must confirm
        if (confirmingUserId !== trade.proposerId && confirmingUserId !== trade.recipientId) {
            throw new Error('Only trade participants can confirm');
        }

        // Find players
        const proposer = players.find(p => p.id === trade.proposerId);
        const recipient = players.find(p => p.id === trade.recipientId);

        if (!proposer || !recipient) {
            throw new Error('Player not found');
        }

        // Verify items still exist and belong to correct players
        const proposerItemsToTrade = allItems.filter(item => 
            trade.proposerItems.includes(item.id)
        );
        const recipientItemsToTrade = allItems.filter(item => 
            trade.recipientItems.includes(item.id)
        );

        if (proposerItemsToTrade.length !== trade.proposerItems.length) {
            throw new Error('Some proposer items no longer exist');
        }

        if (recipientItemsToTrade.length !== trade.recipientItems.length) {
            throw new Error('Some recipient items no longer exist');
        }

        // Verify ownership
        for (const item of proposerItemsToTrade) {
            if (!proposer.ownedItems.some(i => i.id === item.id)) {
                throw new Error(`Proposer does not own item: ${item.name}`);
            }
        }

        for (const item of recipientItemsToTrade) {
            if (!recipient.ownedItems.some(i => i.id === item.id)) {
                throw new Error(`Recipient does not own item: ${item.name}`);
            }
        }

        // ATOMIC TRANSACTION: Execute the trade
        // Remove items from proposer, add recipient's items
        proposer.ownedItems = proposer.ownedItems.filter(
            item => !trade.proposerItems.includes(item.id)
        );
        proposer.ownedItems.push(...recipientItemsToTrade);

        // Remove items from recipient, add proposer's items
        recipient.ownedItems = recipient.ownedItems.filter(
            item => !trade.recipientItems.includes(item.id)
        );
        recipient.ownedItems.push(...proposerItemsToTrade);

        // Update trade status
        trade.status = 'completed';
        trade.confirmedAt = Date.now();

        return {
            success: true,
            proposer,
            recipient
        };
    }

    /**
     * Reject trade
     */
    rejectTrade(
        trade: MultiItemTrade,
        rejectingUserId: string
    ): void {
        if (trade.status === 'completed' || trade.status === 'cancelled') {
            throw new Error('Cannot reject completed or cancelled trade');
        }

        if (rejectingUserId !== trade.recipientId && rejectingUserId !== trade.proposerId) {
            throw new Error('Only trade participants can reject');
        }

        trade.status = 'rejected';
    }

    /**
     * Cancel trade (proposer only, before acceptance)
     */
    cancelTrade(
        trade: MultiItemTrade,
        cancellingUserId: string
    ): void {
        if (trade.status !== 'pending') {
            throw new Error('Can only cancel pending trades');
        }

        if (cancellingUserId !== trade.proposerId) {
            throw new Error('Only the proposer can cancel');
        }

        trade.status = 'cancelled';
    }

    /**
     * Generate trade summary for Locker Room feed
     */
    generateTradeSummary(
        trade: MultiItemTrade,
        proposerItems: LoreItem[],
        recipientItems: LoreItem[]
    ): string {
        const proposerItemsList = proposerItems.map(i => i.name).join(', ');
        const recipientItemsList = recipientItems.map(i => i.name).join(', ');

        return `🔄 **TRADE COMPLETED**
${trade.proposerName} traded: ${proposerItemsList}
${trade.recipientName} traded: ${recipientItemsList}
Status: ${trade.status === 'completed' ? '✅ Completed' : '❌ Failed'}`;
    }

    /**
     * Validate trade is fair (optional - can be used for warnings)
     */
    validateTradeFairness(
        proposerItems: LoreItem[],
        recipientItems: LoreItem[]
    ): {
        isFair: boolean;
        warning?: string;
    } {
        // Calculate rarity weights
        const rarityWeights: { [key: string]: number } = {
            'brick': 1,
            'mid': 3,
            'heat': 10,
            'grail': 50
        };

        const proposerValue = proposerItems.reduce((sum, item) => 
            sum + (rarityWeights[item.rarity] || 1), 0
        );

        const recipientValue = recipientItems.reduce((sum, item) => 
            sum + (rarityWeights[item.rarity] || 1), 0
        );

        const ratio = Math.max(proposerValue, recipientValue) / Math.min(proposerValue, recipientValue);

        if (ratio > 3) {
            return {
                isFair: false,
                warning: '⚠️ LOPSIDED TRADE: Value difference is significant'
            };
        }

        return { isFair: true };
    }
}

export const multiItemTradeService = new MultiItemTradeService();
