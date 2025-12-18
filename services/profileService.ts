import { RiskProfile, RiskProfileType, PrestigeLevel, UserProfile, PersonalityTestQuestion, AscensionOffer } from '../types';

/**
 * Profile Service
 * Manages user profiles, risk profiles, and prestige levels
 */

// Personality Test Questions
export const PERSONALITY_TEST_QUESTIONS: PersonalityTestQuestion[] = [
  {
    id: 'q1',
    question: 'Do you bet with your head or your heart?',
    options: [
      {
        text: 'HEAD - I analyze the numbers',
        weight: { THE_ALGO: 3, THE_DEGENERATE: 0, THE_SHARK: 1 }
      },
      {
        text: 'HEART - I trust my gut',
        weight: { THE_ALGO: 0, THE_DEGENERATE: 3, THE_SHARK: 1 }
      },
      {
        text: 'NEITHER - I exploit others',
        weight: { THE_ALGO: 1, THE_DEGENERATE: 0, THE_SHARK: 3 }
      }
    ]
  },
  {
    id: 'q2',
    question: 'A 1000:1 odds bet exists. Do you take it?',
    options: [
      {
        text: 'NO - Expected value is terrible',
        weight: { THE_ALGO: 3, THE_DEGENERATE: 0, THE_SHARK: 1 }
      },
      {
        text: 'YES - You miss 100% of the shots you don\'t take',
        weight: { THE_ALGO: 0, THE_DEGENERATE: 3, THE_SHARK: 1 }
      },
      {
        text: 'MAYBE - If I can hedge it in the market',
        weight: { THE_ALGO: 1, THE_DEGENERATE: 0, THE_SHARK: 3 }
      }
    ]
  },
  {
    id: 'q3',
    question: 'Your friend is on a losing streak. What do you do?',
    options: [
      {
        text: 'Show them the analytics',
        weight: { THE_ALGO: 3, THE_DEGENERATE: 1, THE_SHARK: 0 }
      },
      {
        text: 'Double down with them',
        weight: { THE_ALGO: 0, THE_DEGENERATE: 3, THE_SHARK: 1 }
      },
      {
        text: 'Bet against them',
        weight: { THE_ALGO: 1, THE_DEGENERATE: 0, THE_SHARK: 3 }
      }
    ]
  }
];

// Risk Profile Definitions
export const RISK_PROFILES: Record<RiskProfileType, RiskProfile> = {
  THE_ALGO: {
    type: 'THE_ALGO',
    name: 'The Algo',
    description: 'Analytics-focused. You trust the numbers, not the noise.',
    icon: 'Calculator',
    bonuses: {
      prophecyCardBonus: 1.15 // 15% bonus to Prophecy Card payouts
    }
  },
  THE_DEGENERATE: {
    type: 'THE_DEGENERATE',
    name: 'The Degenerate',
    description: 'High-risk, high-reward. You live for the thrill.',
    icon: 'Skull',
    bonuses: {
      parlayBonus: 1.2 // 20% bonus to Parlay payouts
    }
  },
  THE_SHARK: {
    type: 'THE_SHARK',
    name: 'The Shark',
    description: 'PVP-focused. You make your money off others.',
    icon: 'Wolf',
    bonuses: {
      tradingBonus: 0.95 // 5% discount on trading fees
    }
  }
};

/**
 * Calculate risk profile based on personality test answers
 */
export function calculateRiskProfile(answers: number[][]): RiskProfile {
  const scores: Record<RiskProfileType, number> = {
    THE_ALGO: 0,
    THE_DEGENERATE: 0,
    THE_SHARK: 0
  };

  // Calculate total weight for each profile type
  answers.forEach((answer, questionIndex) => {
    const question = PERSONALITY_TEST_QUESTIONS[questionIndex];
    const optionIndex = answer[0];
    const option = question.options[optionIndex];
    
    scores.THE_ALGO += option.weight.THE_ALGO;
    scores.THE_DEGENERATE += option.weight.THE_DEGENERATE;
    scores.THE_SHARK += option.weight.THE_SHARK;
  });

  // Find highest scoring profile
  const highestScore = Math.max(scores.THE_ALGO, scores.THE_DEGENERATE, scores.THE_SHARK);
  
  if (scores.THE_ALGO === highestScore) {
    return RISK_PROFILES.THE_ALGO;
  } else if (scores.THE_DEGENERATE === highestScore) {
    return RISK_PROFILES.THE_DEGENERATE;
  } else {
    return RISK_PROFILES.THE_SHARK;
  }
}

/**
 * Create a new user profile
 */
export function createUserProfile(userId: string, userName: string, riskProfile: RiskProfile): UserProfile {
  return {
    userId,
    userName,
    riskProfile,
    prestigeLevels: [],
    hasAscended: false,
    totalGritBurned: 0
  };
}

/**
 * Get user profile from localStorage
 */
export function getUserProfile(userId: string): UserProfile | null {
  try {
    const stored = localStorage.getItem(`user_profile_${userId}`);
    if (!stored) return null;
    return JSON.parse(stored) as UserProfile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(`user_profile_${profile.userId}`, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * Check if ascension is available for the current season
 */
export function isAscensionAvailable(season: number): boolean {
  // In production, this would check if the NFL season has ended
  // For demo purposes, we'll allow it manually
  const seasonEndDate = new Date('2024-02-11'); // Super Bowl Sunday example
  const now = new Date();
  
  // Allow manual override via localStorage for demo
  const manualOverride = localStorage.getItem('ascension_available');
  if (manualOverride === 'true') {
    return true;
  }
  
  return now >= seasonEndDate;
}

/**
 * Create an ascension offer for the user
 */
export function createAscensionOffer(currentGrit: number, season: number): AscensionOffer {
  const isAvailable = isAscensionAvailable(season);
  
  // Calculate multiplier based on prestige level
  // Each ascension adds 0.05 (5%) to the multiplier, starting at 1.1 (10%)
  const multiplier = 1.1;
  
  return {
    currentGrit,
    season,
    badge: `Season ${season} Survivor`,
    multiplier,
    isAvailable
  };
}

/**
 * Perform ascension (burn grit, grant prestige)
 */
export function performAscension(profile: UserProfile, currentGrit: number, season: number): UserProfile {
  const newPrestigeLevel: PrestigeLevel = {
    season,
    badge: `Season ${season} Survivor`,
    multiplier: 1.1 + (profile.prestigeLevels.length * 0.05), // Increases with each ascension
    ascendedAt: Date.now()
  };

  return {
    ...profile,
    prestigeLevels: [...profile.prestigeLevels, newPrestigeLevel],
    hasAscended: true,
    totalGritBurned: profile.totalGritBurned + currentGrit
  };
}

/**
 * Get total multiplier from all prestige levels
 */
export function getTotalPrestigeMultiplier(profile: UserProfile): number {
  if (profile.prestigeLevels.length === 0) {
    return 1.0;
  }
  
  // Return the highest multiplier (most recent ascension)
  const latest = profile.prestigeLevels[profile.prestigeLevels.length - 1];
  return latest.multiplier;
}

/**
 * Apply prestige multiplier to grit earnings
 */
export function applyPrestigeMultiplier(baseGrit: number, profile: UserProfile): number {
  const multiplier = getTotalPrestigeMultiplier(profile);
  return Math.floor(baseGrit * multiplier);
}

/**
 * Get risk profile icon SVG
 */
export function getRiskProfileIcon(iconName: string): string {
  const icons: Record<string, string> = {
    Calculator: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="7" y="5" width="10" height="3" fill="currentColor"/><rect x="7" y="10" width="2" height="2" fill="currentColor"/><rect x="11" y="10" width="2" height="2" fill="currentColor"/><rect x="15" y="10" width="2" height="2" fill="currentColor"/><rect x="7" y="14" width="2" height="2" fill="currentColor"/><rect x="11" y="14" width="2" height="2" fill="currentColor"/><rect x="15" y="14" width="2" height="2" fill="currentColor"/><rect x="7" y="18" width="6" height="2" fill="currentColor"/><rect x="15" y="18" width="2" height="2" fill="currentColor"/></svg>`,
    Skull: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 4 5 4 9C4 11 4.5 13 6 14.5V18C6 19.1 6.9 20 8 20H9V22H11V20H13V22H15V20H16C17.1 20 18 19.1 18 18V14.5C19.5 13 20 11 20 9C20 5 16 2 12 2M9 12C8.4 12 8 11.6 8 11C8 10.4 8.4 10 9 10C9.6 10 10 10.4 10 11C10 11.6 9.6 12 9 12M15 12C14.4 12 14 11.6 14 11C14 10.4 14.4 10 15 10C15.6 10 16 10.4 16 11C16 11.6 15.6 12 15 12M11 16H9V14H11V16M15 16H13V14H15V16Z"/></svg>`,
    Wolf: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 2L6 8L2 9L4 13L3 20H8L12 22L16 20H21L20 13L22 9L18 8L16 2L12 5L8 2M12 9C13.1 9 14 9.9 14 11C14 12.1 13.1 13 12 13C10.9 13 10 12.1 10 11C10 9.9 10.9 9 12 9M12 15C14.7 15 17 16.3 17 18V19H7V18C7 16.3 9.3 15 12 15Z"/></svg>`
  };
  
  return icons[iconName] || '';
}
