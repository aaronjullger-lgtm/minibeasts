import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastNotification";
import { CharacterSelectScreen } from "./components/CharacterScreens";
import { OverseerGame } from "./components/OverseerGame";
import { CharacterData, OverseerPlayerState } from "./types";
import { characterData } from "./constants";

type GameState = "select" | "playing";

const AppContent: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("select");
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  const [overseerPlayer, setOverseerPlayer] = useState<OverseerPlayerState | null>(null);

  // Handle character selection
  const handleCharacterSelect = (character: CharacterData) => {
    setSelectedCharacter(character);
    
    // Initialize Overseer player state
    const initialOverseerPlayer: OverseerPlayerState = {
      ...character,
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
      unlockedAchievements: [],
      // Overseer-specific properties
      ownedItems: [],
      equippedItems: [],
      activePowerUps: [],
      tradeOffers: [],
      tribunalBets: [],
      squadRideBets: [],
      sportsbookBets: [],
      weeklyStats: {
        gritWagered: 0,
        gritWon: 0,
        gritLost: 0,
        betsPlaced: 0,
        betsWon: 0
      }
    };
    
    setOverseerPlayer(initialOverseerPlayer);
    setGameState("playing");
  };

  // Handle exit from Overseer (back to character select)
  const handleExit = () => {
    setGameState("select");
    setSelectedCharacter(null);
    setOverseerPlayer(null);
  };

  // Show character select screen
  if (gameState === "select") {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-green-400 mb-4" style={{ fontFamily: 'monospace' }}>
              👁️ THE OVERSEER
            </h1>
            <p className="text-2xl text-gray-400 mb-2">
              AI-Driven Social Betting Game
            </p>
            <p className="text-lg text-gray-500">
              Select Your Character to Enter the Underground Casino
            </p>
          </div>
          <CharacterSelectScreen onSelect={handleCharacterSelect} />
        </div>
      </div>
    );
  }

  // Show Overseer game
  if (gameState === "playing" && overseerPlayer) {
    return <OverseerGame initialPlayer={overseerPlayer} onExit={handleExit} />;
  }

  return null;
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
