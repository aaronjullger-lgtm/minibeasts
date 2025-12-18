import React from 'react';

interface SnitchButtonProps {
  onSnitch?: () => void;
  label?: string;
}

export const SnitchButton: React.FC<SnitchButtonProps> = ({ onSnitch, label = 'Ping Commish' }) => {
  const handleClick = () => {
    if (onSnitch) {
      onSnitch();
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('commish-snitch'));
      }
      alert('📞 Alert sent to The Commish. Bet flagged for review.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-xs text-board-off-white/70 hover:text-board-red transition-colors"
      title="Notify The Commish"
    >
      <span className="text-lg">📞</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
