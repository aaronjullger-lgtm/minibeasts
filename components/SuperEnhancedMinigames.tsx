import React, { useState, useEffect, useCallback, useRef } from 'react';
import { commishActions, tyWindowMessages, datingScenarios, fantasyDraftPlayers, triviaData, commentaryBattleData } from '../constants';

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
            const isLong = message.length > 25;
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
                        Short = Under 25 characters | Long = 25+ characters
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => makePrediction('short')}
                        className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl font-bold text-xl transform hover:scale-105 transition-all"
                    >
                        <div className="text-3xl mb-2">💬</div>
                        <div>SHORT Message</div>
                        <div className="text-xs mt-1 text-blue-200">&lt; 25 chars</div>
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
