import React, { useState, useEffect } from 'react';
import { GameState, PlayerState, CharacterData, EndGameReport, DatingScenario } from './types';
import { characterData, fullDatingScenarios } from './constants';
import { GameScreen } from './components/GameScreen';
import { IntroScreen, CharacterSelectScreen, EndScreen } from './components/CharacterScreens';
import { DatingSimScreen } from './components/DatingSimScreen';

const initialMasterRanking = (): PlayerState[] => 
  Object.values(characterData).map(c => ({
    ...c,
    grit: 0,
    loveLife: 50, // 0-100
    fandom: 50, // 0-100
    uniqueStatValue: 50, // 0-100
    happiness: 100,
    energy: 3, // Daily Action Points, max 3
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
  
  // Dating sim state
  const [datingSimScenario, setDatingSimScenario] = useState<DatingScenario | null>(null);
  
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

  const handleDatingSimComplete = (result: {
    insecurityGain: number;
    rejectionFlavor: string;
    achievements?: string[];
  }) => {
    // Apply stat changes to the player
    if (player) {
      const updatedPlayer = { ...player };
      
      // Update insecurity based on character
      if (player.id === 'craif') {
        updatedPlayer.insecurity = Math.min(100, updatedPlayer.insecurity + result.insecurityGain);
      } else if (player.id === 'elie') {
        updatedPlayer.ego = Math.max(0, updatedPlayer.ego - result.insecurityGain / 2);
      }
      
      // Add small happiness loss
      updatedPlayer.happiness = Math.max(0, updatedPlayer.happiness - result.insecurityGain / 2);
      
      // Add achievements
      if (result.achievements) {
        result.achievements.forEach(achId => {
          if (!updatedPlayer.unlockedAchievements.includes(achId)) {
            updatedPlayer.unlockedAchievements.push(achId);
          }
        });
      }
      
      // Give some grit as consolation prize
      const gritReward = Math.max(10, 40 - result.insecurityGain / 3);
      updatedPlayer.grit = updatedPlayer.grit + gritReward;
      
      setPlayer(updatedPlayer);
      
      // Update master ranking
      const updatedRanking = masterRanking.map(p => 
        p.id === updatedPlayer.id ? updatedPlayer : p
      );
      setMasterRanking(updatedRanking);
      
      // Update initial data for game to reflect changes
      setInitialDataForGame({
        player: updatedPlayer,
        ranking: updatedRanking
      });
    }
    
    // Return to playing state
    setDatingSimScenario(null);
    setGameState('playing');
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
          return <GameScreen 
            initialData={initialDataForGame} 
            onGameEnd={handleGameEnd}
            onTriggerDatingSim={(scenario: DatingScenario) => {
              setDatingSimScenario(scenario);
              setGameState('datingSim');
            }}
          />;
        }
        // Fallback
        setGameState('select');
        return null;
      case 'datingSim':
        if (datingSimScenario) {
          return <DatingSimScreen scenario={datingSimScenario} onComplete={handleDatingSimComplete} />;
        }
        // Fallback
        setGameState('playing');
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
    <div className="bg-imessage-dark text-white min-h-screen">
      {renderGameState()}
    </div>
  );
}

export default App;