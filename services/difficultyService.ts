import { settingsService } from './settingsService';

/**
 * Service to handle difficulty-based game mechanics
 */
export const difficultyService = {
  /**
   * Get stat drain multiplier based on difficulty
   * Easy: Stats drain 25% slower
   * Normal: Standard drain rate
   * Hard: Stats drain 50% faster
   */
  getStatDrainMultiplier(): number {
    const difficulty = settingsService.getSettings().difficulty;
    switch (difficulty) {
      case 'easy':
        return 0.75;
      case 'hard':
        return 1.5;
      case 'normal':
      default:
        return 1.0;
    }
  },

  /**
   * Get grit reward multiplier based on difficulty
   * Easy: 25% less grit rewards
   * Normal: Standard rewards
   * Hard: 50% more grit rewards
   */
  getGritMultiplier(): number {
    const difficulty = settingsService.getSettings().difficulty;
    switch (difficulty) {
      case 'easy':
        return 0.75;
      case 'hard':
        return 1.5;
      case 'normal':
      default:
        return 1.0;
    }
  },

  /**
   * Get minigame difficulty multiplier
   * Easy: Minigames are easier (more time, easier targets)
   * Normal: Standard difficulty
   * Hard: Minigames are harder (less time, harder targets)
   */
  getMinigameDifficultyMultiplier(): number {
    const difficulty = settingsService.getSettings().difficulty;
    switch (difficulty) {
      case 'easy':
        return 0.7; // 30% easier
      case 'hard':
        return 1.4; // 40% harder
      case 'normal':
      default:
        return 1.0;
    }
  },

  /**
   * Get random event frequency multiplier
   * Easy: Events happen 25% less often
   * Normal: Standard frequency
   * Hard: Events happen 50% more often
   */
  getEventFrequencyMultiplier(): number {
    const difficulty = settingsService.getSettings().difficulty;
    switch (difficulty) {
      case 'easy':
        return 0.75;
      case 'hard':
        return 1.5;
      case 'normal':
      default:
        return 1.0;
    }
  },

  /**
   * Apply difficulty to a stat drain
   */
  applyStatDrain(baseDrain: number): number {
    return Math.round(baseDrain * this.getStatDrainMultiplier());
  },

  /**
   * Apply difficulty to a grit reward
   */
  applyGritReward(baseGrit: number): number {
    return Math.round(baseGrit * this.getGritMultiplier());
  },

  /**
   * Apply difficulty to minigame scoring
   */
  applyMinigameScore(baseScore: number): number {
    return Math.round(baseScore * this.getGritMultiplier());
  },

  /**
   * Check if random event should trigger based on difficulty
   */
  shouldTriggerEvent(baseChance: number): boolean {
    const adjustedChance = baseChance * this.getEventFrequencyMultiplier();
    return Math.random() < adjustedChance;
  },

  /**
   * Get difficulty label and description
   */
  getDifficultyInfo() {
    const difficulty = settingsService.getSettings().difficulty;
    const info = {
      easy: {
        label: 'Easy',
        description: 'Relaxed pace, more forgiving stats, fewer challenges',
        color: 'text-green-400'
      },
      normal: {
        label: 'Normal',
        description: 'Balanced challenge, standard rewards and consequences',
        color: 'text-blue-400'
      },
      hard: {
        label: 'Hard',
        description: 'Intense challenge, faster stat drain, bigger rewards',
        color: 'text-red-400'
      }
    };
    return info[difficulty];
  }
};
