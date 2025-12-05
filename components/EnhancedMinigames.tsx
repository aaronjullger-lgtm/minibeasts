import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sundayScariesTeams, sundayScariesRoasts, commishActions, tyWindowMessages, datingScenarios, ParlayLeg, CommishAction, fantasyDraftPlayers, triviaData, commentaryBattleData } from '../constants';

// Game Constants
const MAX_PARLAY_LEGS = 8;
const DIFFICULTY_PENALTY_PER_LEG = 0.09;
const TILT_PENALTY_DIVISOR = 200;

// ============================================================================
// SUNDAY SCARIES: ULTRA PARLAY MAYHEM - COMPLETE REVAMP
// ============================================================================
// New Features: Parlay insurance, hot streaks, tilt meter, live roasts, special events
export const EnhancedSundayScariesMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
    const [grit, setGrit] = useState(0);
    const [bankroll, setBankroll] = useState(1000);
    const [isHatersMode, setIsHatersMode] = useState(false);
    const [gamePhase, setGamePhase] = useState<'building' | 'watching' | 'resolved'>('building');
    const [roastMessage, setRoastMessage] = useState('');
    const [elieMultiplier, setElieMultiplier] = useState(1);
    const [hotStreak, setHotStreak] = useState(0);
    const [tiltMeter, setTiltMeter] = useState(0);
    const [hasInsurance, setHasInsurance] = useState(false);
    const [multiplierActive, setMultiplierActive] = useState(false);
    const [liveRoast, setLiveRoast] = useState('');
    const [flashingLeg, setFlashingLeg] = useState<number | null>(null);
    const [confettiMode, setConfettiMode] = useState(false);
    const [betAmount, setBetAmount] = useState(100);
    const [specialEventTriggered, setSpecialEventTriggered] = useState(false);

    // Special power-ups and abilities
    const buyInsurance = () => {
        if (bankroll >= 200 && !hasInsurance) {
            setBankroll(prev => prev - 200);
            setHasInsurance(true);
            setRoastMessage('💰 Parlay Insurance Activated! One leg can fail and you still win!');
        }
    };

    const activateMultiplier = () => {
        if (hotStreak >= 2 && !multiplierActive) {
            setMultiplierActive(true);
            setHotStreak(0);
            setRoastMessage('🔥 2X MULTIPLIER ACTIVE! This hit is gonna be HUGE!');
        }
    };

    // Enhanced leg adding with team matchups
    const addLegToParlay = () => {
        if (parlayLegs.length >= MAX_PARLAY_LEGS) return;
        
        const team = sundayScariesTeams[Math.floor(Math.random() * sundayScariesTeams.length)];
        const opponent = sundayScariesTeams[Math.floor(Math.random() * sundayScariesTeams.length)];
        const betType = ['ML', 'Spread', 'Over', 'Under'][Math.floor(Math.random() * 4)];
        const odds = isHatersMode ? 
            Math.floor(Math.random() * 250) + 200 : 
            Math.floor(Math.random() * 180) - 130;
        
        // Calculate leg danger level for visual feedback
        const dangerLevel = Math.abs(odds) > 200 ? 'high' : Math.abs(odds) > 150 ? 'medium' : 'low';
        
        setParlayLegs([...parlayLegs, {
            team,
            opponent,
            betType,
            description: isHatersMode ? `${team} to LOSE vs ${opponent}` : `${team} ${betType} vs ${opponent}`,
            odds,
            success: null,
            dangerLevel
        }]);

        // Animate the added leg
        setFlashingLeg(parlayLegs.length);
        setTimeout(() => setFlashingLeg(null), 500);
    };

    const lockInParlay = () => {
        if (parlayLegs.length === 0) return;
        if (betAmount > bankroll) {
            setRoastMessage('❌ Not enough bankroll! Lower your bet or hit the ATM (and disappoint your girl).');
            return;
        }

        setBankroll(prev => prev - betAmount);
        
        // Special character multipliers
        if (playerName.toLowerCase() === 'elie') {
            setElieMultiplier(2);
            setRoastMessage("🤓 Elie's 'Actually I'm Smart' multiplier active! Losses hurt 2x!");
        } else if (playerName.toLowerCase() === 'colin') {
            setTiltMeter(50);
            setRoastMessage('🎰 Colin detected! Starting with 50% tilt meter!');
        }
        
        setGamePhase('watching');
        
        // Simulate games with enhanced drama
        let delay = 800;
        let finalLegs: ParlayLeg[] = [...parlayLegs];
        let failedLegs = 0;
        
        parlayLegs.forEach((leg, index) => {
            setTimeout(() => {
                // Progressive difficulty with chaos
                const difficultyPenalty = index * DIFFICULTY_PENALTY_PER_LEG;
                const tiltPenalty = tiltMeter / TILT_PENALTY_DIVISOR;
                const baseSuccessChance = isHatersMode ? 0.42 : 0.54;
                const successChance = Math.max(0.15, baseSuccessChance - difficultyPenalty - tiltPenalty);
                const success = Math.random() < successChance;
                
                if (!success) failedLegs++;
                
                // Live roast generation based on game state
                if (!success) {
                    const roasts = [
                        `💀 ${leg.team} just choked HARD! Colin is laughing at you!`,
                        `🗑️ ${leg.team} sold! This one's on YOU!`,
                        `😂 Elie: "I called that!" (He didn't)`,
                        `🤡 Justin just screenshot this L`,
                        `💩 That team played like they had $1000 on YOU losing`,
                    ];
                    setLiveRoast(roasts[Math.floor(Math.random() * roasts.length)]);
                    setTiltMeter(prev => Math.min(100, prev + 15));
                } else {
                    const hypeMessages = [
                        `✅ ${leg.team} COVERS! We might be eating tonight!`,
                        `🔥 ${leg.team} came through! Believe in the process!`,
                        `💚 That's what we're talking about! Keep it going!`,
                        `🎯 LOCK OF THE CENTURY right there!`,
                    ];
                    setLiveRoast(hypeMessages[Math.floor(Math.random() * hypeMessages.length)]);
                }
                
                setParlayLegs(prev => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], success };
                    finalLegs = updated;
                    return updated;
                });
                
                setFlashingLeg(index);
                setTimeout(() => setFlashingLeg(null), 400);
                
                if (index === parlayLegs.length - 1) {
                    setTimeout(() => {
                        resolveParlay(finalLegs, failedLegs);
                    }, 1200);
                }
            }, delay * (index + 1));
        });
    };

    const resolveParlay = (legs: ParlayLeg[], failedLegs: number) => {
        const allSuccess = legs.every(leg => leg.success === true);
        const successfulLegs = legs.filter(leg => leg.success === true).length;
        
        // Insurance check
        if (!allSuccess && hasInsurance && failedLegs === 1) {
            // Insurance saves the day!
            const multiplier = Math.pow(2.2, legs.length - 1);
            const baseGrit = legs.length * 18 * multiplier * (multiplierActive ? 2 : 1);
            const winnings = betAmount * multiplier * 1.5;
            
            setBankroll(prev => prev + winnings);
            setGrit(Math.floor(baseGrit));
            setHotStreak(prev => prev + 1);
            setConfettiMode(true);
            
            setRoastMessage(`🛡️ INSURANCE SAVED YOU! One leg failed but your parlay still HITS! 
                +${Math.floor(baseGrit)} grit, +$${winnings.toFixed(0)}! 
                🎉 Eric: "That's what I call GRIT!"`);
            setHasInsurance(false);
            
        } else if (allSuccess) {
            // PARLAY HITS!
            const multiplier = Math.pow(2.3, legs.length - 1);
            const baseGrit = legs.length * 20 * multiplier * (multiplierActive ? 2 : 1) + (isHatersMode ? 75 : 0);
            const winnings = betAmount * multiplier * (legs.length >= 6 ? 2.5 : 1.8);
            
            setBankroll(prev => prev + winnings);
            setGrit(Math.floor(baseGrit));
            setHotStreak(prev => prev + 1);
            setConfettiMode(true);
            
            const bigWinMessages = [
                `🚀 ${legs.length}-LEGGER HITS! YOU'RE A LEGEND!`,
                `💰 CASHHHH! +$${winnings.toFixed(0)}! Elie is SEETHING!`,
                `🔥 ABSOLUTE MADNESS! The group chat is going WILD!`,
                `👑 KING STATUS! Justin just added this to his hall of fame screenshots!`,
                `⚡ UNSTOPPABLE! The bookies are crying! +${Math.floor(baseGrit)} GRIT!`
            ];
            
            setRoastMessage(bigWinMessages[Math.floor(Math.random() * bigWinMessages.length)]);
            
            if (legs.length >= 7) {
                setSpecialEventTriggered(true);
                setRoastMessage(prev => prev + ' 🎊 SPECIAL EVENT: Spencer just made you honorary commish for hitting a 7-legger!');
            }
            
        } else if (successfulLegs === legs.length - 1) {
            // ONE LEG AWAY - Most brutal outcome
            const loss = legs.length * 12 * elieMultiplier;
            setGrit(-loss);
            setTiltMeter(100);
            
            const brutalMessages = [
                `💀 ONE. LEG. AWAY. That's the most brutal loss possible.`,
                `😭 You were SO CLOSE! Colin: "That's the game baby!"`,
                `🤮 Lost on the last leg. Elie: "I would've cashed that..."`,
                `💔 ONE AWAY. The bookies are laughing AT YOU.`,
                `🗑️ So close yet so far. This is why we can't have nice things.`
            ];
            setRoastMessage(brutalMessages[Math.floor(Math.random() * brutalMessages.length)] + ` -${loss} grit`);
            
        } else {
            // Regular loss
            const loss = legs.length * 7 * elieMultiplier;
            setGrit(-loss);
            setTiltMeter(prev => Math.min(100, prev + 25));
            setHotStreak(0);
            
            const lossMessages = [
                `You lost ${loss} grit. ${legs.length > 4 ? 'Why did you even try that?' : 'Better luck next time.'}`,
                `💸 Money gone. Grit gone. Dignity gone.`,
                `${legs.length} legs and ${failedLegs} failed. Math isn't your friend today.`,
                `Lost ${loss} grit. Aaron: "skill issue tbh"`,
            ];
            setRoastMessage(lossMessages[Math.floor(Math.random() * lossMessages.length)]);
        }
        
        setGamePhase('resolved');
        setTimeout(() => setConfettiMode(false), 3000);
    };

    const handleFinish = () => {
        // Special events based on performance
        if (playerName.toLowerCase() === 'colin' && grit < -30) {
            setRoastMessage("⚠️ SPECIAL EVENT: Your liberal GF found your betting history! Cost: 250 grit to smooth over...");
            setTimeout(() => onGameEnd(Math.max(grit - 250, -500)), 2500);
        } else if (hotStreak >= 3) {
            onGameEnd(Math.floor(grit * 1.3)); // Hot streak bonus
        } else if (tiltMeter >= 90) {
            onGameEnd(Math.floor(grit * 0.8)); // Tilt penalty
        } else {
            onGameEnd(Math.max(grit, 0));
        }
    };

    return (
        <div className="relative glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-red-500/50 overflow-hidden">
            {/* Confetti effect */}
            {confettiMode && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                fontSize: '24px'
                            }}
                        >
                            {['🎉', '💰', '🔥', '⚡', '🏆'][i % 5]}
                        </div>
                    ))}
                </div>
            )}
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
                    🎰 Sunday Scaries: ULTRA PARLAY MAYHEM
                </h2>
                
                {/* Stats dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm md:text-base">
                    <div className="glass-dark p-2 md:p-3 rounded-xl border border-green-500/30">
                        <div className="text-xs text-gray-400">Bankroll</div>
                        <div className="text-lg md:text-2xl font-bold text-green-400">${bankroll}</div>
                    </div>
                    <div className="glass-dark p-2 md:p-3 rounded-xl border border-yellow-500/30">
                        <div className="text-xs text-gray-400">Hot Streak</div>
                        <div className="text-lg md:text-2xl font-bold text-yellow-400">
                            {hotStreak} 🔥
                        </div>
                    </div>
                    <div className={`glass-dark p-2 md:p-3 rounded-xl border ${tiltMeter > 70 ? 'border-red-500 animate-pulse' : 'border-red-500/30'}`}>
                        <div className="text-xs text-gray-400">Tilt Meter</div>
                        <div className="text-lg md:text-2xl font-bold text-red-400">{tiltMeter}%</div>
                    </div>
                    <div className="glass-dark p-2 md:p-3 rounded-xl border border-blue-500/30">
                        <div className="text-xs text-gray-400">Current Grit</div>
                        <div className={`text-lg md:text-2xl font-bold ${grit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            {grit >= 0 ? '+' : ''}{grit}
                        </div>
                    </div>
                </div>
                
                {gamePhase === 'building' && (
                    <>
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                            <button
                                onClick={() => setIsHatersMode(!isHatersMode)}
                                className={`px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105 ${
                                    isHatersMode 
                                        ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50 animate-pulse' 
                                        : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                            >
                                {isHatersMode ? "🔥 HATER'S MODE" : "Regular Mode"}
                            </button>
                            
                            <button
                                onClick={buyInsurance}
                                disabled={hasInsurance || bankroll < 200}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg font-bold transition-all"
                            >
                                {hasInsurance ? '✅ Insured' : '🛡️ Buy Insurance ($200)'}
                            </button>
                            
                            <button
                                onClick={activateMultiplier}
                                disabled={hotStreak < 2 || multiplierActive}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg font-bold transition-all"
                            >
                                {multiplierActive ? '⚡ 2X ACTIVE' : `🔥 2X Multiplier (Need ${2 - hotStreak} wins)`}
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="text-sm text-gray-300 block mb-2">Bet Amount: ${betAmount}</label>
                            <input
                                type="range"
                                min="50"
                                max={bankroll}
                                step="50"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="w-full max-w-md"
                            />
                        </div>
                        
                        <div className="bg-gray-900/80 p-4 md:p-6 rounded-xl mb-6 min-h-[200px] border-2 border-gray-700">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">
                                Your Parlay ({parlayLegs.length}/8 legs)
                                {parlayLegs.length >= 5 && <span className="text-red-400 ml-2 animate-pulse">🔥 MEGA RISK</span>}
                            </h3>
                            {parlayLegs.length === 0 ? (
                                <p className="text-gray-400 text-lg">Add legs to your parlay below</p>
                            ) : (
                                <div className="space-y-2">
                                    {parlayLegs.map((leg, i) => (
                                        <div 
                                            key={i} 
                                            className={`bg-gray-800 p-3 rounded-lg transition-all transform ${
                                                flashingLeg === i ? 'scale-105 bg-blue-700' : ''
                                            } ${
                                                leg.dangerLevel === 'high' ? 'border-2 border-red-500' :
                                                leg.dangerLevel === 'medium' ? 'border border-yellow-500' :
                                                'border border-green-500/30'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-base md:text-xl">{leg.team}</span>
                                                <span className="text-xs md:text-sm text-gray-400">{leg.betType}</span>
                                            </div>
                                            <div className="text-sm text-gray-300">{leg.description}</div>
                                            <span className="text-green-400 font-bold">
                                                ({leg.odds > 0 ? '+' : ''}{leg.odds})
                                                {leg.dangerLevel === 'high' && ' ⚠️ HIGH RISK'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={addLegToParlay}
                                disabled={parlayLegs.length >= 8}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg"
                            >
                                ➕ Add Leg
                            </button>
                            <button
                                onClick={lockInParlay}
                                disabled={parlayLegs.length === 0 || betAmount > bankroll}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg"
                            >
                                🔒 LOCK IT IN (${betAmount})
                            </button>
                        </div>
                    </>
                )}
                
                {gamePhase === 'watching' && (
                    <div className="bg-gray-900/80 p-4 md:p-6 rounded-xl mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 animate-pulse">📺 GAMES IN PROGRESS 📺</h3>
                        <div className="space-y-3">
                            {parlayLegs.map((leg, i) => (
                                <div key={i} className={`p-4 rounded-lg text-lg md:text-xl font-bold transition-all transform ${
                                    flashingLeg === i ? 'scale-105' : ''
                                } ${
                                    leg.success === null ? 'bg-gray-700 animate-pulse' :
                                    leg.success ? 'bg-green-600 shadow-lg shadow-green-500/50' : 
                                    'bg-red-600 shadow-lg shadow-red-500/50'
                                }`}>
                                    <div>{leg.team} - {leg.description}</div>
                                    {leg.success !== null && (
                                        <span className="text-2xl md:text-3xl ml-4">{leg.success ? '✅' : '❌'}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {liveRoast && (
                            <div className="mt-6 text-lg md:text-2xl italic text-yellow-300 animate-bounce">
                                "{liveRoast}"
                            </div>
                        )}
                    </div>
                )}
                
                {gamePhase === 'resolved' && (
                    <div className="bg-gray-900/80 p-4 md:p-6 rounded-xl mb-6">
                        <h3 className={`text-3xl md:text-4xl font-bold mb-4 ${grit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {grit > 0 ? '🎉 PARLAY HITS! 🎉' : '💀 PARLAY MISSED 💀'}
                        </h3>
                        <p className="text-2xl md:text-3xl mb-4">
                            {grit > 0 ? '+' : ''}{grit} Grit
                            {multiplierActive && grit > 0 && <span className="text-purple-400 ml-2">(2X MULTIPLIER!)</span>}
                            {elieMultiplier > 1 && grit < 0 && <span className="text-red-500 ml-2">(x{elieMultiplier} Elie penalty!)</span>}
                        </p>
                        <p className="text-xl mb-4">
                            Bankroll: ${bankroll}
                            {hotStreak > 0 && <span className="text-yellow-400 ml-2">🔥 {hotStreak} win streak!</span>}
                        </p>
                        {roastMessage && (
                            <div className="text-lg md:text-2xl italic text-yellow-300 mb-6 whitespace-pre-line">
                                "{roastMessage}"
                            </div>
                        )}
                        {specialEventTriggered && (
                            <div className="mb-4 p-4 bg-purple-900 rounded-lg border-2 border-purple-500 animate-pulse">
                                <p className="text-xl font-bold">🎊 ACHIEVEMENT UNLOCKED: Parlay God</p>
                            </div>
                        )}
                        <button
                            onClick={handleFinish}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                        >
                            Continue to Results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export the enhanced minigames as the default export for easy replacement
export { EnhancedSundayScariesMinigame as SundayScariesMinigame };
