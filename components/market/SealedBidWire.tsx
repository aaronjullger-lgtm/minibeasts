/**
 * Sealed Bid Wire Component
 * 
 * Visual Metaphor: Sliding classified envelopes across a table
 * Aesthetic: Tactical Luxury / 007 / Underground
 * 
 * Features:
 * - Sealed bid system with hidden amounts
 * - Slide-to-seal interaction mechanic
 * - Mechanical countdown timers
 * - Tactical matte cardstock aesthetic with noise texture
 */

import React, { useState, useEffect } from 'react';
import { WaiverListing, LoreItem, OverseerPlayerState } from '../../types';
import { assetService } from '../../services/assetService';

interface SealedBidWireProps {
    player: OverseerPlayerState;
    activeListings: WaiverListing[];
    allItems: LoreItem[];
    onPlaceBid: (listingId: string, bidAmount: number) => void;
}

export const SealedBidWire: React.FC<SealedBidWireProps> = ({
    player,
    activeListings,
    allItems,
    onPlaceBid
}) => {
    const [selectedListing, setSelectedListing] = useState<WaiverListing | null>(null);
    const [bidAmount, setBidAmount] = useState(100);
    const [slideProgress, setSlideProgress] = useState(0);
    const [isSealed, setIsSealed] = useState(false);
    const [sheetVisible, setSheetVisible] = useState(false);

    useEffect(() => {
        if (selectedListing) {
            setTimeout(() => setSheetVisible(true), 10);
        } else {
            setSheetVisible(false);
            setSlideProgress(0);
            setIsSealed(false);
        }
    }, [selectedListing]);

    const getItemForListing = (listing: WaiverListing): LoreItem | undefined => {
        return allItems.find(item => item.id === listing.itemId);
    };

    const handleSlideStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (bidAmount <= 0 || bidAmount > player.grit) return;
        
        const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const slideContainer = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const maxSlide = slideContainer.width - 80;

        const handleMove = (moveEvent: TouchEvent | MouseEvent) => {
            const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const delta = currentX - startX;
            const progress = Math.min(Math.max(delta / maxSlide, 0), 1);
            setSlideProgress(progress);

            if (progress >= 0.95) {
                handleSlideComplete();
                cleanup();
            }
        };

        const handleEnd = () => {
            if (slideProgress < 0.95) {
                setSlideProgress(0);
            }
            cleanup();
        };

        const cleanup = () => {
            document.removeEventListener('touchmove', handleMove as any);
            document.removeEventListener('mousemove', handleMove as any);
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('mouseup', handleEnd);
        };

        document.addEventListener('touchmove', handleMove as any);
        document.addEventListener('mousemove', handleMove as any);
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('mouseup', handleEnd);
    };

    const handleSlideComplete = () => {
        if (!selectedListing) return;

        setIsSealed(true);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        setTimeout(() => {
            onPlaceBid(selectedListing.id, bidAmount);
            setSelectedListing(null);
            setBidAmount(100);
        }, 800);
    };

    const handleCardClick = (listing: WaiverListing) => {
        const isOwn = listing.originalOwnerId === player.id;
        if (!isOwn) {
            setSelectedListing(listing);
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    };

    return (
        <div className="min-h-screen bg-tactical-dark p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gold-leaf mb-2 tracking-wider">
                    THE SEALED BID WIRE
                </h2>
                <p className="text-tactical-gray text-sm tracking-widest uppercase">
                    Classified Auctions • Blind Bids • Deniable Operations
                </p>
            </div>

            {/* Active Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {activeListings.map(listing => {
                    const item = getItemForListing(listing);
                    if (!item) return null;

                    const timeRemaining = assetService.getTimeRemaining(listing.expiresAt);
                    const isOwn = listing.originalOwnerId === player.id;

                    return (
                        <div
                            key={listing.id}
                            onClick={() => handleCardClick(listing)}
                            className="relative bg-tactical-dark border border-tactical-gray rounded-sm p-5 cursor-pointer transition-all hover:border-gold-leaf group"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
                                backgroundSize: 'cover'
                            }}
                        >
                            {/* Corner Accent */}
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold-leaf opacity-30"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold-leaf opacity-30"></div>

                            {/* Item Name */}
                            <h3 className={`text-xl font-bold mb-3 ${
                                item.rarity === 'grail' || item.rarity === 'heat' 
                                    ? 'text-gold-leaf' 
                                    : 'text-paper-white'
                            }`}>
                                {item.name}
                            </h3>

                            {/* Owner */}
                            <div className="text-xs text-tactical-gray mb-4 font-mono">
                                ASSET HOLDER: {isOwn ? 'YOU' : listing.originalOwnerName.toUpperCase()}
                            </div>

                            {/* Timer - Mechanical Style */}
                            <div className="bg-black/40 rounded-sm p-3 mb-3">
                                <div className="text-xs text-tactical-gray mb-1 font-mono">
                                    BID WINDOW CLOSES IN:
                                </div>
                                <div className={`font-mono text-2xl tracking-wider ${
                                    timeRemaining.isExpired ? 'text-red-500' :
                                    timeRemaining.hours < 1 ? 'text-red-400' : 'text-green-400'
                                }`}>
                                    {timeRemaining.isExpired ? 'EXPIRED' :
                                     `${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`}
                                </div>
                            </div>

                            {/* Rarity Badge */}
                            <div className={`inline-block px-3 py-1 text-xs font-mono tracking-wider ${
                                item.rarity === 'grail' ? 'bg-red-900/30 text-red-400 border border-red-700' :
                                item.rarity === 'heat' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                                item.rarity === 'mid' ? 'bg-blue-900/30 text-blue-400 border border-blue-700' :
                                'bg-gray-800/30 text-gray-400 border border-gray-700'
                            }`}>
                                {item.rarity.toUpperCase()}
                            </div>

                            {/* Status Indicator */}
                            {isOwn && (
                                <div className="mt-3 text-xs text-red-400 font-mono">
                                    ► YOUR LISTING
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Sheet - Leather Folio Style */}
            {selectedListing && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black z-40"
                        onClick={() => setSelectedListing(null)}
                        style={{
                            opacity: sheetVisible ? 0.85 : 0,
                            transition: 'opacity 0.3s ease-out'
                        }}
                    />
                    
                    {/* Bottom Sheet */}
                    <div 
                        className="fixed inset-x-0 bottom-0 z-50 bg-tactical-dark border-t-2 border-tactical-gray rounded-t-lg"
                        style={{
                            transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            maxHeight: '85vh',
                            backgroundImage: `linear-gradient(to bottom, rgba(10, 14, 20, 0.95), rgba(10, 14, 20, 1))`
                        }}
                    >
                        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '85vh' }}>
                            {/* Handle */}
                            <div className="flex justify-center mb-2">
                                <div className="w-16 h-1 bg-tactical-gray rounded-full"></div>
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gold-leaf mb-1">
                                        CLASSIFIED BID
                                    </h3>
                                    <p className="text-xs text-tactical-gray font-mono tracking-wider">
                                        OPERATION: ASSET ACQUISITION
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedListing(null)}
                                    className="text-tactical-gray hover:text-paper-white text-2xl w-10 h-10"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Item Dossier */}
                            <div className="bg-black/40 border border-tactical-gray rounded-sm p-4">
                                <div className="text-xs text-tactical-gray font-mono mb-2">
                                    TARGET ASSET:
                                </div>
                                <div className="text-xl font-bold text-paper-white">
                                    {getItemForListing(selectedListing)?.name}
                                </div>
                                <div className="text-xs text-red-400 font-mono mt-3">
                                    ⚠ BID AMOUNT REMAINS CLASSIFIED UNTIL WINDOW CLOSURE
                                </div>
                            </div>

                            {/* Bid Input - Minimalist Underlined */}
                            <div>
                                <label className="block text-xs text-tactical-gray mb-3 font-mono tracking-wider">
                                    YOUR BID (GRIT)
                                </label>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-transparent border-b-2 border-tactical-gray text-paper-white font-mono text-3xl text-center py-3 focus:border-gold-leaf outline-none transition-colors"
                                    min="1"
                                    max={player.grit}
                                />
                                <p className="text-xs text-tactical-gray mt-2 text-center font-mono">
                                    Available: {player.grit} grit
                                </p>
                            </div>

                            {/* Slide to Seal */}
                            <div className="space-y-3">
                                <div className="text-xs text-tactical-gray font-mono text-center">
                                    SLIDE TO SEAL BID →
                                </div>
                                <div 
                                    className="relative h-16 bg-black/60 border border-tactical-gray rounded-sm overflow-hidden"
                                    onTouchStart={handleSlideStart}
                                    onMouseDown={handleSlideStart}
                                >
                                    {/* Track */}
                                    <div 
                                        className="absolute inset-0 bg-gold-leaf/20"
                                        style={{ 
                                            width: `${slideProgress * 100}%`,
                                            transition: slideProgress === 0 ? 'width 0.3s ease-out' : 'none'
                                        }}
                                    />

                                    {/* Slider Button */}
                                    <div 
                                        className="absolute top-2 bottom-2 w-20 bg-tactical-gray border border-gold-leaf rounded-sm flex items-center justify-center cursor-grab active:cursor-grabbing"
                                        style={{
                                            left: `calc(${slideProgress * 100}% - ${slideProgress * 20}px + 8px)`,
                                            transition: slideProgress === 0 ? 'left 0.3s ease-out' : 'none'
                                        }}
                                    >
                                        <span className="text-gold-leaf text-xl">►</span>
                                    </div>

                                    {/* Text */}
                                    {!isSealed && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-paper-white/50 font-mono text-sm tracking-wider">
                                                {slideProgress > 0.5 ? 'SEALING...' : 'SLIDE TO SEAL'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Sealed Stamp */}
                                    {isSealed && (
                                        <div 
                                            className="absolute inset-0 flex items-center justify-center"
                                            style={{
                                                animation: 'stamp 0.3s ease-out'
                                            }}
                                        >
                                            <span className="text-red-500 font-bold text-2xl tracking-wider opacity-60 transform -rotate-12">
                                                SEALED
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payout Info */}
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-3">
                                <p className="text-xs text-yellow-400/90 font-mono leading-relaxed">
                                    IF SUCCESSFUL:<br/>
                                    • Asset transferred to you<br/>
                                    • Original holder receives: {Math.floor(bidAmount * 0.5)} grit (50%)<br/>
                                    • Commission burned: {bidAmount - Math.floor(bidAmount * 0.5)} grit (50%)
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {activeListings.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-tactical-gray text-lg font-mono">
                        NO ACTIVE OPERATIONS
                    </p>
                    <p className="text-tactical-gray/60 text-sm mt-2 font-mono">
                        Check back for classified asset opportunities
                    </p>
                </div>
            )}

            {/* Stamp Animation */}
            <style>{`
                @keyframes stamp {
                    0% {
                        transform: scale(0) rotate(-45deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2) rotate(-15deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1) rotate(-12deg);
                        opacity: 0.6;
                    }
                }
            `}</style>
        </div>
    );
};
