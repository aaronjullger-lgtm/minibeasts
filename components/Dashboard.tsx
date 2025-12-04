import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, MinigameType, SeasonGoal } from '../types';
import { MiniBeastIcon } from './ChatUI';

const getStatusMessage = (player: PlayerState): string => {
    if (player.happiness < 20) return "absolutely fuming.";
    if (player.energy < 20) return "running on fumes.";
    switch (player.id) {
        case 'aaron': return player.paSchoolStress > 80 ? "about to drop out." : "thinking of a new bit.";
        case 'elie': return (player.ego || 0) > 80 ? "feeling untouchable." : "crafting a hot take.";
        case 'eric': return "ALL-IN on grit.";
        case 'craif': return player.insecurity > 80 ? "getting friend-zoned again." : "on ambulance duty.";
        case 'seth': return "feeling a little too comfortable.";
        case 'justin': return "looking for drama. 🤓";
        case 'colin': return (player.parlayAddiction || 0) > 75 ? "sweating a 12-leg parlay." : "looking for an edge.";
        case 'spencer': return (player.commishPower || 0) < 20 ? "feeling powerless." : "running a tight ship.";
        case 'pace': return (player.clout || 0) > 75 ? "feeling like a celebrity." : "checking his phone.";
        default: return "just vibing.";
    }
};

const StatTooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 text-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-600 shadow-lg">
            {text}
        </div>
    </div>
);

const statDescriptions: { [key: string]: string } = {
    GRIT: "The main score. Earned from minigames and winning arguments. Highest Grit at the end wins the All-In Meal.",
    HAPPINESS: "Your mental state. Low happiness can lead to bad events and poor performance.",
    ENERGY: "Needed for daily actions and minigames. Restores a bit each day.",
    STRESS: "Aaron's PA School Stress. High stress drains energy and happiness.",
    EGO: "Elie's sense of self-importance. High ego leads to unhinged takes, low ego leads to spirals.",
    INSECURITY: "Craif's self-esteem. High insecurity means he's probably been left on read again.",
    ADDICTION: "Colin's Parlay Addiction. High addiction can lead to risky behavior and bad outcomes.",
    POWER: "Spencer's Commish Power. A measure of his control over the league. Or lack thereof.",
    CLOUT: "Pace's social influence. High clout can lead to positive events and opportunities."
};

const usePrevious = <T,>(value: T): T | undefined => {
    // FIX: useRef must be called with an initial value.
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

const CharacterStats: React.FC<{ player: PlayerState }> = ({ player }) => {
    // Simple stat display without animations to avoid infinite loop
    const renderStat = (label: string, value: number, color: string, emoji?: string) => (
        <StatTooltip key={label} text={statDescriptions[label] || "A measure of something important."}>
            <div className="cursor-help relative ios-glass rounded-xl p-3 text-center">
                <span className={`block text-xs font-semibold ${color} mb-1`}>{emoji} {label}</span>
                <span className="text-2xl font-bold">{value}</span>
            </div>
        </StatTooltip>
    );

    const stats = [
        renderStat("GRIT", player.grit, "text-blue-400", "⚡"),
        renderStat("MOOD", player.happiness, "text-green-400", "😊"),
        renderStat("ENERGY", player.energy, "text-yellow-400", "🔋")
    ];

    // Add character-specific stat
    switch (player.id) {
        case 'aaron': 
            stats.unshift(renderStat("STRESS", player.paSchoolStress, "text-red-400", "📚"));
            break;
        case 'elie': 
            stats.unshift(renderStat("EGO", player.ego, "text-purple-400", "👑"));
            break;
        case 'craif': 
            stats.unshift(renderStat("INSECURITY", player.insecurity, "text-gray-400", "💔"));
            break;
        case 'colin': 
            stats.unshift(renderStat("PARLAY", player.parlayAddiction || 0, "text-red-500", "🎰"));
            break;
        case 'spencer': 
            stats.unshift(renderStat("POWER", player.commishPower || 0, "text-teal-400", "👨‍⚖️"));
            break;
        case 'pace': 
            stats.unshift(renderStat("CLOUT", player.clout || 0, "text-pink-400", "✨"));
            break;
    }
    
    return <div className="grid grid-cols-3 md:grid-cols-4 gap-2 w-full">{stats}</div>;
}

const MinigameIcon: React.FC<{ game: MinigameType | null }> = ({ game }) => {
    let icon = '❓';
    if (game === 'kicking') icon = '🏈';
    if (game === 'quarterback') icon = '🎯';
    if (game === 'play_calling') icon = '📋';
    if (game === 'running_back') icon = '🏃';
    if (game === 'fantasy_draft') icon = '📈';
    if (game === 'commentary_battle') icon = '🎤';
    if (game === 'trivia_night') icon = '🧠';
    if (game === 'beer_die') icon = '🎲';
    return <span className="text-lg" title={`Next game: ${game}`}>{icon}</span>;
};

const TimeOfDay: React.FC<{time: number}> = ({time}) => {
    const getGradient = () => {
        if (time < 15) { // Sunrise
            const progress = time / 15;
            return `linear-gradient(90deg, #3B82F6 ${progress * 50}%, #F59E0B, #1E3A8A)`;
        } else if (time < 85) { // Day
            return `linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6)`;
        } else { // Sunset
            const progress = (time - 85) / 15;
            return `linear-gradient(90deg, #1E3A8A, #D97706, #111827 ${progress * 50}%)`;
        }
    }

    const sunPosition = `${time}%`;
    const icon = time > 15 && time < 85 ? '☀️' : '🌙';

    return (
        <div className="w-full">
            <div className="text-xs font-bold text-center mb-1 text-gray-400">DAY {Math.floor(time / 100) + 1}</div>
            <div className={`w-full h-4 rounded-full relative overflow-hidden`} style={{ background: getGradient() }}>
                <div className="absolute top-1/2 -translate-y-1/2 text-xs transition-all duration-100 linear" style={{ left: sunPosition, transform: `translateX(-${sunPosition}) translateY(-50%)` }}>
                    {icon}
                </div>
            </div>
            <style>{`
                @keyframes fade-up {
                    0% { opacity: 1; transform: translateY(0) translateX(-50%); }
                    100% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                }
                .animate-fade-up { animation: fade-up 2s ease-out forwards; }
            `}</style>
        </div>
    );
};

interface HUDProps {
  player: PlayerState;
  day: number;
  week: number;
  weeklyGritGoal: number;
  onActionClick: (action: 'store' | 'minigame' | 'manage' | 'achievements') => void;
  timeOfDay: number;
  nextMinigame: MinigameType | null;
  seasonGoals: SeasonGoal[];
}

export const HUD: React.FC<HUDProps> = ({ player, day, week, weeklyGritGoal, onActionClick, timeOfDay, nextMinigame, seasonGoals }) => {
  const [showGoals, setShowGoals] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const statusMessage = getStatusMessage(player);
  const gritProgress = Math.min(100, (player.grit / weeklyGritGoal) * 100);

  return (
    <div className="w-full ios-glass backdrop-blur-xl border-b border-white/10 shadow-lg z-20">
      {/* iOS-style info bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
            <MiniBeastIcon characterId={player.id} isTalking={false} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">{player.name}</h2>
            <p className="text-white/60 text-xs">Week {week}, Day {day}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowStats(!showStats)} 
          className="ios-button-secondary px-3 py-1 text-sm"
        >
          Stats
        </button>
      </div>

      {/* Stats Panel - Collapsible */}
      {showStats && (
        <div className="p-4 border-b border-white/10" style={{animation: 'slide-up 0.3s ease-out'}}>
          <CharacterStats player={player} />
          <div className="mt-3 ios-glass rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-xs font-semibold">Weekly Goal</span>
              <span className="text-white text-xs font-bold">{player.grit} / {weeklyGritGoal}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${gritProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-3 flex gap-2 overflow-x-auto ios-scrollbar">
        <button 
          onClick={() => onActionClick('minigame')} 
          className="ios-button flex-shrink-0 flex items-center gap-2 text-sm"
        >
          <MinigameIcon game={nextMinigame} /> Play Game
        </button>
        <button 
          onClick={() => onActionClick('store')} 
          className="ios-button-secondary flex-shrink-0 text-sm"
        >
          🛍️ Store
        </button>
        <button 
          onClick={() => onActionClick('manage')} 
          className="ios-button-secondary flex-shrink-0 text-sm"
        >
          ⚙️ Manage
        </button>
        <button 
          onClick={() => onActionClick('achievements')} 
          className="ios-button-secondary flex-shrink-0 text-sm"
        >
          🏆 Goals
        </button>
      </div>
    </div>
  );
};
// Simple Dashboard/Roster view component
export const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-orbitron mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          Roster & Stats
        </h2>
        <p className="text-slate-300 text-lg mb-6">
          Your complete roster stats, player profiles, and season performance will be displayed here.
        </p>
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-400">Total Grit Earned</span>
            <span className="text-emerald-400 font-bold text-xl">Coming Soon</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-400">Games Played</span>
            <span className="text-cyan-400 font-bold text-xl">Coming Soon</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-400">Best Streak</span>
            <span className="text-yellow-400 font-bold text-xl">Coming Soon</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-6 italic">
          Full roster management and detailed stats are being implemented. Stay tuned!
        </p>
      </div>
    </div>
  );
};
