import React, { useState, useEffect } from 'react';
import { DatingScenario, DialogueChoice, RejectionFlavor } from '../types';

interface DatingSimScreenProps {
    scenario: DatingScenario;
    onComplete: (result: {
        insecurityGain: number;
        rejectionFlavor: RejectionFlavor;
        achievements?: string[];
    }) => void;
}

export const DatingSimScreen: React.FC<DatingSimScreenProps> = ({ scenario, onComplete }) => {
    const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<DialogueChoice | null>(null);
    const [showResponse, setShowResponse] = useState(false);
    const [showDefensivePrompt, setShowDefensivePrompt] = useState(false);
    const [defensiveText, setDefensiveText] = useState('');
    const [totalInsecurity, setTotalInsecurity] = useState(0);
    const [aaronAppeared, setAaronAppeared] = useState(false);
    const [roastMessage, setRoastMessage] = useState('');

    const handleChoiceSelect = (choice: DialogueChoice) => {
        setSelectedChoice(choice);
        setShowResponse(true);
        setTotalInsecurity(prev => prev + choice.insecurityGain);

        // Aaron randomly shows up to say "skill issue"
        if (Math.random() > 0.4) {
            setTimeout(() => {
                setAaronAppeared(true);
                setRoastMessage("aaron: skill issue");
            }, 1500);
        }
    };

    const handleContinueAfterResponse = () => {
        setShowResponse(false);
        setShowDefensivePrompt(true);
        setAaronAppeared(false);
        setRoastMessage('');
    };

    const handleDefensiveSubmit = () => {
        // Longer explanations show more desperation but slightly reduce insecurity
        if (defensiveText.length > 50) {
            setTotalInsecurity(prev => Math.max(0, prev - 3));
        } else if (defensiveText.length > 0) {
            setTotalInsecurity(prev => prev + 5);
        }

        setDefensiveText('');
        setShowDefensivePrompt(false);

        // Move to next choice or end
        if (currentChoiceIndex < scenario.choices.length - 1) {
            setCurrentChoiceIndex(prev => prev + 1);
            setSelectedChoice(null);
        } else {
            // Game over - determine rejection flavor
            const flavor: RejectionFlavor = 
                totalInsecurity >= 80 ? 'complete_disaster' :
                totalInsecurity >= 50 ? 'brutal' :
                totalInsecurity >= 30 ? 'standard' : 'mild';
            
            const achievements: string[] = [];
            if (totalInsecurity < 35) {
                achievements.push('BITCHLESS_SURVIVOR');
            }

            onComplete({
                insecurityGain: totalInsecurity,
                rejectionFlavor: flavor,
                achievements
            });
        }
    };

    const currentChoice = scenario.choices[currentChoiceIndex];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-3xl border-4 border-pink-500/50">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-orbitron mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                        💔 The Bitchless Chronicles 💔
                    </h1>
                    <div className="flex justify-between items-center">
                        <div className="text-2xl">
                            {scenario.character === 'elie' ? '🤓 Elie' : '🚑 Craif'}
                        </div>
                        <div className="bg-red-900 px-6 py-2 rounded-full">
                            <span className="text-xl font-bold">Insecurity: {totalInsecurity}</span>
                        </div>
                        <div className="text-xl text-gray-400">
                            Scene {currentChoiceIndex + 1}/{scenario.choices.length}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                {!showResponse && !showDefensivePrompt && (
                    <div className="space-y-6">
                        {/* Scenario description */}
                        <div className="bg-gray-900 p-6 rounded-xl border-2 border-purple-500/30">
                            <p className="text-2xl text-white mb-2 font-semibold">{currentChoice.situation}</p>
                        </div>

                        {/* Dialogue choices */}
                        <div className="space-y-4">
                            <p className="text-xl text-center text-gray-300 italic">What do you say?</p>
                            {currentChoice.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleChoiceSelect(option)}
                                    className="w-full p-5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-xl font-bold text-lg text-left transition-all transform hover:scale-105 border-2 border-pink-500/30"
                                >
                                    💬 "{option.text}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Response from the other person */}
                {showResponse && selectedChoice && (
                    <div className="space-y-6 animate-[pop-in_0.5s_ease-out]">
                        <div className="bg-gray-900 p-6 rounded-xl border-2 border-red-500/50">
                            <p className="text-sm text-gray-400 mb-3">Her response:</p>
                            <p className="text-2xl text-white font-semibold mb-4">
                                "{selectedChoice.response}"
                            </p>
                            <div className="flex items-center justify-center gap-3 text-red-400">
                                <span className="text-4xl">💔</span>
                                <span className="text-xl font-bold">
                                    +{selectedChoice.insecurityGain} Insecurity
                                </span>
                            </div>
                        </div>

                        {aaronAppeared && roastMessage && (
                            <div className="bg-blue-900 p-4 rounded-lg border-2 border-blue-500 animate-pulse">
                                <p className="text-xl italic text-blue-300 text-center">{roastMessage}</p>
                            </div>
                        )}

                        <button
                            onClick={handleContinueAfterResponse}
                            className="w-full px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold text-xl transition-all"
                        >
                            Continue... 😔
                        </button>
                    </div>
                )}

                {/* Defensive Response System */}
                {showDefensivePrompt && (
                    <div className="space-y-6 animate-[pop-in_0.5s_ease-out]">
                        <div className="bg-orange-900 p-6 rounded-xl border-2 border-orange-500/50">
                            <h3 className="text-3xl font-bold mb-4 text-center">
                                ⚠️ The Group Chat is Roasting You ⚠️
                            </h3>
                            <p className="text-xl text-center text-gray-300 mb-6">
                                Everyone saw what just happened. Type your desperate explanation:
                            </p>
                            
                            <textarea
                                value={defensiveText}
                                onChange={(e) => setDefensiveText(e.target.value)}
                                className="w-full p-4 bg-gray-800 rounded-lg text-white text-lg mb-4 min-h-[150px] border-2 border-orange-500/30 focus:border-orange-500 focus:outline-none"
                                placeholder="Type your defensive response here... The longer and more desperate, the better (or worse?)..."
                                autoFocus
                            />
                            
                            <div className="text-sm text-gray-400 mb-4 text-center">
                                💡 Tip: Longer responses ({'>'}50 chars) show desperation but slightly reduce insecurity
                            </div>
                            
                            <button
                                onClick={handleDefensiveSubmit}
                                className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold text-xl transition-all"
                            >
                                Send to Group Chat 📨
                            </button>
                            
                            {defensiveText.length === 0 && (
                                <button
                                    onClick={handleDefensiveSubmit}
                                    className="w-full mt-3 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-base transition-all"
                                >
                                    Skip (suffer in silence)
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
