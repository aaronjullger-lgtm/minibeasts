import React, { useState, useEffect, useCallback } from 'react';

interface TowerOfDelusionProps {
  onGameEnd: (vibes: number) => void;
}

type BlockType = 'pace' | 'elie' | 'seth';

interface TowerBlock {
  id: number;
  type: BlockType;
  stability: number;
}

export const TowerOfDelusion: React.FC<TowerOfDelusionProps> = ({ onGameEnd }) => {
  const [towerHeight, setTowerHeight] = useState(0);
  const [stability, setStability] = useState(100); // percentage
  const [vibes, setVibes] = useState(0);
  const [blocks, setBlocks] = useState<TowerBlock[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'selecting' | 'toppled'>('selecting');
  const [eventMessage, setEventMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);

  // Random events every 5 seconds
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const eventTimer = setInterval(() => {
      const events = [
        { message: '📱 Autocorrect Error! The tower shakes!', stabilityLoss: 10 },
        { message: '🗣️ Colin starts a bad take! Instability!', stabilityLoss: 8 },
        { message: '😱 Elie has a meltdown! Structure weakens!', stabilityLoss: 12 },
        { message: '🏈 Sunday NFL loss! Mood drops!', stabilityLoss: 5 },
      ];
      
      const event = events[Math.floor(Math.random() * events.length)];
      setEventMessage(event.message);
      setStability(prev => Math.max(0, prev - event.stabilityLoss));
      setIsShaking(true);
      
      setTimeout(() => {
        setEventMessage('');
        setIsShaking(false);
      }, 2000);
    }, 5000);

    return () => clearInterval(eventTimer);
  }, [gameState]);

  // Check if tower topples
  useEffect(() => {
    if (stability <= 0 && gameState === 'playing') {
      setGameState('toppled');
      setTimeout(() => {
        onGameEnd(0); // Loss - no vibes earned
      }, 2000);
    }
  }, [stability, gameState, onGameEnd]);

  const addBlock = useCallback((blockType: BlockType) => {
    const newBlock: TowerBlock = {
      id: Date.now(),
      type: blockType,
      stability: 0,
    };

    let vibeGain = 0;
    let stabilityChange = 0;

    switch (blockType) {
      case 'pace':
        // Pace Block: High Vibe gain, High Instability (RNG check)
        vibeGain = 25;
        const paceSuccess = Math.random() > 0.4; // 60% success rate
        if (paceSuccess) {
          stabilityChange = -5;
          newBlock.stability = -5;
        } else {
          stabilityChange = -20;
          newBlock.stability = -20;
          setEventMessage('💥 Pace Block collapsed! High risk!');
          setTimeout(() => setEventMessage(''), 2000);
        }
        break;

      case 'elie':
        // Elie Block: Negative Vibe gain, Increases Stability
        vibeGain = -10;
        stabilityChange = 15;
        newBlock.stability = 15;
        break;

      case 'seth':
        // Seth Block: Wildcard (50/50 chance to be Invincible or Explode)
        const sethSuccess = Math.random() > 0.5;
        if (sethSuccess) {
          vibeGain = 40;
          stabilityChange = 10;
          newBlock.stability = 10;
          setEventMessage('🙏 Seth Block is Blessed! Invincible!');
          setTimeout(() => setEventMessage(''), 2000);
        } else {
          vibeGain = -5;
          stabilityChange = -30;
          newBlock.stability = -30;
          setEventMessage('💣 Seth Block exploded!');
          setTimeout(() => setEventMessage(''), 2000);
        }
        break;
    }

    setBlocks(prev => [...prev, newBlock]);
    setTowerHeight(prev => prev + 1);
    setVibes(prev => Math.max(0, prev + vibeGain));
    setStability(prev => Math.max(0, Math.min(100, prev + stabilityChange)));
    setGameState('playing');
  }, []);

  const cashOut = () => {
    onGameEnd(vibes);
  };

  const getBlockEmoji = (type: BlockType) => {
    switch (type) {
      case 'pace': return '🏊';
      case 'elie': return '🤓';
      case 'seth': return '🙏';
    }
  };

  const getBlockColor = (type: BlockType) => {
    switch (type) {
      case 'pace': return 'bg-blue-500';
      case 'elie': return 'bg-gray-600';
      case 'seth': return 'bg-yellow-600';
    }
  };

  if (gameState === 'toppled') {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center border-4 border-red-600">
        <h2 className="text-3xl font-graduate mb-4 text-red-500">TOWER COLLAPSED!</h2>
        <p className="text-xl mb-4">Your tower of delusion came crashing down.</p>
        <p className="text-2xl font-bold">Final Vibes: {vibes}</p>
        <p className="text-gray-400 mt-2">You earned 0 Grit from this run.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border-4 border-white ${isShaking ? 'animate-shake' : ''}`}>
      <h2 className="text-3xl font-graduate mb-2 text-center">Squad Ride: Tower of Delusion</h2>
      <p className="text-center text-sm text-gray-400 mb-4">Build the tower of hype! But watch out for instability...</p>

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-400 font-bold mb-1">HEIGHT</p>
          <p className="text-2xl font-graduate">{towerHeight}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-green-400 font-bold mb-1">STABILITY</p>
          <p className="text-2xl font-graduate">{stability}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div
              className={`h-full rounded-full transition-all ${
                stability > 70 ? 'bg-green-500' : stability > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stability}%` }}
            />
          </div>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-purple-400 font-bold mb-1">VIBES</p>
          <p className="text-2xl font-graduate">{vibes}</p>
        </div>
      </div>

      {/* Event Message */}
      {eventMessage && (
        <div className="bg-red-900/50 border border-red-600 p-3 rounded-lg mb-4 animate-pulse">
          <p className="text-center font-bold">{eventMessage}</p>
        </div>
      )}

      {/* Tower Visualization */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4 min-h-[200px] flex flex-col-reverse items-center justify-start overflow-y-auto max-h-[300px]">
        {blocks.length === 0 ? (
          <p className="text-gray-500 text-center my-auto">No blocks yet. Start building!</p>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className={`${getBlockColor(block.type)} border-2 border-white w-32 h-8 flex items-center justify-center font-bold text-xl mb-1 rounded`}
              title={`${block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block (Stability: ${block.stability > 0 ? '+' : ''}${block.stability})`}
            >
              {getBlockEmoji(block.type)}
            </div>
          ))
        )}
        {/* Base */}
        <div className="bg-gray-700 w-40 h-4 mt-2 rounded"></div>
      </div>

      {/* Block Selection */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => addBlock('pace')}
          disabled={gameState === 'toppled'}
          className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg font-bold disabled:opacity-50"
        >
          <div className="text-3xl mb-1">🏊</div>
          <div className="text-sm">Pace Block</div>
          <div className="text-xs text-gray-300">+25 Vibes, Risky</div>
        </button>
        <button
          onClick={() => addBlock('elie')}
          disabled={gameState === 'toppled'}
          className="bg-gray-600 hover:bg-gray-700 p-4 rounded-lg font-bold disabled:opacity-50"
        >
          <div className="text-3xl mb-1">🤓</div>
          <div className="text-sm">Elie Block</div>
          <div className="text-xs text-gray-300">-10 Vibes, +Stable</div>
        </button>
        <button
          onClick={() => addBlock('seth')}
          disabled={gameState === 'toppled'}
          className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg font-bold disabled:opacity-50"
        >
          <div className="text-3xl mb-1">🙏</div>
          <div className="text-sm">Seth Block</div>
          <div className="text-xs text-gray-300">Wildcard!</div>
        </button>
      </div>

      {/* Cash Out Button */}
      {towerHeight > 0 && (
        <button
          onClick={cashOut}
          className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg font-bold text-xl"
        >
          💰 CASH OUT - Keep {vibes} Vibes as Grit
        </button>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
