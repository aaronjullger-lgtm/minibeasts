import { PlayerState, GlobalState, Message, Achievement } from '../types';
import { saveService } from './saveService';
import { gameStateService } from './gameStateService';
import { achievementService } from './achievementService';
import { rivalryService } from './rivalryService';
import { settingsService } from './settingsService';
import { soundService } from './soundService';

/**
 * Centralized game manager to coordinate all services
 * This provides a single interface for game state management
 */
export class GameManager {
  private static instance: GameManager;

  private constructor() {}

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Initialize a new game
   */
  initializeGame(player: PlayerState, allPlayers: PlayerState[]): {
    player: PlayerState;
    ranking: PlayerState[];
    week: number;
    day: number;
  } {
    return {
      player,
      ranking: gameStateService.calculateRanking(allPlayers),
      week: 1,
      day: 1
    };
  }

  /**
   * Load a saved game
   */
  loadGame() {
    return saveService.loadGame();
  }

  /**
   * Save current game state
   */
  saveGame(player: PlayerState, ranking: PlayerState[], day: number, week: number): boolean {
    return saveService.saveGame(player, ranking, day, week);
  }

  /**
   * Advance to the next day with all side effects
   */
  advanceDay(
    currentDay: number,
    currentWeek: number,
    player: PlayerState,
    ranking: PlayerState[]
  ): {
    day: number;
    week: number;
    weekChanged: boolean;
    player: PlayerState;
    ranking: PlayerState[];
    achievements: Achievement[];
  } {
    const { day, week, weekChanged } = gameStateService.advanceDay(currentDay, currentWeek);

    // Reset energy at start of new day
    const updatedPlayer = { ...player, energy: 3 };

    // Calculate new ranking
    const updatedRanking = gameStateService.calculateRanking(
      ranking.map(p => (p.id === player.id ? updatedPlayer : p))
    );

    // Check for achievements
    const newAchievements: Achievement[] = [];

    // Week completion achievement
    if (weekChanged) {
      const weekAchievement = achievementService.unlockAchievement(`WEEK_${currentWeek}_SURVIVOR`);
      if (weekAchievement) {
        newAchievements.push(weekAchievement);
        soundService.playAchievement();
      }
    }

    // Add history entry
    if (weekChanged) {
      gameStateService.addHistoryEntry({
        week: currentWeek,
        day: currentDay,
        event: `Completed Week ${currentWeek}`
      });
    }

    return {
      day,
      week,
      weekChanged,
      player: updatedPlayer,
      ranking: updatedRanking,
      achievements: newAchievements
    };
  }

  /**
   * Update player stats with achievement checking
   */
  updatePlayerStats(
    player: PlayerState,
    updates: Partial<PlayerState>
  ): {
    player: PlayerState;
    achievements: Achievement[];
  } {
    const updatedPlayer = { ...player, ...updates };
    const newAchievements: Achievement[] = [];

    // Check stat-based achievements
    if (updatedPlayer.grit >= 1000) {
      const achievement = achievementService.unlockAchievement('GRIT_KING');
      if (achievement) {
        newAchievements.push(achievement);
        soundService.playAchievement();
      }
    }

    if (updatedPlayer.happiness === 100) {
      const achievement = achievementService.unlockAchievement('MAX_HAPPINESS');
      if (achievement) {
        newAchievements.push(achievement);
        soundService.playAchievement();
      }
    }

    if (updatedPlayer.loveLife >= 100) {
      const achievement = achievementService.unlockAchievement('GF_SECURED');
      if (achievement) {
        newAchievements.push(achievement);
        soundService.playAchievement();
      }
    }

    return {
      player: updatedPlayer,
      achievements: newAchievements
    };
  }

  /**
   * Handle minigame completion with all side effects
   */
  completeMinigame(
    player: PlayerState,
    minigameId: string,
    gritEarned: number,
    week: number,
    day: number
  ): {
    player: PlayerState;
    achievements: Achievement[];
  } {
    const updatedPlayer = { ...player, grit: player.grit + gritEarned };
    const newAchievements: Achievement[] = [];

    // Add history entry
    gameStateService.addHistoryEntry({
      week,
      day,
      event: `Played ${minigameId} minigame`,
      gritChange: gritEarned
    });

    // Check minigame-specific achievements
    const minigameAchievementId = `MINIGAME_${minigameId.toUpperCase()}_MASTER`;
    const achievement = achievementService.unlockAchievement(minigameAchievementId);
    if (achievement) {
      newAchievements.push(achievement);
      soundService.playAchievement();
    }

    // Check high score achievements
    if (gritEarned >= 100) {
      const highScore = achievementService.unlockAchievement('MINIGAME_HIGH_SCORE');
      if (highScore) {
        newAchievements.push(highScore);
        soundService.playAchievement();
      }
    }

    // Play sound
    if (gritEarned > 0) {
      soundService.playGritGain();
    }

    return {
      player: updatedPlayer,
      achievements: newAchievements
    };
  }

  /**
   * Handle rivalry creation
   */
  createRivalry(
    targetId: string,
    targetName: string,
    reason: string,
    intensity: number
  ) {
    const rivalry = rivalryService.addRivalryEvent(targetId, targetName, {
      type: 'roast',
      description: reason,
      intensityChange: intensity
    });

    // Check rivalry achievement
    if (rivalry.level >= 5) {
      const achievement = achievementService.unlockAchievement('RIVALRY_MAX');
      if (achievement) {
        soundService.playAchievement();
        return { rivalry, achievement };
      }
    }

    return { rivalry, achievement: null };
  }

  /**
   * Get comprehensive game statistics
   */
  getGameStats(player: PlayerState, allPlayers: PlayerState[]) {
    const rank = gameStateService.getPlayerRank(player, allPlayers);
    const history = gameStateService.getHistorySummary();
    const achievements = achievementService.getProgress();
    const rivalries = rivalryService.getRivalries();
    const alliances = rivalryService.getAlliances();

    return {
      rank,
      totalPlayers: allPlayers.length,
      history,
      achievements,
      rivalries: rivalries.filter(r => !r.resolved),
      alliances,
      rivalryEffects: rivalryService.getRivalryEffects(rivalries),
      allianceEffects: rivalryService.getAllianceEffects(alliances)
    };
  }

  /**
   * Reset all game data (for new game)
   */
  resetGame() {
    saveService.deleteSave();
    gameStateService.clearHistory();
    rivalryService.clearAll();
    // Note: We don't clear achievements as they persist across games
  }

  /**
   * Get settings
   */
  getSettings() {
    return settingsService.getSettings();
  }

  /**
   * Update settings
   */
  updateSettings(updates: Partial<ReturnType<typeof settingsService.getSettings>>) {
    const currentSettings = settingsService.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    settingsService.saveSettings(newSettings);
    return newSettings;
  }
}

// Export singleton instance
export const gameManager = GameManager.getInstance();
