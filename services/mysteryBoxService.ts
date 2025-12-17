/**
 * Mystery Box & Trading Service
 * 
 * Handles:
 * - Mystery box opening with rarity-based drops
 * - Trading floor for player-to-player trades
 * - Item inventory management
 * - Equipment system for passive bonuses
 */

import { 
    LoreItem, 
    MysteryBox, 
    TradeOffer, 
    TradingFloor,
    OverseerPlayerState 
} from '../types';
import { 
    LORE_ITEMS, 
    MYSTERY_BOXES, 
    RARITY_CONFIG,
    TRADING_FLOOR_CONFIG 
} from '../constants-overseer';

class MysteryBoxService {
    private tradingFloor: TradingFloor = {
        offers: [],
        houseTaxRate: TRADING_FLOOR_CONFIG.houseTaxRate
    };

    /**
     * Open a mystery box and get a random item based on rarity
     */
    openMysteryBox(boxId: string): LoreItem | null {
        const box = MYSTERY_BOXES.find(b => b.id === boxId);
        if (!box) {
            return null;
        }

        // Determine rarity based on drop rates
        const roll = Math.random() * 100;
        let cumulativeRate = 0;
        let selectedRarity = 'common';

        // Adjust rates based on box tier
        const adjustedRates = RARITY_CONFIG.map(config => {
            if (box.tier === 'evidence_locker') {
                // Evidence Locker has better drop rates
                if (config.rarity === 'common') return { ...config, dropRate: 0 };
                if (config.rarity === 'uncommon') return { ...config, dropRate: 0 };
                if (config.rarity === 'rare') return { ...config, dropRate: 40 };
                if (config.rarity === 'epic') return { ...config, dropRate: 35 };
                if (config.rarity === 'legendary') return { ...config, dropRate: 20 };
                if (config.rarity === 'mythic') return { ...config, dropRate: 5 };
            }
            return config;
        });

        for (const rarityConfig of adjustedRates) {
            cumulativeRate += rarityConfig.dropRate;
            if (roll <= cumulativeRate) {
                selectedRarity = rarityConfig.rarity;
                break;
            }
        }

        // Filter possible items by selected rarity
        const itemsOfRarity = box.possibleItems
            .map(id => LORE_ITEMS.find(item => item.id === id))
            .filter(item => item && item.rarity === selectedRarity && item.currentSupply !== 0);

        if (itemsOfRarity.length === 0) {
            // Fallback to any available item
            const availableItems = box.possibleItems
                .map(id => LORE_ITEMS.find(item => item.id === id))
                .filter(item => item && item.currentSupply !== 0);
            
            if (availableItems.length === 0) return null;
            
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            return randomItem ? this.cloneItem(randomItem) : null;
        }

        const selectedItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
        
        if (!selectedItem) return null;

        // Decrease supply if limited
        if (selectedItem.supply > 0) {
            selectedItem.currentSupply--;
        }

        return this.cloneItem(selectedItem);
    }

    /**
     * Clone an item for player inventory
     */
    private cloneItem(item: LoreItem): LoreItem {
        return {
            ...item,
            equipped: false // Always start unequipped
        };
    }

    /**
     * Quick sell an item for grit
     */
    quickSellItem(item: LoreItem): number {
        // Quick sell value is 40% of typical market value based on rarity
        const rarityMultipliers: { [key: string]: number } = {
            common: 5,
            uncommon: 15,
            rare: 40,
            epic: 100,
            legendary: 300,
            mythic: 1000
        };

        return rarityMultipliers[item.rarity] || 5;
    }

    /**
     * List an item for sale on the trading floor
     */
    listItemForTrade(
        sellerId: string,
        sellerName: string,
        itemId: string,
        price: number
    ): TradeOffer {
        if (price < TRADING_FLOOR_CONFIG.minimumPrice) {
            throw new Error(`Price must be at least ${TRADING_FLOOR_CONFIG.minimumPrice} grit`);
        }

        if (price > TRADING_FLOOR_CONFIG.maximumPrice) {
            throw new Error(`Price cannot exceed ${TRADING_FLOOR_CONFIG.maximumPrice} grit`);
        }

        const offer: TradeOffer = {
            id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sellerId,
            sellerName,
            itemId,
            price,
            listedAt: Date.now(),
            status: 'active'
        };

        this.tradingFloor.offers.push(offer);
        return offer;
    }

    /**
     * Purchase an item from the trading floor
     */
    purchaseFromTradingFloor(
        offerId: string,
        buyerId: string,
        buyerGrit: number
    ): { success: boolean; houseTax: number; sellerProceeds: number } {
        const offer = this.tradingFloor.offers.find(o => o.id === offerId);
        
        if (!offer || offer.status !== 'active') {
            return { success: false, houseTax: 0, sellerProceeds: 0 };
        }

        if (buyerId === offer.sellerId) {
            throw new Error('Cannot buy your own listing');
        }

        const houseTax = Math.floor(offer.price * this.tradingFloor.houseTaxRate);
        const totalCost = offer.price + houseTax;

        if (buyerGrit < totalCost) {
            return { success: false, houseTax: 0, sellerProceeds: 0 };
        }

        // Mark as sold
        offer.status = 'sold';

        return {
            success: true,
            houseTax,
            sellerProceeds: offer.price
        };
    }

    /**
     * Cancel a trade listing
     */
    cancelTradeListing(offerId: string, playerId: string): boolean {
        const offer = this.tradingFloor.offers.find(o => o.id === offerId);
        
        if (!offer || offer.sellerId !== playerId || offer.status !== 'active') {
            return false;
        }

        offer.status = 'cancelled';
        return true;
    }

    /**
     * Get all active trade offers
     */
    getActiveTrades(): TradeOffer[] {
        return this.tradingFloor.offers.filter(o => o.status === 'active');
    }

    /**
     * Get player's active listings
     */
    getPlayerListings(playerId: string): TradeOffer[] {
        return this.tradingFloor.offers.filter(
            o => o.sellerId === playerId && o.status === 'active'
        );
    }

    /**
     * Equip an item to get passive bonuses
     */
    equipItem(player: OverseerPlayerState, itemId: string): boolean {
        const item = player.ownedItems.find(i => i.id === itemId);
        
        if (!item) {
            return false;
        }

        // Check if item is character-specific
        if (item.characterId && item.characterId !== player.id) {
            throw new Error('This item can only be equipped by ' + item.characterId);
        }

        // Unequip any item in the same slot (for now, limit to 3 equipped items)
        if (player.equippedItems.length >= 3 && !player.equippedItems.includes(itemId)) {
            return false; // Too many items equipped
        }

        if (!player.equippedItems.includes(itemId)) {
            player.equippedItems.push(itemId);
            item.equipped = true;
        }

        return true;
    }

    /**
     * Unequip an item
     */
    unequipItem(player: OverseerPlayerState, itemId: string): boolean {
        const itemIndex = player.equippedItems.indexOf(itemId);
        
        if (itemIndex === -1) {
            return false;
        }

        player.equippedItems.splice(itemIndex, 1);
        
        const item = player.ownedItems.find(i => i.id === itemId);
        if (item) {
            item.equipped = false;
        }

        return true;
    }

    /**
     * Calculate total payout multiplier from equipped items
     */
    calculateEquippedBonuses(player: OverseerPlayerState, betType?: string): number {
        let totalMultiplier = 1.0;

        for (const itemId of player.equippedItems) {
            const item = player.ownedItems.find(i => i.id === itemId);
            
            if (!item || !item.passiveBonus) {
                continue;
            }

            // Check if bonus applies to this bet type
            if (item.passiveBonus.betType && betType && item.passiveBonus.betType !== betType) {
                continue;
            }

            if (item.passiveBonus.payoutMultiplier) {
                totalMultiplier *= item.passiveBonus.payoutMultiplier;
            }
        }

        return totalMultiplier;
    }

    /**
     * Get item by ID
     */
    getItemById(itemId: string): LoreItem | undefined {
        return LORE_ITEMS.find(item => item.id === itemId);
    }

    /**
     * Clean up expired trade listings
     */
    cleanupExpiredListings(): void {
        const now = Date.now();
        
        this.tradingFloor.offers = this.tradingFloor.offers.filter(offer => {
            if (offer.status !== 'active') {
                return true; // Keep sold/cancelled for history
            }
            
            // Remove listings older than 7 days
            return (now - offer.listedAt) < TRADING_FLOOR_CONFIG.listingDuration;
        });
    }

    /**
     * Reset trading floor
     */
    resetTradingFloor(): void {
        this.tradingFloor.offers = [];
    }
}

export const mysteryBoxService = new MysteryBoxService();
