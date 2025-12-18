import React, { useState, useEffect } from 'react';
import { ProphecyCard as ProphecyCardType, ProphecyOption } from '../types';

interface ProphecyCardProps {
  card: ProphecyCardType;
  currentPlayerGrit: number;
  onPlaceBet: (cardId: string, optionId: string, wager: number) => void;
  onClose: () => void;
}

export const ProphecyCard: React.FC<ProphecyCardProps> = ({
  card,
  currentPlayerGrit,
  onPlaceBet,
  onClose
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wager, setWager] = useState(50);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Calculate time remaining
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, card.expiresAt - now);
      const total = card.expiresAt - card.createdAt;
      const progressPercent = (remaining / total) * 100;
      
      setTimeRemaining(remaining);
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [card.createdAt, card.expiresAt]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlaceBet = () => {
    if (!selectedOption || card.isLocked || card.isResolved) return;
    
    if (wager < 10) {
      alert('Minimum wager is 10 grit');
      return;
    }
    
    if (wager > currentPlayerGrit) {
      alert('Insufficient grit');
      return;
    }

    onPlaceBet(card.id, selectedOption, wager);
  };

  const calculatePayout = (optionId: string): number => {
    const option = card.options.find(o => o.id === optionId);
    if (!option) return 0;
    
    const odds = option.odds;
    if (odds > 0) {
      return wager * (odds / 100);
    } else {
      return wager * (100 / Math.abs(odds));
    }
  };

  const isLocked = card.isLocked || timeRemaining === 0;
  const isExpired = timeRemaining === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      {/* Prophecy Card */}
      <div 
        className={`relative bg-board-navy rounded-lg max-w-lg w-full border-2 transition-all duration-500 ${
          isLocked ? 'border-gray-600' : 'border-board-red'
        }`}
        style={{
          filter: isLocked ? 'blur(0.5px) brightness(0.7)' : 'none',
          boxShadow: isLocked 
            ? '0 0 20px rgba(100, 100, 150, 0.3)' 
            : '0 0 30px rgba(255, 51, 51, 0.5)'
        }}
      >
        {/* Frost overlay when locked */}
        {isLocked && (
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(200, 220, 255, 0.15) 0%, rgba(150, 180, 230, 0.1) 100%)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="text-5xl font-board-grit text-white uppercase tracking-widest rotate-12 opacity-80"
                style={{
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.5)',
                  transform: 'rotate(-12deg) scale(1.3)',
                }}
              >
                LOCKED
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-20"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔮</span>
            <div>
              <h2 className="text-xl font-bold text-board-off-white font-board-grit uppercase">
                Prophecy Card
              </h2>
              <p className="text-xs text-gray-400">High-Volatility Micro-Bet</p>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-board-grit text-board-red uppercase">
                {isExpired ? 'EXPIRED' : 'TIME TO LOCK'}
              </span>
              <span className="text-sm font-board-grit text-board-off-white">
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <div className="w-full bg-board-muted-blue rounded-full h-3 overflow-hidden border border-gray-700">
              <div 
                className={`h-full transition-all duration-100 ${
                  progress > 50 ? 'bg-board-gold' : progress > 20 ? 'bg-yellow-500' : 'bg-board-red'
                }`}
                style={{
                  width: `${progress}%`,
                  animation: progress < 20 ? 'pulse 1s ease-in-out infinite' : 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-board-off-white mb-2">
              {card.title}
            </h3>
            <p className="text-sm text-gray-400">
              {card.description}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {card.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isWinner = card.isResolved && card.winningOption === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => !isLocked && setSelectedOption(option.id)}
                  disabled={isLocked}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    isWinner
                      ? 'border-board-gold bg-board-gold bg-opacity-20'
                      : isSelected
                      ? 'border-board-red bg-board-red bg-opacity-10'
                      : 'border-gray-700 bg-gray-800 bg-opacity-50'
                  } ${!isLocked ? 'hover:border-board-red cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-board-off-white font-medium">
                      {option.label}
                    </span>
                    <span className={`font-board-grit text-sm ${
                      isWinner ? 'text-board-gold' : 'text-gray-400'
                    }`}>
                      {option.odds > 0 ? '+' : ''}{option.odds}
                    </span>
                  </div>
                  
                  {/* Show total wagered */}
                  {option.totalWagered > 0 && (
                    <div className="mt-2 text-xs text-gray-500 font-board-grit">
                      Total Pool: {option.totalWagered} grit
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Wager Input */}
          {!isLocked && !card.isResolved && (
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-board-grit uppercase">
                  Your Wager
                </label>
                <input
                  type="number"
                  min="10"
                  max={currentPlayerGrit}
                  value={wager}
                  onChange={(e) => setWager(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 bg-board-muted-blue border border-gray-700 rounded text-board-off-white font-board-grit"
                  placeholder="Enter grit amount"
                />
              </div>

              {selectedOption && (
                <div className="bg-board-muted-blue p-3 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Potential Payout:</span>
                    <span className="text-board-gold font-board-grit">
                      {Math.round(calculatePayout(selectedOption))} grit
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePlaceBet}
                disabled={!selectedOption || wager < 10}
                className="w-full py-3 bg-board-red hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded transition-colors font-board-grit uppercase"
              >
                {selectedOption ? 'Place Prophecy Bet' : 'Select an Option'}
              </button>
            </div>
          )}

          {/* Resolution Display */}
          {card.isResolved && (
            <div className="pt-4 border-t border-gray-700">
              <div className="bg-board-gold bg-opacity-20 border border-board-gold rounded-lg p-4 text-center">
                <p className="text-board-gold font-board-grit uppercase text-sm">
                  🎯 Prophecy Resolved
                </p>
                <p className="text-white text-lg font-bold mt-2">
                  {card.options.find(o => o.id === card.winningOption)?.label}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
