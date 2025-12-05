import React, { useState, useEffect } from "react";
import { GameScreen } from "./components/GameScreen";
import { IntroScreen, CharacterSelectScreen } from "./components/CharacterScreens";
import { SimplifiedMainMenu } from "./components/SimplifiedMainMenu";
import { SettingsPanel } from "./components/SettingsPanel";
import { AchievementsPanel } from "./components/AchievementsPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider, useToast } from "./components/ToastNotification";
import { CharacterData, GameState } from "./types";
import { characterData } from "./constants";
import { saveService } from "./services/saveService";
import { useKeyboardShortcut } from "./utils/hooks";

type MainTab = "dynasty" | "minigames" | "roster" | "history";

const AppContent: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("dynasty");
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const { showToast } = useToast();

  // Check for saved game on mount
  useEffect(() => {
    setHasSavedGame(saveService.hasSavedGame());
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcut('s', () => {
    if (gameState === 'playing') {
      handleQuickSave();
    }
  }, { ctrl: true });

  useKeyboardShortcut('Escape', () => {
    if (showSettings) setShowSettings(false);
    if (showAchievements) setShowAchievements(false);
  });



  // Handle character selection and game state transitions
  const handleStartGame = () => {
    setGameState("select");
  };

  const handleCharacterSelect = (character: CharacterData) => {
    setSelectedCharacter(character);
    setGameState("playing");
  };

  const handleGameEnd = () => {
    setGameState("intro");
    setSelectedCharacter(null);
  };

  const handleNewRun = () => {
    setSelectedCharacter(null);
    setGameState("intro");
  };

  const handleContinueSeason = () => {
    const savedGame = saveService.loadGame();
    if (savedGame) {
      // Load the saved character
      setSelectedCharacter(savedGame.player);
      setGameState("playing");
    }
  };



  // If we're in intro or character select mode, show those screens
  if (gameState === "intro") {
    return (
      <IntroScreen 
        onStart={handleStartGame}
        onContinue={hasSavedGame ? handleContinueSeason : undefined}
      />
    );
  }

  if (gameState === "select") {
    return (
      <CharacterSelectScreen onSelect={handleCharacterSelect} />
    );
  }

  // If we're playing and have a character, show the full game
  if (gameState === "playing" && selectedCharacter) {
    // Create initial player state from selected character
    const initialPlayerState = {
      ...selectedCharacter,
      grit: 100,
      loveLife: 50,
      fandom: 50,
      uniqueStatValue: 50,
      energy: 3,
      happiness: 75,
      paSchoolStress: 50,
      insecurity: 50,
      liberalGfSuspicion: 50,
      truckMaintenance: 50,
      ego: 50,
      parlayAddiction: 50,
      commishPower: 50,
      clout: 50,
      unlockedAchievements: []
    };

    // Create initial ranking with other characters
    const otherCharacters = Object.values(characterData)
      .filter((c: CharacterData) => c.id !== selectedCharacter.id)
      .map((c: CharacterData) => ({
        ...c,
        grit: Math.floor(Math.random() * 50) + 50,
        loveLife: 50,
        fandom: 50,
        uniqueStatValue: 50,
        energy: 3,
        happiness: 75,
        paSchoolStress: 50,
        insecurity: 50,
        liberalGfSuspicion: 50,
        truckMaintenance: 50,
        ego: 50,
        parlayAddiction: 50,
        commishPower: 50,
        clout: 50,
        unlockedAchievements: []
      }));

    const initialData = {
      player: initialPlayerState,
      ranking: [initialPlayerState, ...otherCharacters],
      day: 1,
      week: 1
    };

    return (
      <GameScreen 
        initialData={initialData}
        onGameEnd={handleGameEnd}
      />
    );
  }

  // Simplified main menu - user preferred the old simpler dashboard
  return (
    <>
      <SimplifiedMainMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartGame={handleStartGame}
        onNewRun={handleNewRun}
      />
      
      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      
      {/* Achievements Panel */}
      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
