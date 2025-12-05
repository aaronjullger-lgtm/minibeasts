import React from 'react';
import { Dashboard } from './Dashboard';
import { NewMinigames } from './NewMinigames';
import { HistoryTab } from './HistoryTab';

type MainTab = "dynasty" | "minigames" | "roster" | "history";

interface SimplifiedMainMenuProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  onStartGame: () => void;
  onNewRun: () => void;
}

export const SimplifiedMainMenu: React.FC<SimplifiedMainMenuProps> = ({
  activeTab,
  setActiveTab,
  onStartGame,
  onNewRun
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      {/* Simple clean header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Mini Beasts
        </h1>
        <p className="text-gray-400 text-sm md:text-base">The All-In Meal · Dynasty Mode</p>
      </header>

      {/* Simple tab navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "dynasty" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("dynasty")}
          >
            🏈 Dynasty
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "minigames" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("minigames")}
          >
            🎮 Minigames
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "roster" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("roster")}
          >
            👥 Roster
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "history" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("history")}
          >
            📜 History
          </button>
        </div>
      </div>

      {/* Content area - clean and simple */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">
          {activeTab === "dynasty" && (
            <div className="text-center py-12">
              <div className="mb-6 text-7xl animate-bounce">🏈</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Start Your Dynasty?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Jump into Dynasty Mode and experience the full NFL season with 18 unique personalities.
                Manage your stats, navigate the group chat, and become the ultimate champion.
              </p>
              <button 
                type="button"
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-xl text-white font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                onClick={onStartGame}
              >
                <span className="relative z-10 flex items-center gap-3">
                  🚀 Launch Dynasty Mode
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-xl" />
              </button>
              
              <button
                type="button"
                className="mt-4 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-gray-300 hover:text-white font-semibold transition-all"
                onClick={onNewRun}
              >
                🔄 New Run
              </button>
            </div>
          )}

          {activeTab === "minigames" && <NewMinigames />}

          {activeTab === "roster" && <Dashboard />}

          {activeTab === "history" && <HistoryTab />}
        </div>
      </div>

      {/* Simple footer info */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p className="mb-2">💡 Pro tip: Play minigames to earn grit and unlock achievements</p>
        <p>Built for degenerates, by degenerates 🏈</p>
      </div>
    </div>
  );
};
