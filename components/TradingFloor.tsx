/**
 * Trading Floor Component
 * 
 * P2P Direct Trading Terminal
 * Players can select items from their inventory and their partner's inventory
 * to propose 1-to-1 trades with a two-step lock mechanism
 */

import React, { useState, useEffect } from 'react';
import { LoreItem, OverseerPlayerState } from '../types';
import { proposeTrade } from '../services/marketService';

interface TradingFloorProps {
    player: OverseerPlayerState;
    allPlayers: OverseerPlayerState[]; // All active players for partner selection
    onExecuteTrade: (targetPlayerId: string, myItems: string[], theirItems: string[]) => void;
    onClose: () => void;
}

export const TradingFloor: React.FC<TradingFloorProps> = ({
    player,
    allPlayers,
    onExecuteTrade,
    onClose
}) => {
    const [selectedPartner, setSelectedPartner] = useState<OverseerPlayerState | null>(null);
    const [mySelectedItems, setMySelectedItems] = useState<Set<string>>(new Set());
    const [theirSelectedItems, setTheirSelectedItems] = useState<Set<string>>(new Set());
    const [lockState, setLockState] = useState<'unlocked' | 'locked' | 'confirmed'>('unlocked');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX_ITEMS = 5;

    // Reset lock state when selections change
    useEffect(() => {
        if (lockState !== 'unlocked') {
            setLockState('unlocked');
        }
    }, [mySelectedItems.size, theirSelectedItems.size]);

    const getRarityColor = (rarity: string): string => {
        const colors: { [key: string]: string } = {
            'grail': '#FF3333',
            'heat': '#D4AF37',
            'mid': '#4a9eff',
            'brick': '#9ca3af'
        };
        return colors[rarity] || '#9ca3af';
    };

    const toggleMyItem = (itemId: string) => {
        const newSet = new Set(mySelectedItems);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else if (newSet.size < MAX_ITEMS) {
            newSet.add(itemId);
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
        }
        setMySelectedItems(newSet);
    };

    const toggleTheirItem = (itemId: string) => {
        const newSet = new Set(theirSelectedItems);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else if (newSet.size < MAX_ITEMS) {
            newSet.add(itemId);
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
        }
        setTheirSelectedItems(newSet);
    };

    const handleInitiateLock = () => {
        if (mySelectedItems.size === 0 || theirSelectedItems.size === 0) {
            return;
        }
        setLockState('locked');
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    };

    const handleConfirmDeal = async () => {
        if (!selectedPartner || lockState !== 'locked') {
            return;
        }

        setIsSubmitting(true);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([20, 50, 20]);
        }

        try {
            await proposeTrade(
                selectedPartner.id,
                Array.from(mySelectedItems),
                Array.from(theirSelectedItems)
            );
            
            onExecuteTrade(
                selectedPartner.id,
                Array.from(mySelectedItems),
                Array.from(theirSelectedItems)
            );
        } catch (error) {
            console.error('Trade failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const availablePlayers = allPlayers.filter(p => p.id !== player.id);
    const partnerInventory = selectedPartner?.ownedItems || [];

    const canInitiateLock = mySelectedItems.size > 0 && theirSelectedItems.size > 0;

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-board-navy border-b-4 border-board-red p-4 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-board-off-white font-board-header italic">
                            🔄 TRADING FLOOR
                        </h2>
                        <p className="text-gray-400 text-sm font-board-grit">
                            Direct P2P Barter Terminal
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-3xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Partner Selection */}
                <div className="bg-board-muted-blue rounded-lg p-4 border-2 border-board-off-white/20">
                    <label className="block text-sm font-bold text-gray-400 mb-2 font-board-grit">
                        SELECT TRADING PARTNER
                    </label>
                    <select
                        value={selectedPartner?.id || ''}
                        onChange={(e) => {
                            const partner = availablePlayers.find(p => p.id === e.target.value);
                            setSelectedPartner(partner || null);
                            setMySelectedItems(new Set());
                            setTheirSelectedItems(new Set());
                            setLockState('unlocked');
                        }}
                        className="w-full bg-board-navy border-2 border-board-off-white/30 rounded px-4 py-3 text-board-off-white font-board-grit focus:border-board-red outline-none"
                    >
                        <option value="">Choose a player...</option>
                        {availablePlayers.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.ownedItems.length} items)
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPartner && (
                    <>
                        {/* The Stash - Two Grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* My Inventory */}
                            <div className="bg-board-muted-blue rounded-lg p-4 border-2 border-green-500/30">
                                <h3 className="text-xl font-bold text-green-400 mb-3 font-board-header">
                                    MY INVENTORY ({mySelectedItems.size}/{MAX_ITEMS})
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {player.ownedItems.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No items</p>
                                    ) : (
                                        player.ownedItems.map(item => {
                                            const isSelected = mySelectedItems.has(item.id);
                                            const canSelect = !isSelected && mySelectedItems.size >= MAX_ITEMS;
                                            
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => !canSelect && toggleMyItem(item.id)}
                                                    disabled={lockState !== 'unlocked' || canSelect}
                                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-board-red bg-board-red/20'
                                                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-400'
                                                    } ${lockState !== 'unlocked' ? 'opacity-50 cursor-not-allowed' : ''} ${
                                                        canSelect ? 'opacity-30 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-board-off-white">
                                                                {item.name}
                                                            </p>
                                                            <p 
                                                                className="text-xs uppercase font-bold mt-1"
                                                                style={{ color: getRarityColor(item.rarity) }}
                                                            >
                                                                {item.rarity}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <span className="text-board-red text-xl">✓</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Their Inventory */}
                            <div className="bg-board-muted-blue rounded-lg p-4 border-2 border-blue-500/30">
                                <h3 className="text-xl font-bold text-blue-400 mb-3 font-board-header">
                                    {selectedPartner.name.toUpperCase()}'S INVENTORY ({theirSelectedItems.size}/{MAX_ITEMS})
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {partnerInventory.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No items</p>
                                    ) : (
                                        partnerInventory.map(item => {
                                            const isSelected = theirSelectedItems.has(item.id);
                                            const canSelect = !isSelected && theirSelectedItems.size >= MAX_ITEMS;
                                            
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => !canSelect && toggleTheirItem(item.id)}
                                                    disabled={lockState !== 'unlocked' || canSelect}
                                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-board-red bg-board-red/20'
                                                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-400'
                                                    } ${lockState !== 'unlocked' ? 'opacity-50 cursor-not-allowed' : ''} ${
                                                        canSelect ? 'opacity-30 cursor-not-allowed' : ''
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-board-off-white">
                                                                {item.name}
                                                            </p>
                                                            <p 
                                                                className="text-xs uppercase font-bold mt-1"
                                                                style={{ color: getRarityColor(item.rarity) }}
                                                            >
                                                                {item.rarity}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <span className="text-board-red text-xl">✓</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trade Summary */}
                        {(mySelectedItems.size > 0 || theirSelectedItems.size > 0) && (
                            <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-4">
                                <p className="text-xs text-yellow-400 font-board-grit">
                                    <strong>TRADE SUMMARY:</strong><br/>
                                    You give: {mySelectedItems.size} item(s)<br/>
                                    You receive: {theirSelectedItems.size} item(s)
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer - Fixed */}
            {selectedPartner && (
                <div className="bg-board-navy border-t-4 border-board-red p-4 flex-shrink-0">
                    {lockState === 'unlocked' && (
                        <button
                            onClick={handleInitiateLock}
                            disabled={!canInitiateLock}
                            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 text-xl rounded-lg transition-all font-board-header"
                        >
                            {canInitiateLock ? '🔒 INITIATE LOCK' : '⚠️ SELECT ITEMS TO TRADE'}
                        </button>
                    )}
                    
                    {lockState === 'locked' && (
                        <button
                            onClick={handleConfirmDeal}
                            disabled={isSubmitting}
                            className="w-full bg-board-red hover:bg-red-600 disabled:bg-gray-700 text-white font-bold py-4 text-xl rounded-lg transition-all font-board-header animate-pulse"
                        >
                            {isSubmitting ? '⏳ PROCESSING...' : '✅ CONFIRM DEAL'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
