import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fantasyDraftPlayers, triviaData, commentaryBattleData } from '../constants';

// ============================================================================
// FANTASY DRAFT: CHAMPIONSHIP BUILDER - ULTIMATE EDITION
// ============================================================================
// New: Trade system, waiver wire, injuries, synergies, live scoring, playoff simulation
export const UltraFantasyDraftMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [currentRound, setCurrentRound] = useState(0);
    const [team, setTeam] = useState<typeof fantasyDraftPlayers[0]>([]);
    const [benchedPlayers, setBenchedPlayers] = useState<typeof fantasyDraftPlayers[0]>([]);
    const [grit, setGrit] = useState(0);
    const [gamePhase, setGamePhase] = useState<'draft' | 'waiver' | 'trade' | 'simulating' | 'playoffs' | 'ended'>('draft');
    const [teamSynergy, setTeamSynergy] = useState(0);
    const [draftStrategy, setDraftStrategy] = useState<'safe' | 'risky' | 'balanced'>('balanced');
    const [tradeOffers, setTradeOffers] = useState<Array<{player: string; for: string}>>([]);
    const [weekScores, setWeekScores] = useState<number[]>([]);
    const [injuries, setInjuries] = useState<string[]>([]);
    const [specialAbilityUsed, setSpecialAbilityUsed] = useState(false);
    const [message, setMessage] = useState('');
    const [animatingPlayer, setAnimatingPlayer] = useState<string | null>(null);

    // Character-specific special abilities
    const useSpecialAbility = () => {
        if (specialAbilityUsed) return;
        
        setSpecialAbilityUsed(true);
        
        if (playerName.toLowerCase() === 'eric') {
            // Eric's "ALL-IN" mode - force all risky picks to succeed
            setMessage('🔥 ERIC\'S ALL-IN MODE ACTIVATED! Next pick guaranteed high ceiling!');
            setDraftStrategy('risky');
        } else if (playerName.toLowerCase() === 'elie') {
            // Elie overthinks and gets a worse pick
            setMessage('🤓 Elie\'s overthinking penalty! -10 to next pick projection!');
        } else if (playerName.toLowerCase() === 'justin') {
            // Justin screenshots opponent's worst pick
            setMessage('📸 Justin screenshotted your worst draft pick! +20 grit for the meme!');
            setGrit(prev => prev + 20);
        } else {
            setMessage('⭐ Special ability: Draft insight revealed!');
        }
    };

    const draftPlayer = (player: typeof fantasyDraftPlayers[0][0]) => {
        const newTeam = [...team, player];
        setTeam(newTeam);
        setAnimatingPlayer(player.name);
        setTimeout(() => setAnimatingPlayer(null), 800);

        // Apply strategy and character effects
        let gritEarned = 0;
        let projectionBonus = 0;
        
        // Character-specific bonuses
        if (playerName.toLowerCase() === 'eric' && specialAbilityUsed && player.type === 'High-Ceiling') {
            projectionBonus = 15;
            setMessage(`💪 DAWG MOVE! ${player.name} +${projectionBonus} projection!`);
        } else if (playerName.toLowerCase() === 'elie' && specialAbilityUsed) {
            projectionBonus = -10;
            setMessage(`😅 Overthought it... ${player.name} -10 projection`);
        }
        
        // Strategy-based rewards
        if (player.type === 'Gritty Vet') {
            gritEarned = draftStrategy === 'safe' ? 25 : 20;
        } else if (player.type === 'Safe Stud') {
            gritEarned = draftStrategy === 'balanced' ? 20 : 15;
        } else {
            // High-ceiling player
            const busted = draftStrategy === 'risky' ? Math.random() > 0.65 : Math.random() > 0.5;
            gritEarned = busted ? 5 : (draftStrategy === 'risky' ? 40 : 30);
            
            if (!busted) {
                setMessage(`🎯 ${player.name} HIT! High-ceiling play paid off!`);
            } else {
                setMessage(`💀 ${player.name} BUSTED... That's the risk!`);
            }
        }

        // Calculate synergy bonus
        if (newTeam.length >= 2) {
            const lastTwo = newTeam.slice(-2);
            if (lastTwo.every(p => p.type === 'Gritty Vet')) {
                setTeamSynergy(prev => prev + 15);
                setMessage('🤝 GRIT SYNERGY! Two vets = +15 synergy bonus!');
            }
        }

        setGrit(prev => prev + gritEarned);

        // Random injury chance (keeps it realistic)
        if (Math.random() < 0.15) {
            setInjuries(prev => [...prev, player.name]);
            setMessage(`⚠️ INJURY UPDATE: ${player.name} questionable for Week 1!`);
        }

        if (currentRound < fantasyDraftPlayers.length - 1) {
            setCurrentRound(currentRound + 1);
        } else {
            // Generate trade offers after draft
            generateTradeOffers(newTeam);
            setGamePhase('trade');
        }
    };

    const generateTradeOffers = (currentTeam: typeof fantasyDraftPlayers[0]) => {
        const offers = currentTeam.slice(0, 2).map(player => ({
            player: player.name,
            for: ['DeAndre Hopkins', 'Travis Kelce', 'Saquon Barkley'][Math.floor(Math.random() * 3)]
        }));
        setTradeOffers(offers);
        setMessage('📊 Trade offers are in! Accept one or move to waivers?');
    };

    const acceptTrade = (offer: typeof tradeOffers[0]) => {
        setMessage(`✅ Trade accepted! ${offer.player} for ${offer.for}`);
        setGrit(prev => prev + 25);
        setTeam(prev => prev.filter(p => p.name !== offer.player));
        setGamePhase('waiver');
    };

    const skipTrades = () => {
        setGamePhase('waiver');
    };

    const addWaiverWirePlayer = () => {
        const waiverPlayers = [
            { name: "Breakout RB", type: "High-Ceiling", projection: 25, risk: 35, notes: "Backup who might start" },
            { name: "Consistent WR3", type: "Safe Stud", projection: 12, risk: 10, notes: "Always good for 8-10 points" },
        ];
        const pick = waiverPlayers[Math.floor(Math.random() * waiverPlayers.length)];
        setBenchedPlayers(prev => [...prev, pick as any]);
        setMessage(`📥 Added ${pick.name} from waivers!`);
        setGrit(prev => prev + 10);
    };

    const simulateSeason = () => {
        setGamePhase('simulating');
        setMessage('🏈 Simulating regular season...');
        
        // Simulate 13 weeks
        const scores: number[] = [];
        let weekDelay = 0;
        
        for (let week = 0; week < 13; week++) {
            setTimeout(() => {
                const totalProjection = team.reduce((sum, p) => sum + p.projection, 0);
                const synergy = teamSynergy;
                const injuryPenalty = injuries.length * 5;
                
                // Random variance each week
                const variance = Math.floor(Math.random() * 30) - 15;
                const weekScore = Math.max(0, totalProjection + synergy - injuryPenalty + variance);
                
                scores.push(weekScore);
                setWeekScores(scores);
                
                if (weekScore > 100) {
                    setMessage(`🔥 Week ${week + 1}: ${weekScore} pts - HUGE WEEK!`);
                } else if (weekScore < 50) {
                    setMessage(`😬 Week ${week + 1}: ${weekScore} pts - rough week...`);
                } else {
                    setMessage(`📊 Week ${week + 1}: ${weekScore} pts`);
                }
                
                if (week === 12) {
                    setTimeout(() => {
                        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                        if (avgScore >= 80) {
                            setGamePhase('playoffs');
                            setMessage('🏆 You made the PLAYOFFS! Time for the championship run!');
                        } else {
                            setGamePhase('ended');
                            setMessage('💀 Season over. Missed playoffs. Better luck next year...');
                        }
                    }, 1500);
                }
            }, weekDelay);
            weekDelay += 500;
        }
    };

    const simulatePlayoffs = () => {
        setMessage('🏆 PLAYOFF SIMULATION STARTING...');
        
        const avgScore = weekScores.reduce((a, b) => a + b, 0) / weekScores.length;
        const playoffBonus = teamSynergy * 2;
        const finalScore = avgScore + playoffBonus;
        
        setTimeout(() => {
            if (finalScore >= 90) {
                setMessage('🎉🏆 CHAMPIONSHIP WON! You are the LEAGUE CHAMPION!');
                setGrit(prev => prev + 150);
            } else if (finalScore >= 80) {
                setMessage('🥈 Runner-up! Lost in the finals. Still a great season!');
                setGrit(prev => prev + 75);
            } else {
                setMessage('😢 Playoff loss. One and done. So close...');
                setGrit(prev => prev + 30);
            }
            setTimeout(() => setGamePhase('ended'), 2000);
        }, 2000);
    };

    const endGame = () => {
        const totalProjection = team.reduce((sum, p) => sum + p.projection, 0);
        const finalBonus = totalProjection > 75 ? 50 : totalProjection > 60 ? 25 : 0;
        const synergyBonus = teamSynergy;
        onGameEnd(grit + finalBonus + synergyBonus);
    };

    if (gamePhase === 'ended') {
        const totalProjection = team.reduce((sum, p) => sum + p.projection, 0);
        const avgWeekScore = weekScores.length > 0 ? weekScores.reduce((a, b) => a + b, 0) / weekScores.length : 0;

        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-green-500/50">
                <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    🏈 Season Complete! 🏈
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-lg md:text-xl">
                    <div className="bg-blue-900 p-4 rounded-xl">
                        <p className="text-sm text-gray-300">Draft Projection</p>
                        <p className="text-2xl md:text-3xl font-bold">{totalProjection}</p>
                    </div>
                    <div className="bg-green-900 p-4 rounded-xl">
                        <p className="text-sm text-gray-300">Avg Week Score</p>
                        <p className="text-2xl md:text-3xl font-bold">{Math.round(avgWeekScore)}</p>
                    </div>
                    <div className="bg-purple-900 p-4 rounded-xl">
                        <p className="text-sm text-gray-300">Team Synergy</p>
                        <p className="text-2xl md:text-3xl font-bold">+{teamSynergy}</p>
                    </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl mb-4 max-h-48 overflow-y-auto">
                    <h3 className="font-bold mb-2">Your Championship Roster:</h3>
                    {team.map((player, i) => (
                        <div key={i} className="text-sm mb-1 flex justify-between">
                            <span>{player.name} ({player.type})</span>
                            <span className="text-green-400">{player.projection} pts</span>
                        </div>
                    ))}
                </div>
                <div className="text-yellow-300 italic mb-6">{message}</div>
                <p className="text-2xl md:text-3xl font-bold mb-6">Total Grit: {grit}</p>
                <button onClick={endGame} className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xl transform hover:scale-105 transition-all">
                    Finish Season
                </button>
            </div>
        );
    }

    if (gamePhase === 'playoffs') {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-yellow-500/50 animate-pulse">
                <h2 className="text-5xl font-orbitron mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    🏆 PLAYOFF TIME 🏆
                </h2>
                <p className="text-2xl mb-6">You made it to the playoffs! Time to prove yourself!</p>
                <div className="text-xl mb-6 text-yellow-300">{message}</div>
                <button 
                    onClick={simulatePlayoffs}
                    className="px-12 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-bold text-2xl transform hover:scale-110 transition-all"
                >
                    SIMULATE PLAYOFFS
                </button>
            </div>
        );
    }

    if (gamePhase === 'simulating') {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-blue-500/50">
                <h2 className="text-4xl font-orbitron mb-6">📊 Season in Progress...</h2>
                <div className="mb-6">
                    <p className="text-xl mb-4">{message}</p>
                    <div className="bg-gray-900 p-4 rounded-xl">
                        <h3 className="font-bold mb-2">Weekly Scores:</h3>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {weekScores.map((score, i) => (
                                <div key={i} className={`p-2 rounded ${score > 100 ? 'bg-green-600' : score < 50 ? 'bg-red-600' : 'bg-gray-700'}`}>
                                    <div className="text-xs">W{i + 1}</div>
                                    <div className="font-bold">{score}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gamePhase === 'waiver') {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-cyan-500/50">
                <h2 className="text-4xl font-orbitron mb-6">📥 Waiver Wire</h2>
                <p className="text-xl mb-6">Add depth to your roster before the season starts!</p>
                <div className="space-y-4 mb-6">
                    <button 
                        onClick={addWaiverWirePlayer}
                        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-xl w-full"
                    >
                        Claim Waiver Player
                    </button>
                    <button 
                        onClick={simulateSeason}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl w-full"
                    >
                        Start Season →
                    </button>
                </div>
                {benchedPlayers.length > 0 && (
                    <div className="bg-gray-900 p-4 rounded-xl">
                        <h3 className="font-bold mb-2">Bench:</h3>
                        {benchedPlayers.map((p, i) => (
                            <div key={i} className="text-sm">{p.name}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (gamePhase === 'trade') {
        return (
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-orange-500/50">
                <h2 className="text-4xl font-orbitron mb-6">🔄 Trade Offers</h2>
                <p className="text-xl mb-6">Your league mates want to make deals!</p>
                <div className="space-y-4 mb-6">
                    {tradeOffers.map((offer, i) => (
                        <button
                            key={i}
                            onClick={() => acceptTrade(offer)}
                            className="w-full p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold text-lg"
                        >
                            Trade away {offer.player} → Get {offer.for}
                        </button>
                    ))}
                    <button 
                        onClick={skipTrades}
                        className="w-full px-8 py-4 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold text-xl"
                    >
                        Skip Trades
                    </button>
                </div>
            </div>
        );
    }

    // Draft phase
    const round = fantasyDraftPlayers[currentRound];

    return (
        <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-5xl text-center border-4 border-green-500/50">
            <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                🏈 Fantasy Draft Championship Builder
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 text-sm md:text-lg">
                <div className="bg-green-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Round {currentRound + 1}/3</p>
                </div>
                <div className="bg-yellow-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Grit: {grit}</p>
                </div>
                <div className="bg-purple-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Synergy: +{teamSynergy}</p>
                </div>
                <div className="bg-blue-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold text-xs md:text-base">{draftStrategy.toUpperCase()}</p>
                </div>
            </div>

            {message && (
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-3 md:p-4 rounded-xl mb-4 border-2 border-blue-500 animate-pulse">
                    <p className="text-base md:text-xl font-bold text-yellow-300">{message}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center mb-4">
                <button
                    onClick={() => setDraftStrategy('safe')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-bold text-sm md:text-base ${draftStrategy === 'safe' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                    🛡️ Safe
                </button>
                <button
                    onClick={() => setDraftStrategy('balanced')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-bold text-sm md:text-base ${draftStrategy === 'balanced' ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                    ⚖️ Balanced
                </button>
                <button
                    onClick={() => setDraftStrategy('risky')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-bold text-sm md:text-base ${draftStrategy === 'risky' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                    🎲 Risky
                </button>
                {!specialAbilityUsed && (
                    <button
                        onClick={useSpecialAbility}
                        className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-sm md:text-base"
                    >
                        ⭐ Special
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {round.map((player, i) => (
                    <button
                        key={i}
                        onClick={() => draftPlayer(player)}
                        className={`p-4 md:p-6 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-2xl font-bold transform hover:scale-105 transition-all ${
                            animatingPlayer === player.name ? 'ring-4 ring-green-500 animate-pulse' : ''
                        }`}
                    >
                        <div className="text-lg md:text-2xl mb-2">{player.name}</div>
                        <div className="text-xs md:text-sm text-yellow-400 mb-2">{player.type}</div>
                        <div className="text-xs text-gray-300 mb-3">{player.notes}</div>
                        <div className="flex justify-between text-xs md:text-sm">
                            <span className="text-green-400">Proj: {player.projection}</span>
                            <span className="text-red-400">Risk: {player.risk}%</span>
                        </div>
                    </button>
                ))}
            </div>

            {injuries.length > 0 && (
                <div className="mt-4 p-3 bg-red-900/50 rounded-xl">
                    <p className="text-sm">⚠️ Injured: {injuries.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// TRIVIA NIGHT: BRAIN BATTLE - ULTIMATE EDITION
// ============================================================================
// New: Lifelines, streaks, time pressure, character-specific categories, lightning round
export const UltraTriviaNightMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(20);
    const [lifelines, setLifelines] = useState({ fiftyFifty: true, askGroup: true, skip: true });
    const [eliminatedAnswers, setEliminatedAnswers] = useState<number[]>([]);
    const [groupSuggestion, setGroupSuggestion] = useState<number | null>(null);
    const [lightningRound, setLightningRound] = useState(false);
    const [roastMessage, setRoastMessage] = useState('');
    const [multiplier, setMultiplier] = useState(1);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const question = triviaData[currentQuestion];

    useEffect(() => {
        if (!answered && !lightningRound) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAnswer(-1); // Time's up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [answered, currentQuestion, lightningRound]);

    // Trigger lightning round after question 3
    useEffect(() => {
        if (currentQuestion === 3 && streak >= 3) {
            setLightningRound(true);
            setTimeLeft(10);
            setRoastMessage('⚡ LIGHTNING ROUND! Streak bonus activated! 2x multiplier!');
            setMultiplier(2);
        }
    }, [currentQuestion, streak]);

    const handleAnswer = (index: number) => {
        if (answered) return;

        if (timerRef.current) clearInterval(timerRef.current);
        setSelectedAnswer(index);
        setAnswered(true);

        const correct = index === question.correct;
        
        if (correct) {
            // Time bonus
            const timeBonus = lightningRound ? 10 : Math.floor(timeLeft / 2);
            const streakBonus = streak * 5;
            const points = (20 + timeBonus + streakBonus) * multiplier;
            
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            setMaxStreak(prev => Math.max(prev, streak + 1));
            
            const reactions = [
                "🔥 That's what I'm talking about!",
                "💪 BIG BRAIN ENERGY!",
                "🎯 LOCK IT IN!",
                "👑 NFL SCHOLAR!",
            ];
            setRoastMessage(reactions[Math.floor(Math.random() * reactions.length)]);
        } else {
            setStreak(0);
            setMultiplier(1);
            
            // Character-specific roasts
            if (playerName.toLowerCase() === 'elie') {
                setRoastMessage("🤓 Elie: 'Actually, I think the question was wrong...'");
            } else if (playerName.toLowerCase() === 'justin') {
                setRoastMessage("📸 Justin just screenshot this wrong answer for later");
            } else {
                const roasts = [
                    "💀 WRONG! Did you even watch football?",
                    "😂 Colin is laughing at you",
                    "🤡 That's embarrassing...",
                    "💩 Stick to fantasy, not trivia",
                ];
                setRoastMessage(roasts[Math.floor(Math.random() * roasts.length)]);
            }
        }
    };

    const useFiftyFifty = () => {
        if (!lifelines.fiftyFifty || answered) return;
        
        setLifelines(prev => ({ ...prev, fiftyFifty: false }));
        
        // Eliminate 2 wrong answers
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== question.correct);
        const toEliminate = wrongAnswers.slice(0, 2);
        setEliminatedAnswers(toEliminate);
        setRoastMessage("🎯 50/50 used! Two wrong answers eliminated!");
    };

    const useAskGroup = () => {
        if (!lifelines.askGroup || answered) return;
        
        setLifelines(prev => ({ ...prev, askGroup: false }));
        
        // 70% chance group suggests correct answer
        const suggestion = Math.random() < 0.7 ? question.correct : 
            Math.floor(Math.random() * 4);
        
        setGroupSuggestion(suggestion);
        
        const groupResponses = [
            `📱 Eric: "It's gotta be ${question.answers[suggestion]}, that's the ALL-IN answer"`,
            `💬 Justin: "Pretty sure it's ${question.answers[suggestion]}"`,
            `🤓 Elie: "Based on my analysis, ${question.answers[suggestion]}"`,
            `👍 Alex: "${question.answers[suggestion]} no doubt"`,
        ];
        
        setRoastMessage(groupResponses[Math.floor(Math.random() * groupResponses.length)]);
    };

    const useSkip = () => {
        if (!lifelines.skip || answered) return;
        
        setLifelines(prev => ({ ...prev, skip: false }));
        setRoastMessage("⏭️ Question skipped! Moving on...");
        
        setTimeout(() => {
            nextQuestion();
        }, 1000);
    };

    const nextQuestion = () => {
        if (currentQuestion < triviaData.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setAnswered(false);
            setSelectedAnswer(null);
            setTimeLeft(lightningRound ? 10 : 20);
            setEliminatedAnswers([]);
            setGroupSuggestion(null);
            setRoastMessage('');
        } else {
            // Perfect game bonus
            const perfectBonus = maxStreak === triviaData.length ? 100 : 0;
            onGameEnd(score + perfectBonus);
        }
    };

    return (
        <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-indigo-500/50">
            <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🧠 {lightningRound ? '⚡ LIGHTNING ROUND ⚡' : 'NFL Trivia Night'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-sm md:text-base">
                <div className="bg-blue-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Q {currentQuestion + 1}/{triviaData.length}</p>
                </div>
                <div className="bg-green-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Score: {score}</p>
                </div>
                <div className="bg-orange-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Streak: {streak}🔥</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg font-bold ${timeLeft <= 5 ? 'bg-red-900 animate-pulse' : 'bg-purple-900'}`}>
                    <p>⏱️ {timeLeft}s</p>
                </div>
                <div className="bg-yellow-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">x{multiplier}</p>
                </div>
            </div>

            {roastMessage && (
                <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-3 md:p-4 rounded-xl mb-4 border-2 border-purple-500">
                    <p className="text-base md:text-xl italic text-yellow-300">{roastMessage}</p>
                </div>
            )}

            <div className="bg-gray-900 p-4 md:p-6 rounded-xl mb-6">
                <p className="text-xl md:text-2xl font-bold">{question.question}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                {question.answers.map((answer, index) => {
                    let bgColor = 'bg-gray-700 hover:bg-gray-600';
                    let isDisabled = eliminatedAnswers.includes(index);
                    
                    if (answered) {
                        if (index === question.correct) {
                            bgColor = 'bg-green-600';
                        } else if (index === selectedAnswer) {
                            bgColor = 'bg-red-600';
                        }
                    } else if (groupSuggestion === index) {
                        bgColor = 'bg-blue-700 hover:bg-blue-600 ring-2 ring-blue-400';
                    }
                    
                    if (isDisabled) {
                        bgColor = 'bg-gray-900 opacity-30';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={answered || isDisabled}
                            className={`p-3 md:p-4 ${bgColor} rounded-xl font-bold text-base md:text-lg disabled:cursor-default transition-all transform hover:scale-105`}
                        >
                            {answer}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-4">
                <button
                    onClick={useFiftyFifty}
                    disabled={!lifelines.fiftyFifty || answered}
                    className="px-3 md:px-6 py-2 md:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg font-bold text-sm md:text-base"
                >
                    🎯 50/50
                </button>
                <button
                    onClick={useAskGroup}
                    disabled={!lifelines.askGroup || answered}
                    className="px-3 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg font-bold text-sm md:text-base"
                >
                    📱 Ask Group
                </button>
                <button
                    onClick={useSkip}
                    disabled={!lifelines.skip || answered}
                    className="px-3 md:px-6 py-2 md:py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg font-bold text-sm md:text-base"
                >
                    ⏭️ Skip
                </button>
            </div>

            {answered && (
                <button
                    onClick={nextQuestion}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-xl transform hover:scale-105 transition-all"
                >
                    {currentQuestion < triviaData.length - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                </button>
            )}
        </div>
    );
};

// ============================================================================
// COMMENTARY BATTLE: HOT TAKE HAVOC - ULTIMATE EDITION
// ============================================================================
// New: Roast meter, alignment system, viral moments, group explosion, multiple rounds, boss round
export const UltraCommentaryBattleMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [score, setScore] = useState(0);
    const [roastMeter, setRoastMeter] = useState(0);
    const [groupExplosion, setGroupExplosion] = useState(0);
    const [characterAlignment, setCharacterAlignment] = useState<{[key: string]: number}>({
        eric: 0,
        elie: 0,
        justin: 0,
        alex: 0,
        colin: 0
    });
    const [viralMoments, setViralMoments] = useState(0);
    const [hotTakeActive, setHotTakeActive] = useState(false);
    const [screenshotByJustin, setScreenshotByJustin] = useState(false);
    const [message, setMessage] = useState('');
    const [round, setRound] = useState(1);
    const [bossRound, setBossRound] = useState(false);

    const scenario = commentaryBattleData[currentScenario];

    const handleChoice = (option: typeof commentaryBattleData[0]['options'][0]) => {
        let points = option.points;
        
        // Apply hot take multiplier
        if (hotTakeActive) {
            points *= 2;
            setMessage(`🔥 HOT TAKE MULTIPLIER! ${option.text} (${points} pts)`);
            setHotTakeActive(false);
        } else {
            setMessage(option.text);
        }

        // Update character alignment
        if ('for' in option && option.for) {
            setCharacterAlignment(prev => ({
                ...prev,
                [option.for as string]: prev[option.for as string] + 1
            }));
        }

        // Check for viral moment (high scoring take)
        if (points >= 12) {
            setViralMoments(prev => prev + 1);
            setMessage(`📸 VIRAL MOMENT! Justin screenshotted that take! +${points} pts`);
            setScreenshotByJustin(true);
            setTimeout(() => setScreenshotByJustin(false), 2000);
        }

        // Update roast meter based on take quality
        if (points <= 5) {
            setRoastMeter(prev => Math.min(100, prev + 20));
            setMessage(`${option.text} - 😬 The group is roasting you for that weak take...`);
        } else if (points >= 15) {
            setRoastMeter(prev => Math.max(0, prev - 10));
            setMessage(`${option.text} - 🔥 FIRE TAKE! The group is impressed!`);
        }

        // Group explosion increases with controversial takes
        if (points >= 10) {
            setGroupExplosion(prev => Math.min(100, prev + 15));
        }

        const newScore = score + points;
        setScore(newScore);

        // Boss round trigger
        if (currentScenario === commentaryBattleData.length - 1 && !bossRound) {
            setBossRound(true);
            setMessage('🎙️ FINAL BOSS: Defend your WORST take of all time!');
            return;
        }

        if (currentScenario < commentaryBattleData.length - 1) {
            setTimeout(() => {
                setCurrentScenario(prev => prev + 1);
                setMessage('');
                
                // Advance round every 3 scenarios
                if ((currentScenario + 1) % 3 === 0) {
                    setRound(prev => prev + 1);
                    setMessage('🎉 Round complete! Stakes are getting higher!');
                }
            }, 2000);
        } else if (!bossRound) {
            // Final scoring
            endGame();
        }
    };

    const activateHotTake = () => {
        if (!hotTakeActive && roastMeter < 50) {
            setHotTakeActive(true);
            setMessage('🔥 HOT TAKE MODE! Next answer worth 2x points!');
        }
    };

    const defendWorstTake = (defense: 'double-down' | 'apologize' | 'blame-others') => {
        let bonus = 0;
        
        if (defense === 'double-down') {
            bonus = score >= 35 ? 50 : 10;
            setMessage(bonus > 10 ? 
                '💪 DOUBLED DOWN! The group respects the confidence! +50 grit' :
                '😬 Doubled down but the take was still trash... +10 grit'
            );
        } else if (defense === 'apologize') {
            bonus = 25;
            setMessage('😔 Apologized. The group accepts it. Respectable. +25 grit');
        } else {
            bonus = roastMeter > 50 ? 40 : 15;
            setMessage(bonus > 15 ?
                "🎯 Blamed it on the group! They're PISSED but it's funny +40 grit" :
                "👎 Tried to blame others. Didn't land. +15 grit"
            );
        }
        
        setScore(prev => prev + bonus);
        setTimeout(() => endGame(), 2000);
    };

    const endGame = () => {
        // Alignment bonuses
        const alignmentBonus = Object.values(characterAlignment).reduce((sum, val) => sum + (val * 5), 0);
        const viralBonus = viralMoments * 15;
        const explosionPenalty = groupExplosion > 80 ? -20 : 0;
        
        const finalScore = score + alignmentBonus + viralBonus + explosionPenalty;
        onGameEnd(Math.max(finalScore, 10));
    };

    if (bossRound) {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-red-500/50 animate-pulse">
                <h2 className="text-3xl md:text-5xl font-orbitron mb-6 bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    🎙️ BOSS ROUND: DEFEND YOUR TAKE 🎙️
                </h2>
                <div className="bg-gray-900 p-4 md:p-6 rounded-xl mb-6">
                    <p className="text-lg md:text-2xl italic">
                        "Remember when you said {playerName.toLowerCase() === 'elie' ? 'the Eagles were frauds' : 'that terrible take'}? The whole group remembers. Defend it NOW."
                    </p>
                </div>
                <div className="space-y-3 md:space-y-4">
                    <button
                        onClick={() => defendWorstTake('double-down')}
                        className="w-full p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl font-bold text-lg"
                    >
                        💪 Double Down - "I was RIGHT and you know it!"
                    </button>
                    <button
                        onClick={() => defendWorstTake('apologize')}
                        className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg"
                    >
                        😔 Apologize - "Yeah that was bad, my fault"
                    </button>
                    <button
                        onClick={() => defendWorstTake('blame-others')}
                        className="w-full p-4 bg-gradient-to-r from-yellow-600 to-green-600 hover:from-yellow-700 hover:to-green-700 rounded-xl font-bold text-lg"
                    >
                        🎯 Blame the Group - "Y'all MADE me say that!"
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-gray-500/50">
            <h2 className="text-3xl md:text-5xl font-orbitron mb-4 bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600 bg-clip-text text-transparent">
                🎙️ Commentary Battle: Hot Take Havoc
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm md:text-base">
                <div className="bg-green-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Score: {score}</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${roastMeter > 70 ? 'bg-red-900' : roastMeter > 40 ? 'bg-orange-900' : 'bg-gray-900'}`}>
                    <p className="font-bold">Roast: {roastMeter}%</p>
                </div>
                <div className="bg-purple-900 p-2 md:p-3 rounded-lg">
                    <p className="font-bold">Round {round}</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${groupExplosion > 70 ? 'bg-red-900 animate-pulse' : 'bg-blue-900'}`}>
                    <p className="font-bold">💥 {groupExplosion}%</p>
                </div>
            </div>

            {screenshotByJustin && (
                <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-3 md:p-4 rounded-xl mb-4 border-2 border-cyan-500 animate-pulse">
                    <p className="text-lg md:text-2xl">📸 Justin: "Screenshot. This is going in the vault."</p>
                </div>
            )}

            {message && (
                <div className="bg-gray-900 p-3 md:p-4 rounded-xl mb-4">
                    <p className="text-base md:text-xl italic text-yellow-300">{message}</p>
                </div>
            )}

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-6 rounded-xl mb-6 border-2 border-gray-700">
                <p className="text-lg md:text-xl italic text-gray-200">{scenario.scenario}</p>
            </div>

            <p className="text-base md:text-lg mb-4 text-gray-300 font-bold">🎤 Drop your take:</p>
            
            <div className="space-y-3 mb-6">
                {scenario.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleChoice(option)}
                        className="w-full p-3 md:p-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl font-bold text-left transition-all transform hover:scale-102 text-sm md:text-base"
                    >
                        <div className="flex justify-between items-center">
                            <span>{option.text}</span>
                            <span className="text-sm text-green-400">+{hotTakeActive ? option.points * 2 : option.points}</span>
                        </div>
                    </button>
                ))}
            </div>

            {!hotTakeActive && roastMeter < 50 && (
                <button
                    onClick={activateHotTake}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold text-base md:text-xl mb-4 transform hover:scale-105 transition-all"
                >
                    🔥 Activate Hot Take (2x Points)
                </button>
            )}

            <div className="mt-4 p-3 bg-gray-900 rounded-xl">
                <p className="text-xs md:text-sm text-gray-400">Character Alignment: {Object.entries(characterAlignment).filter(([_, v]) => v > 0).map(([k, v]) => `${k}(+${v})`).join(', ') || 'None'}</p>
                {viralMoments > 0 && <p className="text-xs md:text-sm text-cyan-400">📸 Viral Moments: {viralMoments}</p>}
            </div>
        </div>
    );
};
