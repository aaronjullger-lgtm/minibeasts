import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sundayScariesTeams, sundayScariesRoasts, commishActions, tyWindowMessages, datingScenarios, ParlayLeg, CommishAction, OldDatingScenario, fantasyDraftPlayers, triviaData, commentaryBattleData } from '../constants';

// Difficulty scaling constants
const TY_WINDOW_BASE_WAIT = 3000; // Base wait time in ms
const TY_WINDOW_ROUND_PENALTY = 2000; // Additional wait per round in ms
const TY_WINDOW_MAX_RANDOM_WAIT = 5000; // Max random wait variance in ms
const TY_WINDOW_BASE_TIME = 30; // Base capture window in seconds
const TY_WINDOW_TIME_DECREASE = 8; // Seconds reduced per round
const TY_WINDOW_MIN_TIME = 10; // Minimum capture window in seconds
const COMMISH_CHAOS_RISK_DIVISOR = 20; // Chaos level divisor for risk multiplier

// --- SUNDAY SCARIES: THE PARLAY REVENGE GAME ---
export const SundayScariesMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
    const [grit, setGrit] = useState(0);
    const [isHatersMode, setIsHatersMode] = useState(false);
    const [gamePhase, setGamePhase] = useState<'building' | 'watching' | 'resolved'>('building');
    const [roastMessage, setRoastMessage] = useState('');
    const [elieMultiplier, setElieMultiplier] = useState(1);

    const addLegToParlay = () => {
        if (parlayLegs.length >= 5) return;
        
        const team = sundayScariesTeams[Math.floor(Math.random() * sundayScariesTeams.length)];
        const odds = isHatersMode ? Math.floor(Math.random() * 200) + 150 : Math.floor(Math.random() * 150) - 120;
        
        setParlayLegs([...parlayLegs, {
            team,
            description: isHatersMode ? `${team} to LOSE` : `${team} to WIN`,
            odds,
            success: null
        }]);
    };

    const lockInParlay = () => {
        if (parlayLegs.length === 0) return;
        
        // Check if player is Elie to apply multiplier
        if (playerName.toLowerCase() === 'elie') {
            setElieMultiplier(2);
            setRoastMessage("elie's 'Actually I'm Smart' multiplier is active! Losses hurt twice as much!");
        }
        
        setGamePhase('watching');
        
        // Simulate games resolving with difficulty scaling
        let delay = 1000;
        let finalLegs: ParlayLeg[] = [...parlayLegs];
        parlayLegs.forEach((leg, index) => {
            setTimeout(() => {
                // Make it harder as more legs are added (realistic parlay odds)
                // Each additional leg reduces success chance
                const difficultyPenalty = index * 0.08; // 8% harder per leg
                const baseSuccessChance = isHatersMode ? 0.45 : 0.55; // Hater's mode is riskier
                const successChance = Math.max(0.2, baseSuccessChance - difficultyPenalty);
                const success = Math.random() < successChance;
                setParlayLegs(prev => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], success };
                    finalLegs = updated;
                    return updated;
                });
                
                if (!success) {
                    const roast = sundayScariesRoasts.losing[Math.floor(Math.random() * sundayScariesRoasts.losing.length)];
                    setRoastMessage(roast);
                }
                
                if (index === parlayLegs.length - 1) {
                    setTimeout(() => {
                        setParlayLegs(currentLegs => {
                            resolveParlay(currentLegs);
                            return currentLegs;
                        });
                    }, 1000);
                }
            }, delay * (index + 1));
        });
    };

    const resolveParlay = (legs: ParlayLeg[]) => {
        const allSuccess = legs.every(leg => leg.success === true);
        const successfulLegs = legs.filter(leg => leg.success === true).length;
        
        if (allSuccess) {
            // Exponential rewards for bigger parlays (more realistic to gambling)
            const multiplier = Math.pow(2, legs.length - 1); // 2, 4, 8, 16, 32
            const baseGrit = legs.length * 15 * multiplier + (isHatersMode ? 50 : 0);
            setGrit(baseGrit);
            const elieRoast = sundayScariesRoasts.won[Math.floor(Math.random() * sundayScariesRoasts.won.length)];
            setRoastMessage(`${elieRoast} YOU HIT A ${legs.length}-LEGGER! 🎉`);
        } else if (successfulLegs === legs.length - 1) {
            // Brutal "one leg away" message
            const loss = legs.length * 8 * elieMultiplier;
            setGrit(-loss);
            setRoastMessage(`💀 ONE LEG AWAY! That stings even more. Lost ${loss} grit.`);
        } else {
            const loss = legs.length * 5 * elieMultiplier;
            setGrit(-loss);
            setRoastMessage(`You lost ${loss} grit. ${parlayLegs.length > 3 ? 'Why did you even try that?' : 'Better luck next time.'}`);
        }
        
        setGamePhase('resolved');
    };

    const handleFinish = () => {
        // Liberal GF event for Colin
        if (playerName.toLowerCase() === 'colin' && grit < -20) {
            setRoastMessage("⚠️ SPECIAL EVENT: Your liberal GF found your betting history! This is gonna cost you 200 grit to smooth over...");
            setTimeout(() => onGameEnd(Math.max(grit - 200, -300)), 2000);
        } else {
            onGameEnd(Math.max(grit, 0));
        }
    };

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-red-500/50">
            <h2 className="text-5xl font-orbitron mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                🎰 Sunday Scaries: Parlay Revenge
            </h2>
            
            {gamePhase === 'building' && (
                <>
                    <div className="mb-6">
                        <button
                            onClick={() => setIsHatersMode(!isHatersMode)}
                            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                                isHatersMode 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50' 
                                    : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                        >
                            {isHatersMode ? "🔥 HATER'S MODE ACTIVE" : "Regular Mode"}
                        </button>
                    </div>
                    
                    <div className="bg-gray-900 p-6 rounded-xl mb-6 min-h-[200px]">
                        <h3 className="text-2xl font-bold mb-4">Your Parlay ({parlayLegs.length}/5 legs)</h3>
                        {parlayLegs.length === 0 ? (
                            <p className="text-gray-400 text-lg">Add legs to your parlay below</p>
                        ) : (
                            <div className="space-y-2">
                                {parlayLegs.map((leg, i) => (
                                    <div key={i} className="bg-gray-800 p-3 rounded-lg">
                                        <span className="font-bold text-xl">{leg.team}</span> - {leg.description}
                                        <span className="ml-2 text-green-400">({leg.odds > 0 ? '+' : ''}{leg.odds})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={addLegToParlay}
                            disabled={parlayLegs.length >= 5}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Leg to Parlay
                        </button>
                        <button
                            onClick={lockInParlay}
                            disabled={parlayLegs.length === 0}
                            className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lock It In 🔒
                        </button>
                    </div>
                </>
            )}
            
            {gamePhase === 'watching' && (
                <div className="bg-gray-900 p-6 rounded-xl mb-6">
                    <h3 className="text-3xl font-bold mb-6 animate-pulse">📺 GAMES IN PROGRESS 📺</h3>
                    <div className="space-y-3">
                        {parlayLegs.map((leg, i) => (
                            <div key={i} className={`p-4 rounded-lg text-xl font-bold transition-all ${
                                leg.success === null ? 'bg-gray-700 animate-pulse' :
                                leg.success ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                                {leg.team} - {leg.description}
                                {leg.success !== null && (
                                    <span className="ml-4 text-2xl">{leg.success ? '✅' : '❌'}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {roastMessage && (
                        <div className="mt-6 text-2xl italic text-yellow-300 animate-bounce">
                            "{roastMessage}"
                        </div>
                    )}
                </div>
            )}
            
            {gamePhase === 'resolved' && (
                <div className="bg-gray-900 p-6 rounded-xl mb-6">
                    <h3 className={`text-4xl font-bold mb-4 ${grit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {grit > 0 ? '🎉 PARLAY HIT! 🎉' : '💀 PARLAY MISSED 💀'}
                    </h3>
                    <p className="text-3xl mb-4">
                        {grit > 0 ? '+' : ''}{grit} Grit
                        {elieMultiplier > 1 && grit < 0 && <span className="text-red-500 ml-2">(x{elieMultiplier} Elie penalty!)</span>}
                    </p>
                    {roastMessage && (
                        <div className="text-2xl italic text-yellow-300 mb-6">
                            "{roastMessage}"
                        </div>
                    )}
                    <button
                        onClick={handleFinish}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xl"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};

// --- COMMISH CHAOS: SPENCER'S POWER TRIP SIMULATOR ---
export const CommishChaosMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [commishPower, setCommishPower] = useState(100);
    const [chaos, setChaos] = useState(0);
    const [grit, setGrit] = useState(0);
    const [message, setMessage] = useState("You're the commissioner. Time to abuse your power.");
    const [gameOver, setGameOver] = useState(false);
    const [jointAdMinigame, setJointAdMinigame] = useState(false);
    const [adClicks, setAdClicks] = useState(0);

    const performAction = (action: CommishAction) => {
        if (commishPower < action.powerCost || gameOver) return;
        
        setCommishPower(prev => prev - action.powerCost);
        const newChaos = chaos + action.chaosGain;
        setChaos(newChaos);
        
        // Escalating grit rewards based on how risky you're being
        const riskMultiplier = Math.floor(newChaos / COMMISH_CHAOS_RISK_DIVISOR) + 1;
        const gritReward = action.gritReward * riskMultiplier;
        setGrit(prev => prev + gritReward);
        
        // More dramatic messages as chaos increases
        if (newChaos >= 80) {
            setMessage(`${action.description} - 🔥 THE LEAGUE IS ON FIRE! Revolt imminent!`);
        } else if (newChaos >= 60) {
            setMessage(`${action.description} - ⚠️ The group chat is EXPLODING with rage!`);
        } else if (newChaos >= 40) {
            setMessage(`${action.description} - 😤 People are starting to get really annoyed...`);
        } else {
            setMessage(`${action.description} - The league is NOT happy!`);
        }
        
        // Check if league revolt triggered
        if (newChaos >= 100) {
            setGameOver(true);
            setMessage("🚨 THE LEAGUE HAS REVOLTED! They're starting a new league without you! GAME OVER");
        }
    };

    const playJointAd = () => {
        setJointAdMinigame(true);
        setMessage("Click the chiropractic ads to earn emergency commish powers!");
    };

    const clickAd = () => {
        setAdClicks(prev => prev + 1);
        if (adClicks >= 4) {
            setCommishPower(prev => Math.min(prev + 30, 100));
            setGrit(prev => prev + 10);
            setJointAdMinigame(false);
            setAdClicks(0);
            setMessage("Emergency powers restored! The Joint Chiropractic comes through again!");
        }
    };

    const endGame = () => {
        onGameEnd(grit);
    };

    if (jointAdMinigame) {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-purple-500/50">
                <h2 className="text-4xl font-orbitron mb-4">🏥 The Joint Chiropractic Ad 🏥</h2>
                <p className="text-xl mb-6">Click the ad 5 times to earn emergency powers!</p>
                <p className="text-2xl font-bold mb-6">Clicks: {adClicks}/5</p>
                <button
                    onClick={clickAd}
                    className="px-16 py-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl font-bold text-2xl transform hover:scale-105 transition-all"
                >
                    🦴 ADJUST YOUR SPINE 🦴
                </button>
            </div>
        );
    }

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-purple-500/50">
            <h2 className="text-5xl font-orbitron mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                👑 Commish Chaos: Power Trip Simulator
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6 text-xl">
                <div className="bg-blue-900 p-4 rounded-lg">
                    <p className="font-bold">Power</p>
                    <p className="text-3xl">{commishPower}</p>
                </div>
                <div className="bg-red-900 p-4 rounded-lg">
                    <p className="font-bold">Chaos</p>
                    <p className="text-3xl">{chaos}/100</p>
                </div>
                <div className="bg-yellow-900 p-4 rounded-lg">
                    <p className="font-bold">Grit</p>
                    <p className="text-3xl">{grit}</p>
                </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-xl mb-6 min-h-[80px]">
                <p className="text-xl italic">{message}</p>
            </div>
            
            {!gameOver ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {commishActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => performAction(action)}
                                disabled={commishPower < action.powerCost}
                                className="p-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <div className="text-lg mb-2">{action.name}</div>
                                <div className="text-sm text-gray-300 mb-2">{action.description}</div>
                                <div className="text-xs">Power: {action.powerCost} | Chaos: +{action.chaosGain} | Grit: +{action.gritReward}</div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={playJointAd}
                            disabled={commishPower > 50}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🏥 Emergency Joint Ad (Restore Power)
                        </button>
                        <button
                            onClick={endGame}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                        >
                            💰 Cash Out ({grit} Grit)
                        </button>
                    </div>
                </>
            ) : (
                <button
                    onClick={endGame}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xl"
                >
                    Accept Defeat
                </button>
            )}
        </div>
    );
};

// --- THE TY WINDOW: RARE EVENT COLLECTOR ---
export const TyWindowMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [waiting, setWaiting] = useState(true);
    const [tyMessage, setTyMessage] = useState('');
    const [windowActive, setWindowActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [captured, setCaptured] = useState(0);
    const [round, setRound] = useState(1);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (waiting) {
            // Progressive difficulty - wait times get longer each round
            const roundPenalty = (round - 1) * TY_WINDOW_ROUND_PENALTY;
            const waitTime = Math.floor(Math.random() * TY_WINDOW_MAX_RANDOM_WAIT) + TY_WINDOW_BASE_WAIT + roundPenalty;
            const timer = setTimeout(() => {
                const message = tyWindowMessages[Math.floor(Math.random() * tyWindowMessages.length)];
                setTyMessage(message);
                setWaiting(false);
                setWindowActive(true);
                
                // Decrease time window each round (harder to catch)
                const windowTime = Math.max(TY_WINDOW_MIN_TIME, TY_WINDOW_BASE_TIME - (round - 1) * TY_WINDOW_TIME_DECREASE);
                setTimeLeft(windowTime);
                
                // Bonus points for longer messages
                const bonus = message.length > 20 ? 20 : 0;
                setScore(prev => prev + bonus);
            }, waitTime);
            
            return () => clearTimeout(timer);
        }
    }, [waiting, round]);

    useEffect(() => {
        if (windowActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setWindowActive(false);
                        if (round >= 3) {
                            setGameOver(true);
                        } else {
                            setWaiting(true);
                            setRound(prev => prev + 1);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [windowActive, timeLeft, round]);

    const captureMessage = () => {
        if (!windowActive) return;
        
        // Bonus points for fast captures
        const timeBonus = Math.floor(timeLeft * 2);
        const lengthBonus = Math.floor(tyMessage.length / 2);
        const roundBonus = round * 10; // More points for later rounds
        const points = timeBonus + lengthBonus + roundBonus + 10;
        
        setScore(prev => prev + points);
        setCaptured(prev => prev + 1);
        setWindowActive(false);
        
        if (round >= 3) {
            setGameOver(true);
        } else {
            setWaiting(true);
            setRound(prev => prev + 1);
        }
    };

    const finishGame = () => {
        onGameEnd(score);
    };

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-cyan-500/50">
            <h2 className="text-5xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                👻 The Ty Window
            </h2>
            
            <div className="flex justify-between mb-6 text-xl">
                <div>Round: {round}/3</div>
                <div>Captured: {captured}</div>
                <div>Score: {score}</div>
            </div>
            
            {waiting && !gameOver && (
                <div className="bg-gray-900 p-8 rounded-xl animate-pulse">
                    <p className="text-3xl mb-4">⏳ Waiting for Ty to message...</p>
                    <p className="text-gray-400">This could take a while...</p>
                </div>
            )}
            
            {windowActive && (
                <div className="bg-gradient-to-br from-cyan-900 to-blue-900 p-6 rounded-xl border-4 border-cyan-400 animate-pulse">
                    <div className="text-4xl font-bold mb-4 text-cyan-300">
                        🚨 TY WINDOW ACTIVE! 🚨
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-400 mb-2">Ty:</p>
                        <p className="text-2xl font-bold">{tyMessage}</p>
                    </div>
                    <p className="text-3xl mb-4 text-red-400 font-bold animate-bounce">
                        Time left: {timeLeft}s
                    </p>
                    <button
                        onClick={captureMessage}
                        className="px-12 py-6 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-2xl transform hover:scale-110 transition-all shadow-lg shadow-green-500/50"
                    >
                        📸 SCREENSHOT!
                    </button>
                </div>
            )}
            
            {gameOver && (
                <div className="bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-4xl font-bold mb-4">
                        {captured === 3 ? '🏆 PERFECT!' : captured > 0 ? '👍 Not bad!' : '😢 You missed them all...'}
                    </h3>
                    <p className="text-2xl mb-4">
                        Captured: {captured}/3 Ty Windows
                    </p>
                    <p className="text-3xl font-bold mb-6 text-yellow-400">
                        Total Score: {score} Grit
                    </p>
                    {captured === 3 && (
                        <p className="text-xl text-purple-400 mb-4 italic">
                            🎉 Secret Achievement: You caught all the Ty Windows! Legend!
                        </p>
                    )}
                    <button
                        onClick={finishGame}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};

// --- THE BITCHLESS CHRONICLES: DATING SIM ---
export const BitchlessChroniclesMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [character, setCharacter] = useState<'elie' | 'craif' | null>(null);
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [insecurity, setInsecurity] = useState(50);
    const [defensiveResponse, setDefensiveResponse] = useState('');
    const [showDefense, setShowDefense] = useState(false);
    const [rejectionCount, setRejectionCount] = useState(0);
    const [gamePhase, setGamePhase] = useState<'select' | 'playing' | 'defense' | 'ended'>('select');
    const [aaronMessage, setAaronMessage] = useState('');

    const scenarios = character ? datingScenarios.filter(s => s.character === character) : [];
    const currentScenario = scenarios[scenarioIndex];

    const selectCharacter = (char: 'elie' | 'craif') => {
        setCharacter(char);
        setGamePhase('playing');
    };

    const chooseOption = (option: typeof currentScenario.options[0]) => {
        setInsecurity(prev => Math.min(prev + option.insecurityGain, 100));
        setRejectionCount(prev => prev + 1);
        
        // Aaron randomly shows up
        if (Math.random() > 0.5) {
            setAaronMessage("aaron: skill issue");
            setTimeout(() => setAaronMessage(''), 3000);
        }
        
        if (scenarioIndex < scenarios.length - 1) {
            setScenarioIndex(prev => prev + 1);
            setGamePhase('defense');
            setShowDefense(true);
        } else {
            setGamePhase('ended');
        }
    };

    const submitDefense = () => {
        if (defensiveResponse.length > 20) {
            setInsecurity(prev => Math.max(prev - 5, 0));
        } else {
            setInsecurity(prev => Math.min(prev + 10, 100));
        }
        setDefensiveResponse('');
        setShowDefense(false);
        setGamePhase('playing');
    };

    const endGame = () => {
        // Calculate grit based on how badly you failed
        const gritReward = Math.max(10, 50 - rejectionCount * 10);
        onGameEnd(gritReward);
    };

    if (gamePhase === 'select') {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-pink-500/50">
                <h2 className="text-5xl font-orbitron mb-6 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                    💔 The Bitchless Chronicles 💔
                </h2>
                <p className="text-2xl mb-8 italic text-gray-300">
                    Choose your suffering...
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => selectCharacter('elie')}
                        className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transform hover:scale-105 transition-all"
                    >
                        <div className="text-4xl mb-4">🤓</div>
                        <div className="text-2xl font-bold mb-2">Play as Elie</div>
                        <div className="text-sm text-gray-300">
                            Fall for another lesbian while claiming you're "the main character"
                        </div>
                    </button>
                    
                    <button
                        onClick={() => selectCharacter('craif')}
                        className="p-8 bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl transform hover:scale-105 transition-all"
                    >
                        <div className="text-4xl mb-4">🚑</div>
                        <div className="text-2xl font-bold mb-2">Play as Craif</div>
                        <div className="text-sm text-gray-300">
                            Send the perfect text, get "you're such a good friend!" back
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (gamePhase === 'defense' && showDefense) {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-orange-500/50">
                <h2 className="text-3xl font-orbitron mb-4">⚠️ The Group is Roasting You ⚠️</h2>
                <p className="text-xl mb-6 text-gray-300">
                    Type your desperate explanation:
                </p>
                <textarea
                    value={defensiveResponse}
                    onChange={(e) => setDefensiveResponse(e.target.value)}
                    className="w-full p-4 bg-gray-800 rounded-lg text-white text-lg mb-4 min-h-[120px]"
                    placeholder="Type your defensive response here..."
                />
                <p className="text-sm mb-4 text-gray-400">
                    Longer responses show more desperation (but reduce insecurity slightly)
                </p>
                <button
                    onClick={submitDefense}
                    className="px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold text-xl"
                >
                    Send Defense 📨
                </button>
            </div>
        );
    }

    if (gamePhase === 'ended') {
        const rejectionType = rejectionCount >= 3 ? 'Complete Disaster' : rejectionCount >= 2 ? 'Brutal' : 'Mild';
        
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-gray-500/50">
                <h2 className="text-4xl font-orbitron mb-4 text-gray-300">Game Over</h2>
                <div className="text-6xl mb-6">💀</div>
                <h3 className="text-3xl font-bold mb-4 text-red-400">
                    {rejectionType} Rejection Ending
                </h3>
                <p className="text-xl mb-4">
                    Total Rejections: {rejectionCount}
                </p>
                <p className="text-2xl mb-4">
                    Final Insecurity: {insecurity}/100
                </p>
                <p className="text-lg italic text-gray-400 mb-6">
                    {character === 'elie' 
                        ? "But you're still the main character... right?" 
                        : "Maybe the next one will be different... (it won't)"}
                </p>
                <button
                    onClick={endGame}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xl"
                >
                    Accept Your Fate
                </button>
            </div>
        );
    }

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-pink-500/50">
            <h2 className="text-4xl font-orbitron mb-4">
                {character === 'elie' ? '🤓 Elie Mode' : '🚑 Craif Mode'}
            </h2>
            
            <div className="mb-6">
                <div className="bg-red-900 p-3 rounded-lg">
                    <p className="text-xl">Insecurity: {insecurity}/100</p>
                </div>
            </div>
            
            {aaronMessage && (
                <div className="mb-4 p-4 bg-blue-900 rounded-lg border-2 border-blue-500 animate-pulse">
                    <p className="text-xl italic text-blue-300">{aaronMessage}</p>
                </div>
            )}
            
            {currentScenario && (
                <>
                    <div className="bg-gray-900 p-6 rounded-xl mb-6">
                        <p className="text-2xl mb-6">{currentScenario.situation}</p>
                        <div className="space-y-3">
                            {currentScenario.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => chooseOption(option)}
                                    className="w-full p-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold text-lg transition-all"
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// --- BEER DIE CHALLENGE MINIGAME ---
export const BeerDieChallengeMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(3);
    const [die, setDie] = useState<{ id: number; x: number; y: number, startTime: number, duration: number } | null>(null);
    const gameLoopRef = useRef<number | null>(null);
    const gameState = useRef({ score, misses, onGameEnd, isOver: false });

    useEffect(() => {
        gameState.current.score = score;
        gameState.current.misses = misses;
        gameState.current.onGameEnd = onGameEnd;
    }, [score, misses, onGameEnd]);

    const endGame = useCallback(() => {
        if (!gameState.current.isOver) {
            gameState.current.isOver = true;
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            gameState.current.onGameEnd(gameState.current.score);
        }
    }, []);

    const spawnDie = useCallback(() => {
        if (gameState.current.isOver || gameState.current.misses <= 0) {
            endGame();
            return;
        }
        const duration = Math.max(400, 1200 - (gameState.current.score * 8));
        setDie({
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            startTime: performance.now(),
            duration: duration,
        });
    }, [endGame]);

    useEffect(() => {
        const loop = () => {
            if (gameState.current.isOver) return;
            
            setDie(currentDie => {
                if (currentDie && performance.now() - currentDie.startTime > currentDie.duration) {
                    setMisses(m => m - 1);
                    return null;
                }
                return currentDie;
            });
            gameLoopRef.current = requestAnimationFrame(loop);
        };
        
        spawnDie();
        gameLoopRef.current = requestAnimationFrame(loop);
        
        return () => {
             gameState.current.isOver = true;
             if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
    }, [spawnDie]);

    useEffect(() => {
        if (misses <= 0) {
            endGame();
        }
    }, [misses, endGame]);

    useEffect(() => {
        if (die === null && !gameState.current.isOver) {
            const timer = setTimeout(spawnDie, 300);
            return () => clearTimeout(timer);
        }
    }, [die, spawnDie]);

    const handleClickDie = () => {
        if (die && !gameState.current.isOver) {
            setScore(s => s + 8);
            setDie(null);
        }
    };
    
    const progress = die ? Math.min(1, (performance.now() - die.startTime) / die.duration) : 0;

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-cyan-500/50">
            <h2 className="text-5xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">🎲 Beer Die Challenge</h2>
            <div className="flex justify-between items-center mb-6 text-2xl">
                <p className="font-bold">Grit: <span className="text-yellow-400">{score}</span></p>
                <p className="font-bold">Lives: <span className="text-red-500 text-3xl">{'❤️'.repeat(misses)}</span></p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 w-full h-80 rounded-2xl relative cursor-crosshair border-2 border-cyan-500/30">
                {die && (
                    <button
                        onClick={handleClickDie}
                        className="absolute text-4xl transition-transform hover:scale-110"
                        style={{ left: `${die.x}%`, top: `${die.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="relative">
                            <svg width="60" height="60" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="10" />
                                <circle 
                                    cx="50" cy="50" r="45" 
                                    fill="none" stroke="cyan" strokeWidth="10"
                                    strokeDasharray="282.7"
                                    strokeDashoffset={282.7 * progress}
                                    transform="rotate(-90 50 50)"
                                    style={{filter: 'drop-shadow(0 0 10px cyan)'}}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center">🎲</span>
                        </div>
                    </button>
                )}
                 {misses <= 0 && <div className="absolute inset-0 flex items-center justify-center text-5xl text-red-500 bg-black/50 rounded-2xl">GAME OVER</div>}
            </div>
        </div>
    );
};

// --- FANTASY DRAFT MINIGAME ---
export const FantasyDraftMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [currentRound, setCurrentRound] = useState(0);
    const [team, setTeam] = useState<typeof fantasyDraftPlayers[0]>([]);
    const [grit, setGrit] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const draftPlayer = (player: typeof fantasyDraftPlayers[0][0]) => {
        const newTeam = [...team, player];
        setTeam(newTeam);

        // Award grit based on player type and projection
        let gritEarned = 0;
        if (player.type === 'Gritty Vet') {
            gritEarned = 20; // Reliable grit
        } else if (player.type === 'Safe Stud') {
            gritEarned = 15; // Solid choice
        } else {
            // High-ceiling player - random outcome
            const busted = Math.random() > 0.5;
            gritEarned = busted ? 5 : 30;
        }

        setGrit(prev => prev + gritEarned);

        if (currentRound < fantasyDraftPlayers.length - 1) {
            setCurrentRound(currentRound + 1);
        } else {
            setGameOver(true);
        }
    };

    const endGame = () => {
        const totalProjection = team.reduce((sum, p) => sum + p.projection, 0);
        const bonus = totalProjection > 75 ? 50 : totalProjection > 60 ? 25 : 0;
        onGameEnd(grit + bonus);
    };

    if (gameOver) {
        const totalProjection = team.reduce((sum, p) => sum + p.projection, 0);
        const totalRisk = team.reduce((sum, p) => sum + p.risk, 0) / team.length;

        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-green-500/50">
                <h2 className="text-4xl font-orbitron mb-4">🏈 Draft Complete! 🏈</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900 p-4 rounded-xl">
                        <p className="text-sm text-gray-300">Total Projection</p>
                        <p className="text-3xl font-bold">{totalProjection}</p>
                    </div>
                    <div className="bg-purple-900 p-4 rounded-xl">
                        <p className="text-sm text-gray-300">Avg Risk</p>
                        <p className="text-3xl font-bold">{Math.round(totalRisk)}%</p>
                    </div>
                </div>
                <div className="space-y-2 mb-6">
                    {team.map((player, i) => (
                        <div key={i} className="bg-gray-800 p-3 rounded-lg text-left">
                            <p className="font-bold">{player.name} ({player.type})</p>
                            <p className="text-sm text-gray-400">{player.notes}</p>
                        </div>
                    ))}
                </div>
                <p className="text-2xl mb-4">Grit Earned: {grit}</p>
                <button onClick={endGame} className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xl">
                    Finish Draft
                </button>
            </div>
        );
    }

    const round = fantasyDraftPlayers[currentRound];

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-green-500/50">
            <h2 className="text-4xl font-orbitron mb-4">📈 Fantasy Draft - Round {currentRound + 1}</h2>
            <p className="text-xl mb-6">Current Grit: {grit}</p>
            <p className="text-lg mb-6 text-gray-300">Choose your player wisely...</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {round.map((player, i) => (
                    <button
                        key={i}
                        onClick={() => draftPlayer(player)}
                        className="p-6 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-2xl font-bold transform hover:scale-105 transition-all"
                    >
                        <div className="text-2xl mb-2">{player.name}</div>
                        <div className="text-sm text-yellow-400 mb-2">{player.type}</div>
                        <div className="text-xs text-gray-300 mb-3">{player.notes}</div>
                        <div className="flex justify-between text-sm">
                            <span className="text-green-400">Proj: {player.projection}</span>
                            <span className="text-red-400">Risk: {player.risk}%</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- TRIVIA NIGHT MINIGAME ---
export const TriviaNightMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const question = triviaData[currentQuestion];

    const handleAnswer = (index: number) => {
        if (answered) return;

        setSelectedAnswer(index);
        setAnswered(true);

        if (index === question.correct) {
            setScore(prev => prev + 20);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < triviaData.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setAnswered(false);
            setSelectedAnswer(null);
        } else {
            onGameEnd(score);
        }
    };

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-indigo-500/50">
            <h2 className="text-4xl font-orbitron mb-4">🧠 NFL Trivia Night</h2>
            <div className="flex justify-between mb-6 text-xl">
                <span>Question {currentQuestion + 1}/{triviaData.length}</span>
                <span className="text-green-400">Score: {score}</span>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl mb-6">
                <p className="text-2xl">{question.question}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {question.answers.map((answer, index) => {
                    let bgColor = 'bg-gray-700 hover:bg-gray-600';
                    if (answered) {
                        if (index === question.correct) {
                            bgColor = 'bg-green-600';
                        } else if (index === selectedAnswer) {
                            bgColor = 'bg-red-600';
                        }
                    }
                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={answered}
                            className={`p-4 ${bgColor} rounded-xl font-bold text-lg disabled:cursor-default transition-all`}
                        >
                            {answer}
                        </button>
                    );
                })}
            </div>
            {answered && (
                <button
                    onClick={nextQuestion}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl"
                >
                    {currentQuestion < triviaData.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            )}
        </div>
    );
};

// --- COMMENTARY BATTLE MINIGAME ---
export const CommentaryBattleMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const scenario = commentaryBattleData[currentScenario];

    const handleChoice = (option: typeof commentaryBattleData[0]['options'][0]) => {
        const newScore = score + option.points;
        setScore(newScore);

        if (currentScenario < commentaryBattleData.length - 1) {
            setCurrentScenario(prev => prev + 1);
        } else {
            setGameOver(true);
        }
    };

    if (gameOver) {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-gray-500/50">
                <h2 className="text-4xl font-orbitron mb-4">🎙️ Game Over!</h2>
                <p className="text-3xl mb-6">Final Score: {score}</p>
                <p className="text-xl mb-6">
                    {score >= 35 ? "🔥 LEGENDARY COMMENTARY!" : score >= 25 ? "💪 Solid takes!" : "😬 You tried..."}
                </p>
                <button
                    onClick={() => onGameEnd(score)}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl"
                >
                    Finish
                </button>
            </div>
        );
    }

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-gray-500/50">
            <h2 className="text-4xl font-orbitron mb-4">🎙️ Commentary Battle</h2>
            <p className="text-xl mb-6 text-green-400">Score: {score}</p>
            <div className="bg-gray-900 p-6 rounded-xl mb-6">
                <p className="text-xl italic">{scenario.scenario}</p>
            </div>
            <p className="text-lg mb-4 text-gray-300">Drop your take:</p>
            <div className="space-y-3">
                {scenario.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleChoice(option)}
                        className="w-full p-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl font-bold text-left transition-all transform hover:scale-102"
                    >
                        <div className="flex justify-between items-center">
                            <span>{option.text}</span>
                            <span className="text-sm text-green-400">+{option.points}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Wrapper component for the minigames tab
export const NewMinigames: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<'sunday_scaries' | 'commish_chaos' | 'ty_window' | 'bitchless_chronicles' | 'beer_die' | 'fantasy_draft' | 'trivia_night' | 'commentary_battle' | null>(null);
    const [grit, setGrit] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const handleGameEnd = (earnedGrit: number) => {
        setGrit(earnedGrit);
        setShowResult(true);
    };

    const resetGame = () => {
        setSelectedGame(null);
        setGrit(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto text-center border-4 border-green-500/50">
                <h2 className="text-5xl font-orbitron mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Minigame Complete!
                </h2>
                <p className="text-4xl mb-8">
                    {grit > 0 ? '+' : ''}{grit} Grit Earned
                </p>
                <button
                    onClick={resetGame}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl"
                >
                    Play Another Game
                </button>
            </div>
        );
    }

    if (selectedGame === 'sunday_scaries') {
        return <SundayScariesMinigame onGameEnd={handleGameEnd} playerName="Player" />;
    }

    if (selectedGame === 'commish_chaos') {
        return <CommishChaosMinigame onGameEnd={handleGameEnd} />;
    }

    if (selectedGame === 'ty_window') {
        return <TyWindowMinigame onGameEnd={handleGameEnd} />;
    }

    if (selectedGame === 'bitchless_chronicles') {
        return <BitchlessChroniclesMinigame onGameEnd={handleGameEnd} playerName="Player" />;
    }

    if (selectedGame === 'beer_die') {
        return <BeerDieChallengeMinigame onGameEnd={handleGameEnd} />;
    }

    if (selectedGame === 'fantasy_draft') {
        return <FantasyDraftMinigame onGameEnd={handleGameEnd} />;
    }

    if (selectedGame === 'trivia_night') {
        return <TriviaNightMinigame onGameEnd={handleGameEnd} />;
    }

    if (selectedGame === 'commentary_battle') {
        return <CommentaryBattleMinigame onGameEnd={handleGameEnd} />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-3xl font-orbitron mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Choose Your Mini Game
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
                <button
                    onClick={() => setSelectedGame('sunday_scaries')}
                    className="p-6 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">🎰</div>
                    <div className="text-2xl mb-2">Sunday Scaries</div>
                    <div className="text-sm text-gray-200">Build a parlay and pray it hits</div>
                </button>

                <button
                    onClick={() => setSelectedGame('commish_chaos')}
                    className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">👑</div>
                    <div className="text-2xl mb-2">Commish Chaos</div>
                    <div className="text-sm text-gray-200">Abuse your power as commissioner</div>
                </button>

                <button
                    onClick={() => setSelectedGame('ty_window')}
                    className="p-6 bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">👻</div>
                    <div className="text-2xl mb-2">The Ty Window</div>
                    <div className="text-sm text-gray-200">Catch Ty when he actually messages</div>
                </button>

                <button
                    onClick={() => setSelectedGame('bitchless_chronicles')}
                    className="p-6 bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">💔</div>
                    <div className="text-2xl mb-2">Bitchless Chronicles</div>
                    <div className="text-sm text-gray-200">Experience dating rejection simulator</div>
                </button>

                <button
                    onClick={() => setSelectedGame('beer_die')}
                    className="p-6 bg-gradient-to-br from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">🎲</div>
                    <div className="text-2xl mb-2">Beer Die Challenge</div>
                    <div className="text-sm text-gray-200">Click the dice before they disappear</div>
                </button>

                <button
                    onClick={() => setSelectedGame('fantasy_draft')}
                    className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">📈</div>
                    <div className="text-2xl mb-2">Fantasy Draft</div>
                    <div className="text-sm text-gray-200">Build your championship roster</div>
                </button>

                <button
                    onClick={() => setSelectedGame('trivia_night')}
                    className="p-6 bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">🧠</div>
                    <div className="text-2xl mb-2">Trivia Night</div>
                    <div className="text-sm text-gray-200">Test your NFL knowledge</div>
                </button>

                <button
                    onClick={() => setSelectedGame('commentary_battle')}
                    className="p-6 bg-gradient-to-br from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 rounded-2xl font-bold text-xl transform hover:scale-105 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">🎙️</div>
                    <div className="text-2xl mb-2">Commentary Battle</div>
                    <div className="text-sm text-gray-200">Drop the best takes</div>
                </button>
            </div>
        </div>
    );
};
