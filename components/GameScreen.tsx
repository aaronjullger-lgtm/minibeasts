import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, EndGameReport, Message, StoreItem, MinigameType, SeasonGoal, ManageLifeAction, RandomEvent, PropBet, Achievement, GlobalState, GameEvent } from '../types';
import { generateNpcResponse, initiateNpcConversation, generateRoastAndReactions, generateNpcMinigameReactions } from '../services/geminiService';
import { characterData, allStoreItems, SEASON_LENGTH, DAYS_PER_WEEK, getSeasonGoalsForPlayer, manageLifeActions, randomEvents, commentaryBattleData, fantasyDraftPlayers, triviaData, allAchievements, propBetTemplates, characterDefinitions, fullDatingScenarios } from '../constants';
import { HUD } from './Dashboard';
import { MessageBubble, Spinner } from './ChatUI';
import { soundService } from '../services/soundService';
import { gameEvents } from '../events';
import { SundayScariesMinigame, CommishChaosMinigame, TyWindowMinigame, BitchlessChroniclesMinigame } from './NewMinigames';
import { AchievementNotification } from './AchievementNotification';
import { StatChangeNotification } from './StatChangeNotification';

// --- MODAL COMPONENTS ---
const ModalWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        {children}
    </div>
);

// --- NEW MINIGAME COMPONENTS ---

const BeerDieChallengeMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(3);
    const [die, setDie] = useState<{ id: number; x: number; y: number, startTime: number, duration: number } | null>(null);
    // FIX: useRef must be called with an initial value.
    const gameLoopRef = useRef<number | null>(null);
    
    // Use refs to hold mutable state for stable callbacks, preventing re-renders from breaking the game loop
    const gameState = useRef({ score, misses, onGameEnd, isOver: false });

    useEffect(() => {
        // Keep the ref updated with the latest state values without causing effects to re-run
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
        // This effect runs only once to start the game loop
        const loop = () => {
            if (gameState.current.isOver) return;
            
            setDie(currentDie => {
                if (currentDie && performance.now() - currentDie.startTime > currentDie.duration) {
                    setMisses(m => m - 1);
                    return null; // This will trigger the spawning effect below
                }
                return currentDie;
            });
            gameLoopRef.current = requestAnimationFrame(loop);
        };
        
        spawnDie(); // Initial spawn
        gameLoopRef.current = requestAnimationFrame(loop);
        
        return () => {
             gameState.current.isOver = true;
             if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
    }, [spawnDie]);

    useEffect(() => {
        // This effect handles game over condition
        if (misses <= 0) {
            endGame();
        }
    }, [misses, endGame]);

    useEffect(() => {
        // This effect handles spawning new dice after a miss or a hit
        if (die === null && !gameState.current.isOver) {
            const timer = setTimeout(spawnDie, 300); // Brief pause before next die
            return () => clearTimeout(timer);
        }
    }, [die, spawnDie]);

    const handleClickDie = () => {
        if (die && !gameState.current.isOver) {
            setScore(s => s + 8);
            setDie(null); // Setting die to null triggers the spawn effect
        }
    };
    
    const progress = die ? Math.min(1, (performance.now() - die.startTime) / die.duration) : 0;

    return (
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-4 border-cyan-500/50 neon-blue">
            <h2 className="text-5xl font-orbitron mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">🎲 Beer Die Challenge</h2>
            <div className="flex justify-between items-center mb-6 text-2xl">
                <p className="font-orbitron">Grit: <span className="font-bold text-yellow-400">{score}</span></p>
                <p className="font-orbitron">Lives: <span className="font-bold text-red-500 text-3xl">{'❤️'.repeat(misses)}</span></p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 w-full h-80 rounded-2xl relative cursor-crosshair border-2 border-cyan-500/30 shadow-inner">
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
                            <span className="absolute inset-0 flex items-center justify-center" style={{filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'}}>🎲</span>
                        </div>
                    </button>
                )}
                 {misses <= 0 && <div className="absolute inset-0 flex items-center justify-center text-5xl font-orbitron text-red-500 bg-black/50 rounded-2xl backdrop-blur-sm">GAME OVER</div>}
            </div>
        </div>
    );
};

const TriviaNightMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [questions] = useState(() => [...triviaData].sort(() => 0.5 - Math.random()).slice(0, 3));
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'' | 'correct' | 'incorrect'>('');

    const handleAnswer = (answerIndex: number) => {
        if (feedback) return;
        let gritGained = 0;
        if (answerIndex === questions[qIndex].correct) {
            gritGained = 15;
            setScore(s => s + gritGained);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            setFeedback('');
            if (qIndex < questions.length - 1) {
                setQIndex(i => i + 1);
            } else {
                onGameEnd(score + gritGained);
            }
        }, 1500);
    };

    const currentQuestion = questions[qIndex];

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2">Trivia Night</h2>
            <p className="font-bold text-lg mb-4">Total Grit: {score}</p>
            <div className="bg-gray-900 p-4 rounded-lg mb-4 min-h-[80px]">
                <p className="text-xl italic">"{currentQuestion.question}"</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {currentQuestion.answers.map((answer, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={!!feedback}
                        className={`p-4 rounded font-semibold text-lg h-24 flex items-center justify-center transition-colors ${
                            feedback && i === currentQuestion.correct ? 'bg-green-600' :
                            feedback && i !== currentQuestion.correct ? 'bg-red-600' :
                            'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {answer}
                    </button>
                ))}
            </div>
        </div>
    );
};


const CommentaryBattleMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [feedback, setFeedback] = useState('');

    const currentQuestion = commentaryBattleData[questionIndex];

    const handleAnswer = useCallback((points: number) => {
        if (feedback) return;
        const newScore = score + points;
        setScore(newScore);
        if (points > 12) setFeedback('Perfect! 🤓');
        else if (points > 6) setFeedback('Nice one!');
        else setFeedback('Lame...');

        setTimeout(() => {
            setFeedback('');
            if (questionIndex < commentaryBattleData.length - 1) {
                setQuestionIndex(i => i + 1);
                setTimeLeft(10);
            } else {
                onGameEnd(newScore);
            }
        }, 1500);
    }, [feedback, score, questionIndex, onGameEnd]);

    useEffect(() => {
        if (feedback) return;
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            handleAnswer(0); // Times up
        }
    }, [timeLeft, feedback, handleAnswer]);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2">Commentary Battle</h2>
            <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-lg">Total Grit: {score}</p>
                <p className="font-bold text-2xl text-red-500">{timeLeft}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <p className="text-xl italic">"{currentQuestion.scenario}"</p>
            </div>
            {feedback ? (
                <p className="text-3xl font-bold animate-pulse h-48 flex items-center justify-center">{feedback}</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(opt.points)} className="bg-blue-600 hover:bg-blue-700 p-4 rounded font-semibold text-lg h-24 flex items-center justify-center">
                            {opt.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FantasyDraftMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [round, setRound] = useState(0);
    const [team, setTeam] = useState<any[]>([]);
    const [totalProjection, setTotalProjection] = useState(0);

    const handlePick = (player: any) => {
        const newTeam = [...team, player];
        setTeam(newTeam);
        const newTotalProjection = totalProjection + player.projection;
        setTotalProjection(newTotalProjection);

        if (round < fantasyDraftPlayers.length - 1) {
            setRound(r => r + 1);
        } else {
            onGameEnd(Math.floor(newTotalProjection / 3));
        }
    };
    
    if (round >= fantasyDraftPlayers.length) {
        return <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2">Draft Complete!</h2>
            <p className="text-xl">Your team's projected score: {totalProjection}</p>
            <p>You earned {Math.floor(totalProjection/3)} Grit!</p>
        </div>
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2 text-center">Fantasy Draft</h2>
            <p className="text-center mb-4">Round {round + 1} | Team Projection: {totalProjection}</p>
            <div className="flex justify-center gap-4">
                {fantasyDraftPlayers[round].map(player => (
                    <div key={player.name} className="bg-gray-700 p-4 rounded-lg w-1/3 flex flex-col justify-between border-2 border-gray-600">
                        <div>
                            <h3 className="text-xl font-bold font-graduate">{player.name}</h3>
                            <p className={`font-semibold ${player.type === 'Safe Stud' ? 'text-green-400' : player.type === 'High-Ceiling' ? 'text-yellow-400' : 'text-blue-400'}`}>{player.type}</p>
                            <p className="text-sm text-gray-300 my-2">{player.notes}</p>
                        </div>
                        <div className="text-lg">
                            <p>Projection: <span className="font-bold">{player.projection}</span></p>
                            <p>Risk: <span className="font-bold">{player.risk}%</span></p>
                        </div>
                        <button onClick={() => handlePick(player)} className="bg-green-600 hover:bg-green-700 w-full p-2 rounded mt-4 font-bold">Draft Player</button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const KickingMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [gameState, setGameState] = useState<'power' | 'accuracy' | 'result'>('power');
    const [resultText, setResultText] = useState('');
    const [power, setPower] = useState(0);
    const [wind] = useState(Math.floor(Math.random() * 25) - 12); // Harder wind
    const [kicks, setKicks] = useState(3);
    const [score, setScore] = useState(0);
    const [ballPosition, setBallPosition] = useState<{x: number, y: number} | null>(null);
    const powerMeterRef = useRef<HTMLDivElement>(null);
    const accuracyMeterRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (gameState === 'power') {
            if (powerMeterRef.current) {
                const meterHeight = powerMeterRef.current.parentElement!.offsetHeight;
                const barHeight = powerMeterRef.current.offsetHeight;
                setPower((barHeight / meterHeight) * 100);
            }
            setGameState('accuracy');
        } else if (gameState === 'accuracy') {
            if (accuracyMeterRef.current) {
                const meterWidth = accuracyMeterRef.current.parentElement!.offsetWidth;
                const barPos = accuracyMeterRef.current.offsetLeft + accuracyMeterRef.current.offsetWidth / 2;
                const finalAccuracy = (barPos / meterWidth) * 100 + wind;
                calculateResult(power, finalAccuracy);
            }
        }
    };

    const calculateResult = (p: number, a: number) => {
        setGameState('result');
        const distFromCenter = a - 50;
        const finalX = 50 + distFromCenter * 1.5;
        
        setBallPosition({ x: 50, y: 95 });
        setTimeout(() => setBallPosition({ x: finalX, y: 0 }), 100);

        setTimeout(() => {
            let grit = 0;
            let text = '';
            const finalDist = Math.abs(finalX - 50);

            if (p < 60) { text = "Short!"; grit = 2; } 
            else if (finalDist < 2) { text = "Perfect!"; grit = 40; }
            else if (finalDist < 12 && Math.random() < 0.3) { text = "DOINK!"; grit = 8; }
            else if (finalDist < 15) { text = "It's Good!"; grit = 25; }
            else { text = "WIDE!"; grit = 5; }

            setResultText(`${text} [+${grit} Grit]`);
            const newScore = score + grit;
            setScore(newScore);
            setBallPosition(null);

            setTimeout(() => {
                if (kicks > 1) {
                    setKicks(k => k - 1);
                    setGameState('power');
                    setResultText('');
                } else {
                    onGameEnd(newScore);
                }
            }, 1500);
        }, 1100);
    };

    return (
        <div className="bg-green-800 p-6 rounded-lg shadow-xl w-full max-w-lg text-center border-4 border-white" onClick={gameState !== 'result' ? handleClick : undefined} style={{cursor: gameState !== 'result' ? 'pointer' : 'default'}}>
            <h2 className="text-3xl font-graduate mb-2">Field Goal Challenge</h2>
            <p className="mb-2">Kicks Left: {kicks} | Total Grit: {score}</p>
            <p className="mb-4 font-bold text-lg">Wind: {wind > 0 ? `${wind}mph ➡️` : wind < 0 ? `${Math.abs(wind)}mph ⬅️` : 'No wind'}</p>
            
            <div className="h-48 flex flex-col justify-center items-center mb-4 bg-green-900 relative overflow-hidden rounded-md border-2 border-gray-400">
                 {/* Field Lines */}
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="absolute h-px w-full bg-green-700/50" style={{top: `${(i+1)*10}%`}}/>
                ))}
                {/* Goalpost */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1/3 w-2 bg-yellow-400" /> {/* Main post */}
                <div className="absolute h-1 bg-yellow-400" style={{left: '35%', width: '30%', bottom: '33%'}} /> {/* Crossbar */}
                <div className="absolute h-1/2 w-2 bg-yellow-400" style={{left: '35%', bottom: '33%'}} /> {/* Left upright */}
                <div className="absolute h-1/2 w-2 bg-yellow-400" style={{left: 'calc(65% - 2px)', bottom: '33%'}} /> {/* Right upright */}

                {ballPosition && (
                    <div className="absolute text-3xl transition-all duration-1000 ease-out" 
                         style={{
                             bottom: `${ballPosition.y}%`, 
                             left: `${ballPosition.x}%`, 
                             transform: `translate(-50%, 50%) rotate(${ballPosition.y * -5}deg)` 
                         }}>
                        🏈
                    </div>
                )}
                {gameState === 'result' && !ballPosition && <p className="text-3xl font-bold animate-pulse z-10 bg-black/50 p-2 rounded">{resultText}</p>}
            </div>

            <div className="flex justify-center items-end gap-8 h-32">
                { (gameState === 'power' || gameState === 'accuracy') && <>
                    <div className="w-10 h-32 bg-gray-600 rounded-lg relative overflow-hidden">
                        <div ref={powerMeterRef} className={`absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-green-500 ${gameState === 'power' ? 'animate-[shot-meter_1.0s_ease-in-out_infinite]' : ''}`} style={{height: `${power}%`}} />
                    </div>
                    <div className="w-48 h-8 bg-gray-600 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 h-full w-2 bg-green-500 left-1/2 -translate-x-1/2" />
                        <div ref={accuracyMeterRef} className={`absolute top-0 h-full w-2 bg-yellow-400 ${gameState === 'accuracy' ? 'animate-[swing-meter_0.6s_linear_infinite]' : ''}`} />
                    </div>
                </>}
            </div>
            <p className="text-xl mt-4 font-bold h-6">
                {gameState === 'power' && 'Click to Set Power!'}
                {gameState === 'accuracy' && 'Click to Set Accuracy!'}
                {gameState === 'result' && (kicks > 1 ? 'Next Kick...' : 'Game Over')}
            </p>
            <style>{`@keyframes shot-meter { 0% { height: 0%; } 50% { height: 100%; } 100% { height: 0%; } } @keyframes swing-meter { 0% { left: 0; } 50% { left: calc(100% - 8px); } 100% { left: 0; } }`}</style>
        </div>
    );
};

const QuarterbackMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [throws, setThrows] = useState(3);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'play' | 'result'>('ready');
    const [resultText, setResultText] = useState('');
    const [pocketTime, setPocketTime] = useState(5000);
    const [receivers, setReceivers] = useState<{ id: number; route: 'go' | 'slant'; startX: number; x: number; y: number; open: boolean }[]>([]);
    const [defenders, setDefenders] = useState<{ id: number; targetId: number; x: number; y: number }[]>([]);
    // FIX: useRef must be called with an initial value.
    const animationFrameRef = useRef<number | null>(null);
    const playStartRef = useRef<number>(0);

    const setupPlay = useCallback(() => {
        setResultText('');
        setPocketTime(5000);
        // FIX: Explicitly type routes to avoid incorrect type inference.
        const route1: 'go' | 'slant' = Math.random() > 0.5 ? 'go' : 'slant';
        const route2: 'go' | 'slant' = Math.random() > 0.5 ? 'go' : 'slant';
        const newReceivers = [
            { id: 1, route: route1, startX: 25, x: 25, y: 90, open: false },
            { id: 2, route: route2, startX: 75, x: 75, y: 90, open: false },
        ];
        setReceivers(newReceivers);
        setDefenders([
            { id: 1, targetId: 1, x: 25, y: 85 },
            { id: 2, targetId: 2, x: 75, y: 85 },
        ]);
        playStartRef.current = performance.now();
        setGameState('play');
    }, []);

    const gameLoop = useCallback((timestamp: number) => {
        const elapsedTime = timestamp - playStartRef.current;
        setPocketTime(5000 - elapsedTime);

        if (5000 - elapsedTime <= 0) {
            setResultText("SACK! [-5 Grit]");
            setScore(s => Math.max(0, s - 5));
            setGameState('result');
            return;
        }

        // FIX: The original logic for combined state updates was flawed and caused bugs.
        // This corrected logic calculates new positions for both receivers and defenders
        // and then determines the 'open' status in a single, synchronous pass.
        setReceivers(prevReceivers => {
            const movedReceivers = prevReceivers.map(r => {
                let newY = r.y - (elapsedTime / 1000) * 8;
                let newX = r.x;
                if (r.route === 'slant') {
                    const direction = r.startX < 50 ? 1 : -1;
                    newX = r.startX + direction * (elapsedTime / 1000) * 8;
                }
                return { ...r, y: newY, x: newX };
            });

            // Defenders are updated in a separate state, but we need their new positions
            // to calculate the `open` status for receivers. We do this by calculating
            // the new defender positions here.
            const movedDefenders = defenders.map((d, index) => {
                 const target = movedReceivers[index];
                 if (!target) return d;
                 const speed = 0.9; // Slightly slower
                 const moveX = d.x + (target.x - d.x) * speed * 0.1;
                 const moveY = d.y + (target.y - d.y) * speed * 0.1;
                 return { ...d, x: moveX, y: moveY };
            });
            
            // This needs to be called to update the defenders' state for the next frame.
            setDefenders(movedDefenders);

            // Now, we can determine the `open` status and return the final, correct state for receivers.
            return movedReceivers.map((r, index) => {
                const d = movedDefenders[index];
                if (!d) return { ...r, open: true };
                const dist = Math.sqrt(Math.pow(r.x - d.x, 2) + Math.pow(r.y - d.y, 2));
                return { ...r, open: dist > 8 };
            });
        });

        animationFrameRef.current = requestAnimationFrame(gameLoop);
    }, [defenders]);
    
    useEffect(() => {
        if (gameState === 'play') {
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [gameState, gameLoop]);

    const handleThrow = (receiverId: number) => {
        if (gameState !== 'play') return;
        setGameState('result');
        const receiver = receivers.find(r => r.id === receiverId);
        if (!receiver) return;

        let grit = 0;
        let text = '';
        if (receiver.open) {
            grit = Math.floor(receiver.y < 50 ? 20 : 12);
            text = `COMPLETE! [+${grit} Grit]`;
        } else {
            if (Math.random() < 0.2) { grit = -10; text = "INTERCEPTION! [-10 Grit]"; } 
            else { grit = 2; text = `INCOMPLETE! [+${grit} Grit]`; }
        }
        setScore(s => Math.max(0, s + grit));
        setResultText(text);
    };

    const nextPlay = () => {
        if (throws > 1) {
            setThrows(t => t - 1);
            setGameState('ready');
        } else {
            onGameEnd(score);
        }
    };

    return (
        <div className="bg-green-800 p-6 rounded-lg shadow-xl w-full max-w-lg text-center border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2">Quarterback Vision</h2>
            <p className="mb-2">Throws Left: {throws} | Total Grit: {score}</p>
            <div className="w-full h-64 bg-green-700 my-4 rounded relative overflow-hidden">
                {/* Pocket */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-4 border-l-4 border-r-4 border-gray-400 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">QB</div>
                {/* Pocket Collapse Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-600">
                    <div className="h-full bg-red-500" style={{width: `${Math.max(0, pocketTime / 5000 * 100)}%`, transition: 'width 0.05s linear'}} />
                </div>
                {receivers.map(r => (
                    <button key={r.id} onClick={() => handleThrow(r.id)} disabled={gameState !== 'play'} className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${r.open ? 'bg-blue-500' : 'bg-gray-500'}`} style={{left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%, -50%)'}}>WR</button>
                ))}
                {defenders.map(d => (
                    <div key={d.id} className="absolute w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-sm" style={{left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)'}}>DB</div>
                ))}
            </div>
            <div className="h-10 text-xl font-bold">
                {gameState === 'ready' && <button onClick={setupPlay} className="bg-blue-600 p-2 rounded">Start Play</button>}
                {gameState === 'result' && <p className="animate-pulse">{resultText}</p>}
                {gameState === 'play' && <p>Throw to an open receiver!</p>}
            </div>
            {gameState === 'result' && <button onClick={nextPlay} className="bg-gray-600 p-2 rounded mt-2">{throws > 1 ? 'Next Throw' : 'Finish'}</button>}
        </div>
    );
};


const PlayCallingMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [yardline, setYardline] = useState(25);
    const [ballPosition, setBallPosition] = useState(25);
    const [down, setDown] = useState(1);
    const [toGo, setToGo] = useState(10);
    const [gameState, setGameState] = useState<'picking' | 'result'>('picking');
    const [resultText, setResultText] = useState('');
    const [totalGrit, setTotalGrit] = useState(0);

    const handlePlayCall = (playerPlay: 'Run' | 'Short Pass' | 'Deep Pass') => {
        const defensePlays = ['Run Blitz', 'Cover 2', 'Prevent'];
        const defenseCall = defensePlays[Math.floor(Math.random() * defensePlays.length)];

        let yardsGained = 0;
        let turnOver = false;

        if (playerPlay === 'Run') {
            if (defenseCall === 'Run Blitz') yardsGained = Math.floor(Math.random() * 4) - 2;
            else if (defenseCall === 'Cover 2') yardsGained = Math.floor(Math.random() * 5) + 3;
            else yardsGained = Math.floor(Math.random() * 10) + 8;
        } else if (playerPlay === 'Short Pass') {
            if (defenseCall === 'Run Blitz') yardsGained = Math.floor(Math.random() * 8) + 7;
            else if (defenseCall === 'Cover 2') yardsGained = Math.floor(Math.random() * 4) + 2;
            else yardsGained = Math.floor(Math.random() * 6) + 3;
        } else if (playerPlay === 'Deep Pass') {
            if (defenseCall === 'Run Blitz') yardsGained = Math.floor(Math.random() * 20) + 25;
            else if (defenseCall === 'Prevent') yardsGained = Math.floor(Math.random() * 5) - 2;
            else if (Math.random() > 0.6) { turnOver = true; } 
            else { yardsGained = Math.floor(Math.random() * 15) + 15; }
        }
        
        setGameState('result');
        if (turnOver) {
             setResultText(`INTERCEPTION! Drive over.`);
             setTimeout(() => onGameEnd(totalGrit), 2000);
             return;
        }

        setResultText(`Defense called ${defenseCall}. You gained ${yardsGained} yards!`);
        const newYardline = yardline + yardsGained;
        setBallPosition(newYardline);

        setTimeout(() => {
            setYardline(newYardline);
            const firstDownGrit = (toGo - yardsGained <= 0) ? 10 : 0;
            setTotalGrit(g => g + Math.max(0, Math.floor(yardsGained/2)) + firstDownGrit);

            if (newYardline >= 100) {
                setResultText(`TOUCHDOWN!`);
                const finalGrit = totalGrit + Math.max(0, Math.floor(yardsGained/2)) + firstDownGrit + 25;
                setTotalGrit(finalGrit);
                setTimeout(() => onGameEnd(finalGrit), 2000);
                return;
            }

            const newToGo = toGo - yardsGained;
            setTimeout(() => {
                if (down + 1 > 4 && newToGo > 0) {
                     setResultText(`Turnover on downs. Drive over.`);
                     setTimeout(() => onGameEnd(totalGrit), 2000);
                } else {
                     if (newToGo <= 0) { setDown(1); setToGo(10); } 
                     else { setDown(d => d + 1); setToGo(newToGo); }
                    setGameState('picking');
                }
            }, 1500);
        }, 500);
    };

    return (
        <div className="bg-green-700 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2">Play Calling Challenge</h2>
            <div className="bg-green-800 p-2 rounded mb-4">
                <div className="flex justify-between text-lg font-bold">
                    <span>{down}{down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th'} & {toGo > 0 ? toGo : 'Goal'}</span>
                    <span>Total Grit: {totalGrit}</span>
                </div>
                <div className="w-full bg-gray-600 h-8 rounded mt-2 relative">
                    {[...Array(11)].map((_,i) => <div key={i} className="absolute top-0 h-full w-px bg-white/50" style={{left: `${i*10}%`}}><span className="absolute -top-5 text-xs -translate-x-1/2">{i*10}</span></div>)}
                    <div className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-500 ease-out" style={{ left: `calc(${Math.min(100, ballPosition)}% - 12px)` }}>🏈</div>
                </div>
            </div>
            
            {gameState === 'picking' ? (
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => handlePlayCall('Run')} className="bg-blue-600 hover:bg-blue-700 p-4 rounded font-bold">RUN</button>
                    <button onClick={() => handlePlayCall('Short Pass')} className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded font-bold">SHORT PASS</button>
                    <button onClick={() => handlePlayCall('Deep Pass')} className="bg-red-600 hover:bg-red-700 p-4 rounded font-bold">DEEP PASS</button>
                </div>
            ) : (
                <p className="text-2xl font-bold animate-pulse h-16 flex items-center justify-center">{resultText}</p>
            )}
        </div>
    );
};

const RunningBackMinigame: React.FC<{ onGameEnd: (grit: number) => void }> = ({ onGameEnd }) => {
    const [attempts, setAttempts] = useState(3);
    const [totalGrit, setTotalGrit] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'running' | 'tackled'>('ready');
    const [rbPos, setRbPos] = useState({ x: 50, y: 90 });
    const [defenders, setDefenders] = useState<{ id: number; x: number; y: number }[]>([]);
    const [yards, setYards] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const touchStartRef = useRef(0);

    const startRun = () => {
        setRbPos({ x: 50, y: 90 });
        setYards(0);
        setDefenders([]);
        setGameState('running');
    };

    const handleJuke = useCallback((direction: 'left' | 'right') => {
        if (gameState !== 'running') return;
        setRbPos(prev => {
            const newX = prev.x + (direction === 'right' ? 10 : -10);
            return { ...prev, x: Math.max(5, Math.min(95, newX)) }
        });
    }, [gameState]);

    const gameLoop = useCallback(() => {
        setRbPos(prevRbPos => {
            const newRbY = prevRbPos.y - 0.4;
            const currentYards = Math.floor((90 - newRbY) / 2);
            setYards(currentYards);
            
            let wasTackled = false;

            setDefenders(prevDefenders => {
                const newDefenders = prevDefenders.map(d => ({ ...d, y: d.y + 0.2 })).filter(d => d.y < 100);
                if (Math.random() < 0.08) {
                    newDefenders.push({ id: Date.now(), x: Math.random() * 90 + 5, y: Math.max(0, newRbY - 50) });
                }
                
                wasTackled = newDefenders.some(d => Math.sqrt(Math.pow(d.x - prevRbPos.x, 2) + Math.pow(d.y - prevRbPos.y, 2)) < 5);

                return newDefenders;
            });
    
            if (wasTackled || newRbY <= 0) {
                const gritGained = currentYards + (newRbY <= 0 ? 25 : 0);
                setTotalGrit(prev => prev + gritGained);
                setGameState('tackled');
            } else {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
            }

            return { ...prevRbPos, y: newRbY };
        });
    }, []);

    useEffect(() => {
        if (gameState === 'running') {
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [gameState, gameLoop]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handleJuke('left');
            if (e.key === 'ArrowRight') handleJuke('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJuke]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartRef.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const touchEnd = e.changedTouches[0].clientX;
        if (touchStartRef.current - touchEnd > 50) {
            handleJuke('left');
        } else if (touchStartRef.current - touchEnd < -50) {
            handleJuke('right');
        }
        touchStartRef.current = touchEnd;
    };


    const nextAttempt = () => {
        if (attempts > 1) {
            setAttempts(a => a - 1);
            setGameState('ready');
        } else {
            onGameEnd(totalGrit);
        }
    };

    return (
        <div className="bg-green-800 p-6 rounded-lg shadow-xl w-full max-w-lg text-center border-4 border-white">
            <h2 className="text-3xl font-graduate mb-2">Running Back Rush</h2>
            <p className="mb-2">Attempts Left: {attempts} | Total Grit: {totalGrit} | Yards This Run: {yards}</p>
            <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} className="relative w-full h-80 mx-auto bg-green-700 border-2 border-gray-400 my-4 cursor-pointer overflow-hidden">
                {[...Array(10)].map((_, i) => <div key={i} className="absolute h-px w-full bg-green-600" style={{ top: `${i * 10}%` }} />)}
                <div className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs" style={{ left: `${rbPos.x}%`, top: `${rbPos.y}%`, transform: 'translate(-50%, -50%)' }}>RB</div>
                {defenders.map(d => <div key={d.id} className="absolute w-6 h-6 bg-red-600 rounded-full" style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }} />)}
            </div>
            {gameState === 'ready' && <button onClick={startRun} className="bg-blue-600 p-3 rounded font-bold">Start Run</button>}
            {gameState === 'tackled' && <button onClick={nextAttempt} className="bg-gray-600 p-3 rounded font-bold">{attempts > 1 ? 'Next Attempt' : 'Finish'}</button>}
            {gameState === 'running' && <p className="font-bold h-10">Use Arrow Keys or Swipe to Juke!</p>}
        </div>
    );
};


const MinigameModal: React.FC<{ onGameEnd: (grit: number) => void; gameType: MinigameType; player: PlayerState }> = ({ onGameEnd, gameType, player }) => {
    let gameComponent;
    switch (gameType) {
        case 'kicking': gameComponent = <KickingMinigame onGameEnd={onGameEnd} />; break;
        case 'quarterback': gameComponent = <QuarterbackMinigame onGameEnd={onGameEnd} />; break;
        case 'play_calling': gameComponent = <PlayCallingMinigame onGameEnd={onGameEnd} />; break;
        case 'running_back': gameComponent = <RunningBackMinigame onGameEnd={onGameEnd} />; break;
        case 'fantasy_draft': gameComponent = <FantasyDraftMinigame onGameEnd={onGameEnd} />; break;
        case 'commentary_battle': gameComponent = <CommentaryBattleMinigame onGameEnd={onGameEnd} />; break;
        case 'trivia_night': gameComponent = <TriviaNightMinigame onGameEnd={onGameEnd} />; break;
        case 'beer_die': gameComponent = <BeerDieChallengeMinigame onGameEnd={onGameEnd} />; break;
        case 'sunday_scaries': gameComponent = <SundayScariesMinigame onGameEnd={onGameEnd} playerName={player.name} />; break;
        case 'commish_chaos': gameComponent = <CommishChaosMinigame onGameEnd={onGameEnd} />; break;
        case 'ty_window': gameComponent = <TyWindowMinigame onGameEnd={onGameEnd} />; break;
        case 'bitchless_chronicles': gameComponent = <BitchlessChroniclesMinigame onGameEnd={onGameEnd} playerName={player.name} />; break;
        default: gameComponent = <p>No game selected.</p>;
    }
    return <ModalWrapper>{gameComponent}</ModalWrapper>;
}

const StoreModal: React.FC<{ onExit: () => void; onPurchase: (item: StoreItem) => void; grit: number; inventory: string[] }> = ({ onExit, onPurchase, grit, inventory }) => {
    const [currentItems, setCurrentItems] = useState<StoreItem[]>([]);

    useEffect(() => {
        const availableItems = allStoreItems.filter(item => !inventory.includes(item.id) || item.type === 'consumable');
        const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
        setCurrentItems(shuffled.slice(0, 3));
    }, [inventory]);

    return (
        <ModalWrapper>
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-purple-500/30 neon-purple">
                <h2 className="text-5xl font-orbitron text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">The Store</h2>
                <p className="text-center text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-8 font-orbitron">Your Grit: {grit}</p>
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {currentItems.map(item => (
                        <button key={item.id} onClick={() => onPurchase(item)} disabled={grit < item.cost} className="btn-modern w-full glass hover:bg-white/10 p-5 rounded-2xl text-left disabled:opacity-50 disabled:hover:bg-transparent transition-all border-2 border-purple-500/20 hover:border-purple-500/50">
                            <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">{item.name}</h3>
                            <p className="text-gray-200 mb-3 text-base">{item.desc}</p>
                            <p className="text-yellow-400 font-bold text-xl font-orbitron flex items-center gap-2">
                                <span className="text-2xl">💎</span> {item.cost} Grit
                            </p>
                        </button>
                    ))}
                </div>
                <button onClick={onExit} className="btn-modern w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-4 px-5 rounded-2xl mt-8 text-xl font-orbitron shadow-lg border border-red-400/30 neon-pink">Exit Store</button>
            </div>
        </ModalWrapper>
    );
};

const ManageLifeModal: React.FC<{ player: PlayerState, onExit: () => void, onAction: (action: ManageLifeAction) => void }> = ({ player, onExit, onAction }) => {
    const playerActions = manageLifeActions[player.id] || manageLifeActions.default;

    return (
        <ModalWrapper>
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-red-500/30 neon-pink">
                <h2 className="text-5xl font-orbitron text-center mb-8 bg-gradient-to-r from-red-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">Manage Your Life</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {playerActions.map(action => (
                        <button key={action.name} onClick={() => onAction(action)} disabled={player.energy < action.cost} className="btn-modern w-full glass hover:bg-white/10 p-5 rounded-2xl text-left disabled:opacity-50 disabled:hover:bg-transparent transition-all border-2 border-red-500/20 hover:border-red-500/50">
                            <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">{action.name}</h3>
                            <p className="text-gray-200 text-base mb-3">{action.message.split('.')[0]}.</p>
                            <p className="text-yellow-400 font-bold text-xl font-orbitron flex items-center gap-2">
                                <span className="text-2xl">⚡</span> {action.cost} Energy
                            </p>
                        </button>
                    ))}
                </div>
                <button onClick={onExit} className="btn-modern w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-5 rounded-2xl mt-8 text-xl font-orbitron shadow-lg border border-gray-500/30">Close</button>
            </div>
        </ModalWrapper>
    );
};

const RoastModal: React.FC<{ characters: PlayerState[], onRoast: (targetId: string) => void, onExit: () => void }> = ({ characters, onRoast, onExit }) => (
    <ModalWrapper>
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-orange-500/30 neon-orange">
            <h2 className="text-5xl font-orbitron text-center mb-8 bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">🔥 Who Are You Roasting? 🔥</h2>
            <div className="grid grid-cols-3 gap-4">
                {characters.map(char => (
                    <button key={char.id} onClick={() => onRoast(char.id)} className="btn-modern glass hover:bg-white/10 p-4 rounded-2xl text-center font-bold border-2 border-red-500/30 hover:border-red-500/70 transition-all neon-pink font-orbitron text-white">
                        {char.name}
                    </button>
                ))}
            </div>
            <button onClick={onExit} className="btn-modern w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-5 rounded-2xl mt-8 text-xl font-orbitron shadow-lg border border-gray-500/30">Cancel</button>
        </div>
    </ModalWrapper>
);

const AchievementModal: React.FC<{ onExit: () => void, unlocked: string[] }> = ({ onExit, unlocked }) => (
    <ModalWrapper>
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-yellow-500/30 neon-green">
            <h2 className="text-5xl font-orbitron text-center mb-8 bg-gradient-to-r from-yellow-400 via-green-500 to-emerald-600 bg-clip-text text-transparent">🏆 Achievements 🏆</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {allAchievements.map(ach => (
                    <div key={ach.id} className={`p-5 rounded-2xl transition-all ${unlocked.includes(ach.id) ? 'glass border-2 border-green-500/50 neon-green' : 'bg-gray-800/30 border-2 border-gray-600/30 opacity-50'}`}>
                        <h3 className="font-bold text-2xl text-white mb-2 font-orbitron flex items-center gap-2">
                            <span className="text-3xl">{unlocked.includes(ach.id) ? '✅' : '🔒'}</span>
                            {ach.name}
                        </h3>
                        <p className="text-base text-gray-200">{ach.description}</p>
                    </div>
                ))}
            </div>
            <button onClick={onExit} className="btn-modern w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-5 rounded-2xl mt-8 text-xl font-orbitron shadow-lg border border-gray-500/30">Close</button>
        </div>
    </ModalWrapper>
);

const DailyEventModal: React.FC<{ event: GameEvent, onClose: () => void }> = ({ event, onClose }) => (
    <ModalWrapper>
        <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-cyan-500/30 neon-blue">
            <h2 className="text-5xl font-orbitron text-center mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">📅 Daily Event</h2>
            <div className="glass p-6 rounded-2xl border-2 border-cyan-500/20 mb-6">
                <h3 className="text-3xl font-bold text-white mb-4 font-orbitron">{event.name}</h3>
                <p className="text-xl text-gray-200 mb-6">{event.description}</p>
                <div className="space-y-2">
                    <p className="text-lg font-semibold text-cyan-400 font-orbitron">Effects:</p>
                    {event.effects.map((effect, index) => (
                        <p key={index} className="text-base text-white ml-4">
                            <span className={effect.value >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {effect.value >= 0 ? '+' : ''}{effect.value}
                            </span>
                            {' '}{effect.targetStat}
                        </p>
                    ))}
                </div>
            </div>
            <button onClick={onClose} className="btn-modern w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-5 rounded-2xl text-xl font-orbitron shadow-lg border border-cyan-400/30 neon-blue">Continue</button>
        </div>
    </ModalWrapper>
);


// --- MAIN GAME SCREEN COMPONENT ---

interface GameScreenProps {
  initialData: { player: PlayerState, ranking: PlayerState[] } | any;
  onGameEnd: (report: EndGameReport, finalRanking: PlayerState[]) => void;
  onTriggerDatingSim?: (scenario: any) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ initialData, onGameEnd, onTriggerDatingSim }) => {
  const [playerState, setPlayerState] = useState<PlayerState>(initialData.player || initialData.playerState);
  const [ranking, setRanking] = useState<PlayerState[]>(initialData.ranking);
  const [day, setDay] = useState(() => initialData.day || 1);
  const [week, setWeek] = useState(() => initialData.week || 1);
  const [weeklyGritGoal, setWeeklyGritGoal] = useState(() => initialData.weeklyGritGoal || 100);
  const [inventory, setInventory] = useState<string[]>(() => initialData.inventory || []);
  const [storyFeed, setStoryFeed] = useState<Message[]>(() => initialData.storyFeed || []);
  const [playerInput, setPlayerInput] = useState('');
  const [typingCharacter, setTypingCharacter] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'store' | 'minigame' | 'manage' | 'roast' | 'achievements' | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(() => initialData.timeOfDay || 0);
  const [nextMinigame, setNextMinigame] = useState<MinigameType>(() => initialData.nextMinigame || 'kicking');
  const [seasonGoals, setSeasonGoals] = useState<SeasonGoal[]>(() => initialData.seasonGoals || []);
  const [isSending, setIsSending] = useState(false);
  const [propBets, setPropBets] = useState<PropBet[]>(() => initialData.propBets || []);
  const [currentDailyEvent, setCurrentDailyEvent] = useState<GameEvent | null>(null);
  
  // Dynasty Mode: Global State
  const [globalState, setGlobalState] = useState<GlobalState>(() => initialData.globalState || {
    cringeMeter: 0,
    entertainmentMeter: 50,
    season: 1,
    week: 1,
    day: 1
  });
  
  // Dynasty Mode: Newbie system and special events
  const [newbiePresent, setNewbiePresent] = useState(() => initialData.newbiePresent || false);
  const [newbieName, setNewbieName] = useState(() => initialData.newbieName || 'The Spammer');
  const [isKicked, setIsKicked] = useState(false);
  const [kickClickCount, setKickClickCount] = useState(0);
  const [tyWindowOpen, setTyWindowOpen] = useState(false);
  const [tyWindowStartTime, setTyWindowStartTime] = useState<number | null>(null);
  
  // Notification states for visual feedback
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [statChangeQueue, setStatChangeQueue] = useState<Array<{ stat: string; change: number; id: string }>>([]);

  const feedEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const MINIGAMES: MinigameType[] = ['kicking', 'quarterback', 'play_calling', 'running_back', 'fantasy_draft', 'commentary_battle', 'trivia_night', 'beer_die', 'sunday_scaries', 'commish_chaos', 'ty_window', 'bitchless_chronicles'];
  const DAY_DURATION_MS = 90 * 1000;

  const addSystemMessage = useCallback((text: string) => {
    setStoryFeed(prev => [...prev, { speaker: 'system', text, role: 'system' }]);
  }, []);

  const handleNpcConversation = useCallback(async () => {
    if (typingCharacter) return;
    
    try {
      const newMessages = await initiateNpcConversation(storyFeed, ranking, playerState.id);
      
      if (newMessages.length > 0) {
          for (const msg of newMessages) {
              const speakerName = characterData[msg.speaker]?.name;
              setTypingCharacter(speakerName);
              await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 1000));
              setTypingCharacter(null);
              setStoryFeed(prev => [...prev, msg]);
              soundService.playMessageReceived();
          }
      }
    } catch (error) {
      console.error('Error initiating NPC conversation:', error);
      // Silently fail - don't interrupt gameplay
    }
  }, [playerState.id, storyFeed, typingCharacter, ranking]);
  
  // Dynasty Mode: Check for newbie (Season 2+)
  useEffect(() => {
    if (globalState.season > 1 && !newbiePresent && Math.random() < 0.3) {
      const newbieNames = ['The Spammer', 'The Lurker', 'The Try-Hard', 'The Random', 'Bot #1337'];
      const selectedName = newbieNames[Math.floor(Math.random() * newbieNames.length)];
      setNewbieName(selectedName);
      setNewbiePresent(true);
      addSystemMessage(`🆕 A newbie has joined the chat: ${selectedName}`);
    }
  }, [globalState.season, newbiePresent, addSystemMessage]);

  // Initialization
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (!initialData.day) { // Is a new game
        addSystemMessage(`Welcome to the season. The player with the most Grit after ${SEASON_LENGTH} weeks wins the All-In Meal and eternal glory. Good luck.`);
        setNextMinigame(MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)]);
        setSeasonGoals(getSeasonGoalsForPlayer(playerState.id));
        setStoryFeed(prev => [...prev, 
            { speaker: 'spencer', text: 'alright guys, new season, new league.', role: 'model'},
            { speaker: 'eric', text: 'lets get it. ALL IN.', role: 'model'}
        ]);
    }
  }, [addSystemMessage, initialData.day, playerState.id]);

  const runRandomEvent = useCallback(() => {
      for (const event of randomEvents) {
          if (event.trigger(playerState, day, week)) {
              // Check if this is a dating sim trigger event
              if ((event.id === 'bitchless_chronicles_elie' || event.id === 'bitchless_chronicles_craif') && onTriggerDatingSim) {
                  addSystemMessage(event.message);
                  
                  // Find the appropriate scenario
                  const character = event.id === 'bitchless_chronicles_elie' ? 'elie' : 'craif';
                  const scenario = fullDatingScenarios.find(s => s.character === character);
                  
                  if (scenario) {
                      // Trigger the dating sim screen
                      setTimeout(() => {
                          onTriggerDatingSim(scenario);
                      }, 2000); // Give player time to read the event message
                  }
                  return;
              }
              
              // Normal event processing
              addSystemMessage(event.message);
              setRanking(prev => prev.map(p => {
                  if (p.id === playerState.id) {
                      const newStats: PlayerState = { ...p };
                      if (event.grit) newStats.grit += event.grit;
                      for (const key in event.effects) {
                          const statKey = key as keyof PlayerState;
                          const value = event.effects[statKey] as number;
                           const currentVal = newStats[statKey] as number | undefined;
                           if (typeof currentVal === 'number') {
                              (newStats[statKey] as number) = Math.max(0, Math.min(100, currentVal + value));
                          }
                      }
                      return newStats;
                  }
                  return p;
              }));
              return;
          }
      }
  }, [playerState, day, week, addSystemMessage, onTriggerDatingSim]);
  
  // Dynasty Mode: Trigger special events
  const triggerDynastyEvent = useCallback(() => {
    const rand = Math.random();
    
    // The Joke Kick (5% chance)
    if (rand < 0.05 && !isKicked) {
      addSystemMessage("🚪 THE JOKE KICK: You've been temporarily kicked from the chat!");
      setIsKicked(true);
      setKickClickCount(0);
      return;
    }
    
    // Pace South Coup (3% chance)
    if (rand < 0.08 && rand >= 0.05) {
      addSystemMessage("⚡ PACE SOUTH COUP: The Pace South faction is causing drama!");
      const paceSouthMembers = ['pace', 'seth', 'justin'];
      
      // Reduce fandom for Eric North members
      const ericNorthMembers = ['eric', 'aaron', 'colin'];
      setRanking(prev => prev.map(p => {
        if (ericNorthMembers.includes(p.id)) {
          return { ...p, fandom: Math.max(0, p.fandom - 15) };
        }
        return p;
      }));
      
      if (ericNorthMembers.includes(playerState.id)) {
        addSystemMessage("You're part of Eric North - your fandom took a hit! [-15 Fandom]");
      }
      return;
    }
    
    // Ty Window (2% chance)
    if (rand < 0.10 && rand >= 0.08 && !tyWindowOpen) {
      addSystemMessage("🪟 TY WINDOW IS OPEN! Shop prices reduced by 50% for 1 minute!");
      setTyWindowOpen(true);
      setTyWindowStartTime(Date.now());
      
      // Close after 60 seconds
      setTimeout(() => {
        setTyWindowOpen(false);
        setTyWindowStartTime(null);
        addSystemMessage("🪟 Ty Window closed. Prices back to normal.");
      }, 60000);
      return;
    }
  }, [playerState.id, isKicked, tyWindowOpen, addSystemMessage]);

  // Dynasty Mode: Trigger Daily Event
  const triggerDailyEvent = useCallback(() => {
    const randomEvent = gameEvents[Math.floor(Math.random() * gameEvents.length)];
    setCurrentDailyEvent(randomEvent);
    
    // Apply event effects
    randomEvent.effects.forEach(effect => {
      if (effect.targetStat === 'cringeMeter' || effect.targetStat === 'entertainmentMeter') {
        // Apply to global state
        setGlobalState(prev => ({
          ...prev,
          [effect.targetStat]: Math.max(0, Math.min(100, prev[effect.targetStat] + effect.value))
        }));
      } else if (effect.targetStat === 'grit') {
        // Apply grit to player (unbounded accumulation, but prevent negative values)
        setRanking(prev => prev.map(p => p.id === playerState.id ? {
          ...p,
          grit: Math.max(0, p.grit + effect.value)
        } : p));
      } else if (effect.targetStat === 'loveLife' || effect.targetStat === 'fandom' || 
                 effect.targetStat === 'uniqueStatValue' || effect.targetStat === 'energy') {
        // Apply to player stats with bounds
        setRanking(prev => prev.map(p => p.id === playerState.id ? {
          ...p,
          [effect.targetStat]: Math.max(0, Math.min(100, p[effect.targetStat] + effect.value))
        } : p));
      }
    });
  }, [playerState.id]);

  // Dynasty Mode: Advance Day Function
  const advanceDay = useCallback(() => {
    // Trigger daily event
    triggerDailyEvent();
    
    // Reset energy
    setRanking(prev => prev.map(p => ({
      ...p,
      energy: 3,
    })));
    
    // Decay entertainment meter
    setGlobalState(prev => ({
      ...prev,
      entertainmentMeter: Math.max(0, prev.entertainmentMeter - 5),
    }));
    
    // Decay player's unique stat value
    setRanking(prev => prev.map(p => p.id === playerState.id ? {
      ...p,
      uniqueStatValue: Math.max(0, p.uniqueStatValue - 3),
    } : p));
    
    // Check win/loss conditions
    const currentPlayer = ranking.find(p => p.id === playerState.id);
    if (currentPlayer) {
      if (globalState.cringeMeter >= 100) {
        onGameEnd({
          title: "Dead Chat",
          message: "The cringe meter hit 100. The chat has died from too much cringe.",
          isEnd: true
        }, ranking);
        return;
      }
      
      if (globalState.entertainmentMeter <= 0) {
        onGameEnd({
          title: "Dead Chat",
          message: "The entertainment meter hit 0. Everyone left because the chat became boring.",
          isEnd: true
        }, ranking);
        return;
      }
      
      if (currentPlayer.uniqueStatValue <= 0) {
        const charDef = characterDefinitions.find(c => c.characterId === playerState.id);
        const statName = charDef?.uniqueStatName || 'unique stat';
        onGameEnd({
          title: "Kicked",
          message: `Your ${statName} dropped to 0. You've been kicked from the chat.`,
          isEnd: true
        }, ranking);
        return;
      }
    }
  }, [playerState.id, globalState, ranking, onGameEnd, triggerDailyEvent]);

  // Dynasty Mode: Sunday Resolution (NFL Simulation)
  const resolveWeek = useCallback(() => {
    const nflWin = Math.random() > 0.5;
    
    if (nflWin) {
      addSystemMessage("🏈 NFL SUNDAY: Your team WON! [+10 Fandom, +10 Entertainment]");
      setRanking(prev => prev.map(p => p.id === playerState.id ? {
        ...p,
        fandom: Math.min(100, p.fandom + 10),
      } : p));
      setGlobalState(prev => ({
        ...prev,
        entertainmentMeter: Math.min(100, prev.entertainmentMeter + 10),
      }));
    } else {
      addSystemMessage("🏈 NFL SUNDAY: Your team LOST. [-20 Fandom, +10 Cringe]");
      
      // Character-specific logic: Alex and Eagles
      let fandomLoss = -20;
      if (playerState.id === 'alex') {
        fandomLoss = -40; // Double penalty for Alex
        addSystemMessage("As an Eagles fan, this loss hurts twice as much...");
      }
      
      setRanking(prev => prev.map(p => p.id === playerState.id ? {
        ...p,
        fandom: Math.max(0, p.fandom + fandomLoss),
      } : p));
      setGlobalState(prev => ({
        ...prev,
        cringeMeter: Math.min(100, prev.cringeMeter + 10),
      }));
    }
  }, [playerState.id, addSystemMessage]);

  useEffect(() => {
      const allState = { playerState, ranking, day, week, weeklyGritGoal, inventory, storyFeed, timeOfDay, nextMinigame, seasonGoals, propBets, globalState, newbiePresent, newbieName };
      localStorage.setItem('miniBeastsSave', JSON.stringify(allState));
  }, [playerState, ranking, day, week, weeklyGritGoal, inventory, storyFeed, timeOfDay, nextMinigame, seasonGoals, propBets, globalState, newbiePresent, newbieName]);

  // Game Loop Timers
  useEffect(() => {
    const timeTimer = setInterval(() => setTimeOfDay(t => (t + (100 / (DAY_DURATION_MS / 100))) % 100), 100);
    const dayTimer = setInterval(() => {
          setDay(d => {
              const newDay = d + 1;
              if (newDay > DAYS_PER_WEEK) {
                  setWeek(w => {
                      const newWeek = w + 1;
                      
                      // Dynasty Mode: Call resolveWeek for Sunday NFL simulation
                      resolveWeek();
                      
                      if (playerState.grit >= weeklyGritGoal) {
                          addSystemMessage(`WEEKLY GOAL MET! You feel accomplished. [+15 Happiness, +25 Energy]`);
                          soundService.playWeekComplete();
                          soundService.playSuccess();
                          setRanking(prev => prev.map(p => p.id === playerState.id ? {...p, happiness: Math.min(100, p.happiness + 15), energy: Math.min(100, p.energy + 25)} : p));
                      } else {
                         addSystemMessage(`You missed your weekly grit goal... try harder. [-15 Happiness]`);
                         soundService.playError();
                         setRanking(prev => prev.map(p => p.id === playerState.id ? {...p, happiness: Math.max(0, p.happiness - 15)} : p));
                      }
                      setWeeklyGritGoal(g => g + 25);
                      if (newWeek > SEASON_LENGTH) {
                        onGameEnd({title: "Season Over", message: "The season has concluded. Check the final rankings.", isEnd: true}, ranking);
                      } else {
                        addSystemMessage(`--- It is now Week ${newWeek}. ---`);
                      }
                      return newWeek;
                  });
                  return 1;
              }
              addSystemMessage(`--- Day ${newDay} ---`);
              setTimeOfDay(0);
              
              // Dynasty Mode: Call advanceDay
              advanceDay();
              
              setRanking(prev => prev.map(p => ({ ...p, energy: Math.min(100, p.energy + 20), happiness: p.happiness - 2 })));
              return newDay;
          });
      }, DAY_DURATION_MS);
    const chatTimer = setInterval(() => { if (Math.random() < 0.25 && !typingCharacter && !activeModal) { handleNpcConversation(); } }, 25 * 1000);
    const eventTimer = setInterval(runRandomEvent, 20 * 1000);
    const dynastyEventTimer = setInterval(triggerDynastyEvent, 30 * 1000); // Dynasty events every 30 seconds

    return () => { clearInterval(timeTimer); clearInterval(dayTimer); clearInterval(chatTimer); clearInterval(eventTimer); clearInterval(dynastyEventTimer); };
  }, [week, playerState, weeklyGritGoal, addSystemMessage, DAY_DURATION_MS, typingCharacter, activeModal, handleNpcConversation, runRandomEvent, onGameEnd, ranking, advanceDay, resolveWeek, triggerDynastyEvent]);


  useEffect(() => { feedEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [storyFeed]);

  useEffect(() => {
    setPlayerState(ranking.find(p => p.id === playerState.id) || playerState);
  }, [ranking, playerState.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim() || isSending) return;
    
    soundService.playMessageSent();
    setIsSending(true);
    const newPlayerMessage: Message = { speaker: playerState.id, text: playerInput, role: 'user' };
    const currentHistory = [...storyFeed, newPlayerMessage];
    setStoryFeed(currentHistory);
    setPlayerInput('');
    
    const potentialResponders = ranking.filter(c => c.id !== playerState.id);
    const responder = potentialResponders[Math.floor(Math.random() * potentialResponders.length)];
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    setTypingCharacter(responder.name);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 1000));
    
    try {
      const responseText = await generateNpcResponse(currentHistory, responder, playerState.id);
      
      if (responseText) {
        setStoryFeed(prev => [...prev, { speaker: responder.id, text: responseText, role: 'model' }]);
        soundService.playMessageReceived();
      }
    } catch (error) {
      console.error('Error generating NPC response:', error);
      // Fallback response if AI fails
      const fallbackResponses = [
        "...",
        "lol",
        "what",
        "bruh",
        "huh?"
      ];
      const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setStoryFeed(prev => [...prev, { speaker: responder.id, text: fallback, role: 'model' }]);
      soundService.playError();
    }
    setTypingCharacter(null);
    setTimeout(() => setIsSending(false), 5000);
  };
  
  const handleAction = async (action: ManageLifeAction) => {
      const { updates, cost, message } = action;
      setRanking(prev => prev.map(p => {
          if (p.id === playerState.id) {
              const newStats: PlayerState = { ...p, energy: p.energy - cost };
              for (const key in updates) {
                  const statKey = key as keyof PlayerState;
                  const value = updates[statKey] as number;
                   const currentVal = newStats[statKey] as number | undefined;
                   if (typeof currentVal === 'number') {
                     (newStats[statKey] as number) = Math.max(0, Math.min(100, currentVal + value));
                     // Add notification for significant stat changes
                     if (Math.abs(value) >= 5) {
                       setStatChangeQueue(prev => [...prev, {
                         stat: String(key),
                         change: value,
                         id: `${Date.now()}-${key}`
                       }]);
                       if (value > 0) soundService.playSuccess();
                       else soundService.playError();
                     }
                  }
              }
              return newStats;
          }
          return p;
      }));
      addSystemMessage(message);
      setActiveModal(null);

      if (action.chatAction) {
          const { targetId, playerMessage } = action.chatAction;
          const playerMsg: Message = { speaker: playerState.id, text: playerMessage, role: 'user' };
          const currentHistory = [...storyFeed, playerMsg];
          setStoryFeed(currentHistory);

          const target = ranking.find(p => p.id === targetId);
          if (target) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTypingCharacter(target.name);
            await new Promise(resolve => setTimeout(resolve, 1500));
            const response = await generateNpcResponse(currentHistory, target, playerState.id);
            if (response) {
                setStoryFeed(prev => [...prev, { speaker: targetId, text: response, role: 'model' }]);
            }
            setTypingCharacter(null);
          }
      }
  };
  
  const handleRoast = async (targetId: string) => {
      setActiveModal(null);
      if (playerState.energy < 35) {
          addSystemMessage("You're too tired to think of a good roast.");
          return;
      }

      setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, energy: p.energy - 35 } : p));
      addSystemMessage("You're cooking up a roast...");

      const roasterData = ranking.find(p => p.id === playerState.id);
      const targetData = ranking.find(p => p.id === targetId);

      if (!roasterData || !targetData) return;
      
      try {
        const roastData = await generateRoastAndReactions(storyFeed, roasterData, targetData, ranking);

        if (!roastData) {
            addSystemMessage("[SYSTEM: Your roast attempt failed. API issue.]");
            soundService.playError();
            return;
        }

        const { roast, reactions, success } = roastData;
        setStoryFeed(prev => [...prev, roast]);
        soundService.playMessageSent();
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (const reaction of reactions) {
            const reactorName = characterData[reaction.speaker]?.name || 'Someone';
            setTypingCharacter(reactorName);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 800));
            setTypingCharacter(null);
            setStoryFeed(prev => [...prev, reaction]);
            soundService.playMessageReceived();
        }
        
        const targetName = characterData[targetId].name;
        if (success) {
            addSystemMessage(`Your roast on ${targetName} was legendary! [+20 Grit, +10 Happiness]`);
            setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, grit: p.grit + 20, happiness: Math.min(100, p.happiness + 10) } : p));
            soundService.playMinigameWin();
        } else {
            addSystemMessage(`Your roast on ${targetName} backfired horribly. [-20 Happiness]`);
            setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, happiness: Math.max(0, p.happiness - 20) } : p));
            soundService.playMinigameLoss();
        }
      } catch (error) {
        console.error('Error generating roast:', error);
        addSystemMessage("Your roast failed to send. Chat connection issue.");
        soundService.playError();
      }
  };

  const simulateNpcScores = async (gamePlayed: MinigameType, playerScore: number) => {
    const allChars = ranking.filter(c => c.id !== playerState.id);
    const shuffled = [...allChars].sort(() => 0.5 - Math.random());
    const participantCount = Math.random() > 0.5 ? 2 : 1;
    const participants = shuffled.slice(0, participantCount).map(npc => ({
        id: npc.id,
        name: npc.name,
        score: Math.floor(Math.random() * 40) + (11 - npc.rank),
        state: npc
    }));

    if (participants.length === 0) return;

    participants.forEach(npc => {
        addSystemMessage(`${npc.name} scored ${npc.score} in the ${gamePlayed} minigame.`);
    });
    
    try {
      const reactions = await generateNpcMinigameReactions(storyFeed, participants, gamePlayed);

      for (const reaction of reactions) {
          const speakerName = characterData[reaction.speaker]?.name;
          if (speakerName) {
              setTypingCharacter(speakerName);
              await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 1000));
              setTypingCharacter(null);
              setStoryFeed(prev => [...prev, reaction]);
          }
      }
    } catch (error) {
      console.error('Error generating minigame reactions:', error);
      // Silently fail - scores are already shown
    }
  };

  const handleMinigameEnd = (grit: number) => {
    const gamePlayed = nextMinigame;
    setActiveModal(null);
    setRanking(prev => prev.map(c => c.id === playerState.id ? { ...c, grit: c.grit + grit, energy: Math.max(0, c.energy - 25) } : c));
    
    addSystemMessage(`You scored ${grit} Grit in the ${gamePlayed} minigame!`);
    if (grit > 0) {
      soundService.playMinigameWin();
      soundService.playGritGain();
    } else {
      soundService.playMinigameLoss();
      soundService.playGritLoss();
    }
    
    // Add visual notification for grit change
    if (grit !== 0) {
      setStatChangeQueue(prev => [...prev, {
        stat: 'Grit',
        change: grit,
        id: `${Date.now()}-grit`
      }]);
    }

    setNextMinigame(MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)]);
    simulateNpcScores(gamePlayed, grit);
  };

  const handlePurchase = useCallback((item: StoreItem) => {
      // Apply Ty Window discount if active
      const finalCost = tyWindowOpen ? Math.floor(item.cost * 0.5) : item.cost;
      
      if (playerState.grit >= finalCost) {
          soundService.playPurchase();
          setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, grit: p.grit - finalCost } : p));
          if (item.type === 'permanent' || (item.type === 'consumable' && !inventory.includes(item.id))) {
              setInventory(prev => [...prev, item.id]);
          }
          
          if (tyWindowOpen) {
              addSystemMessage(`You bought the ${item.name} at 50% off! [${finalCost} Grit]`);
          } else {
              addSystemMessage(`You bought the ${item.name}!`);
          }
          
          // Handle special items
          if (item.id === 'haters_parlay') {
              const isSuccess = Math.random() > 0.5;
              const effect = isSuccess ? 30 : -20;
              setRanking(prev => prev.map(p => p.id === playerState.id ? { 
                  ...p, 
                  fandom: Math.max(0, Math.min(100, p.fandom + effect)) 
              } : p));
              addSystemMessage(isSuccess ? 
                  "Hater's Parlay HIT! [+30 Fandom]" : 
                  "Hater's Parlay MISSED. [-20 Fandom]");
          }
      }
  }, [tyWindowOpen, playerState.grit, inventory, addSystemMessage]);

  // --- PROP BET LOGIC ---
    useEffect(() => {
        const betTimer = setInterval(() => {
            if (propBets.filter(b => !b.isResolved).length < 3 && Math.random() < 0.2) {
                const availableBets = propBetTemplates.filter(t => !propBets.some(b => b.id === t.id && !b.isResolved));
                if (availableBets.length > 0) {
                    const template = availableBets[Math.floor(Math.random() * availableBets.length)];
                    const newBet: PropBet = {
                        ...template,
                        wager: 25,
                        isResolved: false,
                        isCorrect: null,
                        playerChoice: null,
                        isLocked: false,
                        createdAtIndex: storyFeed.length,
                    };
                    setPropBets(prev => [...prev, newBet]);
                }
            }
        }, 30 * 1000);
        return () => clearInterval(betTimer);
    }, [propBets, storyFeed.length]);

    useEffect(() => {
        setPropBets(prevBets => {
            let betsChanged = false;
            const updatedBets = prevBets.map(bet => {
                if (bet.isResolved) return bet;

                const checkResult = bet.check(storyFeed.slice(bet.createdAtIndex), playerState);
                const shouldExpire = storyFeed.length > bet.createdAtIndex + 15;

                if (checkResult === true) {
                    betsChanged = true;
                    if (bet.isLocked) {
                        const win = bet.playerChoice === 'yes';
                        addSystemMessage(`Prop Bet HIT: "${bet.text}" You chose YES and won ${bet.wager * 2} Grit!`);
                        setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, grit: p.grit + (win ? bet.wager * 2 : 0) } : p));
                    } else {
                         addSystemMessage(`Prop Bet HIT: "${bet.text}" The bet is off.`);
                    }
                    return { ...bet, isResolved: true, isCorrect: true };
                } else if (shouldExpire) {
                    betsChanged = true;
                     if (bet.isLocked) {
                        const win = bet.playerChoice === 'no';
                        addSystemMessage(`Prop Bet MISSED: "${bet.text}" You chose NO and won ${bet.wager * 2} Grit!`);
                        setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, grit: p.grit + (win ? bet.wager * 2 : 0) } : p));
                    } else {
                         addSystemMessage(`Prop Bet EXPIRED: "${bet.text}" The bet is off.`);
                    }
                    return { ...bet, isResolved: true, isCorrect: false };
                }
                return bet;
            });
            return betsChanged ? updatedBets : prevBets;
        });
    }, [storyFeed, playerState, addSystemMessage]);

    const handlePlaceBet = (betId: string, choice: 'yes' | 'no') => {
        if (playerState.grit < 25) {
            addSystemMessage("Not enough Grit to place a bet.");
            return;
        }
        setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, grit: p.grit - 25 } : p));
        setPropBets(prev => prev.map(b => b.id === betId ? { ...b, playerChoice: choice, isLocked: true } : b));
        addSystemMessage(`You bet 25 Grit that the answer to "${propBetTemplates.find(t=>t.id === betId)?.text}" is ${choice.toUpperCase()}.`);
    };

  // Dynasty Mode: Newbie action handlers
  const handleHazeNewbie = useCallback(() => {
    if (playerState.energy < 20) {
      addSystemMessage("Not enough energy to haze the newbie.");
      return;
    }
    
    setRanking(prev => prev.map(p => p.id === playerState.id ? {
      ...p,
      energy: p.energy - 20,
      grit: p.grit + 15
    } : p));
    
    addSystemMessage(`You hazed ${newbieName}. Not cool, but you gained some grit. [+15 Grit, -20 Energy]`);
    setGlobalState(prev => ({
      ...prev,
      cringeMeter: Math.min(100, prev.cringeMeter + 5)
    }));
  }, [playerState.id, playerState.energy, newbieName, addSystemMessage]);

  const handleMentorNewbie = useCallback(() => {
    if (playerState.energy < 20) {
      addSystemMessage("Not enough energy to mentor the newbie.");
      return;
    }
    
    setRanking(prev => prev.map(p => p.id === playerState.id ? {
      ...p,
      energy: p.energy - 20,
    } : p));
    
    addSystemMessage(`You mentored ${newbieName}. Good vibes. [-20 Energy]`);
    setGlobalState(prev => ({
      ...prev,
      entertainmentMeter: Math.min(100, prev.entertainmentMeter + 10)
    }));
  }, [playerState.id, playerState.energy, newbieName, addSystemMessage]);

  // Dynasty Mode: Handle "The Joke Kick" event
  const handleLetMeIn = useCallback(() => {
    setKickClickCount(prev => prev + 1);
    
    if (kickClickCount + 1 >= 10) {
      setIsKicked(false);
      setKickClickCount(0);
      addSystemMessage("You've been let back in! It was just a joke... or was it?");
    }
  }, [kickClickCount, addSystemMessage]);

  // Effect for checking and completing goals
  useEffect(() => {
    const updatedGoals = seasonGoals.map(goal => {
      if (goal.isCompleted) return goal;

      let isNowComplete = false;
      switch (goal.id) {
        case 'grit_250': isNowComplete = playerState.grit >= 250; break;
        case 'store_3': isNowComplete = inventory.filter(id => allStoreItems.find(item => item.id === id)?.type === 'permanent').length >= 3; break;
        case 'roast_elie': isNowComplete = storyFeed.some(msg => msg.role === 'system' && msg.text.includes('roast on Elie was legendary')); break;
        case 'minigame_win': isNowComplete = storyFeed.some(msg => msg.role === 'system' && (parseInt(msg.text.match(/scored (\d+) Grit/)?.[1] || '0') > 40)); break;
        case 'aaron_stress': isNowComplete = playerState.paSchoolStress < 30; break;
        case 'elie_ego': isNowComplete = (playerState.ego || 0) > 90; break;
        case 'colin_parlay': isNowComplete = (playerState.parlayAddiction || 0) < 50; break;
        case 'spencer_power': isNowComplete = (playerState.commishPower || 0) > 75; break;
        case 'pace_clout': isNowComplete = (playerState.clout || 0) > 80; break;
      }
      
      if (isNowComplete) {
        addSystemMessage(`GOAL COMPLETE: ${goal.description} [+${goal.gritReward} Grit]`);
        soundService.playGoalComplete();
        setRanking(prev => prev.map(p => p.id === playerState.id ? {...p, grit: p.grit + goal.gritReward} : p));
        return { ...goal, isCompleted: true };
      }
      return goal;
    });
    setSeasonGoals(updatedGoals);
  }, [playerState, inventory, storyFeed, addSystemMessage, seasonGoals]);
  
  // Effect for achievements
  useEffect(() => {
    const checkAchievements = () => {
        let achievementsUnlocked = false;
        const newUnlocked = [...playerState.unlockedAchievements];

        const unlock = (id: string) => {
            if (!newUnlocked.includes(id)) {
                newUnlocked.push(id);
                const achievement = allAchievements.find(a => a.id === id);
                if (achievement) {
                    addSystemMessage(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}`);
                    soundService.playAchievement(); // Use dedicated achievement sound
                    // Add to notification queue for visual popup
                    setAchievementQueue(prev => [...prev, achievement]);
                }
                achievementsUnlocked = true;
            }
        };

        if (storyFeed.some(msg => msg.role === 'system' && msg.text.includes('roast on'))) unlock('FIRST_ROAST');
        if (storyFeed.some(msg => msg.role === 'system' && msg.text.includes('roast on Elie was legendary'))) unlock('ROAST_ELIE');
        if (storyFeed.some(msg => msg.role === 'system' && msg.text.includes('PARLAY HIT'))) unlock('HIT_PARLAY');
        if (storyFeed.some(msg => msg.role === 'system' && (parseInt(msg.text.match(/scored (\d+) Grit/)?.[1] || '0') > 50))) unlock('MINIGAME_MASTER');
        if (inventory.some(id => allStoreItems.find(item => item.id === id)?.type === 'permanent')) unlock('BUY_PERMANENT');
        if (storyFeed.some(msg => msg.role === 'system' && msg.text.includes("backfired horribly"))) unlock('ROAST_FAIL');
        if (storyFeed.some(msg => msg.speaker === 'ty')) unlock('TY_WINDOW');
        if (week >= 9) unlock('MID_SEASON');

        if (achievementsUnlocked) {
            setRanking(prev => prev.map(p => p.id === playerState.id ? { ...p, unlockedAchievements: newUnlocked } : p));
        }
    };
    checkAchievements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyFeed, inventory, playerState.id, week]);


  // Effect for handling permanent item bonuses
  useEffect(() => {
    const lastMessage = storyFeed[storyFeed.length - 1];
    if (!lastMessage || lastMessage.role === 'system' || lastMessage.role === 'user') return;

    let gritBonus = 0;
    let bonusSource = '';

    if (inventory.includes('kj') && lastMessage.speaker === 'eric' && (lastMessage.text.includes('kj') || lastMessage.text.includes('evans'))) {
        gritBonus = 5; bonusSource = 'KJ Osborn Jersey';
    } else if (inventory.includes('chiro') && lastMessage.speaker === 'spencer' && lastMessage.text.includes('joint')) {
        gritBonus = 5; bonusSource = 'Chiropractic Ad';
    } else if (inventory.includes('terry') && lastMessage.speaker === 'seth' && lastMessage.text.includes('terry')) {
        gritBonus = 5; bonusSource = 'Terry McLaurin RC';
    } else if (inventory.includes('truck') && lastMessage.speaker === 'andrew' && lastMessage.text.includes('truck')) {
        gritBonus = 3; bonusSource = 'Truck Nuts';
    } else if (inventory.includes('nerd_emoji') && lastMessage.speaker === 'justin' && lastMessage.text.includes('🤓')) {
        gritBonus = 3; bonusSource = 'Nerd Emoji License';
    }
    
    if (gritBonus > 0) {
        addSystemMessage(`(${bonusSource}) [+${gritBonus} Grit]`);
        setRanking(prev => prev.map(p => p.id === playerState.id ? {...p, grit: p.grit + gritBonus} : p));
    }
  }, [storyFeed, inventory, addSystemMessage, playerState.id]);


  return (
    <div className="w-full h-screen flex max-w-7xl mx-auto game-container">
      {activeModal === 'minigame' && <MinigameModal gameType={nextMinigame} onGameEnd={handleMinigameEnd} player={playerState} />}
      {activeModal === 'store' && <StoreModal onExit={() => setActiveModal(null)} onPurchase={handlePurchase} grit={playerState.grit} inventory={inventory} />}
      {activeModal === 'manage' && <ManageLifeModal player={playerState} onExit={() => setActiveModal(null)} onAction={handleAction} />}
      {activeModal === 'roast' && <RoastModal characters={ranking.filter(c=>c.id !== playerState.id)} onRoast={handleRoast} onExit={() => setActiveModal(null)} />}
      {activeModal === 'achievements' && <AchievementModal onExit={() => setActiveModal(null)} unlocked={playerState.unlockedAchievements} />}
      
      {/* Daily Event Modal */}
      {currentDailyEvent && <DailyEventModal event={currentDailyEvent} onClose={() => setCurrentDailyEvent(null)} />}
      
      {/* Dynasty Mode: The Joke Kick Event */}
      {isKicked && (
        <ModalWrapper>
          <div className="glass-dark p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border-4 border-red-600 neon-pink">
            <h2 className="text-6xl font-orbitron mb-8 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">🚪 YOU'VE BEEN KICKED</h2>
            <p className="text-2xl mb-8 text-white font-semibold">Click "Let me in" 10 times to return...</p>
            <p className="text-gray-300 mb-6 text-xl font-orbitron">Clicks: <span className="text-cyan-400 font-bold">{kickClickCount}/10</span></p>
            <button
              onClick={handleLetMeIn}
              className="btn-modern bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-5 px-12 rounded-2xl text-2xl font-orbitron shadow-2xl border border-red-400/30"
            >
              LET ME IN
            </button>
          </div>
        </ModalWrapper>
      )}
      
      {/* Dynasty Mode: Newbie Actions */}
      {newbiePresent && !isKicked && (
        <div className="fixed bottom-24 right-6 glass-dark p-5 rounded-2xl shadow-2xl border-2 border-yellow-500/50 z-30 neon-green">
          <h3 className="font-orbitron text-xl mb-3 bg-gradient-to-r from-yellow-400 to-green-500 bg-clip-text text-transparent font-bold">🆕 {newbieName}</h3>
          <p className="text-sm text-gray-300 mb-4 font-semibold">A newbie is in the chat</p>
          <div className="flex gap-2">
            <button
              onClick={handleHazeNewbie}
              disabled={playerState.energy < 20}
              className="btn-modern bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 px-4 py-3 rounded-xl font-bold text-sm border border-red-400/30 font-orbitron"
            >
              Haze (20 ⚡)
            </button>
            <button
              onClick={handleMentorNewbie}
              disabled={playerState.energy < 20}
              className="btn-modern bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 px-4 py-3 rounded-xl font-bold text-sm border border-green-400/30 font-orbitron"
            >
              Mentor (20 ⚡)
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col">
        <HUD 
          player={playerState}
          day={day}
          week={week}
          weeklyGritGoal={weeklyGritGoal}
          onActionClick={(action) => setActiveModal(action)}
          timeOfDay={timeOfDay}
          nextMinigame={nextMinigame}
          seasonGoals={seasonGoals}
        />
        
        <div className="flex-1 overflow-y-auto pr-2 p-4 space-y-4 custom-scrollbar glass-dark border-l border-r border-blue-500/10">
          {storyFeed.map((msg, i) => <MessageBubble key={i} msg={msg} playerId={playerState.id} />)}
          {typingCharacter && <div className="flex justify-start text-cyan-400 italic text-sm ml-14 font-semibold animate-pulse">💬 {typingCharacter} is typing...</div>}
          <div ref={feedEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 md:p-5 glass-dark border-t-2 border-blue-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 glass text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 placeholder-gray-400 font-medium"
            />
            <button type="button" onClick={() => setActiveModal('roast')} className="btn-modern bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-4 px-5 rounded-2xl disabled:opacity-50 border border-red-400/30 neon-pink font-orbitron" disabled={isSending || playerState.energy < 35}>
              🔥
            </button>
            <button type="submit" className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-2xl disabled:opacity-50 border border-blue-400/30 neon-blue font-orbitron" disabled={isSending || !playerInput.trim()}>
              {isSending ? <Spinner /> : 'Send'}
            </button>
          </div>
        </form>
      </div>
      <div className="hidden lg:block w-80 flex-shrink-0 glass-dark p-5 border-l-2 border-purple-500/30 overflow-y-auto custom-scrollbar">
          <h3 className="font-orbitron text-2xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-5 text-center font-bold">💰 Prop Bets</h3>
          <div className="space-y-4">
              {propBets.filter(b => !b.isResolved).length === 0 && <p className="text-gray-400 text-sm text-center italic">No active bets right now...</p>}
              {propBets.filter(b => !b.isResolved).map(bet => (
                  <div key={bet.id} className="glass p-4 rounded-2xl border-2 border-yellow-500/30 shadow-lg">
                      <p className="text-sm text-white mb-3 font-semibold">{bet.text}</p>
                      {bet.isLocked ? (
                          <div className="text-center font-bold font-orbitron">
                              <p className="text-gray-300">Your Pick: <span className={bet.playerChoice === 'yes' ? 'text-green-400' : 'text-red-400'}>{bet.playerChoice?.toUpperCase()}</span></p>
                          </div>
                      ) : (
                          <div className="flex gap-2">
                              <button onClick={() => handlePlaceBet(bet.id, 'yes')} className="btn-modern w-1/2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl p-2 text-sm font-bold font-orbitron border border-green-400/30">YES ({bet.wager}💎)</button>
                              <button onClick={() => handlePlaceBet(bet.id, 'no')} className="btn-modern w-1/2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl p-2 text-sm font-bold font-orbitron border border-red-400/30">NO ({bet.wager}💎)</button>
                          </div>
                      )}
                  </div>
              ))}
               {propBets.filter(b => b.isResolved).length > 0 && <hr className="my-4 border-gray-600"/> }
               {propBets.filter(b => b.isResolved).slice(-3).reverse().map(bet => (
                  <div key={bet.id} className="bg-gray-800 p-3 rounded-lg opacity-60">
                      <p className="text-sm text-gray-400 line-through">{bet.text}</p>
                      <p className="text-center font-bold text-sm mt-1">
                          {bet.isLocked ? `Result: ${bet.isCorrect ? 'HIT' : 'MISSED'}. You ${bet.playerChoice === 'yes' && bet.isCorrect || bet.playerChoice === 'no' && !bet.isCorrect ? 'WON' : 'LOST'}` : 'Result: EXPIRED'}
                      </p>
                  </div>
              ))}
          </div>
      </div>
      
      {/* Achievement Notifications */}
      <AchievementNotification
        achievements={achievementQueue}
        onDismiss={(id) => setAchievementQueue(prev => prev.filter(a => a.id !== id))}
      />
      
      {/* Stat Change Notifications */}
      <StatChangeNotification
        changes={statChangeQueue}
        onDismiss={(id) => setStatChangeQueue(prev => prev.filter(c => c.id !== id))}
      />
    </div>
  );
};