/**
 * Example Usage: Commish AI Logic Core
 * 
 * This file demonstrates how to use the Commish AI Logic components
 * and services in the Mini Beasts application.
 */

import React, { useState, useEffect } from 'react';
import { EdictOverlay } from './components/commish/EdictOverlay';
import { SystemTicker, SystemTickerWithPlayerData } from './components/commish/SystemTicker';
import { 
    calculateCowardice, 
    calculateDelusion, 
    generateRoast, 
    tagBetSlip, 
    generateWeeklyEdict 
} from './services/commishLogic';
import { OverseerPlayerState } from './types';

/**
 * Example 1: Using the Edict Overlay
 * 
 * Display a weekly protocol popup when the app opens or when a new week starts.
 */
export const EdictOverlayExample: React.FC = () => {
    const [showEdict, setShowEdict] = useState(true);
    const [weekNumber, setWeekNumber] = useState(12);
    const [volatility, setVolatility] = useState(50);

    // Generate edict based on current week and volatility
    const edict = generateWeeklyEdict(weekNumber, volatility);

    return (
        <div>
            <button 
                onClick={() => setShowEdict(true)}
                className="bg-board-red text-board-off-white px-4 py-2 rounded"
            >
                Show Weekly Edict
            </button>

            <EdictOverlay
                isOpen={showEdict}
                onAcknowledge={() => setShowEdict(false)}
                weekNumber={weekNumber}
                rule={edict.rule}
                description={edict.description}
            />
        </div>
    );
};

/**
 * Example 2: Using the System Ticker
 * 
 * Display AI commentary in the dashboard header area.
 */
export const SystemTickerExample: React.FC = () => {
    const [mood, setMood] = useState<'alert' | 'neutral' | 'active'>('neutral');

    // Custom messages (optional)
    const customMessages = [
        'SCANNING FOR FRAUD...',
        'MARKET VOLATILITY: HIGH.',
        'DETECTING COWARDICE...',
        'PROCESSING TRIBUNAL DATA...'
    ];

    return (
        <div>
            {/* Basic Usage */}
            <SystemTicker />

            {/* With Custom Messages and Mood */}
            <SystemTicker 
                messages={customMessages}
                mood={mood}
                speed={25}
            />

            {/* Controls for Demo */}
            <div className="p-4 space-x-2">
                <button onClick={() => setMood('alert')} className="px-3 py-1 bg-board-red text-white">Alert</button>
                <button onClick={() => setMood('neutral')} className="px-3 py-1 bg-board-highlight text-white">Neutral</button>
                <button onClick={() => setMood('active')} className="px-3 py-1 bg-board-gold text-white">Active</button>
            </div>
        </div>
    );
};

/**
 * Example 3: Using System Ticker with Player Data
 * 
 * Inject player-specific commentary into the ticker.
 */
export const SystemTickerWithPlayersExample: React.FC = () => {
    const flaggedPlayers = ['SETH', 'AARON', 'WYATT'];

    return (
        <SystemTickerWithPlayerData
            playerNames={flaggedPlayers}
            mood="alert"
        />
    );
};

/**
 * Example 4: Calculating Cowardice
 * 
 * Tag bets that show cowardice (betting on heavy favorites).
 */
export const CowardiceDetectionExample: React.FC = () => {
    const exampleBets = [
        { id: 1, description: 'Chiefs ML', odds: -500, wager: 100 },
        { id: 2, description: 'Cowboys +7', odds: +110, wager: 50 },
        { id: 3, description: '49ers ML', odds: -150, wager: 75 },
        { id: 4, description: 'Bills ML', odds: -300, wager: 200 },
    ];

    return (
        <div className="p-4 space-y-2">
            <h3 className="text-board-text font-board-header text-xl mb-4">Bet Analysis</h3>
            {exampleBets.map(bet => {
                const isCoward = calculateCowardice(bet);
                const tag = tagBetSlip(bet);

                return (
                    <div 
                        key={bet.id}
                        className={`p-3 rounded border ${isCoward ? 'border-board-red bg-board-red/10' : 'border-board-highlight bg-board-surface'}`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-board-text">{bet.description}</span>
                                <span className="text-board-off-white/60 ml-2">
                                    ({bet.odds > 0 ? '+' : ''}{bet.odds})
                                </span>
                            </div>
                            {tag && (
                                <span className="bg-board-red text-board-off-white px-3 py-1 rounded text-xs font-board-grit">
                                    {tag}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Example 5: Checking for Delusion
 * 
 * Detect players who have lost 3+ bets in a row.
 */
export const DelusionDetectionExample: React.FC<{ player: OverseerPlayerState }> = ({ player }) => {
    const isDelusional = calculateDelusion(player);

    return (
        <div className="p-4">
            {isDelusional && (
                <div className="bg-board-red/20 border border-board-red rounded p-4">
                    <div className="text-board-red font-board-header text-lg mb-2">
                        FRAUD ALERT
                    </div>
                    <div className="text-board-off-white font-board-grit text-sm">
                        {player.name} has lost 3+ bets in a row. Delusion detected.
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Example 6: Generating Roasts
 * 
 * Create performance-based roast messages for players.
 */
export const RoastGeneratorExample: React.FC<{ player: OverseerPlayerState }> = ({ player }) => {
    const roast = generateRoast(player);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'brutal': return 'text-board-red';
            case 'medium': return 'text-board-gold';
            case 'mild': return 'text-board-text';
            default: return 'text-board-text';
        }
    };

    return (
        <div className="p-4 bg-board-surface rounded border border-board-highlight">
            <div className="text-board-off-white/60 text-xs font-board-grit mb-2">
                COMMISH ANALYSIS:
            </div>
            <div className={`font-board-grit text-sm ${getSeverityColor(roast.severity)}`}>
                {roast.message}
            </div>
            <div className="mt-2 text-board-off-white/40 text-xs">
                Severity: {roast.severity.toUpperCase()}
            </div>
        </div>
    );
};

/**
 * Example 7: Complete Dashboard Integration
 * 
 * Shows how to integrate all components in a typical dashboard layout.
 */
export const CompleteDashboardExample: React.FC<{ 
    player: OverseerPlayerState;
    weekNumber: number;
    allPlayers: OverseerPlayerState[];
}> = ({ player, weekNumber, allPlayers }) => {
    const [showEdict, setShowEdict] = useState(false);
    const [volatility] = useState(50);

    const edict = generateWeeklyEdict(weekNumber, volatility);
    const roast = generateRoast(player);
    const isDelusional = calculateDelusion(player);

    // Get flagged players for ticker
    const flaggedPlayers = allPlayers
        .filter(p => calculateDelusion(p))
        .map(p => p.name);

    useEffect(() => {
        // Show edict on mount (first visit of the week)
        const hasSeenEdict = localStorage.getItem(`edict-week-${weekNumber}`);
        if (!hasSeenEdict) {
            setShowEdict(true);
        }
    }, [weekNumber]);

    const handleAcknowledgeEdict = () => {
        localStorage.setItem(`edict-week-${weekNumber}`, 'true');
        setShowEdict(false);
    };

    return (
        <div className="min-h-screen bg-board-navy">
            {/* Top Bar */}
            <div className="bg-board-surface border-b border-board-highlight p-4">
                <h1 className="text-board-text font-board-header text-2xl">
                    Mini Beasts - Week {weekNumber}
                </h1>
            </div>

            {/* System Ticker */}
            <SystemTickerWithPlayerData
                playerNames={flaggedPlayers}
                mood={isDelusional ? 'alert' : 'neutral'}
            />

            {/* Main Content */}
            <div className="p-6">
                {/* Player Roast */}
                <RoastGeneratorExample player={player} />

                {/* Delusion Alert */}
                {isDelusional && <DelusionDetectionExample player={player} />}
            </div>

            {/* Edict Overlay */}
            <EdictOverlay
                isOpen={showEdict}
                onAcknowledge={handleAcknowledgeEdict}
                weekNumber={weekNumber}
                rule={edict.rule}
                description={edict.description}
            />
        </div>
    );
};

/**
 * Example 8: Integration with Existing CommishService
 * 
 * Shows how to combine new logic with existing CommishService features.
 */
export const IntegratedCommishExample: React.FC = () => {
    // This would integrate with the existing commishService
    // from services/commishService.ts
    
    return (
        <div className="p-4">
            <div className="text-board-text font-board-grit text-sm">
                The new commishLogic.ts functions can be called alongside
                existing commishService methods:
                
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Use calculateCowardice() to tag bet slips</li>
                    <li>Use calculateDelusion() to trigger fraud alerts</li>
                    <li>Use generateRoast() in the ActionFeed messages</li>
                    <li>Use generateWeeklyEdict() at the start of each week</li>
                    <li>Display SystemTicker below the top navigation</li>
                    <li>Show EdictOverlay on first visit each week</li>
                </ul>
            </div>
        </div>
    );
};
