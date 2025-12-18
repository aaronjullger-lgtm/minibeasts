/**
 * Asset Exchange Demo
 * 
 * Demonstrates the SealedBidWire and HandshakeTerminal components
 */

import React, { useState } from 'react';
import { SealedBidWire } from './components/market/SealedBidWire';
import { HandshakeTerminal } from './components/market/HandshakeTerminal';
import { OverseerPlayerState, WaiverListing, LoreItem } from './types';

export const AssetExchangeDemo: React.FC = () => {
    const [activeMode, setActiveMode] = useState<'sealed' | 'handshake' | null>(null);

    // Mock player data
    const mockPlayer: OverseerPlayerState = {
        id: 'player1',
        name: 'Agent Shadow',
        grit: 5000,
        ownedItems: [
            {
                id: 'item1',
                name: 'Classified Dossier',
                description: 'Top secret intelligence',
                rarity: 'heat',
                supply: 10,
                currentSupply: 3,
                lore: 'Recovered from deep cover operation',
                equipped: false
            },
            {
                id: 'item2',
                name: 'Surveillance Equipment',
                description: 'Advanced monitoring tools',
                rarity: 'mid',
                supply: 50,
                currentSupply: 20,
                lore: 'Standard issue spy gear',
                equipped: false
            },
            {
                id: 'item3',
                name: 'Encryption Key',
                description: 'Unlocks secure communications',
                rarity: 'grail',
                supply: 5,
                currentSupply: 1,
                lore: 'One of five master keys',
                equipped: false
            }
        ] as LoreItem[],
        // Add other required fields with minimal values
        weekNumber: 1,
        totalGritEarned: 5000,
        wins: 0,
        losses: 0,
        ties: 0,
        weeklyProjectedGrit: 0,
        projectedFinish: 0,
        isEliminated: false,
        mysteryBoxesOpened: 0,
        achievements: [],
        activePowerUps: [],
        difficulty: 'recruit',
        gulagStreak: 0,
        waiverPriority: 1,
        tradeBlock: [],
        availableBets: [],
        activeBets: [],
        isNPC: false,
        conspiracyPoints: 0,
        conspiracyTier: 'clean',
        isBot: false,
        isActive: true,
        seasonStats: {
            totalGrit: 5000,
            weeklyGritHistory: [5000],
            bestWeek: { weekNumber: 1, grit: 5000 },
            worstWeek: { weekNumber: 1, grit: 5000 },
            averageGritPerWeek: 5000,
            mysteryBoxValue: 0,
            tradesMade: 0,
            betsWon: 0,
            betsLost: 0,
            gulagWins: 0,
            gulagLosses: 0
        }
    };

    // Mock other players
    const mockPlayers: OverseerPlayerState[] = [
        mockPlayer,
        {
            ...mockPlayer,
            id: 'player2',
            name: 'Operative Viper',
            ownedItems: [
                {
                    id: 'item4',
                    name: 'Field Disguise Kit',
                    description: 'Complete identity change',
                    rarity: 'heat',
                    supply: 20,
                    currentSupply: 10,
                    lore: 'Used in 47 successful infiltrations',
                    equipped: false
                },
                {
                    id: 'item5',
                    name: 'Safe House Key',
                    description: 'Access to emergency shelter',
                    rarity: 'mid',
                    supply: 100,
                    currentSupply: 50,
                    lore: 'Location unknown even to handler',
                    equipped: false
                }
            ] as LoreItem[]
        },
        {
            ...mockPlayer,
            id: 'player3',
            name: 'Handler Ghost',
            ownedItems: [
                {
                    id: 'item6',
                    name: 'Dead Drop Coordinates',
                    description: 'Secure exchange location',
                    rarity: 'mid',
                    supply: 200,
                    currentSupply: 100,
                    lore: 'Updated weekly',
                    equipped: false
                }
            ] as LoreItem[]
        }
    ];

    // Mock waiver listings
    const mockWaiverListings: WaiverListing[] = [
        {
            id: 'waiver1',
            itemId: 'item4',
            originalOwnerId: 'player2',
            originalOwnerName: 'Operative Viper',
            listedAt: Date.now() - 3600000, // 1 hour ago
            expiresAt: Date.now() + 82800000, // 23 hours from now
            status: 'active'
        },
        {
            id: 'waiver2',
            itemId: 'item6',
            originalOwnerId: 'player3',
            originalOwnerName: 'Handler Ghost',
            listedAt: Date.now() - 7200000, // 2 hours ago
            expiresAt: Date.now() + 79200000, // 22 hours from now
            status: 'active'
        }
    ];

    // Mock all items
    const allItems: LoreItem[] = [
        ...mockPlayer.ownedItems,
        ...mockPlayers[1].ownedItems,
        ...mockPlayers[2].ownedItems
    ];

    const handlePlaceBid = (listingId: string, bidAmount: number) => {
        console.log('Bid placed:', { listingId, bidAmount });
        alert(`Sealed bid of ${bidAmount} grit placed successfully!`);
    };

    const handleExecuteTrade = (targetPlayerId: string, myItems: LoreItem[], theirItems: LoreItem[]) => {
        console.log('Trade executed:', { targetPlayerId, myItems, theirItems });
        alert(`Handshake completed! Traded ${myItems.length} items for ${theirItems.length} items.`);
        setActiveMode(null);
    };

    return (
        <div className="min-h-screen bg-board-navy">
            {!activeMode && (
                <div className="flex flex-col items-center justify-center min-h-screen p-8">
                    <h1 className="text-5xl font-bold text-gold-leaf mb-4 text-center tracking-wider">
                        THE ASSET EXCHANGE
                    </h1>
                    <p className="text-tactical-gray text-center mb-12 max-w-2xl font-mono">
                        Phase 4: Tactical Luxury Marketplace<br/>
                        Sealed Bids • Briefcases • Dossiers • Matte Finish
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                        {/* Sealed Bid Wire */}
                        <button
                            onClick={() => setActiveMode('sealed')}
                            className="bg-tactical-dark border-2 border-tactical-gray hover:border-gold-leaf rounded-sm p-8 text-left transition-all group"
                        >
                            <div className="text-4xl mb-4">📨</div>
                            <h2 className="text-2xl font-bold text-gold-leaf mb-2 group-hover:text-paper-white transition-colors">
                                Sealed Bid Wire
                            </h2>
                            <p className="text-tactical-gray text-sm font-mono mb-4">
                                Blind auction system with classified envelopes
                            </p>
                            <ul className="text-xs text-tactical-gray space-y-1 font-mono">
                                <li>• Slide-to-seal interaction</li>
                                <li>• Mechanical countdown timers</li>
                                <li>• Hidden bid amounts</li>
                                <li>• Tactical cardstock aesthetic</li>
                            </ul>
                        </button>

                        {/* Handshake Terminal */}
                        <button
                            onClick={() => setActiveMode('handshake')}
                            className="bg-tactical-dark border-2 border-tactical-gray hover:border-gold-leaf rounded-sm p-8 text-left transition-all group"
                        >
                            <div className="text-4xl mb-4">💼</div>
                            <h2 className="text-2xl font-bold text-gold-leaf mb-2 group-hover:text-paper-white transition-colors">
                                Handshake Terminal
                            </h2>
                            <p className="text-tactical-gray text-sm font-mono mb-4">
                                P2P trading with briefcase security
                            </p>
                            <ul className="text-xs text-tactical-gray space-y-1 font-mono">
                                <li>• Split screen briefcase layout</li>
                                <li>• Chip/microfilm item cards</li>
                                <li>• Biometric scan authorization</li>
                                <li>• Hold-to-confirm (1.5s)</li>
                            </ul>
                        </button>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-tactical-gray text-xs font-mono">
                            Tactical Luxury • 007 Aesthetic • Underground Operations
                        </p>
                    </div>
                </div>
            )}

            {activeMode === 'sealed' && (
                <div className="relative">
                    <button
                        onClick={() => setActiveMode(null)}
                        className="absolute top-4 left-4 z-50 bg-tactical-gray hover:bg-gold-leaf text-paper-white px-4 py-2 rounded-sm font-mono text-sm"
                    >
                        ← Back to Menu
                    </button>
                    <SealedBidWire
                        player={mockPlayer}
                        activeListings={mockWaiverListings}
                        allItems={allItems}
                        onPlaceBid={handlePlaceBid}
                    />
                </div>
            )}

            {activeMode === 'handshake' && (
                <HandshakeTerminal
                    player={mockPlayer}
                    allPlayers={mockPlayers}
                    onExecuteTrade={handleExecuteTrade}
                    onClose={() => setActiveMode(null)}
                />
            )}
        </div>
    );
};
