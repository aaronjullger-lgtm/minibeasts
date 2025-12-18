/**
 * Handshake Terminal Component
 * 
 * Visual Metaphor: Opening a secure briefcase
 * Aesthetic: Tactical Luxury / Two-Key Turn / Biometric Authorization
 * 
 * Features:
 * - Split screen (Your Assets vs Target Assets)
 * - Items as chips/microfilm slides
 * - Hold-to-authorize biometric scan (1.5s)
 * - Scanning line animation
 */

import React, { useState, useEffect, useRef } from 'react';
import { LoreItem, OverseerPlayerState } from '../../types';
import { assetService } from '../../services/assetService';

interface HandshakeTerminalProps {
    player: OverseerPlayerState;
    allPlayers: OverseerPlayerState[];
    onExecuteTrade: (targetPlayerId: string, myItems: LoreItem[], theirItems: LoreItem[]) => void;
    onClose: () => void;
}

export const HandshakeTerminal: React.FC<HandshakeTerminalProps> = ({
    player,
    allPlayers,
    onExecuteTrade,
    onClose
}) => {
    const [selectedPartner, setSelectedPartner] = useState<OverseerPlayerState | null>(null);
    const [mySelectedItems, setMySelectedItems] = useState<Set<string>>(new Set());
    const [theirSelectedItems, setTheirSelectedItems] = useState<Set<string>>(new Set());
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
    const scanStartRef = useRef<number>(0);

    const MAX_ITEMS = 5;
    const SCAN_DURATION = 1500; // 1.5 seconds

    useEffect(() => {
        return () => {
            if (scanTimerRef.current) {
                clearInterval(scanTimerRef.current);
            }
        };
    }, []);

    const toggleMyItem = (itemId: string) => {
        const newSet = new Set(mySelectedItems);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else if (newSet.size < MAX_ITEMS) {
            newSet.add(itemId);
            if (navigator.vibrate) {
                navigator.vibrate(10);
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
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
        setTheirSelectedItems(newSet);
    };

    const handleScanStart = () => {
        if (mySelectedItems.size === 0 || theirSelectedItems.size === 0) return;
        
        setIsScanning(true);
        setScanProgress(0);
        scanStartRef.current = Date.now();

        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        scanTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - scanStartRef.current;
            const progress = Math.min(elapsed / SCAN_DURATION, 1);
            setScanProgress(progress);

            if (progress >= 1) {
                handleScanComplete();
            }
        }, 16); // ~60fps
    };

    const handleScanEnd = () => {
        if (scanTimerRef.current) {
            clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }

        if (scanProgress < 1) {
            setIsScanning(false);
            setScanProgress(0);
        }
    };

    const handleScanComplete = () => {
        if (scanTimerRef.current) {
            clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }

        setIsAuthorized(true);
        
        if (navigator.vibrate) {
            navigator.vibrate([20, 50, 20]);
        }

        setTimeout(() => {
            if (!selectedPartner) return;

            const myItems = player.ownedItems.filter(i => mySelectedItems.has(i.id));
            const theirItems = selectedPartner.ownedItems.filter(i => theirSelectedItems.has(i.id));

            onExecuteTrade(selectedPartner.id, myItems, theirItems);
            
            // Reset
            setMySelectedItems(new Set());
            setTheirSelectedItems(new Set());
            setIsAuthorized(false);
            setIsScanning(false);
            setScanProgress(0);
        }, 600);
    };

    const availablePlayers = allPlayers.filter(p => p.id !== player.id);
    const partnerInventory = selectedPartner?.ownedItems || [];
    const canExecute = mySelectedItems.size > 0 && theirSelectedItems.size > 0;

    return (
        <div className="fixed inset-0 bg-tactical-dark z-50 flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-black/80 border-b border-tactical-gray p-4 flex-shrink-0">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div>
                        <h2 className="text-3xl font-bold text-gold-leaf tracking-wider">
                            HANDSHAKE TERMINAL
                        </h2>
                        <p className="text-tactical-gray text-xs font-mono tracking-widest mt-1">
                            SECURE ASSET EXCHANGE PROTOCOL
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-tactical-gray hover:text-paper-white text-3xl w-12 h-12 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Partner Selection */}
                    <div className="bg-black/40 border border-tactical-gray rounded-sm p-4">
                        <label className="block text-xs text-tactical-gray mb-3 font-mono tracking-wider">
                            SELECT TARGET AGENT
                        </label>
                        <select
                            value={selectedPartner?.id || ''}
                            onChange={(e) => {
                                const partner = availablePlayers.find(p => p.id === e.target.value);
                                setSelectedPartner(partner || null);
                                setMySelectedItems(new Set());
                                setTheirSelectedItems(new Set());
                                setIsAuthorized(false);
                            }}
                            className="w-full bg-tactical-dark border border-tactical-gray rounded-sm px-4 py-3 text-paper-white font-mono focus:border-gold-leaf outline-none"
                        >
                            <option value="">-- SELECT AGENT --</option>
                            {availablePlayers.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name.toUpperCase()} [{p.ownedItems.length} ASSETS]
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPartner && (
                        <>
                            {/* Briefcase Layout - Split Screen */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Your Assets */}
                                <div className="bg-black/40 border border-tactical-gray rounded-sm p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">
                                            YOUR ASSETS
                                        </h3>
                                        <span className="text-tactical-gray text-sm font-mono">
                                            {mySelectedItems.size}/{MAX_ITEMS}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                        {player.ownedItems.length === 0 ? (
                                            <div className="col-span-full text-center py-8 text-tactical-gray font-mono text-sm">
                                                NO ASSETS
                                            </div>
                                        ) : (
                                            player.ownedItems.map(item => {
                                                const isSelected = mySelectedItems.has(item.id);
                                                const canSelect = !isSelected && mySelectedItems.size >= MAX_ITEMS;
                                                
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => !canSelect && toggleMyItem(item.id)}
                                                        disabled={canSelect}
                                                        className={`
                                                            relative aspect-square bg-tactical-dark border rounded-sm p-3 
                                                            transition-all flex flex-col items-center justify-center
                                                            ${isSelected 
                                                                ? 'border-gold-leaf shadow-[0_0_12px_rgba(212,175,55,0.3)]' 
                                                                : 'border-tactical-gray hover:border-paper-white'
                                                            }
                                                            ${canSelect ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                                                        `}
                                                    >
                                                        {/* Chip/Microfilm Aesthetic */}
                                                        <div className="text-xs font-mono text-center break-words text-paper-white">
                                                            {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                                                        </div>
                                                        <div className={`text-[10px] font-mono mt-2 ${
                                                            item.rarity === 'grail' ? 'text-red-400' :
                                                            item.rarity === 'heat' ? 'text-gold-leaf' :
                                                            item.rarity === 'mid' ? 'text-blue-400' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {item.rarity.toUpperCase()}
                                                        </div>

                                                        {/* Selection Indicator */}
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 bg-gold-leaf rounded-full flex items-center justify-center">
                                                                <span className="text-black text-xs">✓</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Target Assets */}
                                <div className="bg-black/40 border border-tactical-gray rounded-sm p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-blue-400 font-mono tracking-wider">
                                            TARGET ASSETS
                                        </h3>
                                        <span className="text-tactical-gray text-sm font-mono">
                                            {theirSelectedItems.size}/{MAX_ITEMS}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                        {partnerInventory.length === 0 ? (
                                            <div className="col-span-full text-center py-8 text-tactical-gray font-mono text-sm">
                                                NO ASSETS
                                            </div>
                                        ) : (
                                            partnerInventory.map(item => {
                                                const isSelected = theirSelectedItems.has(item.id);
                                                const canSelect = !isSelected && theirSelectedItems.size >= MAX_ITEMS;
                                                
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => !canSelect && toggleTheirItem(item.id)}
                                                        disabled={canSelect}
                                                        className={`
                                                            relative aspect-square bg-tactical-dark border rounded-sm p-3 
                                                            transition-all flex flex-col items-center justify-center
                                                            ${isSelected 
                                                                ? 'border-gold-leaf shadow-[0_0_12px_rgba(212,175,55,0.3)]' 
                                                                : 'border-tactical-gray hover:border-paper-white'
                                                            }
                                                            ${canSelect ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                                                        `}
                                                    >
                                                        {/* Chip/Microfilm Aesthetic */}
                                                        <div className="text-xs font-mono text-center break-words text-paper-white">
                                                            {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                                                        </div>
                                                        <div className={`text-[10px] font-mono mt-2 ${
                                                            item.rarity === 'grail' ? 'text-red-400' :
                                                            item.rarity === 'heat' ? 'text-gold-leaf' :
                                                            item.rarity === 'mid' ? 'text-blue-400' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {item.rarity.toUpperCase()}
                                                        </div>

                                                        {/* Selection Indicator */}
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 bg-gold-leaf rounded-full flex items-center justify-center">
                                                                <span className="text-black text-xs">✓</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Exchange Summary */}
                            {canExecute && (
                                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
                                    <p className="text-xs text-yellow-400/90 font-mono">
                                        EXCHANGE PROTOCOL:<br/>
                                        • You transfer: {mySelectedItems.size} asset(s)<br/>
                                        • You receive: {theirSelectedItems.size} asset(s)<br/>
                                        • Authorization required from both parties
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Footer - Biometric Scan */}
            {selectedPartner && canExecute && (
                <div className="bg-black/80 border-t border-tactical-gray p-6 flex-shrink-0">
                    <div className="max-w-md mx-auto">
                        <div className="text-xs text-tactical-gray font-mono text-center mb-3 tracking-wider">
                            HOLD TO AUTHORIZE TRANSFER
                        </div>
                        
                        <button
                            onMouseDown={handleScanStart}
                            onMouseUp={handleScanEnd}
                            onMouseLeave={handleScanEnd}
                            onTouchStart={handleScanStart}
                            onTouchEnd={handleScanEnd}
                            disabled={isAuthorized}
                            className={`
                                relative w-full h-16 rounded-sm border-2 overflow-hidden
                                transition-all font-mono font-bold text-lg tracking-wider
                                ${isAuthorized 
                                    ? 'bg-green-900/50 border-green-500 text-green-400' 
                                    : isScanning 
                                        ? 'bg-gold-leaf/20 border-gold-leaf text-gold-leaf'
                                        : 'bg-tactical-dark border-tactical-gray text-paper-white hover:border-gold-leaf'
                                }
                            `}
                        >
                            {/* Progress Bar */}
                            <div 
                                className="absolute inset-0 bg-gold-leaf/30 transition-all"
                                style={{ 
                                    width: `${scanProgress * 100}%`,
                                    transition: isScanning ? 'none' : 'width 0.3s ease-out'
                                }}
                            />

                            {/* Scanning Line */}
                            {isScanning && (
                                <div 
                                    className="absolute left-0 right-0 h-0.5 bg-gold-leaf"
                                    style={{
                                        top: `${scanProgress * 100}%`,
                                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
                                    }}
                                />
                            )}

                            {/* Button Content */}
                            <div className="relative z-10 flex items-center justify-center h-full">
                                {isAuthorized ? (
                                    <span className="flex items-center gap-2">
                                        <span>✓</span>
                                        <span>AUTHORIZED</span>
                                    </span>
                                ) : isScanning ? (
                                    <span className="flex items-center gap-2">
                                        <span>🔍</span>
                                        <span>SCANNING...</span>
                                        <span>{Math.floor(scanProgress * 100)}%</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span>👆</span>
                                        <span>BIOMETRIC SCAN</span>
                                    </span>
                                )}
                            </div>
                        </button>

                        <div className="text-center text-xs text-tactical-gray/60 font-mono mt-3">
                            Hold for 1.5 seconds to complete authorization
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
