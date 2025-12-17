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
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-4 border-green-500 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-4xl font-bold text-green-400" style={{ fontFamily: 'monospace' }}>
                            🛍️ THE BODEGA
                        </h2>
                        <p className="text-gray-400 mt-2">Underground Casino • Mystery Boxes</p>
                        <p className="text-green-300 text-xl mt-1">Your Grit: {player.grit}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-3xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Mystery Boxes */}
                {!pulledItem && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {MYSTERY_BOXES.map(box => (
                            <div
                                key={box.id}
                                className="border-2 border-gray-700 rounded-lg p-6 bg-gray-800 hover:border-green-500 transition-colors cursor-pointer"
                                onClick={() => !isOpening && handlePurchase(box)}
                            >
                                <div className="text-center">
                                    <div className="text-6xl mb-4">
                                        {box.tier === 'brown_paper_bag' ? '🛍️' : '🗄️'}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {box.name}
                                    </h3>
                                    <p className="text-gray-400 mb-4">{box.description}</p>
                                    
                                    {box.guaranteedRarity && (
                                        <p className="text-sm text-green-400 mb-2">
                                            Guaranteed {box.guaranteedRarity}+
                                        </p>
                                    )}

                                    <div className="flex justify-center items-center gap-2 mb-4">
                                        <span className="text-3xl font-bold text-green-400">
                                            {box.cost}
                                        </span>
                                        <span className="text-gray-400">GRIT</span>
                                    </div>

                                    <button
                                        disabled={player.grit < box.cost || isOpening}
                                        className={`w-full py-3 rounded font-bold ${
                                            player.grit < box.cost
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-500 hover:bg-green-600 text-black'
                                        }`}
                                    >
                                        {isOpening && selectedBox?.id === box.id
                                            ? 'OPENING...'
                                            : player.grit < box.cost
                                            ? 'INSUFFICIENT GRIT'
                                            : 'PURCHASE'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Item Pulled Display */}
                {pulledItem && (
                    <div className="text-center py-8">
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold text-green-400 mb-2">
                                YOU PULLED:
                            </h3>
                        </div>

                        <div
                            className="border-4 rounded-lg p-8 max-w-md mx-auto mb-6"
                            style={{ borderColor: getRarityColor(pulledItem.rarity) }}
                        >
                            <div className="text-6xl mb-4">
                                {pulledItem.name.split(' ')[0]}
                            </div>
                            <h4
                                className="text-2xl font-bold mb-2"
                                style={{ color: getRarityColor(pulledItem.rarity) }}
                            >
                                {pulledItem.name}
                            </h4>
                            <p className="text-sm uppercase tracking-wider mb-4"
                               style={{ color: getRarityColor(pulledItem.rarity) }}
                            >
                                {pulledItem.rarity}
                            </p>
                            <p className="text-gray-300 mb-4">{pulledItem.description}</p>
                            <p className="text-sm text-gray-500 italic">{pulledItem.lore}</p>

                            {pulledItem.passiveBonus && (
                                <div className="mt-4 p-3 bg-gray-900 rounded">
                                    <p className="text-green-400 text-sm">
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
                            className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded"
                        >
                            OPEN ANOTHER
                        </button>
                    </div>
                )}

                {/* Drop Rates */}
                <div className="mt-6 p-4 bg-gray-800 rounded">
                    <h4 className="text-lg font-bold text-white mb-3">DROP RATES</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {RARITY_CONFIG.map(config => (
                            <div key={config.rarity} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span className="text-sm text-gray-300">
                                    {config.label}: {config.dropRate}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
