import React, { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastNotification";
import { OverseerGame } from "./components/OverseerGame";
import { OverseerPlayerState } from "./types";
import { characterData } from "./constants";

const AppContent: React.FC = () => {
  // TODO: Replace with actual user authentication and character assignment
  // For now, defaulting to 'eric' character
  const assignedCharacterId = 'eric'; // This will be dynamically set based on logged-in user
  const assignedCharacter = characterData[assignedCharacterId];

  // Initialize player state with assigned character
  const initialOverseerPlayer: OverseerPlayerState = {
    ...assignedCharacter,
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
    ambushBets: [],
    ambushTargetBets: [],
    weeklyStats: {
      gritWagered: 0,
      gritWon: 0,
      gritLost: 0,
      betsPlaced: 0,
      betsWon: 0
    }
  };

  const [overseerPlayer] = useState<OverseerPlayerState>(initialOverseerPlayer);

  // No exit handler needed since we go straight to game
  const handleExit = () => {
    // TODO: Implement logout or navigate to profile/settings
    console.log('Exit requested - implement logout');
  };

  return <OverseerGame initialPlayer={overseerPlayer} onExit={handleExit} />;
};

const App: React.FC = () => {
  return (
    <div className="app-grain min-h-screen bg-stadium-gradient">
      <ErrorBoundary>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
