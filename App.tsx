import React, { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastNotification";
import { TheDossier } from "./components/TheDossier";
import { LockerRoom } from "./components/locker/LockerRoom";
import { TacticalBoard } from "./components/views/TacticalBoard";
import { OverseerPlayerState, AmbushBet } from "./types";
import { OperationType } from "./services/ledgerService";
import { characterData } from "./constants";
import { ScreenShell } from "./components/layout/ScreenShell";
import { Label, Mono } from "./components/ui/Typography";

type TabType = 'board' | 'locker' | 'market' | 'intel';

const AppContent: React.FC = () => {
  // Initialize player state
  const assignedCharacterId = 'eric';
  const assignedCharacter = characterData[assignedCharacterId];

  const initialOverseerPlayer: OverseerPlayerState = {
    ...assignedCharacter,
    grit: 10000,
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

  const [player, setPlayer] = useState<OverseerPlayerState>(initialOverseerPlayer);
  const [activeTab, setActiveTab] = useState<TabType>('board');
  const [globalAmbushBets, setGlobalAmbushBets] = useState<AmbushBet[]>([]);

  // Mock players for demo
  const allPlayers: OverseerPlayerState[] = [
    player,
    { ...player, id: 'wyatt', name: 'Wyatt' },
    { ...player, id: 'alex', name: 'Alex' },
    { ...player, id: 'colin', name: 'Colin' },
  ];

  // Handle operation execution from Black Ledger
  const handleOperationExecuted = (operation: OperationType, cost: number) => {
    setPlayer(prev => ({
      ...prev,
      grit: prev.grit - cost
    }));
  };

  // Handle mystery box purchases
  const handleMysteryBoxPurchase = (tierId: string, cost: number, pulledItem: any) => {
    setPlayer(prev => ({
      ...prev,
      grit: prev.grit - cost,
      ownedItems: [...prev.ownedItems, pulledItem]
    }));
  };

  // Handle ambush bet placement
  const handlePlaceAmbushBet = (
    targetUserId: string,
    targetUserName: string,
    description: string,
    category: 'social' | 'behavior' | 'prop',
    odds: number,
    wager: number
  ) => {
    const newBet: AmbushBet = {
      id: `bet_${Date.now()}`,
      bettorId: player.id,
      bettorName: player.name,
      targetUserId,
      targetUserName,
      description,
      category,
      odds,
      wager,
      potentialPayout: wager * ((odds + 100) / 100),
      isResolved: false,
      createdAt: Date.now()
    };

    setGlobalAmbushBets(prev => [...prev, newBet]);
    setPlayer(prev => ({
      ...prev,
      grit: prev.grit - wager
    }));
  };

  // Tactical header
  const header = (
    <div className="flex items-center justify-between h-full px-4">
      <Label className="text-muted-text">SEASON 1 • PHASE 3</Label>
      <div className="flex items-center gap-2">
        <Label>GRIT</Label>
        <Mono className="text-2xl text-alert-orange">{player.grit.toLocaleString()}</Mono>
      </div>
    </div>
  );

  // Bottom navigation
  const footer = (
    <nav className="flex items-center justify-around h-full px-2">
      {[
        { id: 'board' as TabType, label: 'Board', icon: '🎯' },
        { id: 'locker' as TabType, label: 'Locker', icon: '🗄️' },
        { id: 'market' as TabType, label: 'Market', icon: '💼' },
        { id: 'intel' as TabType, label: 'Intel', icon: '📊' },
      ].map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center gap-1 min-w-[60px] py-2 transition-all duration-200"
          >
            <span 
              className={`text-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-alert-orange scale-110 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' 
                  : 'text-paper-white opacity-60'
              }`}
            >
              {tab.icon}
            </span>
            <Label 
              className={isActive ? 'text-alert-orange' : 'text-muted-text'}
            >
              {tab.label}
            </Label>
          </button>
        );
      })}
    </nav>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'board':
        return (
          <TacticalBoard
            player={player}
            globalAmbushBets={globalAmbushBets}
            onPlaceAmbushBet={handlePlaceAmbushBet}
            allPlayers={allPlayers}
          />
        );
      
      case 'locker':
        return (
          <LockerRoom
            player={player}
            onPurchase={handleMysteryBoxPurchase}
            onClose={() => setActiveTab('board')}
            onOperationExecuted={handleOperationExecuted}
          />
        );
      
      case 'market':
        return (
          <div className="p-4 text-center">
            <div className="text-4xl mb-4 opacity-30">💼</div>
            <h2 className="text-paper-white text-xl font-bold mb-2">Market</h2>
            <p className="text-muted-text">Trading floor coming soon...</p>
          </div>
        );
      
      case 'intel':
        return (
          <div className="p-4">
            <TheDossier player={player} onClose={() => setActiveTab('board')} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-tactical-dark carbon-pattern">
      <ScreenShell header={header} footer={footer}>
        {renderContent()}
      </ScreenShell>
    </div>
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
