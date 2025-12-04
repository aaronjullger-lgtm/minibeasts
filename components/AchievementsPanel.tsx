import React, { useState, useEffect } from 'react';
import { achievementService } from '../services/achievementService';
import { Achievement } from '../types';

export const AchievementsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [achievements, setAchievements] = useState<Array<Achievement & { unlocked: boolean; unlockedAt?: number }>>([]);
  const [progress, setProgress] = useState({ total: 0, unlocked: 0, percentage: 0 });
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    const allAchievements = achievementService.getAllAchievementsWithStatus();
    setAchievements(allAchievements);
    setProgress(achievementService.getProgress());
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryIcon = (id: string): string => {
    if (id.includes('ROAST')) return '💬';
    if (id.includes('MINIGAME') || id.includes('KICKING') || id.includes('QB') || id.includes('RB') || id.includes('DRAFT') || id.includes('TRIVIA') || id.includes('DIE') || id.includes('SUNDAY') || id.includes('COMMISH') || id.includes('TY') || id.includes('BITCHLESS')) return '🎮';
    if (id.includes('GRIT') || id.includes('HAPPINESS') || id.includes('ENERGY') || id.includes('STAT') || id.includes('MAX')) return '📊';
    if (id.includes('GF') || id.includes('SOCIAL') || id.includes('TY_WINDOW') || id.includes('ARGUMENT')) return '💕';
    if (id.includes('STORE') || id.includes('BUY') || id.includes('SPEND') || id.includes('HIT')) return '💰';
    if (id.includes('WEEK') || id.includes('SEASON') || id.includes('SURVIVOR')) return '📅';
    if (id.includes('EGO') || id.includes('STRESS') || id.includes('SECURE')) return '🎭';
    return '🏆';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border-2 border-slate-700 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              🏆 Achievements
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">
                {progress.unlocked} / {progress.total} Unlocked
              </span>
              <span className="text-amber-400 font-bold">{progress.percentage}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            {(['all', 'unlocked', 'locked'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === filterOption
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAchievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-slate-400">No achievements in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-amber-500/50'
                      : 'bg-slate-800/50 border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl flex-shrink-0 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {getCategoryIcon(achievement.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm mb-1 ${achievement.unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="mt-2 text-[0.65rem] text-amber-500/70">
                          Unlocked {formatDate(achievement.unlockedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
