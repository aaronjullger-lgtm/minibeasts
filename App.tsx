import React, { useState, useEffect } from 'react';
import { GameState, PlayerState, CharacterData, EndGameReport } from './types';
import { characterData } from './constants';
import { GameScreen } from './components/GameScreen';
import { IntroScreen, CharacterSelectScreen, EndScreen } from './components/CharacterScreens';

const initialMasterRanking = (): PlayerState[] => 
  Object.values(characterData).map(c => ({
    ...c,
    grit: 0,
    happiness: 100,
    energy: 100,
    paSchoolStress: 50, // Aaron
    insecurity: 50, // Craif
    liberalGfSuspicion: 0, // Colin
    truckMaintenance: 100, // Andrew
    ego: 50, // Elie
    parlayAddiction: c.id === 'colin' ? 20 : 0,
    commishPower: c.id === 'spencer' ? 10 : 0,
    clout: c.id === 'pace' ? 30 : 0,
    unlockedAchievements: [],
  }));

function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [endGameReport, setEndGameReport] = useState<EndGameReport | null>(null);
  const [masterRanking, setMasterRanking] = useState<PlayerState[]>(initialMasterRanking);

  const [initialDataForGame, setInitialDataForGame] = useState<any>(null);
  const [savedGameData, setSavedGameData] = useState<any>(null);
  const [isSaveChecked, setIsSaveChecked] = useState(false);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('miniBeastsSave');
      if (saved) {
        setSavedGameData(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved game:", e);
      localStorage.removeItem('miniBeastsSave');
    }
    setIsSaveChecked(true);
  }, []);

  const handleCharSelect = (char: CharacterData) => {
    const selectedPlayer = masterRanking.find(c => c.id === char.id);
    if (selectedPlayer) {
      setPlayer(selectedPlayer);
      setInitialDataForGame({ player: selectedPlayer, ranking: masterRanking });
      setGameState('playing');
    }
  };
  
  const handleContinueFromSave = () => {
    if (savedGameData) {
        setPlayer(savedGameData.playerState);
        setMasterRanking(savedGameData.ranking);
        setInitialDataForGame(savedGameData);
        setGameState('playing');
    }
  };

  const handleGameEnd = (report: EndGameReport, finalRanking: PlayerState[]) => {
    localStorage.removeItem('miniBeastsSave');
    setEndGameReport(report);
    setMasterRanking(finalRanking);
    setGameState('ended');
  };

  const handleRestart = () => {
    localStorage.removeItem('miniBeastsSave');
    setEndGameReport(null);
    setPlayer(null);
    setSavedGameData(null);
    setInitialDataForGame(null);
    setMasterRanking(initialMasterRanking());
    setGameState('intro');
  };
  
  const handleContinue = () => {
    setEndGameReport(null);
    if (player) {
      const updatedPlayer = masterRanking.find(p => p.id === player.id);
      if (updatedPlayer) setPlayer(updatedPlayer);
    }
    setGameState('playing');
  };
  
  const handleIntroEnd = () => {
    setGameState('select');
  };

  const renderGameState = () => {
    if (!isSaveChecked) {
      return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }
    
    switch (gameState) {
      case 'intro':
        return <IntroScreen onStart={handleIntroEnd} onContinue={savedGameData ? handleContinueFromSave : undefined} />;
      case 'select':
        return <CharacterSelectScreen onSelect={handleCharSelect} />;
      case 'playing':
        if (initialDataForGame) {
          return <GameScreen initialData={initialDataForGame} onGameEnd={handleGameEnd} />;
        }
        // Fallback
        setGameState('select');
        return null;
      case 'ended':
        if (endGameReport) {
          return <EndScreen report={endGameReport} onRestart={handleRestart} onContinue={handleContinue} />;
        }
        // Fallback
        setGameState('select');
        return null;
      default:
        return <IntroScreen onStart={handleIntroEnd} />;
    }
  };

  return (
    <div className="bg-game-gradient text-white min-h-screen font-inter">
      {renderGameState()}
    </div>
  );
}

export default App;