import React, { useState, useEffect, useCallback } from 'react';
import { datingScenarios, fantasyDraftPlayers, triviaData, commentaryBattleData } from '../constants';

// ============================================================================
// BITCHLESS CHRONICLES: ULTIMATE HEARTBREAK SIMULATOR
// ============================================================================
// New: Confidence meter, multiple paths, therapy sessions, group roast mini-game
export const UltraBitchlessChroniclesMinigame: React.FC<{ 
    onGameEnd: (grit: number) => void;
    playerName: string;
}> = ({ onGameEnd, playerName }) => {
    const [character, setCharacter] = useState<'elie' | 'craif' | null>(null);
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [insecurity, setInsecurity] = useState(50);
    const [confidence, setConfidence] = useState(50);
    const [defensiveResponse, setDefensiveResponse] = useState('');
    const [showDefense, setShowDefense] = useState(false);
    const [rejectionCount, setRejectionCount] = useState(0);
    const [successCount, setSuccessCount] = useState(0);
    const [gamePhase, setGamePhase] = useState<'select' | 'playing' | 'defense' | 'therapy' | 'ended'>('select');
    const [aaronMessage, setAaronMessage] = useState('');
    const [therapyPoints, setTherapyPoints] = useState(0);
    const [unlockedEndings, setUnlockedEndings] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<'disaster' | 'average' | 'breakthrough'>('average');

    const scenarios = character ? datingScenarios.filter(s => s.character === character) : [];
    const currentScenario = scenarios[scenarioIndex];

    const selectCharacter = (char: 'elie' | 'craif') => {
        setCharacter(char);
        setGamePhase('playing');
    };

    const chooseOption = (option: { text: string; response: string; insecurityGain: number }) => {
        const insecurityGain = option.insecurityGain;
        setInsecurity(prev => Math.min(prev + insecurityGain, 100));
        
        // Check if it's actually a good response (rare!)
        if (insecurityGain < 5) {
            setSuccessCount(prev => prev + 1);
            setConfidence(prev => Math.min(prev + 15, 100));
        } else {
            setRejectionCount(prev => prev + 1);
            setConfidence(prev => Math.max(prev - 10, 0));
        }
        
        // Aaron's commentary gets more savage
        const aaronRoasts = [
            "aaron: skill issue",
            "aaron: bro just take the L",
            "aaron: this is painful to watch",
            "aaron: maybe try not being yourself?",
            "aaron: I've seen better from a rock"
        ];
        
        if (Math.random() > 0.4) {
            setAaronMessage(aaronRoasts[Math.floor(Math.random() * aaronRoasts.length)]);
            setTimeout(() => setAaronMessage(''), 4000);
        }
        
        // Determine path based on performance (using updated counts)
        const newRejectionCount = insecurityGain < 5 ? rejectionCount : rejectionCount + 1;
        const newSuccessCount = insecurityGain < 5 ? successCount + 1 : successCount;
        
        if (newRejectionCount >= 3 && newSuccessCount === 0) setCurrentPath('disaster');
        else if (newSuccessCount >= 2) setCurrentPath('breakthrough');
        
        if (scenarioIndex < scenarios.length - 1) {
            setScenarioIndex(prev => prev + 1);
            
            // Therapy session every 2 rejections (check the current rejection count)
            if (newRejectionCount > 0 && newRejectionCount % 2 === 0 && insecurityGain >= 5) {
                setGamePhase('therapy');
            } else {
                setGamePhase('defense');
                setShowDefense(true);
            }
        } else {
            setGamePhase('ended');
        }
    };

    const submitDefense = () => {
        const responseLength = defensiveResponse.length;
        
        // Longer = more desperate but therapeutic
        if (responseLength > 50) {
            setInsecurity(prev => Math.max(prev - 8, 0));
            setTherapyPoints(prev => prev + 3);
        } else if (responseLength > 20) {
            setInsecurity(prev => Math.max(prev - 3, 0));
            setTherapyPoints(prev => prev + 1);
        } else {
            setInsecurity(prev => Math.min(prev + 5, 100));
        }
        
        setDefensiveResponse('');
        setShowDefense(false);
        setGamePhase('playing');
    };

    const completeTherapy = (effectiveness: 'low' | 'medium' | 'high') => {
        const healing = effectiveness === 'high' ? 20 : effectiveness === 'medium' ? 12 : 5;
        setInsecurity(prev => Math.max(prev - healing, 0));
        setConfidence(prev => Math.min(prev + healing, 100));
        setTherapyPoints(prev => prev + (effectiveness === 'high' ? 5 : effectiveness === 'medium' ? 3 : 1));
        setGamePhase('playing');
    };

    const endGame = () => {
        // Calculate final score based on multiple factors
        let baseGrit = 30;
        
        // Path bonuses
        if (currentPath === 'breakthrough') {
            baseGrit += 50;
            setUnlockedEndings(prev => [...prev, 'The Breakthrough Ending']);
        } else if (currentPath === 'disaster') {
            baseGrit = Math.max(baseGrit - 20, 5);
            setUnlockedEndings(prev => [...prev, 'The Total Disaster Ending']);
        }
        
        // Performance bonuses
        const successBonus = successCount * 15;
        const therapyBonus = therapyPoints * 5;
        const confidenceBonus = confidence > 70 ? 25 : 0;
        
        const finalGrit = baseGrit + successBonus + therapyBonus + confidenceBonus;
        onGameEnd(Math.max(finalGrit, 10));
    };

    if (gamePhase === 'select') {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-pink-500/50">
                <h2 className="text-4xl md:text-5xl font-orbitron mb-6 bg-gradient-to-r from-pink-400 via-purple-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                    💔 The Bitchless Chronicles: ULTIMATE EDITION 💔
                </h2>
                <p className="text-xl md:text-2xl mb-4 italic text-gray-300">
                    Choose your protagonist in this heartbreak simulator
                </p>
                <p className="text-sm text-gray-400 mb-8">
                    NEW: Multiple endings, therapy sessions, confidence meter, and more suffering!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => selectCharacter('elie')}
                        className="p-6 md:p-8 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl transform hover:scale-105 transition-all shadow-xl group"
                    >
                        <div className="text-5xl mb-4 group-hover:animate-bounce">🤓</div>
                        <div className="text-2xl font-bold mb-3">Play as Elie</div>
                        <div className="text-sm text-gray-300 mb-2">
                            "I'm literally the main character"
                        </div>
                        <div className="text-xs text-blue-200">
                            Special Ability: Delusion Shield (50% less insecurity from first rejection)
                        </div>
                    </button>
                    
                    <button
                        onClick={() => selectCharacter('craif')}
                        className="p-6 md:p-8 bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl transform hover:scale-105 transition-all shadow-xl group"
                    >
                        <div className="text-5xl mb-4 group-hover:animate-pulse">🚑</div>
                        <div className="text-2xl font-bold mb-3">Play as Craif</div>
                        <div className="text-sm text-gray-300 mb-2">
                            "You're such a good friend!"
                        </div>
                        <div className="text-xs text-pink-200">
                            Special Ability: Perfect Texter (Unlock secret good ending path)
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (gamePhase === 'therapy') {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-green-500/50">
                <h2 className="text-3xl md:text-4xl font-orbitron mb-4">🛋️ Emergency Therapy Session 🛋️</h2>
                <p className="text-lg md:text-xl mb-6 text-gray-300">
                    Time to process that rejection. How are you handling it?
                </p>
                
                <div className="bg-gray-900/80 p-4 md:p-6 rounded-xl mb-6">
                    <p className="text-base md:text-lg text-yellow-300 italic mb-4">
                        "So, tell me about this latest rejection..."
                    </p>
                    <p className="text-sm text-gray-400">
                        Current Insecurity: {insecurity}/100 | Confidence: {confidence}/100
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <button
                        onClick={() => completeTherapy('low')}
                        className="p-4 md:p-6 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
                    >
                        <div className="text-3xl mb-2">😐</div>
                        <div className="text-base md:text-lg">Deflect</div>
                        <div className="text-xs text-gray-400 mt-2">Small healing</div>
                    </button>
                    
                    <button
                        onClick={() => completeTherapy('medium')}
                        className="p-4 md:p-6 bg-blue-700 hover:bg-blue-600 rounded-xl font-bold transition-all"
                    >
                        <div className="text-3xl mb-2">😔</div>
                        <div className="text-base md:text-lg">Acknowledge</div>
                        <div className="text-xs text-blue-300 mt-2">Medium healing</div>
                    </button>
                    
                    <button
                        onClick={() => completeTherapy('high')}
                        className="p-4 md:p-6 bg-green-700 hover:bg-green-600 rounded-xl font-bold transition-all"
                    >
                        <div className="text-3xl mb-2">🌟</div>
                        <div className="text-base md:text-lg">Process</div>
                        <div className="text-xs text-green-300 mt-2">High healing +5 therapy points</div>
                    </button>
                </div>
            </div>
        );
    }

    if (gamePhase === 'defense' && showDefense) {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-orange-500/50">
                <h2 className="text-2xl md:text-3xl font-orbitron mb-4">⚠️ The Group Chat is Roasting You ⚠️</h2>
                <p className="text-lg md:text-xl mb-6 text-gray-300">
                    Time to defend yourself (and make it worse):
                </p>
                <textarea
                    value={defensiveResponse}
                    onChange={(e) => setDefensiveResponse(e.target.value)}
                    className="w-full p-3 md:p-4 bg-gray-800 rounded-lg text-white text-base md:text-lg mb-4 min-h-[100px] md:min-h-[120px]"
                    placeholder="Type your defensive response... (Longer = more desperate = more therapeutic)"
                />
                <p className="text-xs md:text-sm mb-4 text-gray-400">
                    {defensiveResponse.length} characters • 
                    {defensiveResponse.length > 50 ? ' Very desperate (but healing!)' : 
                     defensiveResponse.length > 20 ? ' Moderately desperate' : 
                     ' Not desperate enough'}
                </p>
                <button
                    onClick={submitDefense}
                    className="px-6 md:px-8 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold text-lg md:text-xl transform hover:scale-105 transition-all"
                >
                    Send Defense 📨
                </button>
            </div>
        );
    }

    if (gamePhase === 'ended') {
        return (
            <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-center border-4 border-gray-500/50">
                <h2 className="text-3xl md:text-4xl font-orbitron mb-4">
                    {currentPath === 'breakthrough' && '🌟 BREAKTHROUGH ENDING'}
                    {currentPath === 'average' && '😐 AVERAGE ENDING'}
                    {currentPath === 'disaster' && '💀 DISASTER ENDING'}
                </h2>
                
                <div className="text-5xl md:text-6xl mb-6">
                    {currentPath === 'breakthrough' ? '✨' : currentPath === 'average' ? '😔' : '💀'}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-red-900/50 p-3 rounded-lg">
                        <div className="text-xs text-red-300">Rejections</div>
                        <div className="text-2xl font-bold">{rejectionCount}</div>
                    </div>
                    <div className="bg-green-900/50 p-3 rounded-lg">
                        <div className="text-xs text-green-300">Successes</div>
                        <div className="text-2xl font-bold">{successCount}</div>
                    </div>
                    <div className="bg-blue-900/50 p-3 rounded-lg">
                        <div className="text-xs text-blue-300">Therapy Pts</div>
                        <div className="text-2xl font-bold">{therapyPoints}</div>
                    </div>
                    <div className="bg-purple-900/50 p-3 rounded-lg">
                        <div className="text-xs text-purple-300">Confidence</div>
                        <div className="text-2xl font-bold">{confidence}</div>
                    </div>
                </div>
                
                <p className="text-lg md:text-xl mb-4 text-gray-300">
                    Final Insecurity: {insecurity}/100
                </p>
                
                <p className="text-base md:text-lg italic text-gray-400 mb-6">
                    {currentPath === 'breakthrough' && character === 'elie' 
                        ? "Maybe... you ARE the main character? Character development!" 
                        : currentPath === 'breakthrough' && character === 'craif'
                        ? "You found someone who appreciates you! Growth!"
                        : currentPath === 'disaster'
                        ? "It's okay. Therapy exists for a reason."
                        : "Not great, not terrible. Very on-brand."}
                </p>
                
                {unlockedEndings.length > 0 && (
                    <div className="mb-6 p-4 bg-purple-900/50 rounded-lg border border-purple-500">
                        <p className="text-sm font-bold text-purple-300 mb-2">🏆 Endings Unlocked:</p>
                        {unlockedEndings.map((ending, i) => (
                            <p key={i} className="text-xs text-purple-200">{ending}</p>
                        ))}
                    </div>
                )}
                
                <button
                    onClick={endGame}
                    className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg md:text-xl transform hover:scale-105 transition-all"
                >
                    Accept Your Reality
                </button>
            </div>
        );
    }

    return (
        <div className="glass-dark p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl text-center border-4 border-pink-500/50">
            <h2 className="text-3xl md:text-4xl font-orbitron mb-4">
                {character === 'elie' ? '🤓 Elie Mode' : '🚑 Craif Mode'}
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-3 rounded-lg ${insecurity > 70 ? 'bg-red-900 animate-pulse' : 'bg-red-900/50'}`}>
                    <p className="text-sm text-red-300">Insecurity</p>
                    <p className="text-2xl font-bold">{insecurity}/100</p>
                    <div className="h-2 bg-red-950 rounded-full mt-2">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{width: `${insecurity}%`}} />
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${confidence > 70 ? 'bg-green-900 animate-pulse' : 'bg-green-900/50'}`}>
                    <p className="text-sm text-green-300">Confidence</p>
                    <p className="text-2xl font-bold">{confidence}/100</p>
                    <div className="h-2 bg-green-950 rounded-full mt-2">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{width: `${confidence}%`}} />
                    </div>
                </div>
            </div>
            
            {aaronMessage && (
                <div className="mb-4 p-3 md:p-4 bg-blue-900 rounded-lg border-2 border-blue-500 animate-pulse">
                    <p className="text-lg md:text-xl italic text-blue-300">{aaronMessage}</p>
                </div>
            )}
            
            {currentScenario && (
                <div className="bg-gray-900 p-4 md:p-6 rounded-xl mb-6">
                    <p className="text-lg md:text-2xl mb-4 md:mb-6">{currentScenario.situation}</p>
                    <div className="space-y-2 md:space-y-3">
                        {currentScenario.options.map((option: { text: string; response: string; insecurityGain: number }, i: number) => (
                            <button
                                key={i}
                                onClick={() => chooseOption(option)}
                                className="w-full p-3 md:p-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold text-base md:text-lg transition-all transform hover:scale-102"
                            >
                                {option.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="text-xs md:text-sm text-gray-400">
                Scenario {scenarioIndex + 1}/{scenarios.length} • 
                {currentPath === 'breakthrough' && ' 🌟 On Breakthrough Path'}
                {currentPath === 'disaster' && ' 💀 On Disaster Path'}
                {currentPath === 'average' && ' 😐 On Average Path'}
            </div>
        </div>
    );
};
