/**
 * Judgment Day Recap Component
 * 
 * Full-screen cinematic "Stories" style recap of the week's results:
 * - Shadow Lock reveals (unredacted trigger phrases)
 * - Receipt Reel (evidence from AI Commish)
 * - Stat Sheet (Biggest Payout, Whale of Week, Gulag Inmates)
 * - Indictment Winners (social superlative voting results)
 * - Final payout animation with mechanical counter
 * - Shareable weekly performance image
 */

import React, { useState, useEffect } from 'react';
import { OverseerPlayerState, AmbushBet, JudgmentRecap } from '../types';
import { judgmentDayService } from '../services/judgmentDayService';

interface JudgmentDayRecapProps {
    player: OverseerPlayerState;
    recapData: JudgmentRecap;
    onComplete: () => void;
}

interface RecapSlide {
    id: string;
    type: 'intro' | 'shadow_locks' | 'receipts' | 'stats' | 'indictments' | 'payout';
    title: string;
    background: 'grit_rain' | 'redacted_bars' | 'static' | 'gradient' | 'vault';
    content: any;
}

export const JudgmentDayRecap: React.FC<JudgmentDayRecapProps> = ({
    player,
    recapData,
    onComplete
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [counterValue, setCounterValue] = useState(player.grit);
    const [showDownload, setShowDownload] = useState(false);

    // Generate recap slides
    const slides: RecapSlide[] = [
        {
            id: 'intro',
            type: 'intro',
            title: 'JUDGMENT DAY',
            background: 'gradient',
            content: { weekNumber: recapData.weekNumber }
        },
        {
            id: 'shadow_locks',
            type: 'shadow_locks',
            title: 'SHADOW LOCK REVEALS',
            background: 'redacted_bars',
            content: recapData.shadowLockReveals || []
        },
        {
            id: 'receipts',
            type: 'receipts',
            title: 'THE RECEIPT REEL',
            background: 'static',
            content: recapData.receipts || []
        },
        {
            id: 'stats',
            type: 'stats',
            title: 'THE STAT SHEET',
            background: 'gradient',
            content: {
                biggestPayout: recapData.winners && recapData.winners.length > 0 ? recapData.winners[0] : null,
                whaleOfWeek: recapData.whaleOfWeek,
                gulagInmate: recapData.gulagInmate
            }
        },
        {
            id: 'indictments',
            type: 'indictments',
            title: 'INDICTMENT WINNERS',
            background: 'gradient',
            content: recapData.indictmentWinners || []
        },
        {
            id: 'payout',
            type: 'payout',
            title: 'YOUR FINAL TALLY',
            background: 'vault',
            content: {
                previousBalance: recapData.playerNewBalance ? player.grit - ((recapData.playerNewBalance || player.grit) - player.grit) : player.grit,
                newBalance: recapData.playerNewBalance || player.grit,
                profitLoss: recapData.playerNewBalance ? (recapData.playerNewBalance - player.grit) : 0,
                itemsPulled: recapData.playerItemsPulled || 0
            }
        }
    ];

    // Auto-advance timer (5 seconds per slide)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentSlide < slides.length - 1) {
                nextSlide();
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentSlide]);

    // Mechanical counter animation for payout slide
    useEffect(() => {
        if (slides[currentSlide].type === 'payout') {
            const targetValue = recapData.playerNewBalance || player.grit;
            const duration = 2000; // 2 seconds
            const steps = 60; // 60 fps
            const increment = (targetValue - player.grit) / steps;
            
            let step = 0;
            const interval = setInterval(() => {
                step++;
                setCounterValue(prev => Math.floor(player.grit + (increment * step)));
                
                if (step >= steps) {
                    clearInterval(interval);
                    setCounterValue(targetValue);
                    setShowDownload(true);
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }
    }, [currentSlide, slides]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentSlide(prev => prev + 1);
                setIsAnimating(false);
            }, 200);
        } else {
            onComplete();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentSlide(prev => prev - 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const getBackgroundClass = (bg: string): string => {
        switch (bg) {
            case 'grit_rain':
                return 'bg-gradient-to-b from-board-navy to-black';
            case 'redacted_bars':
                return 'bg-board-navy';
            case 'static':
                return 'bg-black';
            case 'vault':
                return 'bg-gradient-radial from-yellow-900/20 to-black';
            default:
                return 'bg-stadium-gradient';
        }
    };

    const renderSlideContent = (slide: RecapSlide) => {
        switch (slide.type) {
            case 'intro':
                return (
                    <div className="text-center space-y-8 animate-fade-in">
                        <h1 className="text-7xl font-board-header italic text-board-red animate-pulse">
                            ⚖️ JUDGMENT DAY
                        </h1>
                        <p className="text-3xl text-board-off-white">
                            Week {slide.content.weekNumber} Recap
                        </p>
                        <p className="text-lg text-gray-400">
                            Tap anywhere to continue
                        </p>
                    </div>
                );

            case 'shadow_locks':
                return (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-board-header italic text-board-red mb-8">
                            🎯 {slide.title}
                        </h2>
                        {slide.content.map((reveal: any, i: number) => (
                            <div
                                key={i}
                                className="bg-board-crimson/20 border-2 border-board-crimson rounded-lg p-6 animate-slide-in"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl">{reveal.success ? '✅' : '❌'}</span>
                                    <div className="flex-1">
                                        <p className="text-xl font-bold text-board-off-white mb-2">
                                            {reveal.targetName}
                                        </p>
                                        <p className="text-board-beige mb-3">
                                            "{reveal.triggerPhrase}"
                                        </p>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">
                                                {reveal.bettorCount} bettors • {reveal.totalGrit} grit
                                            </span>
                                            <span className={reveal.success ? 'text-green-400' : 'text-red-400'}>
                                                {reveal.success ? 'CONFIRMED' : 'FAILED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'receipts':
                return (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-board-header italic text-board-red mb-8">
                            📸 {slide.title}
                        </h2>
                        {slide.content.map((receipt: any, i: number) => (
                            <div
                                key={i}
                                className="bg-gray-900 border-2 border-board-muted-blue rounded-lg p-6 animate-slide-in"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">🧾</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-2">
                                            {receipt.timestamp}
                                        </p>
                                        <p className="text-board-off-white italic mb-3">
                                            "{receipt.evidence}"
                                        </p>
                                        <p className="text-sm text-board-red">
                                            Commish Verdict: {receipt.verdict}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'stats':
                return (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-board-header italic text-board-red mb-8 text-center">
                            📊 {slide.title}
                        </h2>
                        
                        {/* Biggest Payout */}
                        {slide.content.biggestPayout && (
                            <div className="bg-gradient-to-r from-green-900/30 to-transparent border-2 border-green-500 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">🏆 BIGGEST PAYOUT</p>
                                        <p className="text-3xl font-bold text-board-off-white">
                                            {slide.content.biggestPayout.playerName}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {slide.content.biggestPayout.biggestWin?.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-board-grit text-green-400">
                                            +{slide.content.biggestPayout.biggestWin?.payout || slide.content.biggestPayout.totalWinnings}
                                        </p>
                                        <p className="text-sm text-gray-400">GRIT</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Whale of the Week */}
                        {slide.content.whaleOfWeek && (
                            <div className="bg-gradient-to-r from-blue-900/30 to-transparent border-2 border-blue-500 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">🐋 WHALE OF THE WEEK</p>
                                        <p className="text-3xl font-bold text-board-off-white">
                                            {slide.content.whaleOfWeek.playerName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-board-grit text-blue-400">
                                            {slide.content.whaleOfWeek.totalWagered}
                                        </p>
                                        <p className="text-sm text-gray-400">TOTAL WAGERED</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gulag Inmate */}
                        {slide.content.gulagInmate && (
                            <div className="bg-gradient-to-r from-board-crimson/30 to-transparent border-2 border-board-crimson rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">🔒 GULAG INMATE</p>
                                        <p className="text-3xl font-bold text-board-off-white">
                                            {slide.content.gulagInmate.playerName}
                                        </p>
                                        <p className="text-sm text-red-400 mt-1">
                                            Hit 0 Grit • Currently Locked Out
                                        </p>
                                    </div>
                                    <div className="text-6xl animate-pulse">
                                        🔒
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'indictments':
                return (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-board-header italic text-board-red mb-8 text-center">
                            ⚖️ {slide.title}
                        </h2>
                        {slide.content.map((indictment: any, i: number) => (
                            <div
                                key={i}
                                className="bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-6 animate-slide-in"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <p className="text-sm text-yellow-400 mb-2">{indictment.category}</p>
                                <p className="text-2xl font-bold text-board-off-white mb-2">
                                    {indictment.winnerName}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {indictment.votes} votes • "{indictment.reason}"
                                </p>
                            </div>
                        ))}
                    </div>
                );

            case 'payout':
                return (
                    <div className="text-center space-y-8">
                        <h2 className="text-4xl font-board-header italic text-board-off-white mb-8">
                            💰 {slide.title}
                        </h2>

                        {/* Mechanical Counter */}
                        <div className="bg-black/60 border-4 border-yellow-600 rounded-lg p-8 max-w-2xl mx-auto">
                            <p className="text-sm text-gray-400 mb-4">YOUR GRIT BALANCE</p>
                            <div className="text-8xl font-board-grit text-yellow-400 mb-4 animate-counter">
                                {counterValue.toLocaleString()}
                            </div>
                            
                            {slide.content.profitLoss !== 0 && (
                                <div className={`text-3xl font-bold ${slide.content.profitLoss > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {slide.content.profitLoss > 0 ? '+' : ''}{slide.content.profitLoss.toLocaleString()} GRIT
                                </div>
                            )}
                        </div>

                        {/* Weekly Summary */}
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="bg-gray-900 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Items Pulled</p>
                                <p className="text-2xl font-bold text-board-off-white">{slide.content.itemsPulled}</p>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Net Profit/Loss</p>
                                <p className={`text-2xl font-bold ${slide.content.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {slide.content.profitLoss >= 0 ? '+' : ''}{slide.content.profitLoss}
                                </p>
                            </div>
                        </div>

                        {/* Download Receipt Button */}
                        {showDownload && (
                            <button
                                onClick={() => {
                                    // Generate and download receipt image
                                    const receiptData = judgmentDayService.generateShareableReceipt(
                                        player.name,
                                        slide.content.profitLoss,
                                        slide.content.itemsPulled,
                                        recapData.weekNumber
                                    );
                                    // In real implementation, would trigger download
                                    console.log('Receipt generated:', receiptData);
                                }}
                                className="bg-board-red hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 animate-fade-in"
                            >
                                📸 DOWNLOAD RECEIPT
                            </button>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const currentSlideData = slides[currentSlide];

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Background with motion effect */}
            <div className={`absolute inset-0 ${getBackgroundClass(currentSlideData.background)}`}>
                {/* Motion backgrounds */}
                {currentSlideData.background === 'grit_rain' && (
                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-4xl animate-fall"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}
                            >
                                💰
                            </div>
                        ))}
                    </div>
                )}

                {currentSlideData.background === 'redacted_bars' && (
                    <div className="absolute inset-0 opacity-30">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="h-8 bg-board-crimson mb-4 animate-slide-redacted"
                                style={{
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-10">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden"
                    >
                        <div
                            className="h-full bg-board-red transition-all duration-300"
                            style={{
                                width: i < currentSlide ? '100%' : i === currentSlide ? '100%' : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div
                className="relative z-10 h-full flex items-center justify-center p-8 cursor-pointer"
                onClick={nextSlide}
            >
                <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    {renderSlideContent(currentSlideData)}
                </div>
            </div>

            {/* Navigation Hints */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 z-10 text-gray-400 text-sm">
                {currentSlide > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                        ← Previous
                    </button>
                )}
                <div className="flex-1" />
                {currentSlide < slides.length - 1 ? (
                    <button onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                        Next →
                    </button>
                ) : (
                    <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="text-board-red font-bold">
                        Return to Board →
                    </button>
                )}
            </div>

            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }

                @keyframes slide-redacted {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }

                @keyframes counter {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .animate-fall {
                    animation: fall linear infinite;
                }

                .animate-slide-redacted {
                    animation: slide-redacted 0.5s ease-out forwards;
                }

                .animate-counter {
                    animation: counter 0.5s ease-in-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-slide-in {
                    animation: slide-in 0.4s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};
