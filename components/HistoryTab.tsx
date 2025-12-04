import React, { useState, useEffect } from 'react';
import { gameStateService, GameHistory } from '../services/gameStateService';

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof gameStateService.getHistorySummary> | null>(null);
  const [filter, setFilter] = useState<'all' | number>('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = () => {
    if (filter === 'all') {
      setHistory(gameStateService.getHistory());
    } else {
      setHistory(gameStateService.getWeekHistory(filter));
    }
    setSummary(gameStateService.getHistorySummary());
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (history.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          No History Yet
        </h3>
        <p className="text-slate-400 text-sm max-w-sm">
          Start playing Dynasty Mode to build your legend. Every parlay, every roast, every triumph and disaster will be recorded here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="ios-glass rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Total Events</div>
            <div className="text-2xl font-bold text-emerald-300">{summary.totalEvents}</div>
          </div>
          <div className="ios-glass rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Grit Earned</div>
            <div className="text-2xl font-bold text-green-400">+{summary.totalGritEarned}</div>
          </div>
          <div className="ios-glass rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Grit Lost</div>
            <div className="text-2xl font-bold text-red-400">-{summary.totalGritLost}</div>
          </div>
          <div className="ios-glass rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Best Week</div>
            <div className="text-2xl font-bold text-amber-300">
              {summary.bestWeek ? `W${summary.bestWeek.week}` : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {[...Array(17)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setFilter(i + 1)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === i + 1
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Week {i + 1}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {history.map((entry, index) => (
          <div
            key={`${entry.timestamp}-${index}`}
            className="ios-glass rounded-xl p-3 flex items-start gap-3"
          >
            <div className="flex-shrink-0">
              <div className="text-xs text-slate-400">
                Week {entry.week}, Day {entry.day}
              </div>
              <div className="text-[0.65rem] text-slate-500">
                {formatTimestamp(entry.timestamp)}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-200">{entry.event}</div>
            </div>
            {entry.gritChange !== undefined && (
              <div
                className={`flex-shrink-0 font-bold text-sm ${
                  entry.gritChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {entry.gritChange > 0 ? '+' : ''}
                {entry.gritChange}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
