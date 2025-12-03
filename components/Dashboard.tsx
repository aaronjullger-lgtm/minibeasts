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
    const [statChanges, setStatChanges] = useState<Array<{ id: number, label: string, value: number }>>([]);
    const prevPlayer = usePrevious(player);

    useEffect(() => {
        if (!prevPlayer) return;
        const changes: Array<{ id: number, label: string, value: number }> = [];
        
        const checkStat = (stat: keyof PlayerState, label: string) => {
            const currentValue = player[stat] as number | undefined;
            const prevValue = prevPlayer[stat] as number | undefined;
            if (currentValue !== undefined && prevValue !== undefined && currentValue !== prevValue) {
                changes.push({
                    id: Date.now() + Math.random(),
                    label,
                    value: currentValue - prevValue
                });
            }
        };

        checkStat('grit', 'GRIT');
        checkStat('happiness', 'HAPPINESS');
        checkStat('energy', 'ENERGY');
        if (player.id === 'aaron') checkStat('paSchoolStress', 'STRESS');
        if (player.id === 'elie') checkStat('ego', 'EGO');
        if (player.id === 'craif') checkStat('insecurity', 'INSECURITY');
        if (player.id === 'colin') checkStat('parlayAddiction', 'ADDICTION');
        if (player.id === 'spencer') checkStat('commishPower', 'POWER');
        if (player.id === 'pace') checkStat('clout', 'CLOUT');

        if (changes.length > 0) {
            setStatChanges(prev => [...prev, ...changes]);
            changes.forEach(change => {
                setTimeout(() => {
                    setStatChanges(prev => prev.filter(c => c.id !== change.id));
                }, 2000);
            });
        }

    }, [player, prevPlayer]);

    const StatDisplay: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
        <StatTooltip text={statDescriptions[label] || "A measure of something important."}>
            <div className="cursor-help relative">
                <span className={`block text-xs font-bold ${color}`}>{label}</span>
                <span className="font-graduate text-lg md:text-2xl">{value}</span>
                {statChanges.filter(c => c.label === label).map(change => (
                    <div key={change.id} className={`absolute top-0 left-1/2 -translate-x-1/2 font-bold text-lg animate-fade-up ${change.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change.value > 0 ? `+${change.value}` : change.value}
                    </div>
                ))}
            </div>
        </StatTooltip>
    );

    const getStats = () => {
        const coreStats = [
            <StatDisplay key="grit" label="GRIT" value={player.grit} color="text-blue-400" />,
            <StatDisplay key="happy" label="HAPPINESS" value={player.happiness} color="text-green-400" />,
            <StatDisplay key="energy" label="ENERGY" value={player.energy} color="text-yellow-400" />
        ];

        switch (player.id) {
            case 'aaron': return [<StatDisplay key="stress" label="STRESS" value={player.paSchoolStress} color="text-red-400" />, ...coreStats];
            case 'elie': return [<StatDisplay key="ego" label="EGO" value={player.ego} color="text-purple-400" />, ...coreStats];
            case 'craif': return [<StatDisplay key="insecurity" label="INSECURITY" value={player.insecurity} color="text-gray-400" />, ...coreStats];
            case 'colin': return [<StatDisplay key="addiction" label="ADDICTION" value={player.parlayAddiction || 0} color="text-red-500" />, ...coreStats];
            case 'spencer': return [<StatDisplay key="power" label="POWER" value={player.commishPower || 0} color="text-teal-400" />, ...coreStats];
            case 'pace': return [<StatDisplay key="clout" label="CLOUT" value={player.clout || 0} color="text-pink-400" />, ...coreStats];
            default: return coreStats;
        }
    };
    
    return <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 text-center">{getStats()}</div>;
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
  const statusMessage = getStatusMessage(player);
  const gritProgress = Math.min(100, (player.grit / weeklyGritGoal) * 100);

  return (
    <div className="w-full glass-dark backdrop-blur-xl p-4 shadow-2xl z-20 flex flex-col gap-4 text-white border-b-2 border-blue-500/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-3 border-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 shadow-lg neon-blue p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              <MiniBeastIcon characterId={player.id} isTalking={false} />
            </div>
          </div>
          <div className="flex-grow">
            <h2 className="font-orbitron text-2xl md:text-3xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-bold">{player.name}</h2>
            <p className="text-sm md:text-base text-cyan-300 italic font-semibold">"{statusMessage}"</p>
          </div>
        </div>
        <div className="hidden md:block w-px h-14 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
        <CharacterStats player={player} />
        <div className="hidden md:block w-px h-14 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
        <div className="flex items-center gap-4">
           <div className="relative">
              <button onClick={() => setShowGoals(!showGoals)} onBlur={() => setShowGoals(false)} className="text-right hover:text-cyan-300 transition-colors glass rounded-xl p-3 border border-blue-500/30">
                <h3 className="font-orbitron text-xl md:text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-bold">Week {week}</h3>
                <p className="text-xs md:text-sm text-gray-400 font-semibold">Day {day}</p>
              </button>
              {showGoals && (
                <div className="absolute top-full right-0 mt-2 w-80 glass-dark border-2 border-blue-500/30 rounded-xl p-4 shadow-2xl z-10 neon-blue">
                    <h4 className="font-bold text-xl mb-3 text-cyan-300 font-orbitron">Season Goals</h4>
                    <ul className="space-y-2">
                        {seasonGoals.map(goal => (
                            <li key={goal.id} className={`text-sm font-semibold ${goal.isCompleted ? 'text-green-400 line-through' : 'text-gray-200'}`}>
                                {goal.description}
                            </li>
                        ))}
                    </ul>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-full md:hidden"><TimeOfDay time={timeOfDay} /></div>
        <button onClick={() => onActionClick('store')} className="btn-modern bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold py-3 px-4 text-sm md:text-base md:px-5 rounded-xl transition-transform transform hover:scale-105 shadow-lg border border-purple-400/30 neon-purple font-orbitron">Store</button>
        <button onClick={() => onActionClick('minigame')} className="btn-modern bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 font-bold py-3 px-4 text-sm md:text-base md:px-5 rounded-xl transition-transform transform hover:scale-105 flex items-center gap-2 shadow-lg border border-yellow-400/30 font-orbitron" style={{boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'}}>
          Game <MinigameIcon game={nextMinigame} />
        </button>
        <button onClick={() => onActionClick('manage')} className="btn-modern bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold py-3 px-4 text-sm md:text-base md:px-5 rounded-xl transition-transform transform hover:scale-105 shadow-lg border border-red-400/30 neon-pink font-orbitron">Manage</button>
        <button onClick={() => onActionClick('achievements')} className="btn-modern bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold py-3 px-4 text-sm md:text-base md:px-5 rounded-xl transition-transform transform hover:scale-105 shadow-lg border border-green-400/30 neon-green font-orbitron">🏆</button>

      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-grow">
            <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-cyan-300 font-orbitron">WEEKLY GRIT GOAL</span>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-orbitron">{player.grit} / {weeklyGritGoal}</span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-3 border border-blue-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 h-full rounded-full animate-gradient shadow-lg" style={{ width: `${gritProgress}%`, transition: 'width 0.5s ease-in-out', boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)' }}></div>
            </div>
        </div>
        <div className="w-48 flex-shrink-0 hidden md:block">
             <TimeOfDay time={timeOfDay} />
        </div>
      </div>
    </div>
  );
};