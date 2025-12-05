import React, { useState, useEffect, useCallback, useRef } from 'react';
import { commishActions, tyWindowMessages, datingScenarios, fantasyDraftPlayers, triviaData, commentaryBattleData } from '../constants';

// Game Constants
const TY_MESSAGE_LENGTH_THRESHOLD = 25;
const TY_WINDOW_BASE_TIME = 30;
const DICTATOR_MODE_DISCOUNT = 0.5;

// ============================================================================
// BEER DIE MAYHEM - ULTIMATE EDITION
// ============================================================================
// New: Power-ups, obstacles, combo system, boss rounds, achievements
export const UltraBeerDieMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(5); // Increased from 3
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [powerUp, setPowerUp] = useState<'slow' | 'multi' | 'shield' | null>(null);
    const [powerUpDuration, setPowerUpDuration] = useState(0);
    const [bossRound, setBossRound] = useState(false);
    const [obstacles, setObstacles] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [dice, setDice] = useState<Array<{ 
        id: number; 
        x: number; 
        y: number; 
        startTime: number; 
        duration: number;
        isGolden?: boolean;
        isBomb?: boolean;
    }>>([]);
    const gameLoopRef = useRef<number | null>(null);
    const gameState = useRef({ score, misses, combo, onGameEnd, isOver: false, powerUp, obstacles });

    useEffect(() => {
        gameState.current = { score, misses, combo, onGameEnd, isOver: gameState.current.isOver, powerUp, obstacles };
    }, [score, misses, combo, onGameEnd, powerUp, obstacles]);

    // Power-up effects
    useEffect(() => {
        if (powerUpDuration > 0) {
            const timer = setInterval(() => {
                setPowerUpDuration(prev => {
                    if (prev <= 1) {
                        setPowerUp(null);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [powerUpDuration]);

    // Boss round every 100 points
    useEffect(() => {
        if (score > 0 && score % 100 === 0 && !bossRound) {
            setBossRound(true);
            setTimeout(() => setBossRound(false), 10000);
        }
    }, [score, bossRound]);

    const spawnDie = useCallback(() => {
        if (gameState.current.isOver || gameState.current.misses <= 0) return;
        
        const baseSpeed = bossRound ? 500 : 1200;
        const duration = Math.max(300, baseSpeed - (gameState.current.score * 6));
        const adjustedDuration = gameState.current.powerUp === 'slow' ? duration * 2 : duration;
        
        // Spawn multiple dice in boss round or with multi power-up
        const diceCount = bossRound ? 3 : (gameState.current.powerUp === 'multi' ? 2 : 1);
        
        const newDice = [];
        for (let i = 0; i < diceCount; i++) {
            // Random special dice
            const isGolden = Math.random() < 0.1; // 10% golden (5x points)
            const isBomb = Math.random() < 0.08; // 8% bomb (lose life)
            
            newDice.push({
                id: Date.now() + i,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                startTime: performance.now(),
                duration: adjustedDuration,
                isGolden,
                isBomb
            });
        }
        
        setDice(prev => [...prev, ...newDice]);
        
        // Spawn power-ups randomly
        if (Math.random() < 0.15 && !gameState.current.powerUp) {
            const powerUps = ['slow', 'multi', 'shield'] as const;
            const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
            setPowerUp(randomPowerUp);
            setPowerUpDuration(8);
        }
        
        // Spawn obstacles in boss round
        if (bossRound && Math.random() < 0.3) {
            setObstacles(prev => [
                ...prev,
                { id: Date.now(), x: Math.random() * 90 + 5, y: Math.random() * 90 + 5 }
            ]);
        }
    }, [bossRound]);

    useEffect(() => {
        const loop = () => {
            if (gameState.current.isOver) return;
            
            setDice(currentDice => {
                return currentDice.filter(d => {
                    if (performance.now() - d.startTime > d.duration) {
                        // Missed a die
                        if (gameState.current.powerUp !== 'shield') {
                            setMisses(m => m - 1);
                        }
                        setCombo(0);
                        return false;
                    }
                    return true;
                });
            });
            
            gameLoopRef.current = requestAnimationFrame(loop);
        };
        
        const spawnInterval = setInterval(spawnDie, bossRound ? 400 : 600);
        gameLoopRef.current = requestAnimationFrame(loop);
        
        return () => {
            clearInterval(spawnInterval);
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [spawnDie, bossRound]);

    useEffect(() => {
        if (misses <= 0) {
            gameState.current.isOver = true;
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            onGameEnd(score);
        }
    }, [misses, score, onGameEnd]);

    const handleClickDie = (dieId: number, isGolden?: boolean, isBomb?: boolean) => {
        if (gameState.current.isOver) return;
        
        if (isBomb) {
            // Clicked a bomb!
            if (powerUp === 'shield') {
                // Shield protects you
                setScore(s => s + 5);
            } else {
                setMisses(m => m - 1);
                setCombo(0);
            }
        } else {
            // Calculate points with combo multiplier
            const basePoints = isGolden ? 40 : 10;
            const comboMultiplier = Math.floor(combo / 5) + 1;
            const points = basePoints * comboMultiplier;
            
            setScore(s => s + points);
            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });
        }
        
        setDice(prev => prev.filter(d => d.id !== dieId));
    };

    return (
        <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-cyan-500/50 relative overflow-hidden">
            {bossRound && (
                <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none z-10 flex items-center justify-center">
                    <div className="text-6xl font-bold text-red-500 animate-bounce">BOSS ROUND!</div>
                </div>
            )}
            
            <div className="relative z-20">
                <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    🎲 BEER DIE MAYHEM 🎲
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-sm md:text-base">
                    <div className="bg-yellow-900/50 p-2 rounded-lg border border-yellow-500">
                        <div className="text-xs text-yellow-300">Score</div>
                        <div className="text-xl md:text-2xl font-bold text-yellow-400">{score}</div>
                    </div>
                    <div className="bg-red-900/50 p-2 rounded-lg border border-red-500">
                        <div className="text-xs text-red-300">Lives</div>
                        <div className="text-xl md:text-2xl">{'❤️'.repeat(misses)}</div>
                    </div>
                    <div className="bg-purple-900/50 p-2 rounded-lg border border-purple-500">
                        <div className="text-xs text-purple-300">Combo</div>
                        <div className="text-xl md:text-2xl font-bold text-purple-400">
                            {combo}x {combo >= 10 && '🔥'}
                        </div>
                    </div>
                    <div className="bg-blue-900/50 p-2 rounded-lg border border-blue-500">
                        <div className="text-xs text-blue-300">Max Combo</div>
                        <div className="text-xl md:text-2xl font-bold text-blue-400">{maxCombo}x</div>
                    </div>
                    <div className="bg-green-900/50 p-2 rounded-lg border border-green-500">
                        <div className="text-xs text-green-300">Power-Up</div>
                        <div className="text-base md:text-lg font-bold text-green-400">
                            {powerUp ? (
                                <>
                                    {powerUp === 'slow' && '⏱️ Slow'} 
                                    {powerUp === 'multi' && '✖️ Multi'}
                                    {powerUp === 'shield' && '🛡️ Shield'}
                                    <div className="text-xs">({powerUpDuration}s)</div>
                                </>
                            ) : 'None'}
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 w-full h-[400px] md:h-96 rounded-2xl relative cursor-crosshair border-2 border-cyan-500/30 overflow-hidden">
                    {/* Obstacles */}
                    {obstacles.map(obstacle => (
                        <div
                            key={obstacle.id}
                            className="absolute w-12 h-12 bg-red-900/50 border-2 border-red-500 rounded-lg animate-pulse"
                            style={{ left: `${obstacle.x}%`, top: `${obstacle.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            ⚠️
                        </div>
                    ))}
                    
                    {/* Dice */}
                    {dice.map(die => {
                        const progress = Math.min(1, (performance.now() - die.startTime) / die.duration);
                        return (
                            <button
                                key={die.id}
                                onClick={() => handleClickDie(die.id, die.isGolden, die.isBomb)}
                                className={`absolute text-3xl md:text-4xl transition-transform hover:scale-125 ${
                                    die.isGolden ? 'animate-spin' : die.isBomb ? 'animate-bounce' : ''
                                }`}
                                style={{ left: `${die.x}%`, top: `${die.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className="relative">
                                    <svg width="60" height="60" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="10" />
                                        <circle 
                                            cx="50" cy="50" r="45" 
                                            fill="none" 
                                            stroke={die.isGolden ? 'gold' : die.isBomb ? 'red' : 'cyan'} 
                                            strokeWidth="10"
                                            strokeDasharray="282.7"
                                            strokeDashoffset={282.7 * progress}
                                            transform="rotate(-90 50 50)"
                                            style={{filter: `drop-shadow(0 0 10px ${die.isGolden ? 'gold' : die.isBomb ? 'red' : 'cyan'})`}}
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        {die.isGolden ? '💰' : die.isBomb ? '💣' : '🎲'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                    
                    {misses <= 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 rounded-2xl">
                            <div className="text-5xl text-red-500 mb-4">GAME OVER</div>
                            <div className="text-3xl mb-2">Final Score: {score}</div>
                            <div className="text-xl">Max Combo: {maxCombo}x</div>
                            {maxCombo >= 20 && <div className="text-lg text-yellow-400 mt-2">🏆 COMBO MASTER!</div>}
                        </div>
                    )}
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                    <div>💰 Golden Die = 5x Points | 💣 Bomb = Lose Life | 🛡️ Shield = Ignore Misses</div>
                    <div className="mt-1">Combo Multiplier: x{Math.floor(combo / 5) + 1}</div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// TY WINDOW MASTER - ULTIMATE PREDICTION GAME
// ============================================================================
// New: Prediction system, streak bonuses, message types, difficulty modes
export const UltraTyWindowMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [waiting, setWaiting] = useState(true);
    const [tyMessage, setTyMessage] = useState('');
    const [windowActive, setWindowActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [captured, setCaptured] = useState(0);
    const [missed, setMissed] = useState(0);
    const [round, setRound] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [prediction, setPrediction] = useState<'short' | 'long' | null>(null);
    const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null);
    const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
    const [showPrediction, setShowPrediction] = useState(false);

    useEffect(() => {
        if (waiting && !showPrediction) {
            // Show prediction phase before Ty messages
            setShowPrediction(true);
            setPrediction(null);
            setPredictionCorrect(null);
        }
    }, [waiting, showPrediction]);

    const makePrediction = (type: 'short' | 'long') => {
        setPrediction(type);
        setShowPrediction(false);
        
        // Wait for Ty to message
        const basewait = difficulty === 'easy' ? 2000 : difficulty === 'normal' ? 3000 : 4000;
        const roundPenalty = (round - 1) * 1500;
        const waitTime = Math.floor(Math.random() * 4000) + basewait + roundPenalty;
        
        setTimeout(() => {
            const messages = tyWindowMessages;
            const message = messages[Math.floor(Math.random() * messages.length)];
            setTyMessage(message);
            
            // Check prediction
            const isLong = message.length > TY_MESSAGE_LENGTH_THRESHOLD;
            const correct = (prediction === 'long' && isLong) || (prediction === 'short' && !isLong);
            setPredictionCorrect(correct);
            
            setWaiting(false);
            setWindowActive(true);
            
            // Calculate window time based on difficulty and prediction
            const baseTime = difficulty === 'easy' ? 35 : difficulty === 'normal' ? 28 : 20;
            const predictionBonus = correct ? 5 : 0;
            const windowTime = Math.max(10, baseTime - (round - 1) * 6 + predictionBonus);
            setTimeLeft(windowTime);
            
            // Award prediction bonus
            if (correct) {
                const bonus = 15 + (streak * 5);
                setScore(prev => prev + bonus);
            }
        }, waitTime);
    };

    useEffect(() => {
        if (windowActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setWindowActive(false);
                        setMissed(prev => prev + 1);
                        setStreak(0);
                        
                        if (round >= 5) {
                            setGameOver(true);
                        } else {
                            setWaiting(true);
                            setShowPrediction(true);
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
        
        // Calculate points with bonuses
        const timeBonus = Math.floor(timeLeft * 3);
        const lengthBonus = Math.floor(tyMessage.length / 1.5);
        const roundBonus = round * 12;
        const predictionBonus = predictionCorrect ? 30 : 0;
        const streakBonus = streak * 10;
        const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'normal' ? 1.2 : 1;
        
        const points = Math.floor((timeBonus + lengthBonus + roundBonus + predictionBonus + streakBonus) * difficultyMultiplier);
        
        setScore(prev => prev + points);
        setCaptured(prev => prev + 1);
        setStreak(prev => {
            const newStreak = prev + 1;
            if (newStreak > maxStreak) setMaxStreak(newStreak);
            return newStreak;
        });
        setWindowActive(false);
        
        if (round >= 5) {
            setGameOver(true);
        } else {
            setWaiting(true);
            setShowPrediction(true);
            setRound(prev => prev + 1);
        }
    };

    const finishGame = () => {
        // Achievements
        const perfectGame = captured === 5;
        const speedster = maxStreak >= 3;
        const finalScore = score + (perfectGame ? 100 : 0) + (speedster ? 50 : 0);
        onGameEnd(finalScore);
    };

    if (gameOver) {
        const captureRate = Math.round((captured / 5) * 100);
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-cyan-500/50">
                <h2 className="text-4xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    👻 The Ty Window - Complete!
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-900/50 p-4 rounded-xl border border-green-500">
                        <div className="text-sm text-green-300">Captured</div>
                        <div className="text-3xl font-bold text-green-400">{captured}/5</div>
                    </div>
                    <div className="bg-red-900/50 p-4 rounded-xl border border-red-500">
                        <div className="text-sm text-red-300">Missed</div>
                        <div className="text-3xl font-bold text-red-400">{missed}</div>
                    </div>
                    <div className="bg-purple-900/50 p-4 rounded-xl border border-purple-500">
                        <div className="text-sm text-purple-300">Max Streak</div>
                        <div className="text-3xl font-bold text-purple-400">{maxStreak}x</div>
                    </div>
                </div>
                
                <div className="text-3xl md:text-4xl font-bold mb-4 text-yellow-400">
                    Final Score: {score}
                    {captured === 5 && <div className="text-lg text-green-400 mt-2">+ 100 bonus (Perfect!)</div>}
                    {maxStreak >= 3 && <div className="text-lg text-purple-400">+ 50 bonus (Speedster!)</div>}
                </div>
                
                <div className="text-xl mb-6">
                    {captured === 5 && '🏆 PERFECT! You caught EVERY Ty Window!'}
                    {captured >= 4 && captured < 5 && '💪 Excellent work! Almost perfect!'}
                    {captured === 3 && '👍 Not bad! You got most of them!'}
                    {captured < 3 && '😅 Ty is too elusive... try again!'}
                </div>
                
                <div className="text-lg text-gray-300 mb-6">
                    Capture Rate: {captureRate}%
                </div>
                
                <button
                    onClick={finishGame}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl transform hover:scale-105 transition-all"
                >
                    Continue ({score + (captured === 5 ? 100 : 0) + (maxStreak >= 3 ? 50 : 0)} Total Grit)
                </button>
            </div>
        );
    }

    if (showPrediction) {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-cyan-500/50">
                <h2 className="text-4xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    🔮 Ty Prediction Phase
                </h2>
                
                <div className="flex justify-between mb-6 text-lg">
                    <div>Round: {round}/5</div>
                    <div>Streak: {streak}x 🔥</div>
                    <div>Score: {score}</div>
                </div>
                
                <div className="bg-gray-900/80 p-6 rounded-xl mb-6">
                    <p className="text-2xl mb-4">Will Ty's next message be short or long?</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Correct predictions give bonus points and extra time!
                    </p>
                    <p className="text-xs text-gray-500">
                        Short = Under {TY_MESSAGE_LENGTH_THRESHOLD} characters | Long = {TY_MESSAGE_LENGTH_THRESHOLD}+ characters
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => makePrediction('short')}
                        className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl font-bold text-xl transform hover:scale-105 transition-all"
                    >
                        <div className="text-3xl mb-2">💬</div>
                        <div>SHORT Message</div>
                        <div className="text-xs mt-1 text-blue-200">&lt; {TY_MESSAGE_LENGTH_THRESHOLD} chars</div>
                    </button>
                    
                    <button
                        onClick={() => makePrediction('long')}
                        className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl font-bold text-xl transform hover:scale-105 transition-all"
                    >
                        <div className="text-3xl mb-2">📝</div>
                        <div>LONG Message</div>
                        <div className="text-xs mt-1 text-purple-200">25+ chars</div>
                    </button>
                </div>
            </div>
        );
    }
    
    if (waiting && !showPrediction) {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-cyan-500/50">
                <h2 className="text-4xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    👻 The Ty Window
                </h2>
                
                <div className="flex justify-between mb-6">
                    <div>Round: {round}/5</div>
                    <div>Captured: {captured}</div>
                    <div>Score: {score}</div>
                </div>
                
                <div className="bg-gray-900/80 p-8 rounded-xl animate-pulse">
                    <p className="text-2xl md:text-3xl mb-4">⏳ Waiting for Ty to message...</p>
                    <p className="text-gray-400">
                        You predicted: {prediction === 'short' ? '💬 SHORT' : '📝 LONG'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">This could take a while...</p>
                </div>
            </div>
        );
    }
    
    if (windowActive) {
        const isLong = tyMessage.length > 25;
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-cyan-400 animate-pulse">
                <h2 className="text-4xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    🚨 TY WINDOW ACTIVE! 🚨
                </h2>
                
                {predictionCorrect !== null && (
                    <div className={`mb-4 p-3 rounded-lg ${predictionCorrect ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
                        {predictionCorrect ? (
                            <span className="text-green-300">✅ Correct Prediction! +30 points & +5s</span>
                        ) : (
                            <span className="text-red-300">❌ Wrong Prediction! Message is {isLong ? 'LONG' : 'SHORT'}</span>
                        )}
                    </div>
                )}
                
                <div className="flex justify-between mb-4 text-base md:text-lg">
                    <div>Round: {round}/5</div>
                    <div className="text-yellow-400">Streak: {streak}x 🔥</div>
                    <div>Score: {score}</div>
                </div>
                
                <div className="bg-gray-800 p-4 md:p-6 rounded-lg mb-4">
                    <p className="text-sm text-gray-400 mb-2">Ty:</p>
                    <p className="text-xl md:text-2xl font-bold break-words">{tyMessage}</p>
                    <p className="text-xs text-gray-500 mt-2">Length: {tyMessage.length} chars</p>
                </div>
                
                <div className="relative mb-6">
                    <div className="text-4xl md:text-5xl font-bold text-red-400 animate-bounce mb-2">
                        {timeLeft}s
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-red-500 transition-all duration-1000"
                            style={{ width: `${(timeLeft / 30) * 100}%` }}
                        />
                    </div>
                </div>
                
                <button
                    onClick={captureMessage}
                    className="px-10 md:px-16 py-5 md:py-6 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-2xl md:text-3xl transform hover:scale-110 transition-all shadow-2xl shadow-green-500/50"
                >
                    📸 SCREENSHOT!
                </button>
            </div>
        );
    }
    
    return null;
};

// ============================================================================
// COMMISH CHAOS DELUXE - ABSOLUTE POWER EDITION
// ============================================================================
// New: League satisfaction meter, propaganda system, conspiracy theories, revolution phases
export const UltraCommishChaosMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [commishPower, setCommishPower] = useState(100);
    const [chaos, setChaos] = useState(0);
    const [grit, setGrit] = useState(0);
    const [leagueSatisfaction, setLeagueSatisfaction] = useState(75);
    const [message, setMessage] = useState("You're the commissioner. Time to abuse your power... wisely?");
    const [gameOver, setGameOver] = useState(false);
    const [jointAdMinigame, setJointAdMinigame] = useState(false);
    const [adClicks, setAdClicks] = useState(0);
    const [revolutionPhase, setRevolutionPhase] = useState(0); // 0-3
    const [propaganda, setPropaganda] = useState(0); // 0-100
    const [conspiracyTheories, setConspiracyTheories] = useState<string[]>([]);
    const [actionHistory, setActionHistory] = useState<string[]>([]);
    const [dictatorMode, setDictatorMode] = useState(false);

    const spreadPropaganda = () => {
        if (commishPower >= 15) {
            setCommishPower(prev => prev - 15);
            setPropaganda(prev => Math.min(100, prev + 20));
            setLeagueSatisfaction(prev => Math.min(100, prev + 10));
            setChaos(prev => Math.max(0, prev - 5));
            setGrit(prev => prev + 8);
            setMessage("📢 You've spun the narrative! The league is buying your propaganda... for now.");
        }
    };

    const triggerConspiracy = () => {
        const conspiracies = [
            "Collin is secretly controlling the waiver wire!",
            "The scoring system is rigged against Elie!",
            "Justin is screenshotting everything for blackmail!",
            "Spencer's cat walked across the keyboard during trades!",
            "The league is actually just a social experiment!"
        ];
        
        if (commishPower >= 20 && propaganda >= 30) {
            setCommishPower(prev => prev - 20);
            const theory = conspiracies[Math.floor(Math.random() * conspiracies.length)];
            setConspiracyTheories(prev => [...prev, theory]);
            setChaos(prev => Math.min(100, prev + 15));
            setGrit(prev => prev + 12);
            setMessage(`🕵️ Conspiracy Theory Launched: "${theory}" - The league is confused!`);
        }
    };

    const performAction = (action: any) => {
        if (commishPower < action.powerCost || gameOver) return;
        
        setCommishPower(prev => prev - action.powerCost);
        const newChaos = chaos + action.chaosGain;
        setChaos(newChaos);
        
        // Calculate satisfaction impact
        const satisfactionLoss = Math.floor(action.chaosGain * 0.8);
        setLeagueSatisfaction(prev => Math.max(0, prev - satisfactionLoss));
        
        // Revolution phase progression
        if (leagueSatisfaction < 60 && revolutionPhase === 0) setRevolutionPhase(1);
        if (leagueSatisfaction < 40 && revolutionPhase === 1) setRevolutionPhase(2);
        if (leagueSatisfaction < 20 && revolutionPhase === 2) setRevolutionPhase(3);
        
        // Escalating grit rewards with propaganda bonus
        const propagandaMultiplier = 1 + (propaganda / 100);
        const riskMultiplier = Math.floor(newChaos / 15) + 1;
        const gritReward = Math.floor(action.gritReward * riskMultiplier * propagandaMultiplier);
        setGrit(prev => prev + gritReward);
        
        // Track action history
        setActionHistory(prev => [...prev, action.name]);
        
        // Dynamic messages based on chaos and satisfaction
        let messageText = action.description;
        if (newChaos >= 90) {
            messageText += " - 🚨 THE LEAGUE IS IN FULL REVOLT MODE!";
        } else if (newChaos >= 70) {
            messageText += " - 🔥 The group chat is EXPLODING!";
        } else if (newChaos >= 50) {
            messageText += " - ⚠️ People are getting really mad...";
        }
        
        if (leagueSatisfaction <= 25) {
            messageText += " - 💀 League satisfaction is CRITICAL!";
        }
        
        setMessage(messageText);
        
        // Check for different game over conditions
        if (newChaos >= 100 && leagueSatisfaction < 30) {
            setGameOver(true);
            setMessage("🚨 THE LEAGUE HAS COMPLETELY REVOLTED! They're starting a new league called 'Not Spencer's League'!");
        } else if (dictatorMode && newChaos >= 80) {
            setGameOver(true);
            setMessage("👑 ABSOLUTE POWER! You've become a fantasy football dictator! The league fears and respects you!");
        }
    };

    const activateDictatorMode = () => {
        if (propaganda >= 75 && chaos >= 50 && !dictatorMode) {
            setDictatorMode(true);
            setGrit(prev => prev + 50);
            setMessage("👑 DICTATOR MODE ACTIVATED! You now rule with an iron fist! All actions cost 50% less power!");
        }
    };

    const playJointAd = () => {
        setJointAdMinigame(true);
        setMessage("Click the chiropractic ads to earn emergency commish powers!");
    };

    const clickAd = () => {
        setAdClicks(prev => prev + 1);
        if (adClicks >= 4) {
            const powerRestore = dictatorMode ? 40 : 30;
            setCommishPower(prev => Math.min(prev + powerRestore, 100));
            setGrit(prev => prev + 15);
            setJointAdMinigame(false);
            setAdClicks(0);
            setMessage("🏥 Emergency powers restored! The Joint Chiropractic saves the day (and your spine)!");
        }
    };

    const endGame = () => {
        // Calculate final bonuses
        let finalGrit = grit;
        if (propaganda >= 80) finalGrit += 40; // Propaganda master bonus
        if (conspiracyTheories.length >= 3) finalGrit += 30; // Conspiracy theorist bonus
        if (dictatorMode) finalGrit = Math.floor(finalGrit * 1.3); // Dictator bonus
        if (actionHistory.length >= 10) finalGrit += 25; // Action master bonus
        
        onGameEnd(finalGrit);
    };

    if (jointAdMinigame) {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-purple-500/50">
                <h2 className="text-3xl md:text-4xl font-orbitron mb-4">🏥 The Joint Chiropractic Ad 🏥</h2>
                <p className="text-lg md:text-xl mb-6">Click the ad 5 times to earn emergency powers!</p>
                <p className="text-2xl md:text-3xl font-bold mb-6">Clicks: {adClicks}/5</p>
                <button
                    onClick={clickAd}
                    className="px-12 md:px-20 py-6 md:py-10 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-2xl font-bold text-xl md:text-3xl transform hover:scale-105 transition-all shadow-2xl"
                >
                    🦴 ADJUST YOUR SPINE 🦴
                </button>
                <p className="mt-4 text-sm text-gray-400">
                    "Your spine will thank you!" - Definitely not Spencer
                </p>
            </div>
        );
    }

    return (
        <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-purple-500/50 relative overflow-hidden">
            {dictatorMode && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-yellow-500/20 to-transparent h-32 animate-pulse" />
            )}
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    {dictatorMode ? '👑 DICTATOR MODE' : '⚖️ Commish Chaos DELUXE'}
                </h2>
                
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-sm">
                    <div className="bg-blue-900/50 p-2 md:p-3 rounded-lg border border-blue-500">
                        <p className="text-xs font-bold text-blue-300">Power</p>
                        <p className="text-xl md:text-2xl font-bold">{commishPower}</p>
                        <div className="h-1 bg-blue-900 rounded-full mt-1">
                            <div className="h-full bg-blue-400 rounded-full transition-all" style={{width: `${commishPower}%`}} />
                        </div>
                    </div>
                    <div className="bg-red-900/50 p-2 md:p-3 rounded-lg border border-red-500">
                        <p className="text-xs font-bold text-red-300">Chaos</p>
                        <p className="text-xl md:text-2xl font-bold">{chaos}/100</p>
                        <div className="h-1 bg-red-900 rounded-full mt-1">
                            <div className="h-full bg-red-500 rounded-full transition-all" style={{width: `${chaos}%`}} />
                        </div>
                    </div>
                    <div className="bg-yellow-900/50 p-2 md:p-3 rounded-lg border border-yellow-500">
                        <p className="text-xs font-bold text-yellow-300">Grit</p>
                        <p className="text-xl md:text-2xl font-bold">{grit}</p>
                    </div>
                    <div className={`bg-green-900/50 p-2 md:p-3 rounded-lg border ${leagueSatisfaction < 30 ? 'border-red-500 animate-pulse' : 'border-green-500'}`}>
                        <p className="text-xs font-bold text-green-300">Satisfaction</p>
                        <p className="text-xl md:text-2xl font-bold">{leagueSatisfaction}%</p>
                        <div className="h-1 bg-green-900 rounded-full mt-1">
                            <div className="h-full bg-green-400 rounded-full transition-all" style={{width: `${leagueSatisfaction}%`}} />
                        </div>
                    </div>
                    <div className="bg-purple-900/50 p-2 md:p-3 rounded-lg border border-purple-500">
                        <p className="text-xs font-bold text-purple-300">Propaganda</p>
                        <p className="text-xl md:text-2xl font-bold">{propaganda}%</p>
                        <div className="h-1 bg-purple-900 rounded-full mt-1">
                            <div className="h-full bg-purple-400 rounded-full transition-all" style={{width: `${propaganda}%`}} />
                        </div>
                    </div>
                </div>
                
                {/* Revolution Phase Indicator */}
                {revolutionPhase > 0 && (
                    <div className={`mb-4 p-3 rounded-lg border-2 ${
                        revolutionPhase === 3 ? 'bg-red-900/50 border-red-500 animate-pulse' :
                        revolutionPhase === 2 ? 'bg-orange-900/50 border-orange-500' :
                        'bg-yellow-900/50 border-yellow-500'
                    }`}>
                        <p className="font-bold">
                            {revolutionPhase === 3 && '🚨 REVOLUTION PHASE 3: TOTAL ANARCHY'}
                            {revolutionPhase === 2 && '⚠️ REVOLUTION PHASE 2: ACTIVE RESISTANCE'}
                            {revolutionPhase === 1 && '😤 REVOLUTION PHASE 1: GROWING DISCONTENT'}
                        </p>
                    </div>
                )}
                
                {/* Conspiracy Theories */}
                {conspiracyTheories.length > 0 && (
                    <div className="mb-4 bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-sm font-bold mb-2">🕵️ Active Conspiracy Theories:</p>
                        <div className="text-xs space-y-1">
                            {conspiracyTheories.map((theory, i) => (
                                <div key={i} className="text-yellow-300">• {theory}</div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="bg-gray-900/80 p-3 md:p-4 rounded-xl mb-4 min-h-[60px] border border-gray-700">
                    <p className="text-sm md:text-lg italic">{message}</p>
                </div>
                
                {!gameOver ? (
                    <>
                        {/* Special Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <button
                                onClick={spreadPropaganda}
                                disabled={commishPower < 15}
                                className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 rounded-xl font-bold disabled:opacity-50 transition-all transform hover:scale-105"
                            >
                                <div className="text-2xl mb-1">📢</div>
                                <div className="text-sm">Spread Propaganda</div>
                                <div className="text-xs text-blue-200">Power: 15 | +10 Satisfaction</div>
                            </button>
                            
                            <button
                                onClick={triggerConspiracy}
                                disabled={commishPower < 20 || propaganda < 30}
                                className="p-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 rounded-xl font-bold disabled:opacity-50 transition-all transform hover:scale-105"
                            >
                                <div className="text-2xl mb-1">🕵️</div>
                                <div className="text-sm">Launch Conspiracy</div>
                                <div className="text-xs text-yellow-200">Power: 20 | Need 30 Propaganda</div>
                            </button>
                            
                            <button
                                onClick={activateDictatorMode}
                                disabled={propaganda < 75 || chaos < 50 || dictatorMode}
                                className={`p-3 rounded-xl font-bold disabled:opacity-50 transition-all transform hover:scale-105 ${
                                    dictatorMode 
                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 animate-pulse' 
                                        : 'bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 disabled:from-gray-700 disabled:to-gray-700'
                                }`}
                            >
                                <div className="text-2xl mb-1">👑</div>
                                <div className="text-sm">{dictatorMode ? 'ACTIVE' : 'Dictator Mode'}</div>
                                <div className="text-xs text-purple-200">75 Propaganda + 50 Chaos</div>
                            </button>
                        </div>
                        
                        {/* Regular Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {commishActions.map((action, i) => {
                                const cost = dictatorMode ? Math.floor(action.powerCost * 0.5) : action.powerCost;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => performAction({...action, powerCost: cost})}
                                        disabled={commishPower < cost}
                                        className="p-3 md:p-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-102 text-left"
                                    >
                                        <div className="text-base md:text-lg mb-2">{action.name}</div>
                                        <div className="text-xs md:text-sm text-gray-300 mb-2">{action.description}</div>
                                        <div className="text-xs">
                                            Power: {cost} | Chaos: +{action.chaosGain} | Grit: +{action.gritReward}
                                            {dictatorMode && <span className="text-yellow-400 ml-2">💪 50% OFF</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Bottom Actions */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={playJointAd}
                                disabled={commishPower > 40}
                                className="px-4 md:px-6 py-2 md:py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                            >
                                🏥 Emergency Joint Ad
                            </button>
                            <button
                                onClick={endGame}
                                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transform hover:scale-105 transition-all"
                            >
                                💰 Cash Out ({grit} Grit)
                            </button>
                        </div>
                        
                        <div className="mt-4 text-xs text-gray-400">
                            Actions Taken: {actionHistory.length} | Conspiracies Active: {conspiracyTheories.length}
                        </div>
                    </>
                ) : (
                    <div className="py-6">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Game Over!</h3>
                        <div className="text-lg mb-4">{message}</div>
                        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
                            <div className="bg-purple-900/50 p-3 rounded-lg">
                                <div className="text-sm text-purple-300">Actions Taken</div>
                                <div className="text-2xl font-bold">{actionHistory.length}</div>
                            </div>
                            <div className="bg-yellow-900/50 p-3 rounded-lg">
                                <div className="text-sm text-yellow-300">Conspiracies</div>
                                <div className="text-2xl font-bold">{conspiracyTheories.length}</div>
                            </div>
                        </div>
                        {dictatorMode && <div className="text-xl text-yellow-400 mb-4">👑 DICTATOR MODE BONUS: +30%</div>}
                        {propaganda >= 80 && <div className="text-lg text-blue-400 mb-2">📢 Propaganda Master: +40 Grit</div>}
                        {conspiracyTheories.length >= 3 && <div className="text-lg text-yellow-400 mb-2">🕵️ Conspiracy Pro: +30 Grit</div>}
                        <button
                            onClick={endGame}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xl transform hover:scale-105 transition-all"
                        >
                            Accept Your Fate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
