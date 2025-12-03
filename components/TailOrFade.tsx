import React, { useState, useEffect } from 'react';
import { characterData } from '../constants';

interface TailOrFadeProps {
  onGameEnd: (grit: number) => void;
  playerInventory?: string[];
}

interface Lock {
  id: string;
  characterId: string;
  characterName: string;
  prediction: string;
  odds: string;
  reliability: number; // 0-100, higher means more likely to hit
}

export const TailOrFade: React.FC<TailOrFadeProps> = ({ onGameEnd, playerInventory = [] }) => {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [selectedLock, setSelectedLock] = useState<Lock | null>(null);
  const [playerChoice, setPlayerChoice] = useState<'tail' | 'fade' | null>(null);
  const [betAmount, setBetAmount] = useState(25);
  const [gameState, setGameState] = useState<'selecting' | 'betting' | 'result'>('selecting');
  const [resultMessage, setResultMessage] = useState('');
  const [gritWon, setGritWon] = useState(0);

  // Character reliability ratings (used for RNG resolution)
  const characterReliability: { [key: string]: number } = {
    wyatt: 80,     // High reliability - Pious
    eric: 75,      // High reliability - ALL-IN
    aaron: 70,     // Above average
    spencer: 65,   // Commissioner knows his stuff
    nick: 60,      // Average
    alex: 55,      // Eagles bias
    andrew: 60,    // Old man wisdom
    luke: 55,      // Decent
    seth: 50,      // Average
    max: 50,       // Average
    tj: 45,        // NPC
    dj: 40,        // Party guy
    justin: 40,    // Instigator
    colin: 35,     // Parlay bro - risky
    elie: 30,      // Bad takes
    craif: 25,     // Friend-zoned
    pace: 20,      // Bad luck
    ty: 15,        // Rarely speaks, even worse picks
  };

  // Generate 3 random locks
  useEffect(() => {
    const generateLocks = () => {
      const allCharacters = Object.values(characterData);
      const shuffled = [...allCharacters].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      const predictions = [
        'Bears by 10',
        'Start this RB',
        'Under 44.5',
        'Eagles ML',
        'Cowboys -7',
        '5-leg parlay',
        'Commanders +3',
        'Dolphins win',
        'Bills over 27.5',
        'Ravens defense',
        'Steelers -4',
        'Giants upset',
        'This WR goes off',
        'Terry McLaurin TD',
        'Start your studs',
      ];

      const odds = ['+150', '-110', '+200', '+500', '-200', '+1200', '+300', '-150', '+250'];

      return selected.map(char => ({
        id: char.id,
        characterId: char.id,
        characterName: char.name,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        odds: odds[Math.floor(Math.random() * odds.length)],
        reliability: characterReliability[char.id] || 50,
      }));
    };

    setLocks(generateLocks());
  }, []);

  const selectLock = (lock: Lock) => {
    setSelectedLock(lock);
    setGameState('betting');
  };

  const placeBet = (choice: 'tail' | 'fade') => {
    setPlayerChoice(choice);
    setGameState('result');

    // Apply item effects if available
    let adjustedReliability = selectedLock!.reliability;
    
    // Example: Tinder Gold lowers Craif's reliability
    if (playerInventory.includes('tinder') && selectedLock!.characterId === 'craif') {
      adjustedReliability = Math.max(0, adjustedReliability - 20);
    }

    // Run RNG check based on adjusted reliability
    const success = Math.random() * 100 < adjustedReliability;

    let gritChange = 0;
    let message = '';

    if (choice === 'tail') {
      // Betting WITH the character
      if (success) {
        gritChange = betAmount * 2;
        message = `🎉 ${selectedLock!.characterName}'s pick HIT! You won ${gritChange} Grit!`;
      } else {
        gritChange = 0;
        message = `😔 ${selectedLock!.characterName}'s pick MISSED. You lost ${betAmount} Grit.`;
      }
    } else {
      // Betting AGAINST the character (fade)
      if (!success) {
        gritChange = betAmount * 2;
        message = `🎉 ${selectedLock!.characterName}'s pick MISSED! You faded correctly and won ${gritChange} Grit!`;
      } else {
        gritChange = 0;
        message = `😔 ${selectedLock!.characterName}'s pick HIT. Your fade failed. You lost ${betAmount} Grit.`;
      }
    }

    setResultMessage(message);
    setGritWon(gritChange);

    setTimeout(() => {
      onGameEnd(gritChange);
    }, 3000);
  };

  const goBack = () => {
    setSelectedLock(null);
    setPlayerChoice(null);
    setGameState('selecting');
  };

  if (gameState === 'result') {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center border-4 border-white">
        <h2 className="text-3xl font-graduate mb-4">Result</h2>
        <div className="bg-gray-900 p-6 rounded-lg mb-4">
          <p className="text-2xl mb-4">{resultMessage}</p>
          <p className="text-4xl font-bold text-yellow-400">{gritWon > 0 ? `+${gritWon}` : gritWon} Grit</p>
        </div>
        <p className="text-gray-400">Closing in 3 seconds...</p>
      </div>
    );
  }

  if (gameState === 'betting' && selectedLock) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border-4 border-white">
        <h2 className="text-3xl font-graduate mb-4 text-center">Tail or Fade?</h2>
        
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center text-2xl"
              style={{ backgroundColor: characterData[selectedLock.characterId]?.nflTeamColor || '#666' }}
            >
              {selectedLock.characterName.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{selectedLock.characterName}'s Lock</h3>
              <p className="text-gray-400">Reliability: {selectedLock.reliability}%</p>
            </div>
          </div>
          
          <div className="text-center bg-gray-800 p-4 rounded-lg">
            <p className="text-3xl font-bold mb-2">{selectedLock.prediction}</p>
            <p className="text-xl text-yellow-400">{selectedLock.odds}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Bet Amount (Grit):</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
            className="w-full bg-gray-700 text-white p-3 rounded-lg"
            min={10}
            step={5}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => placeBet('tail')}
            className="bg-green-600 hover:bg-green-700 p-6 rounded-lg font-bold text-xl"
          >
            👍 TAIL
            <p className="text-sm mt-2">Bet WITH {selectedLock.characterName}</p>
          </button>
          <button
            onClick={() => placeBet('fade')}
            className="bg-red-600 hover:bg-red-700 p-6 rounded-lg font-bold text-xl"
          >
            👎 FADE
            <p className="text-sm mt-2">Bet AGAINST {selectedLock.characterName}</p>
          </button>
        </div>

        <button
          onClick={goBack}
          className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded-lg font-bold"
        >
          Back to Locks
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl border-4 border-white">
      <h2 className="text-3xl font-graduate mb-2 text-center">Tail or Fade</h2>
      <p className="text-center text-gray-400 mb-6">The betting market for chat member predictions</p>

      <div className="space-y-4">
        {locks.map(lock => (
          <div
            key={lock.id}
            className="bg-gray-900 p-4 rounded-lg border-2 border-gray-600 hover:border-blue-500 cursor-pointer transition-all"
            onClick={() => selectLock(lock)}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full border-4 border-gray-600 flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: characterData[lock.characterId]?.nflTeamColor || '#666' }}
              >
                {lock.characterName.charAt(0)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold">{lock.characterName}</h3>
                  <span className="text-yellow-400 font-bold">{lock.odds}</span>
                </div>
                <p className="text-lg">{lock.prediction}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-grow bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        lock.reliability > 70 ? 'bg-green-500' :
                        lock.reliability > 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${lock.reliability}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{lock.reliability}% reliable</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-600">
        <p className="text-sm text-gray-400 text-center">
          💡 Tip: Higher reliability means the pick is more likely to hit. Fade the bad predictors!
        </p>
      </div>
    </div>
  );
};
