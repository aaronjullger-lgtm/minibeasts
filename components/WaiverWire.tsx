/**
 * Waiver Wire Component
 * 
 * NFL-style blind-bid liquidation system:
 * - 24-hour bidding windows
 * - Hidden bids until resolution
 * - 50% payout to owner, 50% burned
 */

import React, { useState } from 'react';
import { WaiverListing, WaiverBid, LoreItem, OverseerPlayerState } from '../types';
import { waiverWireService } from '../services/waiverWireService';

interface WaiverWireProps {
    player: OverseerPlayerState;
    activeWaivers: WaiverListing[];
    allItems: LoreItem[];
    onPlaceBid: (listingId: string, bidAmount: number) => void;
    onListItem: (itemId: string) => void;
}

export const WaiverWire: React.FC<WaiverWireProps> = ({
    player,
    activeWaivers,
    allItems,
    onPlaceBid,
    onListItem
}) => {
    const [selectedListing, setSelectedListing] = useState<WaiverListing | null>(null);
    const [bidAmount, setBidAmount] = useState(100);

    const getItemForListing = (listing: WaiverListing): LoreItem | undefined => {
        return allItems.find(item => item.id === listing.itemId);
    };

    const getRarityColor = (rarity: string): string => {
        const colors: { [key: string]: string } = {
            'grail': '#ff3333', // Red
            'heat': '#ffd700',  // Gold
            'mid': '#4a9eff',   // Blue
            'brick': '#9ca3af'  // Grey
        };
        return colors[rarity] || '#9ca3af';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-4xl font-board-header italic text-board-off-white mb-2">
                    ⚖️ THE WAIVER WIRE
                </h2>
                <p className="text-board-beige">
                    Blind-Bid Liquidations • 24-Hour Windows • 50% Payout to Owner
                </p>
            </div>

            {/* Active Waivers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeWaivers.map(listing => {
                    const item = getItemForListing(listing);
                    if (!item) return null;

                    const timeRemaining = waiverWireService.getTimeRemaining(listing);
                    const isOwn = listing.originalOwnerId === player.id;

                    return (
                        <div
                            key={listing.id}
                            className="bg-gray-900 border-2 rounded-lg p-4 hover:border-board-red transition-colors cursor-pointer"
                            style={{ borderColor: getRarityColor(item.rarity) }}
                            onClick={() => !isOwn && setSelectedListing(listing)}
                        >
                            {/* Item Preview */}
                            <div className="text-center mb-3">
                                <div className="text-4xl mb-2">📦</div>
                                <h3 className="font-bold text-board-off-white">{item.name}</h3>
                                <div 
                                    className="inline-block px-2 py-1 rounded text-xs font-bold mt-1"
                                    style={{ 
                                        backgroundColor: getRarityColor(item.rarity) + '20',
                                        color: getRarityColor(item.rarity)
                                    }}
                                >
                                    {item.rarity.toUpperCase()}
                                </div>
                            </div>

                            {/* Waiver Info */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Owner:</span>
                                    <span className="text-board-off-white font-bold">
                                        {isOwn ? 'YOU' : listing.originalOwnerName}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Time Left:</span>
                                    <span className={`font-board-grit ${timeRemaining.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                                        {timeRemaining.isExpired ? 'EXPIRED' : 
                                         `${timeRemaining.hours}h ${timeRemaining.minutes}m`}
                                    </span>
                                </div>

                                {isOwn && (
                                    <div className="bg-board-red/20 border border-board-red rounded p-2 text-center">
                                        <p className="text-xs text-board-red font-bold">
                                            YOUR LISTING
                                        </p>
                                    </div>
                                )}

                                {!isOwn && !timeRemaining.isExpired && (
                                    <button
                                        className="w-full bg-board-red hover:bg-red-600 text-white font-bold py-2 rounded mt-2 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedListing(listing);
                                        }}
                                    >
                                        💰 PLACE BID
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bid Modal */}
            {selectedListing && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border-4 border-board-red rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-board-off-white">
                                💰 Place Blind Bid
                            </h3>
                            <button
                                onClick={() => setSelectedListing(null)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Item Info */}
                            <div className="bg-black/60 rounded p-4">
                                <p className="text-sm text-gray-400 mb-1">Bidding on:</p>
                                <p className="text-lg font-bold text-board-off-white">
                                    {getItemForListing(selectedListing)?.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    ⚠️ Bids are hidden until the 24-hour window closes
                                </p>
                            </div>

                            {/* Bid Amount Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                    YOUR BID (GRIT)
                                </label>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                                    className="w-full bg-gray-800 border-2 border-gray-700 rounded px-4 py-3 text-board-off-white font-board-grit text-xl focus:border-board-red outline-none"
                                    min="1"
                                    max={player.grit}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Available: {player.grit} grit
                                </p>
                            </div>

                            {/* Payout Info */}
                            <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3">
                                <p className="text-xs text-yellow-400">
                                    <strong>If you win:</strong> You get the item<br/>
                                    <strong>Original owner gets:</strong> {Math.floor(bidAmount * 0.5)} grit (50%)<br/>
                                    <strong>Burned by Commish:</strong> {bidAmount - Math.floor(bidAmount * 0.5)} grit (50%)
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => {
                                    onPlaceBid(selectedListing.id, bidAmount);
                                    setSelectedListing(null);
                                }}
                                disabled={bidAmount > player.grit || bidAmount <= 0}
                                className="w-full bg-board-red hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors"
                            >
                                PLACE BLIND BID
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {activeWaivers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        No active waivers right now
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                        List an item from your inventory to start a 24-hour auction
                    </p>
                </div>
            )}
        </div>
    );
};
