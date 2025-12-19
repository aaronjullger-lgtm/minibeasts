/**
 * The Locker Room - SUPPLY CHAIN (Tactical Luxury Edition)
 * Refactored from emoji-filled storefront to high-end supply depot
 * 
 * Features:
 * - ScreenShell layout (bug-free scrolling)
 * - Typography system (Mono, Label, Header)
 * - AssetCard components (emoji-free, clean)
 * - Sticky balance display
 * - Hidden "Syndicate" backdoor trigger
 */

import React, { useState, useRef, useEffect } from 'react';
import { LoreItem, OverseerPlayerState } from '../../types';
import { mysteryBoxService } from '../../services/mysteryBoxService';
import { CrateOpenAnimation } from '../CrateOpenAnimation';
import { BlackLedger } from '../corruption/BlackLedger';
import { OperationType } from '../../services/ledgerService';
import { ScreenShell } from '../layout/ScreenShell';
import { AssetCard } from './AssetCard';
import { Mono, Label } from '../ui/Typography';

interface LockerRoomProps {
    player: OverseerPlayerState;
    onPurchase: (tierId: string, cost: number, pulledItem: LoreItem) => void;
    onClose: () => void;
    onOperationExecuted?: (operation: OperationType, cost: number) => void;
}

interface MysteryBoxTier {
    id: 'clearance' | 'standard' | 'grail';
    name: string;
    description: string;
    cost: number;
}

export const LockerRoom: React.FC<LockerRoomProps> = ({ player, onPurchase, onClose, onOperationExecuted }) => {
    const [pulledItem, setPulledItem] = useState<LoreItem | null>(null);
    const [isOpening, setIsOpening] = useState(false);
    const [showBlackLedger, setShowBlackLedger] = useState(false);
    
    // Hidden trigger state
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const holdStartTimeRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const HOLD_DURATION = 3000; // 3 seconds

    // Mystery Box Tiers
    const tiers: MysteryBoxTier[] = [
        {
            id: 'clearance',
            name: 'Clearance Rack',
            description: 'Budget finds. Mostly towels and socks. Maybe something decent.',
            cost: 100,
        },
        {
            id: 'standard',
            name: 'Standard Issue',
            description: 'The everyday grind. Solid gear for the committed.',
            cost: 500,
        },
        {
            id: 'grail',
            name: 'Grail Crate',
            description: 'Legends only. Pure gold. Championship dreams.',
            cost: 2500,
        }
    ];

    const handlePurchase = (tier: MysteryBoxTier) => {
        if (player.grit < tier.cost) {
            return;
        }

        setIsOpening(true);
        
        // Simulate opening delay
        setTimeout(() => {
            const item = mysteryBoxService.openMysteryBoxByTier(tier.id);
            setPulledItem(item);
            onPurchase(tier.id, tier.cost, item);
        }, 100);
    };

    const handleAnimationComplete = () => {
        setPulledItem(null);
        setIsOpening(false);
    };

    // Hidden Syndicate Trigger Handlers
    const handleHoldStart = () => {
        holdStartTimeRef.current = Date.now();
        
        progressIntervalRef.current = setInterval(() => {
            if (holdStartTimeRef.current) {
                const elapsed = Date.now() - holdStartTimeRef.current;
                const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
                setHoldProgress(progress);
            }
        }, 50);

        holdTimerRef.current = setTimeout(() => {
            setShowBlackLedger(true);
            setHoldProgress(0);
        }, HOLD_DURATION);
    };

    const handleHoldEnd = () => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        holdStartTimeRef.current = null;
        setHoldProgress(0);
    };

    useEffect(() => {
        return () => {
            handleHoldEnd();
        };
    }, []);

    const header = (
        <div className="flex justify-between items-center h-full px-4">
            <button
                onClick={onClose}
                className="text-paper-white hover:text-muted-text transition-colors"
            >
                <Label>← BACK</Label>
            </button>
            <h1 className="font-sans font-bold text-xl text-paper-white uppercase tracking-wider">
                SUPPLY CHAIN
            </h1>
            <div className="w-16 flex-shrink-0"></div> {/* Spacer for centering */}
        </div>
    );

    return (
        <>
            <ScreenShell header={header}>
                {/* Sticky Balance Display */}
                <div className="sticky top-0 z-10 bg-tactical-dark border-b border-tactical-border p-4">
                    <div
                        className="flex justify-between items-center select-none cursor-pointer"
                        onMouseDown={handleHoldStart}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        onTouchStart={handleHoldStart}
                        onTouchEnd={handleHoldEnd}
                        onTouchCancel={handleHoldEnd}
                    >
                        <Label>AVAILABLE FUNDS</Label>
                        <Mono className="text-2xl">{player.grit.toLocaleString()}</Mono>
                        
                        {/* Progress indicator for hidden trigger */}
                        {holdProgress > 0 && (
                            <div 
                                className="absolute bottom-0 left-0 h-1 bg-alert-orange transition-all duration-100"
                                style={{ width: `${holdProgress}%` }}
                            />
                        )}
                    </div>
                </div>

                {/* Asset Cards Grid */}
                <div className="flex flex-col gap-3 p-4">
                    {tiers.map((tier) => (
                        <AssetCard
                            key={tier.id}
                            title={tier.name}
                            description={tier.description}
                            price={tier.cost}
                            onPurchase={() => handlePurchase(tier)}
                            disabled={isOpening}
                            canAfford={player.grit >= tier.cost}
                        />
                    ))}
                </div>
            </ScreenShell>

            {/* Crate Opening Animation Overlay */}
            {pulledItem && (
                <CrateOpenAnimation
                    item={pulledItem}
                    onComplete={handleAnimationComplete}
                />
            )}

            {/* Black Ledger - Operations Access */}
            {showBlackLedger && (
                <BlackLedger
                    player={player}
                    onOperationExecuted={(operation, cost) => {
                        if (onOperationExecuted) {
                            onOperationExecuted(operation, cost);
                        }
                        setShowBlackLedger(false);
                    }}
                    onClose={() => setShowBlackLedger(false)}
                />
            )}
        </>
    );
};
