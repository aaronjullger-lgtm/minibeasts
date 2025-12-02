export interface CharacterData {
  id: string;
  name: string;
  rank: number;
  girlfriend: boolean;
  wife?: boolean;
  nflTeamColor: string;
  bio: string;
}

export interface PlayerState extends CharacterData {
  grit: number;
  happiness: number;
  energy: number;
  // Character-specific stats
  paSchoolStress: number; // Aaron
  insecurity: number; // Craif
  liberalGfSuspicion: number; // Colin
  truckMaintenance: number; // Andrew
  ego: number; // Elie
  parlayAddiction?: number; // Colin
  commishPower?: number; // Spencer
  clout?: number; // Pace
  unlockedAchievements: string[];
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  desc: string;
  type: 'consumable' | 'permanent';
}

export interface Message {
  speaker: string;
  text: string;
  // 'user' is the player, 'model' is AI/NPC, 'system' is for game events
  role: 'user' | 'model' | 'system';
}

export interface EndGameReport {
    title: string;
    message: string;
    isEnd: boolean;
}

export type GameState = 'intro' | 'select' | 'playing' | 'ended';

export type MinigameType = 'kicking' | 'quarterback' | 'play_calling' | 'running_back' | 'fantasy_draft' | 'commentary_battle' | 'trivia_night' | 'beer_die';

export interface SeasonGoal {
  id: string;
  description: string;
  isCompleted: boolean;
  gritReward: number;
}

export interface ManageLifeAction {
    name:string;
    cost: number;
    updates: Partial<PlayerState>;
    message: string;
    chatAction?: {
      targetId: string;
      playerMessage: string;
    }
}

export interface RandomEvent {
  id: string;
  trigger: (player: PlayerState, day: number, week: number) => boolean;
  message: string;
  effects: Partial<PlayerState>;
  grit?: number;
}

export interface PropBet {
    id: string;
    text: string;
    wager: number;
    isResolved: boolean;
    isCorrect: boolean | null; // Can be null if it just expires
    check: (history: Message[], player: PlayerState) => boolean | null;
    createdAtIndex: number;
    playerChoice: 'yes' | 'no' | null;
    isLocked: boolean;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
}