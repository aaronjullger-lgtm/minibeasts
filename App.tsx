import React, { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { IntroScreen, CharacterSelectScreen } from "./components/CharacterScreens";
import { ChatUI } from "./components/ChatUI";
import { Dashboard } from "./components/Dashboard";
import { NewMinigames } from "./components/NewMinigames";
import { CharacterData, GameState } from "./types";
import { characterData } from "./constants";

type MainTab = "dynasty" | "minigames" | "roster" | "history";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("dynasty");

  // These would normally come from your game state / services:
  const currentWeek = 3;
  const totalWeeks = 17;
  const bankroll = 425.5;
  const grit = 72;
  const chaos = 48;
  const relationshipHeat = 33; // e.g. "how close are you to getting caught"
  const unreadMessages = 3;
  
  // Stat thresholds for visual feedback
  const GRIT_THRESHOLD_LEGENDARY = 90;
  const GRIT_THRESHOLD_ELITE = 75;
  const GRIT_THRESHOLD_RISING = 50;
  const CHAOS_THRESHOLD_CRITICAL = 80;
  const CHAOS_THRESHOLD_SPICY = 60;
  const CHAOS_THRESHOLD_HEATING = 40;
  const RELATIONSHIP_THRESHOLD_DANGER = 70;
  const RELATIONSHIP_THRESHOLD_RISKY = 50;
  const RELATIONSHIP_THRESHOLD_SKETCHY = 30;
  const BANKROLL_THRESHOLD_HIGH_ROLLER = 500;
  const BANKROLL_THRESHOLD_DEGENERATE = 300;

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((currentWeek / totalWeeks) * 100))
  );

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
    setGameState("playing");
  };

  const handleQuickSave = () => {
    // TODO: Implement save functionality
    alert("Game saved! (Save functionality will be implemented)");
  };

  const handleAdvanceWeek = () => {
    // TODO: Implement week advancement
    alert("Advancing to next week! (This will be connected to Dynasty Mode)");
  };

  const [chatMessage, setChatMessage] = useState("");
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement chat message handling
      console.log("Sending message:", chatMessage);
      setChatMessage("");
    }
  };

  // If we're in intro or character select mode, show those screens
  if (gameState === "intro") {
    return (
      <IntroScreen 
        onStart={handleStartGame}
        onContinue={selectedCharacter ? handleContinueSeason : undefined}
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
      .filter((c: any) => c.id !== selectedCharacter.id)
      .map((c: any) => ({
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

  // Otherwise show the main menu UI
  return (
    <div className="app-shell">
      <div className="app-frame">
        {/* HEADER */}
        <header className="app-header">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-semibold tracking-tight">
                  Mini Beasts: The All-In Meal
                </h1>
                <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Dynasty Mode
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[0.7rem] md:text-xs text-slate-300/80">
                <span>Week {currentWeek} of {totalWeeks}</span>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span>Browser Play</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex flex-col gap-1 w-36">
              <div className="flex items-center justify-between text-[0.7rem] text-slate-300">
                <span>Season Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              className="pill-muted gap-1.5 hover-lift"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Auto-save on
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <div className="flex flex-1 flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4">
          {/* LEFT COLUMN: HUD + tabs + main view */}
          <div className="flex-1 flex flex-col gap-3 md:gap-4">
            {/* HUD */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
              <div className="hud-card hover-lift transition-all">
                <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                  <span>Bankroll</span>
                  <span className="badge-pill bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    {bankroll > BANKROLL_THRESHOLD_HIGH_ROLLER ? 'High Roller' : bankroll > BANKROLL_THRESHOLD_DEGENERATE ? 'Degenerate' : 'Grinding'}
                  </span>
                </div>
                <div className="text-lg md:text-xl font-semibold text-emerald-300">
                  ${bankroll.toFixed(2)}
                </div>
                <div className="h-1.5 w-full rounded-full bg-emerald-900/60 overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" />
                </div>
              </div>

              <div className={`hud-card hover-lift transition-all ${grit >= GRIT_THRESHOLD_LEGENDARY ? 'pulse-glow' : ''}`}>
                <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                  <span>Grit</span>
                  <span className="text-xs text-amber-300">
                    {grit >= GRIT_THRESHOLD_LEGENDARY ? '🔥 Legendary' : grit >= GRIT_THRESHOLD_ELITE ? '💪 Elite' : grit >= GRIT_THRESHOLD_RISING ? '⚡ Rising' : 'Building'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-semibold text-amber-300">
                    {grit}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-amber-900/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${grit}%` }}
                  />
                </div>
              </div>

              <div className={`hud-card hover-lift transition-all ${chaos >= CHAOS_THRESHOLD_CRITICAL ? 'shake-animation' : ''}`}>
                <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                  <span>Chaos</span>
                  <span className="text-xs text-pink-300">
                    {chaos >= CHAOS_THRESHOLD_CRITICAL ? '🚨 Critical' : chaos >= CHAOS_THRESHOLD_SPICY ? '🔥 Spicy' : chaos >= CHAOS_THRESHOLD_HEATING ? '⚠️ Heating Up' : 'Chill'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-semibold text-pink-300">
                    {chaos}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-pink-900/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 transition-all duration-500"
                    style={{ width: `${chaos}%` }}
                  />
                </div>
              </div>

              <div className={`hud-card hover-lift transition-all ${relationshipHeat >= RELATIONSHIP_THRESHOLD_DANGER ? 'shake-animation' : ''}`}>
                <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                  <span>Relationship</span>
                  <span className="text-xs text-sky-300">
                    {relationshipHeat >= RELATIONSHIP_THRESHOLD_DANGER ? '💀 Danger' : relationshipHeat >= RELATIONSHIP_THRESHOLD_RISKY ? '⚠️ Risky' : relationshipHeat >= RELATIONSHIP_THRESHOLD_SKETCHY ? '👀 Sketchy' : 'Safe'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-semibold text-sky-300">
                    {relationshipHeat}
                  </span>
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-sky-900/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-300 via-orange-400 to-red-400 transition-all duration-500"
                    style={{ width: `${relationshipHeat}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Tabs */}
            <section className="section-card flex flex-col gap-3 md:gap-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="badge-pill bg-slate-800/80 text-slate-100 border border-slate-700/80">
                    Season · Week {currentWeek}
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">
                    Pick your chaos: manage dynasty, chase parlays, or check the screenshots
                  </span>
                </div>
                <button 
                  type="button" 
                  className="secondary-btn hidden md:inline-flex hover-lift"
                  onClick={handleNewRun}
                >
                  New Run
                </button>
              </div>

              <div className="bg-slate-900/70 p-1.5 rounded-full border border-slate-700/80 flex gap-1">
                <button
                  type="button"
                  className={`segment-button hover-lift ${
                    activeTab === "dynasty" ? "segment-button-active" : ""
                  }`}
                  onClick={() => setActiveTab("dynasty")}
                >
                  Dynasty
                </button>
                <button
                  type="button"
                  className={`segment-button hover-lift ${
                    activeTab === "minigames" ? "segment-button-active" : ""
                  }`}
                  onClick={() => setActiveTab("minigames")}
                >
                  Minigames
                </button>
                <button
                  type="button"
                  className={`segment-button hover-lift ${
                    activeTab === "roster" ? "segment-button-active" : ""
                  }`}
                  onClick={() => setActiveTab("roster")}
                >
                  Roster
                </button>
                <button
                  type="button"
                  className={`segment-button hover-lift ${
                    activeTab === "history" ? "segment-button-active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </button>
              </div>

              <div className="mt-1 min-h-[220px] md:min-h-[260px]">
                {activeTab === "dynasty" && (
                  <div className="w-full h-full flex items-center justify-center p-6 text-center">
                    <div>
                      <div className="mb-4 text-6xl">🎮</div>
                      <h3 className="text-xl font-semibold text-slate-200 mb-2">
                        Ready to Start Dynasty Mode?
                      </h3>
                      <p className="text-slate-400 text-sm max-w-md mb-6">
                        Jump into the full Dynasty Mode experience! Manage your season, chat with the crew, and chase glory through an entire NFL season.
                      </p>
                      <button 
                        type="button"
                        className="primary-btn hover-lift px-6 py-3"
                        onClick={handleStartGame}
                      >
                        Start Dynasty Mode
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "minigames" && (
                  <div className="w-full h-full">
                    <NewMinigames />
                  </div>
                )}

                {activeTab === "roster" && (
                  <div className="w-full h-full">
                    <Dashboard />
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="w-full h-full flex items-center justify-center text-xs md:text-sm text-slate-300/90">
                    {/* Placeholder – wire to your actual history / log later */}
                    <p className="max-w-sm text-center">
                      Season recap, worst takes, and parlay obituaries will live here.
                      For now, keep surviving the group chat.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Bottom primary actions on mobile */}
            <div className="flex md:hidden justify-between gap-2 pt-1">
              <button 
                type="button" 
                className="secondary-btn flex-1 hover-lift"
                onClick={handleQuickSave}
              >
                Quick Save
              </button>
              <button 
                type="button" 
                className="primary-btn flex-1 hover-lift"
                onClick={handleAdvanceWeek}
              >
                Advance Week
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Chat / side panel */}
          <aside className="w-full md:w-[280px] lg:w-[320px] flex flex-col gap-3">
            <div className="section-card flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-green-400 via-emerald-400 to-sky-400 flex items-center justify-center text-xs font-bold text-slate-950">
                      MB
                    </div>
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[0.6rem] font-semibold flex items-center justify-center text-white">
                        {unreadMessages}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold leading-tight">
                      Group Chat · Mini Beasts
                    </span>
                    <span className="text-[0.7rem] text-slate-400">
                      {unreadMessages > 0 ? "They are cooking you right now" : "Peaceful (for once)"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="badge bg-slate-800/80 text-slate-200 border border-slate-700/80"
                >
                  Live
                </button>
              </div>

              <div className="flex-1 min-h-[220px] rounded-2xl bg-slate-950/90 border border-slate-900/90 overflow-hidden flex flex-col">
                {/* Plug in your existing chat UI */}
                <div className="flex-1 overflow-y-auto chat-scroll p-2.5 md:p-3.5">
                  <ChatUI />
                </div>

                <div className="border-t border-slate-800/80 bg-slate-900/80 px-2.5 md:px-3 py-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Drop a take, confess, or double down..."
                    className="flex-1 bg-slate-950/90 border border-slate-800/80 rounded-full px-3 py-1.5 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400/70 focus:border-emerald-400/70"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    type="button"
                    className="primary-btn px-3 md:px-4 py-1.5 text-xs md:text-sm"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Small helper / tips card */}
            <div className="hidden md:block section-card text-xs text-slate-300/90">
              <p className="font-semibold text-slate-100 mb-1.5">
                How to actually survive this:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Manage grit like a real stamina bar — don&apos;t go all-in every week.</li>
                <li>Check the chat before you lock parlays; they will jinx you.</li>
                <li>
                  Relationship heat too high? Take a week off from betting, or at least pretend.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
