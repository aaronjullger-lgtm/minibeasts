/**
 * Overseer Game Mode - Main Screen
 * 
 * The AI-driven social betting game with weekly phases
 */

import React, { useState, useEffect } from 'react';
import { OverseerPlayerState, TribunalSuperlative, SquadRideParlay, TradeOffer, LoreItem, AmbushBet } from '../types';
import { weeklyScheduleService } from '../services/weeklyScheduleService';
import { overseerService } from '../services/overseerService';
import { bettingService } from '../services/bettingService';
import { mysteryBoxService } from '../services/mysteryBoxService';
import { gulagService } from '../services/gulagService';
import { CorruptionAction } from '../services/corruptionService';
import { BodegaShop } from './BodegaShop';
import { LockerRoom } from './LockerRoom';
import { TradingFloor } from './TradingFloor';
import { TribunalPanel } from './TribunalPanel';
import { TheBoard } from './TheBoard';
import { PaydayScreen } from './PaydayScreen';
import { BankruptScreen } from './BankruptScreen';
import { GulagLockdown } from './GulagLockdown';

interface OverseerGameProps {
    initialPlayer: OverseerPlayerState;
    onExit: () => void;
    onPlayerUpdate?: (player: OverseerPlayerState) => void;
    onLockdownChange?: (locked: boolean) => void;
}

export const OverseerGame: React.FC<OverseerGameProps> = ({ initialPlayer, onExit, onPlayerUpdate, onLockdownChange }) => {
    const [player, setPlayer] = useState<OverseerPlayerState>(initialPlayer);
    const [currentView, setCurrentView] = useState<'main' | 'board' | 'bodega' | 'locker' | 'trading' | 'tribunal'>('main');
    const [phaseInfo, setPhaseInfo] = useState(weeklyScheduleService.getPhaseInfo());
    const [superlatives, setSuperlatives] = useState<TribunalSuperlative[]>([]);
    const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
    const [globalAmbushBets, setGlobalAmbushBets] = useState<AmbushBet[]>([]);
    const [showPayday, setShowPayday] = useState(false);
    const [showBankrupt, setShowBankrupt] = useState(false);

    // Demo mode: Add sample ambush bets targeting the current player
    const addDemoBets = () => {
        const demoBets: AmbushBet[] = [
            {
                id: 'demo_1',
                bettorId: 'anonymous_1',
                bettorName: 'ANONYMOUS',
                targetUserId: player.id,
                targetUserName: player.name,
                description: 'Will mention their favorite team 3x in chat',
                category: 'social',
                odds: 150,
                wager: 500,
                potentialPayout: 1250,
                isResolved: false,
                createdAt: Date.now() - 3600000
            },
            {
                id: 'demo_2',
                bettorId: 'anonymous_2',
                bettorName: 'ANONYMOUS',
                targetUserId: player.id,
                targetUserName: player.name,
                description: 'Will make a bold prediction within 24 hours',
                category: 'behavior',
                odds: 200,
                wager: 1000,
                potentialPayout: 3000,
                isResolved: false,
                createdAt: Date.now() - 7200000
            },
            {
                id: 'demo_3',
                bettorId: 'anonymous_3',
                bettorName: 'ANONYMOUS',
                targetUserId: player.id,
                targetUserName: player.name,
                description: 'Will defend a controversial take',
                category: 'social',
                odds: 125,
                wager: 750,
                potentialPayout: 1687,
                isResolved: false,
                createdAt: Date.now() - 1800000
            }
        ];
        setGlobalAmbushBets(prev => [...prev, ...demoBets]);
    };

    // Update phase info every second
    useEffect(() => {
        const interval = setInterval(() => {
            setPhaseInfo(weeklyScheduleService.getPhaseInfo());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Check for bankruptcy
    useEffect(() => {
        if (gulagService.checkBankruptcy(player)) {
            alert('💀 BANKRUPT! You have been sent to THE GULAG!');
        }
    }, [player.grit]);

    useEffect(() => {
        onPlayerUpdate?.(player);
    }, [player, onPlayerUpdate]);

    const isLockdown = player.grit <= 0 || player.gulagState?.inGulag;

    useEffect(() => {
        onLockdownChange?.(isLockdown);
    }, [isLockdown, onLockdownChange]);

    // Handle phase transitions
    useEffect(() => {
        const checkPhase = async () => {
            if (phaseInfo.phase === 'lines_drop') {
                // Generate superlatives on Thursday
                const generated = await overseerService.generateWeeklySuperlatives(phaseInfo.weekNumber);
                setSuperlatives(generated);
            }
        };

        checkPhase();
    }, [phaseInfo.phase]);

    const handlePurchaseBox = (boxId: string, pulledItem: LoreItem) => {
        const box = mysteryBoxService.openMysteryBox(boxId);
        if (box) {
            setPlayer(prev => ({
                ...prev,
                grit: prev.grit - 50, // Cost deducted
                ownedItems: [...prev.ownedItems, pulledItem]
            }));
        }
    };

    const handleLockerRoomPurchase = (tierId: string, cost: number, pulledItem: LoreItem) => {
        setPlayer(prev => ({
            ...prev,
            grit: prev.grit - cost,
            ownedItems: [...prev.ownedItems, pulledItem]
        }));
    };

    const handleSyndicateAction = (action: CorruptionAction, cost: number) => {
        // Deduct cost from player's grit
        setPlayer(prev => ({
            ...prev,
            grit: prev.grit - cost
        }));
        
        // Log the action for debugging
        console.log(`Syndicate action executed: ${action} for ${cost} grit`);
    };

    const handleHailMaryAttempt = () => {
        const parlayPool = [
            'Exact score on Sunday night + anytime defensive TD',
            '5-leg underdog moneyline ladder',
            'Backup QB over yardage + kicker longest FG parlay',
            'All road dogs against the spread in the late window',
            'Safety + overtime in the primetime slate',
        ];
        const parlay = parlayPool[Math.floor(Math.random() * parlayPool.length)];
        const won = Math.random() < 0.35;

        setPlayer(prev => {
            const baseState = prev.gulagState || {
                playerId: prev.id,
                playerName: prev.name,
                previousBankruptcies: 0,
                rapSheet: [],
                inGulag: true,
            };

            const updatedRapSheet = [
                ...(baseState.rapSheet || []),
                won
                    ? `Escaped via Hail Mary (${new Date().toLocaleDateString()})`
                    : `Executed after failed Hail Mary (${new Date().toLocaleDateString()})`,
            ];

            return {
                ...prev,
                grit: won ? 500 : 0,
                gulagState: {
                    ...baseState,
                    inGulag: !won,
                    banExpiresAt: won ? undefined : Date.now() + 24 * 60 * 60 * 1000,
                    previousBankruptcies: (baseState.previousBankruptcies || 0) + 1,
                    gulagBet: {
                        id: `hail_mary_${Date.now()}`,
                        playerId: prev.id,
                        description: parlay,
                        odds: 500,
                        wager: 0,
                        isResolved: true,
                        won,
                        redemptionAmount: 500,
                    },
                    rapSheet: updatedRapSheet,
                },
            };
        });

        return { won, parlay };
    };

    const handleListItem = (itemId: string, price: number) => {
        const offer = mysteryBoxService.listItemForTrade(
            player.id,
            player.name,
            itemId,
            price
        );
        
        setTradeOffers(prev => [...prev, offer]);
        
        // Remove from player inventory (it's listed now)
        setPlayer(prev => ({
            ...prev,
            ownedItems: prev.ownedItems.filter(i => i.id !== itemId)
        }));
    };

    const handlePurchaseItem = (offerId: string) => {
        const result = mysteryBoxService.purchaseFromTradingFloor(offerId, player.id, player.grit);
        
        if (result.success) {
            const offer = tradeOffers.find(o => o.id === offerId);
            if (offer) {
                const item = mysteryBoxService.getItemById(offer.itemId);
                if (item) {
                    setPlayer(prev => ({
                        ...prev,
                        grit: prev.grit - (offer.price + result.houseTax),
                        ownedItems: [...prev.ownedItems, item]
                    }));
                }
            }
        }
    };

    const handleCancelListing = (offerId: string) => {
        const cancelled = mysteryBoxService.cancelTradeListing(offerId, player.id);
        if (cancelled) {
            setTradeOffers(prev => prev.filter(o => o.id !== offerId));
        }
    };

    const handleExecuteTrade = (targetPlayerId: string, myItems: string[], theirItems: string[]) => {
        // Mock P2P trade execution
        // In a real implementation, this would use the multiItemTradeService
        console.log('P2P Trade proposed:', {
            from: player.id,
            to: targetPlayerId,
            giving: myItems,
            receiving: theirItems
        });
        
        // For now, just show a success message
        alert(`Trade proposal sent to ${targetPlayerId}!\nYou're offering ${myItems.length} items for ${theirItems.length} items.`);
        setCurrentView('main');
    };

    const handlePlaceTribunalBet = (superlativeId: string, nomineeId: string, wager: number, odds: number) => {
        try {
            bettingService.placeTribunalBet(player, superlativeId, nomineeId, wager, odds);
            setPlayer({ ...player });
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to place bet');
        }
    };

    const handleVote = (superlativeId: string, nomineeId: string) => {
        const superlative = superlatives.find(s => s.id === superlativeId);
        if (superlative) {
            try {
                bettingService.voteInTribunal(superlative, player.id, nomineeId);
                setSuperlatives([...superlatives]);
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Failed to vote');
            }
        }
    };

    const handlePlaceAmbushBet = (
        targetUserId: string,
        targetUserName: string,
        description: string,
        category: 'social' | 'behavior' | 'prop',
        odds: number,
        wager: number
    ) => {
        try {
            const bet = bettingService.placeAmbushBet(
                player,
                targetUserId,
                targetUserName,
                description,
                category,
                odds,
                wager
            );
            
            // Add to global ambush bets
            setGlobalAmbushBets(prev => [...prev, bet]);
            
            // Update player state
            setPlayer({ ...player });
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to place ambush bet');
        }
    };

    const formatTime = (hours: number, minutes: number, seconds: number): string => {
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    if (isLockdown) {
        return (
            <GulagLockdown player={player} onHailMary={handleHailMaryAttempt}>
                <></>
            </GulagLockdown>
        );
    }

    return (
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(180deg, var(--rich-navy) 0%, var(--deep-navy) 50%, #000000 100%)' }}>
            {/* Vintage Americana Header with Glassmorphism */}
            <div className="sticky top-0 z-20 glass-card border-b" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg-navy)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title Bar - Cinematic Entry */}
                    <div className="flex justify-between items-center py-4 cinematic-enter">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-lg glow-red" style={{ background: 'linear-gradient(135deg, var(--bright-red) 0%, var(--deep-crimson) 100%)' }}>
                                <span className="text-2xl sm:text-3xl">👁️</span>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--off-white)' }}>
                                    The Overseer
                                </h1>
                                <p className="text-xs" style={{ color: 'var(--beige)' }}>
                                    Week {phaseInfo.weekNumber} • {phaseInfo.phase.toUpperCase().replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onExit}
                            className="btn-glow focus-ring px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] border"
                            style={{ 
                                background: 'linear-gradient(135deg, var(--rich-navy) 0%, var(--deep-navy) 100%)',
                                color: 'var(--off-white)',
                                borderColor: 'var(--muted-blue)'
                            }}
                        >
                            Menu
                        </button>
                    </div>

                    {/* Stats Cards - Americana Colors with Staggered Entry */}
                    <div className="grid grid-cols-3 gap-3 pb-4">
                        <div className="glass-card rounded-lg p-3 border cinematic-enter cinematic-enter-delay-1 glow-blue" style={{ borderColor: 'var(--muted-blue)', backgroundColor: 'var(--glass-bg-navy)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--beige)' }}>Phase</p>
                            <p className="text-sm font-bold" style={{ color: 'var(--bright-red)' }}>{phaseInfo.icon} {phaseInfo.phase.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--off-white)' }}>
                                {formatTime(
                                    phaseInfo.timeRemaining.hours,
                                    phaseInfo.timeRemaining.minutes,
                                    phaseInfo.timeRemaining.seconds
                                )}
                            </p>
                        </div>

                        <div className="glass-card rounded-lg p-3 border cinematic-enter cinematic-enter-delay-2 glow-red" style={{ borderColor: 'var(--bright-red)', backgroundColor: 'var(--glass-bg-navy)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--beige)' }}>Grit</p>
                            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--off-white)' }}>{player.grit}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--beige)' }}>
                                {player.ownedItems.length} items
                            </p>
                        </div>

                        <div className="glass-card rounded-lg p-3 border cinematic-enter cinematic-enter-delay-3 glow-blue" style={{ borderColor: 'var(--muted-blue)', backgroundColor: 'var(--glass-bg-navy)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--beige)' }}>Win Rate</p>
                            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--muted-blue)' }}>
                                {player.weeklyStats.betsPlaced > 0 
                                    ? Math.round((player.weeklyStats.betsWon / player.weeklyStats.betsPlaced) * 100)
                                    : 0}%
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--beige)' }}>
                                {player.weeklyStats.betsPlaced} bets
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs - American Flag Colors */}
                    <div className="flex border-t cinematic-enter cinematic-enter-delay-4" style={{ borderColor: 'var(--glass-border)' }}>
                        <button
                            onClick={() => setCurrentView('main')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring border-b-2 ${
                                currentView === 'main'
                                    ? 'glow-red'
                                    : ''
                            }`}
                            style={{
                                color: currentView === 'main' ? 'var(--bright-red)' : 'var(--beige)',
                                borderBottomColor: currentView === 'main' ? 'var(--bright-red)' : 'transparent'
                            }}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setCurrentView('board')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring border-b-2 ${
                                currentView === 'board'
                                    ? 'glow-red'
                                    : ''
                            }`}
                            style={{
                                color: currentView === 'board' ? 'var(--bright-red)' : 'var(--beige)',
                                borderBottomColor: currentView === 'board' ? 'var(--bright-red)' : 'transparent'
                            }}
                        >
                            The Board
                        </button>
                        <button
                            onClick={() => setCurrentView('tribunal')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring border-b-2 ${
                                currentView === 'tribunal'
                                    ? 'glow-crimson'
                                    : ''
                            }`}
                            style={{
                                color: currentView === 'tribunal' ? 'var(--deep-crimson)' : 'var(--beige)',
                                borderBottomColor: currentView === 'tribunal' ? 'var(--deep-crimson)' : 'transparent'
                            }}
                        >
                            Tribunal
                        </button>
                        <button
                            onClick={() => setCurrentView('bodega')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring border-b-2 ${
                                currentView === 'bodega'
                                    ? 'glow-blue'
                                    : ''
                            }`}
                            style={{
                                color: currentView === 'bodega' ? 'var(--muted-blue)' : 'var(--beige)',
                                borderBottomColor: currentView === 'bodega' ? 'var(--muted-blue)' : 'transparent'
                            }}
                        >
                            Bodega
                        </button>
                        <button
                            onClick={() => setCurrentView('locker')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring border-b-2 ${
                                currentView === 'locker'
                                    ? 'glow-blue'
                                    : ''
                            }`}
                            style={{
                                color: currentView === 'locker' ? 'var(--muted-blue)' : 'var(--beige)',
                                borderBottomColor: currentView === 'locker' ? 'var(--muted-blue)' : 'transparent'
                            }}
                        >
                            Locker
                        </button>
                        <button
                            onClick={() => setCurrentView('trading')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all btn-glow focus-ring border-b-2 ${
                                currentView === 'trading'
                                    ? 'glow-blue'
                                    : ''
                            }`}
                            style={{
                                color: currentView === 'trading' ? 'var(--muted-blue)' : 'var(--beige)',
                                borderBottomColor: currentView === 'trading' ? 'var(--muted-blue)' : 'transparent'
                            }}
                        >
                            Trading
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content with Vintage Americana Style */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {currentView === 'main' && (
                    <div className="space-y-4">
                        <div className="glass-card rounded-lg p-4 md:p-6 border cinematic-enter cinematic-enter-delay-5" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg-navy)' }}>
                            <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: 'var(--off-white)' }}>Week {phaseInfo.weekNumber} Overview</h2>
                            <p className="text-sm md:text-base mb-4" style={{ color: 'var(--beige)' }}>
                                The Overseer is analyzing chat history and generating betting lines.
                            </p>
                            
                            {/* Weekly Schedule with Staggered Animations */}
                            <div className="space-y-2">
                                {weeklyScheduleService.getWeeklySchedule().map((phase, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg transition-all glass-card btn-glow cinematic-enter border ${
                                            phase.phase === phaseInfo.phase
                                                ? 'glow-red'
                                                : ''
                                        }`}
                                        style={{ 
                                            animationDelay: `${0.3 + index * 0.05}s`,
                                            borderColor: phase.phase === phaseInfo.phase ? 'var(--bright-red)' : 'var(--glass-border)',
                                            backgroundColor: 'var(--glass-bg-navy)'
                                        }}
                                    >
                                        <p className="text-sm md:text-base font-semibold" style={{ color: 'var(--off-white)' }}>{phase.day}</p>
                                        <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--beige)' }}>{phase.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'board' && (
                    <div>
                        <div className="max-w-7xl mx-auto px-4 mb-4 flex gap-2">
                            <button
                                onClick={addDemoBets}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                🎭 DEMO: Add Shadow Locks (See what targets see)
                            </button>
                            <button
                                onClick={() => setShowPayday(true)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                💰 DEMO: Show Payday (Subject wins)
                            </button>
                            <button
                                onClick={() => setShowBankrupt(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                💀 DEMO: Show Bankrupt (Bettor loses)
                            </button>
                        </div>
                        <TheBoard
                            player={player}
                            onPlaceAmbushBet={handlePlaceAmbushBet}
                            allPlayers={[
                                player,
                                // Mock players for demo (in real implementation, these would be actual players)
                                { ...player, id: 'wyatt', name: 'Wyatt' },
                                { ...player, id: 'alex', name: 'Alex' },
                                { ...player, id: 'colin', name: 'Colin' },
                                { ...player, id: 'spencer', name: 'Spencer' }
                            ]}
                            globalAmbushBets={globalAmbushBets}
                        />
                    </div>
                )}

                {currentView === 'tribunal' && (
                    <TribunalPanel
                        superlatives={superlatives}
                        player={player}
                        onPlaceBet={handlePlaceTribunalBet}
                        onVote={handleVote}
                        votingOpen={phaseInfo.phase === 'climax'}
                        bettingOpen={phaseInfo.phase === 'action' || phaseInfo.phase === 'climax'}
                    />
                )}
            </div>

            {/* Modals */}
            {currentView === 'bodega' && (
                <BodegaShop
                    player={player}
                    onPurchase={handlePurchaseBox}
                    onClose={() => setCurrentView('main')}
                />
            )}

            {currentView === 'locker' && (
                <LockerRoom
                    player={player}
                    onPurchase={handleLockerRoomPurchase}
                    onSyndicateAction={handleSyndicateAction}
                    onClose={() => setCurrentView('main')}
                />
            )}

            {currentView === 'trading' && (
                <TradingFloor
                    player={player}
                    allPlayers={[
                        player,
                        // Mock players for demo (in real implementation, these would be actual players)
                        { ...player, id: 'wyatt', name: 'Wyatt', ownedItems: [] },
                        { ...player, id: 'alex', name: 'Alex', ownedItems: [] },
                        { ...player, id: 'colin', name: 'Colin', ownedItems: [] },
                        { ...player, id: 'spencer', name: 'Spencer', ownedItems: [] }
                    ]}
                    onExecuteTrade={handleExecuteTrade}
                    onClose={() => setCurrentView('main')}
                />
            )}

            {/* Payday Notification */}
            {showPayday && (
                <PaydayScreen
                    notification={{
                        type: 'VAULT_TRANSFER',
                        recipientId: player.id,
                        recipientName: player.name,
                        amount: 2250,
                        message: `YOU JUST TAXED THE BOYS FOR 2,250 GRIT.`,
                        timestamp: Date.now()
                    }}
                    onClose={() => setShowPayday(false)}
                />
            )}

            {/* Bankrupt Notification */}
            {showBankrupt && (
                <BankruptScreen
                    notification={{
                        type: 'AMBUSH_LOSS',
                        loserId: player.id,
                        loserName: player.name,
                        amount: 1000,
                        subjectId: 'wyatt',
                        subjectName: 'Wyatt',
                        message: `YOU GOT AMBUSHED. WYATT TOOK YOUR GRIT.`,
                        timestamp: Date.now()
                    }}
                    onClose={() => setShowBankrupt(false)}
                />
            )}
        </div>
    );
};
