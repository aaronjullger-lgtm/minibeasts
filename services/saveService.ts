import { PlayerState } from '../types';

export interface SavedGame {
  player: PlayerState;
  ranking: PlayerState[];
  day: number;
  week: number;
  timestamp: number;
  version: string;
}

const SAVE_KEY = 'minibeasts_save';
const SAVE_VERSION = '1.0.0';

export const saveService = {
  /**
   * Save the current game state to localStorage
   */
  saveGame(player: PlayerState, ranking: PlayerState[], day: number, week: number): boolean {
    try {
      const saveData: SavedGame = {
        player,
        ranking,
        day,
        week,
        timestamp: Date.now(),
        version: SAVE_VERSION
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  },

  /**
   * Load the saved game from localStorage
   */
  loadGame(): SavedGame | null {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) return null;
      
      const parsed = JSON.parse(savedData) as SavedGame;
      
      // Version check - could handle migrations here in future
      if (parsed.version !== SAVE_VERSION) {
        console.warn('Save version mismatch, may need migration');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  },

  /**
   * Check if a saved game exists
   */
  hasSavedGame(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  },

  /**
   * Delete the saved game
   */
  deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  },

  /**
   * Get save info without loading full data
   */
  getSaveInfo(): { timestamp: number; week: number; playerName: string } | null {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) return null;
      
      const parsed = JSON.parse(savedData) as SavedGame;
      return {
        timestamp: parsed.timestamp,
        week: parsed.week,
        playerName: parsed.player.name
      };
    } catch (error) {
      return null;
    }
  }
};
