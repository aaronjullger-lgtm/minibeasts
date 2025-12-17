/**
 * The Bodega - Mystery Box Shop Component
 * 
 * Underground casino aesthetic for purchasing mystery boxes
 */

import React, { useState } from 'react';
import { MysteryBox, LoreItem, OverseerPlayerState } from '../types';
import { MYSTERY_BOXES, RARITY_CONFIG } from '../constants-overseer';
import { mysteryBoxService } from '../services/mysteryBoxService';

interface BodegaProps {
    player: OverseerPlayerState;
    onPurchase: (boxId: string, pulledItem: LoreItem) => void;
    onClose: () => void;
}

export const BodegaShop: React.FC<BodegaProps> = ({ player, onPurchase, onClose }) => {
    const [selectedBox, setSelectedBox] = useState<MysteryBox | null>(null);
    const [pulledItem, setPulledItem] = useState<LoreItem | null>(null);
    const [isOpening, setIsOpening] = useState(false);

    const handlePurchase = (box: MysteryBox) => {
        if (player.grit < box.cost) {
            alert('Not enough grit!');
            return;
        }

        setSelectedBox(box);
        setIsOpening(true);

        // Simulate box opening animation
        setTimeout(() => {
            const item = mysteryBoxService.openMysteryBox(box.id);
            if (item) {
                setPulledItem(item);
                onPurchase(box.id, item);
            }
            setIsOpening(false);
        }, 2000);
    };

    const getRarityColor = (rarity: string): string => {
        const config = RARITY_CONFIG.find(r => r.rarity === rarity);
        return config?.color || '#9CA3AF';
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-0 md:p-4">
            <div className="bg-gray-900 w-full h-full md:h-auto md:max-w-4xl md:rounded-lg md:border-4 border-green-500 overflow-y-auto">
                {/* Header - Sticky on mobile */}
                <div className="sticky top-0 z-10 bg-gray-900 border-b-4 border-green-500 md:border-b-0">
                    <div className="flex justify-between items-center p-4 md:p-8 md:pb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400" style={{ fontFamily: 'monospace' }}>
                                🛍️ THE BODEGA
                            </h2>
                            <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Underground Casino • Mystery Boxes</p>
                            <p className="text-green-300 text-lg md:text-xl mt-1 font-mono">Your Grit: {player.grit}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl md:text-3xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-8 md:pt-0">

                {/* Mystery Boxes with Cinematic Animations */}
                {!pulledItem && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                            {MYSTERY_BOXES.map((box, index) => (
                                <div
                                    key={box.id}
                                    className={`glass-card border-2 border-gray-700/50 rounded-lg p-4 md:p-6 active:border-green-500 md:hover:border-green-500 transition-all cursor-pointer btn-glow focus-ring cinematic-enter ${
                                        box.tier === 'brown_paper_bag' ? 'glow-blue' : 'glow-purple'
                                    }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => !isOpening && handlePurchase(box)}
                                >
                                    <div className="text-center">
                                        <div className="text-4xl md:text-6xl mb-3 md:mb-4 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                                            {box.tier === 'brown_paper_bag' ? '🛍️' : '🗄️'}
                                        </div>
                                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2">
                                            {box.name}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4">{box.description}</p>
                                        
                                        {box.guaranteedRarity && (
                                            <p className="text-xs md:text-sm text-green-400 mb-2 font-semibold">
                                                ✨ Guaranteed {box.guaranteedRarity}+
                                            </p>
                                        )}

                                        <div className="flex justify-center items-center gap-2 mb-3 md:mb-4">
                                            <span className="text-2xl md:text-3xl font-bold text-green-400">
                                                {box.cost}
                                            </span>
                                            <span className="text-gray-400 text-sm md:text-base">GRIT</span>
                                        </div>

                                        <button
                                            disabled={player.grit < box.cost || isOpening}
                                            className={`w-full py-3 md:py-3 rounded-lg font-bold text-sm md:text-base min-h-[44px] transition-all btn-glow focus-ring ${
                                                player.grit < box.cost
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 active:from-green-600 active:to-emerald-700 md:hover:from-green-400 md:hover:to-emerald-500 text-white shadow-lg glow-green'
                                            }`}
                                        >
                                            {isOpening && selectedBox?.id === box.id
                                                ? <span className="flex items-center justify-center gap-2">
                                                    <span className="skeleton-shimmer w-4 h-4 rounded-full"></span>
                                                    OPENING...
                                                  </span>
                                                : player.grit < box.cost
                                                ? 'INSUFFICIENT GRIT'
                                                : 'PURCHASE'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Drop Rates */}
                        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-800 rounded">
                            <h4 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3">DROP RATES</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {RARITY_CONFIG.map(config => (
                                    <div key={config.rarity} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 md:w-4 md:h-4 rounded flex-shrink-0"
                                            style={{ backgroundColor: config.color }}
                                        />
                                        <span className="text-xs md:text-sm text-gray-300 truncate">
                                            {config.label}: {config.dropRate}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Item Pulled Display */}
                {pulledItem && (
                    <div className="text-center py-6 md:py-8">
                        <div className="mb-4 md:mb-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                                YOU PULLED:
                            </h3>
                        </div>

                        <div
                            className="border-4 rounded-lg p-6 md:p-8 max-w-md mx-auto mb-4 md:mb-6"
                            style={{ borderColor: getRarityColor(pulledItem.rarity) }}
                        >
                            <div className="text-4xl md:text-6xl mb-3 md:mb-4">
                                {pulledItem.name.split(' ')[0]}
                            </div>
                            <h4
                                className="text-xl md:text-2xl font-bold mb-2"
                                style={{ color: getRarityColor(pulledItem.rarity) }}
                            >
                                {pulledItem.name}
                            </h4>
                            <p className="text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4"
                               style={{ color: getRarityColor(pulledItem.rarity) }}
                            >
                                {pulledItem.rarity}
                            </p>
                            <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">{pulledItem.description}</p>
                            <p className="text-xs md:text-sm text-gray-500 italic">{pulledItem.lore}</p>

                            {pulledItem.passiveBonus && (
                                <div className="mt-3 md:mt-4 p-3 bg-gray-900 rounded">
                                    <p className="text-green-400 text-xs md:text-sm">
                                        ⚡ Passive Bonus: {pulledItem.passiveBonus.payoutMultiplier && 
                                            `+${((pulledItem.passiveBonus.payoutMultiplier - 1) * 100).toFixed(0)}% payout`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setPulledItem(null);
                                setSelectedBox(null);
                            }}
                            className="bg-green-500 active:bg-green-600 md:hover:bg-green-600 text-black font-bold py-3 px-8 rounded min-h-[44px] transition-colors"
                        >
                            OPEN ANOTHER
                        </button>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
