/**
 * Trading Floor Component
 * 
 * Marketplace for player-to-player item trading
 */

import React, { useState } from 'react';
import { TradeOffer, LoreItem, OverseerPlayerState } from '../types';
import { RARITY_CONFIG, TRADING_FLOOR_CONFIG } from '../constants-overseer';
import { mysteryBoxService } from '../services/mysteryBoxService';

interface TradingFloorProps {
    player: OverseerPlayerState;
    allOffers: TradeOffer[];
    onListItem: (itemId: string, price: number) => void;
    onPurchaseItem: (offerId: string) => void;
    onCancelListing: (offerId: string) => void;
    onClose: () => void;
}

export const TradingFloor: React.FC<TradingFloorProps> = ({
    player,
    allOffers,
    onListItem,
    onPurchaseItem,
    onCancelListing,
    onClose
}) => {
    const [view, setView] = useState<'market' | 'inventory' | 'listings'>('market');
    const [selectedItem, setSelectedItem] = useState<LoreItem | null>(null);
    const [listingPrice, setListingPrice] = useState<number>(100);

    const getRarityColor = (rarity: string): string => {
        const config = RARITY_CONFIG.find(r => r.rarity === rarity);
        return config?.color || '#9CA3AF';
    };

    const handleListItem = () => {
        if (!selectedItem) return;

        if (listingPrice < TRADING_FLOOR_CONFIG.minimumPrice) {
            alert(`Minimum price is ${TRADING_FLOOR_CONFIG.minimumPrice} grit`);
            return;
        }

        onListItem(selectedItem.id, listingPrice);
        setSelectedItem(null);
        setListingPrice(100);
        setView('listings');
    };

    const handleQuickSell = (item: LoreItem) => {
        const sellValue = mysteryBoxService.quickSellItem(item);
        if (window.confirm(`Quick sell ${item.name} for ${sellValue} grit?`)) {
            // This would be handled by parent component
            alert(`Sold for ${sellValue} grit!`);
        }
    };

    const activeOffers = allOffers.filter(o => o.status === 'active');
    const myListings = activeOffers.filter(o => o.sellerId === player.id);
    const marketOffers = activeOffers.filter(o => o.sellerId !== player.id);

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-0 md:p-4">
            <div className="bg-gray-900 w-full h-full md:h-auto md:max-w-6xl md:rounded-lg md:border-4 border-green-500 overflow-y-auto">
                {/* Header - Sticky on mobile */}
                <div className="sticky top-0 z-10 bg-gray-900 border-b-4 border-green-500 md:border-b-0">
                    <div className="flex justify-between items-center p-4 md:p-8 md:pb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400" style={{ fontFamily: 'monospace' }}>
                                🏪 TRADING FLOOR
                            </h2>
                            <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
                                Player Marketplace • {TRADING_FLOOR_CONFIG.houseTaxRate * 100}% Tax
                            </p>
                            <p className="text-green-300 text-lg md:text-xl mt-1 font-mono">Your Grit: {player.grit}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl md:text-3xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 md:p-8 md:pt-0">
                    {/* Navigation Tabs */}
                    <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setView('market')}
                            className={`px-4 md:px-6 py-3 rounded font-bold whitespace-nowrap text-sm md:text-base min-h-[44px] transition-colors ${
                                view === 'market'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                            }`}
                        >
                            MARKET ({marketOffers.length})
                        </button>
                        <button
                            onClick={() => setView('inventory')}
                            className={`px-4 md:px-6 py-3 rounded font-bold whitespace-nowrap text-sm md:text-base min-h-[44px] transition-colors ${
                                view === 'inventory'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                            }`}
                        >
                            INVENTORY ({player.ownedItems.length})
                        </button>
                        <button
                            onClick={() => setView('listings')}
                            className={`px-4 md:px-6 py-3 rounded font-bold whitespace-nowrap text-sm md:text-base min-h-[44px] transition-colors ${
                                view === 'listings'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                            }`}
                        >
                            LISTINGS ({myListings.length})
                        </button>
                    </div>

                {/* Market View */}
                {view === 'market' && (
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Available Offers</h3>
                        {marketOffers.length === 0 ? (
                            <p className="text-gray-400 text-center py-8 text-sm md:text-base">No items for sale</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {marketOffers.map(offer => {
                                    const item = mysteryBoxService.getItemById(offer.itemId);
                                    if (!item) return null;

                                    const totalCost = offer.price + Math.floor(offer.price * TRADING_FLOOR_CONFIG.houseTaxRate);

                                    return (
                                        <div
                                            key={offer.id}
                                            className="border-2 rounded-lg p-3 md:p-4 bg-gray-800"
                                            style={{ borderColor: getRarityColor(item.rarity) }}
                                        >
                                            <div className="text-2xl md:text-3xl mb-2">{item.name.split(' ')[0]}</div>
                                            <h4 className="font-bold text-white mb-1 text-sm md:text-base">{item.name}</h4>
                                            <p className="text-xs uppercase mb-2"
                                               style={{ color: getRarityColor(item.rarity) }}
                                            >
                                                {item.rarity}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                                            
                                            <div className="mb-3">
                                                <p className="text-gray-500 text-xs">Seller: {offer.sellerName}</p>
                                                <p className="text-green-400 text-lg font-bold">
                                                    {offer.price} GRIT
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    + {Math.floor(offer.price * TRADING_FLOOR_CONFIG.houseTaxRate)} tax = {totalCost} total
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => onPurchaseItem(offer.id)}
                                                disabled={player.grit < totalCost}
                                                className={`w-full py-2 rounded font-bold ${
                                                    player.grit < totalCost
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-500 hover:bg-green-600 text-black'
                                                }`}
                                            >
                                                {player.grit < totalCost ? 'INSUFFICIENT GRIT' : 'BUY'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Inventory View */}
                {view === 'inventory' && (
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Your Items</h3>
                        {player.ownedItems.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No items in inventory</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {player.ownedItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="border-2 rounded-lg p-4 bg-gray-800"
                                        style={{ borderColor: getRarityColor(item.rarity) }}
                                    >
                                        <div className="text-3xl mb-2">{item.name.split(' ')[0]}</div>
                                        <h4 className="font-bold text-white mb-1">{item.name}</h4>
                                        <p className="text-xs uppercase mb-2"
                                           style={{ color: getRarityColor(item.rarity) }}
                                        >
                                            {item.rarity}
                                        </p>
                                        <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                                        
                                        {item.equipped && (
                                            <p className="text-green-400 text-xs mb-2">✓ EQUIPPED</p>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold text-sm"
                                            >
                                                LIST
                                            </button>
                                            <button
                                                onClick={() => handleQuickSell(item)}
                                                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold text-sm"
                                            >
                                                QUICK SELL
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Listing Modal */}
                        {selectedItem && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
                                <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-6 max-w-md">
                                    <h3 className="text-2xl font-bold text-white mb-4">List Item for Sale</h3>
                                    <p className="text-gray-300 mb-4">{selectedItem.name}</p>
                                    
                                    <label className="block text-gray-300 mb-2">Price (grit):</label>
                                    <input
                                        type="number"
                                        value={listingPrice}
                                        onChange={(e) => setListingPrice(parseInt(e.target.value) || 0)}
                                        min={TRADING_FLOOR_CONFIG.minimumPrice}
                                        max={TRADING_FLOOR_CONFIG.maximumPrice}
                                        className="w-full p-3 bg-gray-700 text-white rounded mb-4"
                                    />
                                    
                                    <p className="text-sm text-gray-400 mb-4">
                                        Buyer pays: {listingPrice + Math.floor(listingPrice * TRADING_FLOOR_CONFIG.houseTaxRate)} grit
                                        <br />
                                        (includes {TRADING_FLOOR_CONFIG.houseTaxRate * 100}% house tax)
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleListItem}
                                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black rounded font-bold"
                                        >
                                            LIST ITEM
                                        </button>
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* My Listings View */}
                {view === 'listings' && (
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Your Active Listings</h3>
                        {myListings.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No active listings</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myListings.map(offer => {
                                    const item = mysteryBoxService.getItemById(offer.itemId);
                                    if (!item) return null;

                                    return (
                                        <div
                                            key={offer.id}
                                            className="border-2 rounded-lg p-4 bg-gray-800"
                                            style={{ borderColor: getRarityColor(item.rarity) }}
                                        >
                                            <div className="text-3xl mb-2">{item.name.split(' ')[0]}</div>
                                            <h4 className="font-bold text-white mb-1">{item.name}</h4>
                                            <p className="text-xs uppercase mb-2"
                                               style={{ color: getRarityColor(item.rarity) }}
                                            >
                                                {item.rarity}
                                            </p>
                                            
                                            <p className="text-green-400 text-lg font-bold mb-3">
                                                {offer.price} GRIT
                                            </p>

                                            <button
                                                onClick={() => onCancelListing(offer.id)}
                                                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded font-bold"
                                            >
                                                CANCEL LISTING
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
