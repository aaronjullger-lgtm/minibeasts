/**
 * Waiver Wire Component
 * 
 * NFL-style blind-bid liquidation system:
 * - 24-hour bidding windows
 * - Hidden bids until resolution
 * - 50% payout to owner, 50% burned
 */

import React, { useState, useEffect } from 'react';
import { WaiverListing, WaiverBid, LoreItem, OverseerPlayerState } from '../types';
import { waiverWireService } from '../services/waiverWireService';
import { placeBlindBid } from '../services/marketService';

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
    const [isStamping, setIsStamping] = useState(false);
    const [sheetVisible, setSheetVisible] = useState(false);

    // Animate sheet in when listing is selected
    useEffect(() => {
        if (selectedListing) {
            setTimeout(() => setSheetVisible(true), 10);
        } else {
            setSheetVisible(false);
        }
    }, [selectedListing]);

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

    const handleStampBid = async () => {
        if (!selectedListing) return;
        
        // Trigger stamp animation
        setIsStamping(true);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
        
        // Wait for animation
        setTimeout(async () => {
            await placeBlindBid(selectedListing.id, bidAmount);
            onPlaceBid(selectedListing.id, bidAmount);
            setIsStamping(false);
            setSelectedListing(null);
            setBidAmount(100);
        }, 400);
    };

    const handleCardClick = (listing: WaiverListing) => {
        const isOwn = listing.originalOwnerId === player.id;
        if (!isOwn) {
            setSelectedListing(listing);
            // Haptic feedback on card tap
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
        }
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
                            onClick={() => handleCardClick(listing)}
                        >
                            {/* Item Preview */}
                            <div className="text-center mb-3">
                                <h3 className="text-2xl font-board-header italic text-board-off-white mb-1">
                                    {item.name}
                                </h3>
                                <div className="text-xs font-board-grit text-gray-400">
                                    {isOwn ? 'YOU' : listing.originalOwnerName}
                                </div>
                                <div 
                                    className="inline-block px-2 py-1 rounded text-xs font-bold mt-2"
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
                                {/* Timer */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Time Left:</span>
                                    <span className={`font-board-grit ${
                                        timeRemaining.isExpired ? 'text-gray-400' : 
                                        timeRemaining.hours < 1 ? 'text-board-red' : 'text-green-400'
                                    }`}>
                                        {timeRemaining.isExpired ? 'EXPIRED' : 
                                         `${timeRemaining.hours}h ${timeRemaining.minutes}m`}
                                    </span>
                                </div>

                                {/* Status */}
                                {isOwn && (
                                    <div className="bg-board-red/20 border border-board-red rounded p-2 text-center">
                                        <p className="text-xs text-board-red font-bold font-board-grit">
                                            YOUR LISTING
                                        </p>
                                    </div>
                                )}

                                {!isOwn && !timeRemaining.isExpired && (
                                    <div className="bg-green-900/20 border border-green-500 rounded p-2 text-center">
                                        <p className="text-xs text-green-400 font-bold font-board-grit">
                                            BLIND BIDS OPEN
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Bottom Sheet */}
            {selectedListing && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/80 z-40"
                        onClick={() => setSelectedListing(null)}
                        style={{
                            transition: 'opacity 0.3s ease-out',
                            opacity: sheetVisible ? 1 : 0
                        }}
                    />
                    
                    {/* Bottom Sheet */}
                    <div 
                        className="fixed inset-x-0 bottom-0 z-50 bg-board-navy border-t-4 border-board-red rounded-t-3xl"
                        style={{
                            transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            maxHeight: '85vh'
                        }}
                    >
                        <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '85vh' }}>
                            {/* Sheet Handle */}
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-board-off-white font-board-header">
                                    💰 Place Blind Bid
                                </h3>
                                <button
                                    onClick={() => setSelectedListing(null)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Item Info */}
                            <div className="bg-board-muted-blue rounded-lg p-4 border border-board-red/30">
                                <p className="text-sm text-gray-400 mb-1">Bidding on:</p>
                                <p className="text-xl font-board-header italic text-board-off-white">
                                    {getItemForListing(selectedListing)?.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-board-grit">
                                    ⚠️ BIDS ARE HIDDEN UNTIL WINDOW CLOSES
                                </p>
                            </div>

                            {/* Bid Amount Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 font-board-grit">
                                    YOUR BID (GRIT)
                                </label>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-board-muted-blue border-b-4 border-board-off-white text-board-off-white font-board-grit text-4xl text-center py-4 focus:border-board-red outline-none"
                                    style={{ borderRadius: 0 }}
                                    min="1"
                                    max={player.grit}
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center font-board-grit">
                                    Available: {player.grit} grit
                                </p>
                            </div>

                            {/* Payout Info */}
                            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                                <p className="text-xs text-yellow-400 font-board-grit">
                                    <strong>If you win:</strong> You get the item<br/>
                                    <strong>Original owner gets:</strong> {Math.floor(bidAmount * 0.5)} grit (50%)<br/>
                                    <strong>Burned by Commish:</strong> {bidAmount - Math.floor(bidAmount * 0.5)} grit (50%)
                                </p>
                            </div>

                            {/* Stamp Bid Button */}
                            <button
                                onClick={handleStampBid}
                                disabled={bidAmount > player.grit || bidAmount <= 0}
                                className="w-full bg-board-red hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 text-2xl rounded-lg transition-all font-board-header"
                                style={{
                                    transform: isStamping ? 'scale(0.85)' : 'scale(1)',
                                    transition: isStamping ? 'transform 0.15s ease-in' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                            >
                                {isStamping ? '⚡ STAMPING...' : '🔨 STAMP BID'}
                            </button>
                        </div>
                    </div>
                </>
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
