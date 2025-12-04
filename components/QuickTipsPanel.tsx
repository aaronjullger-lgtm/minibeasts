import React, { useState, useEffect } from 'react';

/**
 * Quick Tips Panel - Shows helpful tips to new players
 */
export const QuickTipsPanel: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    {
      icon: '⌨️',
      title: 'Keyboard Shortcuts',
      description: 'Press M for minigames, S for store, L for manage life, A for achievements, ESC to close modals.'
    },
    {
      icon: '💪',
      title: 'Manage Your Grit',
      description: 'Grit is your main resource. Earn it through minigames and smart choices. Don\'t let it drop too low!'
    },
    {
      icon: '⚡',
      title: 'Energy System',
      description: 'Actions cost energy. It resets each day, so use it wisely and plan your moves.'
    },
    {
      icon: '🎯',
      title: 'Weekly Goals',
      description: 'Hit your weekly grit goal to earn bonuses. Miss it and face consequences.'
    },
    {
      icon: '🔥',
      title: 'Roasting',
      description: 'Roast other players for big grit rewards, but beware - it might backfire!'
    },
    {
      icon: '🎮',
      title: 'Minigames',
      description: 'Master minigames to earn grit. Each one tests different skills and rewards accordingly.'
    }
  ];
  
  const nextTip = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      onDismiss();
    }
  };
  
  const prevTip = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };
  
  const tip = tips[currentTip];
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-dark p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md border-2 border-blue-500/30 animate-slide-in-up">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-float">{tip.icon}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {tip.title}
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {tip.description}
          </p>
        </div>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tips.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTip(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentTip 
                  ? 'bg-blue-500 w-8' 
                  : idx < currentTip 
                    ? 'bg-blue-500/50' 
                    : 'bg-slate-600'
              }`}
              aria-label={`Go to tip ${idx + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentTip > 0 && (
            <button
              onClick={prevTip}
              className="secondary-btn flex-1 text-sm md:text-base hover-lift"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={nextTip}
            className="primary-btn flex-1 text-sm md:text-base hover-lift"
          >
            {currentTip === tips.length - 1 ? 'Get Started! 🚀' : 'Next →'}
          </button>
        </div>
        
        <button
          onClick={onDismiss}
          className="mt-4 w-full text-slate-400 hover:text-slate-300 text-xs transition-colors"
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
};

/**
 * Hook to manage showing tips on first visit
 */
export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  useEffect(() => {
    const hasVisited = localStorage.getItem('minibeasts_visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
    }
  }, []);
  
  const markVisited = () => {
    localStorage.setItem('minibeasts_visited', 'true');
    setIsFirstVisit(false);
  };
  
  return { isFirstVisit, markVisited };
};
