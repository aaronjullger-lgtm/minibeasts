import { Achievement } from '../types';
import { allAchievements } from '../constants';

const ACHIEVEMENT_KEY = 'minibeasts_achievements';

export interface UnlockedAchievement extends Achievement {
  unlockedAt: number;
}

export const achievementService = {
  /**
   * Get all unlocked achievements
   */
  getUnlockedAchievements(): UnlockedAchievement[] {
    try {
      const stored = localStorage.getItem(ACHIEVEMENT_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  },

  /**
   * Check if an achievement is unlocked
   */
  isAchievementUnlocked(achievementId: string): boolean {
    const unlocked = this.getUnlockedAchievements();
    return unlocked.some(a => a.id === achievementId);
  },

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementId: string): UnlockedAchievement | null {
    try {
      // Check if already unlocked
      if (this.isAchievementUnlocked(achievementId)) {
        return null;
      }

      // Find the achievement definition
      const achievement = allAchievements.find(a => a.id === achievementId);
      if (!achievement) {
        console.error('Achievement not found:', achievementId);
        return null;
      }

      // Create unlocked achievement
      const unlockedAchievement: UnlockedAchievement = {
        ...achievement,
        unlockedAt: Date.now()
      };

      // Save to storage
      const unlocked = this.getUnlockedAchievements();
      unlocked.push(unlockedAchievement);
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(unlocked));

      return unlockedAchievement;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      return null;
    }
  },

  /**
   * Get all available achievements with unlock status
   */
  getAllAchievementsWithStatus(): Array<Achievement & { unlocked: boolean; unlockedAt?: number }> {
    const unlocked = this.getUnlockedAchievements();
    const unlockedMap = new Map(unlocked.map(a => [a.id, a.unlockedAt]));

    return allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id)
    }));
  },

  /**
   * Get achievement progress stats
   */
  getProgress(): { total: number; unlocked: number; percentage: number } {
    const total = allAchievements.length;
    const unlocked = this.getUnlockedAchievements().length;
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
    };
  },

  /**
   * Clear all achievements (for debugging/testing)
   */
  clearAchievements(): void {
    localStorage.removeItem(ACHIEVEMENT_KEY);
  }
};
