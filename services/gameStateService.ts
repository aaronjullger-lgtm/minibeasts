import { PlayerState, Message, GlobalState } from '../types';
import { SEASON_LENGTH, DAYS_PER_WEEK } from '../constants';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface GameHistory {
  week: number;
  day: number;
  event: string;
  gritChange?: number;
  timestamp: number;
}

const HISTORY_KEY = 'minibeasts_history';
const MAX_HISTORY_ENTRIES = 500;

export const gameStateService = {
  /**
   * Calculate if the season has ended
   */
  isSeasonOver(week: number): boolean {
    return week > SEASON_LENGTH;
  },

  /**
   * Calculate if the week has ended
   */
  isWeekOver(day: number): boolean {
    return day > DAYS_PER_WEEK;
  },

  /**
   * Advance to the next day
   */
  advanceDay(currentDay: number, currentWeek: number): { day: number; week: number; weekChanged: boolean } {
    if (currentDay >= DAYS_PER_WEEK) {
      return {
        day: 1,
        week: currentWeek + 1,
        weekChanged: true
      };
    }
    return {
      day: currentDay + 1,
      week: currentWeek,
      weekChanged: false
    };
  },

  /**
   * Calculate player ranking based on grit
   */
  calculateRanking(players: PlayerState[]): PlayerState[] {
    return [...players].sort((a, b) => b.grit - a.grit);
  },

  /**
   * Get player's current rank
   */
  getPlayerRank(player: PlayerState, allPlayers: PlayerState[]): number {
    const sorted = this.calculateRanking(allPlayers);
    return sorted.findIndex(p => p.id === player.id) + 1;
  },

  /**
   * Calculate stats change between two player states
   */
  calculateStatChanges(
    oldState: PlayerState,
    newState: PlayerState
  ): Partial<Record<keyof PlayerState, number>> {
    const changes: Partial<Record<keyof PlayerState, number>> = {};
    
    const numericKeys: (keyof PlayerState)[] = [
      'grit', 'happiness', 'energy', 'loveLife', 'fandom',
      'paSchoolStress', 'insecurity', 'liberalGfSuspicion',
      'truckMaintenance', 'ego', 'parlayAddiction', 'commishPower', 'clout'
    ];

    numericKeys.forEach(key => {
      const oldValue = oldState[key] as number;
      const newValue = newState[key] as number;
      if (typeof oldValue === 'number' && typeof newValue === 'number') {
        const change = newValue - oldValue;
        if (change !== 0) {
          changes[key] = change;
        }
      }
    });

    return changes;
  },

  /**
   * Add entry to game history
   */
  addHistoryEntry(entry: Omit<GameHistory, 'timestamp'>): void {
    try {
      const history = this.getHistory();
      const newEntry: GameHistory = {
        ...entry,
        timestamp: Date.now()
      };
      
      history.unshift(newEntry); // Add to beginning
      
      // Keep only last MAX_HISTORY_ENTRIES
      if (history.length > MAX_HISTORY_ENTRIES) {
        history.splice(MAX_HISTORY_ENTRIES);
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add history entry:', error);
    }
  },

  /**
   * Get game history
   */
  getHistory(): GameHistory[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  },

  /**
   * Get history for a specific week
   */
  getWeekHistory(week: number): GameHistory[] {
    return this.getHistory().filter(entry => entry.week === week);
  },

  /**
   * Clear game history
   */
  clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  },

  /**
   * Get summary stats from history
   */
  getHistorySummary(): {
    totalGritEarned: number;
    totalGritLost: number;
    totalEvents: number;
    bestWeek: { week: number; grit: number } | null;
  } {
    const history = this.getHistory();
    let totalGritEarned = 0;
    let totalGritLost = 0;
    const weekGrit = new Map<number, number>();

    history.forEach(entry => {
      if (entry.gritChange) {
        if (entry.gritChange > 0) {
          totalGritEarned += entry.gritChange;
        } else {
          totalGritLost += Math.abs(entry.gritChange);
        }

        // Track by week
        const current = weekGrit.get(entry.week) || 0;
        weekGrit.set(entry.week, current + entry.gritChange);
      }
    });

    // Find best week
    let bestWeek: { week: number; grit: number } | null = null;
    weekGrit.forEach((grit, week) => {
      if (!bestWeek || grit > bestWeek.grit) {
        bestWeek = { week, grit };
      }
    });

    return {
      totalGritEarned,
      totalGritLost,
      totalEvents: history.length,
      bestWeek
    };
  },

  /**
   * Format a date for display
   */
  formatGameDate(week: number, day: number): string {
    return `Week ${week}, ${DAY_NAMES[day - 1] || `Day ${day}`}`;
  },

  /**
   * Calculate season progress percentage
   */
  getSeasonProgress(week: number): number {
    return Math.min(100, Math.round((week / SEASON_LENGTH) * 100));
  }
};
