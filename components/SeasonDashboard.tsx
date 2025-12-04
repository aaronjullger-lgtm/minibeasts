import React, { useState } from 'react';
import { seasonProgressionService, WeeklyObjective } from '../services/seasonProgressionService';
import { rivalryService, Rivalry, Alliance } from '../services/rivalryService';
import { PlayerState } from '../types';
import { PrimaryButton, SecondaryButton, CardButton, PillButton } from './EnhancedButtons';
import { ProgressBar } from './VisualFeedback';

interface SeasonDashboardProps {
  player: PlayerState;
  currentWeek: number;
  onClose?: () => void;
}

export const SeasonDashboard: React.FC<SeasonDashboardProps> = ({
  player,
  currentWeek,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'objectives' | 'rivalries' | 'legacy'>('objectives');
  
  const weeklyObjectives = seasonProgressionService.generateWeeklyObjectives(currentWeek, player);
  const rivalries = rivalryService.getRivalries();
  const alliances = rivalryService.getAlliances();
  const legacy = seasonProgressionService.getPlayerLegacy();
  const weekFlavor = seasonProgressionService.getWeekFlavor(currentWeek);
  const milestones = seasonProgressionService.getSeasonMilestones();

  const completedObjectives = weeklyObjectives.filter(obj => obj.completed).length;
  const objectiveProgress = (completedObjectives / weeklyObjectives.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl max-w-4xl w-full border-2 border-blue-500/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-slate-700/50 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="absolute inset-0 shimmer" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl animate-float">{weekFlavor.emoji}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{weekFlavor.title}</h2>
                    <p className="text-blue-300">{weekFlavor.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="px-4 py-2 rounded-full bg-blue-600/30 border border-blue-500/50 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-blue-200">
                      Season Progress: {Math.round((currentWeek / 17) * 100)}%
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-amber-600/30 border border-amber-500/50 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-amber-200">
                      💪 {player.grit} GRIT
                    </span>
                  </div>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white text-3xl leading-none font-bold transition-all hover:scale-110 hover:rotate-90"
                >
                  ×
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <ProgressBar
                current={currentWeek}
                max={17}
                showPercentage={true}
                color="bg-gradient-to-r from-blue-500 to-purple-500"
                animate={true}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-4 bg-slate-900/50 border-b border-slate-700/50">
          <PillButton
            active={activeTab === 'objectives'}
            onClick={() => setActiveTab('objectives')}
            icon="🎯"
          >
            Weekly Objectives
          </PillButton>
          <PillButton
            active={activeTab === 'rivalries'}
            onClick={() => setActiveTab('rivalries')}
            icon="⚔️"
          >
            Rivalries & Allies ({rivalries.length + alliances.length})
          </PillButton>
          <PillButton
            active={activeTab === 'legacy'}
            onClick={() => setActiveTab('legacy')}
            icon="🏆"
          >
            Legacy
          </PillButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'objectives' && (
            <div className="space-y-4 animate-slide-in-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">This Week's Challenges</h3>
                <div className="text-sm text-slate-400">
                  {completedObjectives}/{weeklyObjectives.length} Complete
                </div>
              </div>

              {weeklyObjectives.map((objective) => (
                <ObjectiveCard key={objective.id} objective={objective} />
              ))}

              {completedObjectives === weeklyObjectives.length && (
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 animate-bounce-in">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-green-300 mb-1">Perfect Week!</div>
                    <div className="text-slate-300">All objectives completed. You're a legend.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rivalries' && (
            <div className="space-y-6 animate-slide-in-left">
              {/* Rivalries */}
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <span>⚔️</span>
                  Active Rivalries
                </h3>
                {rivalries.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No rivalries yet. Maybe you're too nice? 😇
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rivalries.map((rivalry) => (
                      <RivalryCard key={rivalry.id} rivalry={rivalry} />
                    ))}
                  </div>
                )}
              </div>

              {/* Alliances */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <span>🤝</span>
                  Alliances
                </h3>
                {alliances.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No alliances yet. Everyone for themselves! 💀
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alliances.map((alliance) => (
                      <AllianceCard key={alliance.id} alliance={alliance} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'legacy' && (
            <div className="space-y-6 animate-slide-in-left">
              <div className="grid grid-cols-2 gap-4">
                <LegacyStat
                  icon="🏆"
                  label="Seasons Completed"
                  value={legacy.seasonsCompleted}
                  color="text-yellow-400"
                />
                <LegacyStat
                  icon="💪"
                  label="Total Grit Earned"
                  value={legacy.totalGritEarned.toLocaleString()}
                  color="text-amber-400"
                />
                <LegacyStat
                  icon="⭐"
                  label="Perfect Weeks"
                  value={legacy.perfectWeeks}
                  color="text-blue-400"
                />
                <LegacyStat
                  icon="🎮"
                  label="Minigames Won"
                  value={legacy.minigamesCompleted}
                  color="text-green-400"
                />
              </div>

              {/* Legendary Moments */}
              {legacy.legendaryMoments.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-purple-400 mb-4">✨ Legendary Moments</h3>
                  <div className="space-y-2">
                    {legacy.legendaryMoments.map((moment, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 text-purple-200 animate-slide-in-up"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {moment}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Season Milestones */}
              <div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">📍 Season Milestones</h3>
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <MilestoneCard
                      key={milestone.week}
                      milestone={milestone}
                      currentWeek={currentWeek}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-700/50 p-4 bg-slate-900/50 flex gap-3">
          {onClose && (
            <SecondaryButton onClick={onClose} fullWidth>
              Close
            </SecondaryButton>
          )}
          <PrimaryButton onClick={() => {/* Navigate to minigames */}} fullWidth>
            Play Minigames
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

// Helper Components

const ObjectiveCard: React.FC<{ objective: WeeklyObjective }> = ({ objective }) => {
  return (
    <div
      className={`
        group p-5 rounded-xl border-2 transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${
          objective.completed
            ? 'bg-green-900/20 border-green-500/50 hover:border-green-400'
            : objective.special
            ? 'bg-purple-900/20 border-purple-500/50 hover:border-purple-400 animate-pulse-slow'
            : 'bg-slate-900/50 border-slate-700/50 hover:border-blue-500/50'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 transition-transform group-hover:scale-110">
          {objective.completed ? '✅' : objective.special ? '⭐' : '🎯'}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-white mb-1">{objective.title}</h4>
              <p className="text-sm text-slate-300">{objective.description}</p>
            </div>
            {!objective.completed && (
              <div className="px-3 py-1 rounded-full bg-amber-600/30 border border-amber-500/50 text-xs font-semibold text-amber-200 whitespace-nowrap">
                +{objective.reward.grit} GRIT
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RivalryCard: React.FC<{ rivalry: Rivalry }> = ({ rivalry }) => {
  const intensityColors = ['text-gray-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-red-600'];
  const intensityLabels = ['Mild', 'Brewing', 'Heated', 'Intense', 'LEGENDARY'];

  return (
    <div className="group p-4 rounded-xl bg-red-900/10 border-2 border-red-500/30 hover:border-red-500/60 transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">😡</span>
          <div>
            <div className="font-bold text-white">{rivalry.characterName}</div>
            <div className="text-sm text-slate-400">{rivalry.reason}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${intensityColors[rivalry.level - 1]}`}>
            {intensityLabels[rivalry.level - 1]}
          </div>
          <div className="text-xs text-slate-500">Intensity: {rivalry.level}/5</div>
        </div>
      </div>
    </div>
  );
};

const AllianceCard: React.FC<{ alliance: Alliance }> = ({ alliance }) => {
  return (
    <div className="group p-4 rounded-xl bg-blue-900/10 border-2 border-blue-500/30 hover:border-blue-500/60 transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <div className="font-bold text-white">{alliance.characterName}</div>
            <div className="text-sm text-slate-400">{alliance.benefits[0]}</div>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < alliance.strength ? 'text-blue-400' : 'text-slate-700'}`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const LegacyStat: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
      <div className="text-3xl mb-2 transition-transform group-hover:scale-110">{icon}</div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
};

const MilestoneCard: React.FC<{
  milestone: { week: number; title: string; description: string; reward: string; unlocked: boolean };
  currentWeek: number;
}> = ({ milestone, currentWeek }) => {
  const isReached = currentWeek >= milestone.week;
  const isCurrent = currentWeek === milestone.week;

  return (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all
        ${
          isReached
            ? 'bg-green-900/20 border-green-500/50'
            : isCurrent
            ? 'bg-blue-900/20 border-blue-500/50 animate-pulse'
            : 'bg-slate-900/30 border-slate-700/30'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{isReached ? '✅' : isCurrent ? '🎯' : '🔒'}</div>
        <div className="flex-1">
          <div className="font-bold text-white">Week {milestone.week}: {milestone.title}</div>
          <div className="text-sm text-slate-400">{milestone.description}</div>
          <div className="text-xs text-blue-300 mt-1">Reward: {milestone.reward}</div>
        </div>
      </div>
    </div>
  );
};
