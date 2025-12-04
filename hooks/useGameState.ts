import { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerState, GlobalState, Message, SeasonGoal, PropBet, GameEvent } from '../types';
import { gameManager } from '../services/gameManager';
import { SEASON_LENGTH } from '../constants';

export interface GameStateData {
  player: PlayerState;
  ranking: PlayerState[];
  day: number;
  week: number;
  weeklyGritGoal: number;
  inventory: string[];
  storyFeed: Message[];
  globalState: GlobalState;
  seasonGoals: SeasonGoal[];
  propBets: PropBet[];
  currentDailyEvent: GameEvent | null;
  timeOfDay: number;
  nextMinigame: string;
  newbiePresent: boolean;
  newbieName: string;
}

const DEFAULT_PLAYER: PlayerState = {
  id: '',
  name: '',
  rank: 0,
  girlfriend: false,
  nflTeamColor: '#000000',
  bio: '',
  grit: 0,
  loveLife: 50,
  fandom: 50,
  uniqueStatValue: 50,
  energy: 3,
  happiness: 50,
  paSchoolStress: 0,
  insecurity: 0,
  liberalGfSuspicion: 0,
  truckMaintenance: 0,
  ego: 0,
  unlockedAchievements: []
};

export function useGameState(initialData: Partial<GameStateData>) {
  // Initialize state with proper defaults
  const [state, setState] = useState<GameStateData>(() => ({
    player: initialData.player || DEFAULT_PLAYER,
    ranking: initialData.ranking || [],
    day: initialData.day || 1,
    week: initialData.week || 1,
    weeklyGritGoal: initialData.weeklyGritGoal || 100,
    inventory: initialData.inventory || [],
    storyFeed: initialData.storyFeed || [],
    globalState: initialData.globalState || {
      cringeMeter: 0,
      entertainmentMeter: 50,
      season: 1,
      week: 1,
      day: 1
    },
    seasonGoals: initialData.seasonGoals || [],
    propBets: initialData.propBets || [],
    currentDailyEvent: initialData.currentDailyEvent || null,
    timeOfDay: initialData.timeOfDay || 0,
    nextMinigame: initialData.nextMinigame || 'kicking',
    newbiePresent: initialData.newbiePresent || false,
    newbieName: initialData.newbieName || 'The Spammer'
  }));

  // Track if game is initialized to prevent duplicate initialization
  const isInitialized = useRef(false);

  // Stable update functions
  const updatePlayer = useCallback((updates: Partial<PlayerState>) => {
    setState(prev => {
      const { player: updatedPlayer, achievements } = gameManager.updatePlayerStats(
        prev.player,
        updates
      );
      
      return {
        ...prev,
        player: updatedPlayer,
        ranking: prev.ranking.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
      };
    });
  }, []);

  const updateRanking = useCallback((newRanking: PlayerState[]) => {
    setState(prev => ({ ...prev, ranking: newRanking }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      storyFeed: [...prev.storyFeed, message]
    }));
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    addMessage({ speaker: 'system', text, role: 'system' });
  }, [addMessage]);

  const advanceDay = useCallback(() => {
    setState(prev => {
      const result = gameManager.advanceDay(
        prev.day,
        prev.week,
        prev.player,
        prev.ranking
      );

      // Add system message for week change
      if (result.weekChanged) {
        setTimeout(() => {
          addSystemMessage(`Week ${prev.week} complete! Welcome to Week ${result.week}.`);
        }, 100);
      }

      return {
        ...prev,
        day: result.day,
        week: result.week,
        player: result.player,
        ranking: result.ranking,
        globalState: {
          ...prev.globalState,
          day: result.day,
          week: result.week
        }
      };
    });
  }, [addSystemMessage]);

  const completeMinigame = useCallback((minigameId: string, gritEarned: number) => {
    setState(prev => {
      const result = gameManager.completeMinigame(
        prev.player,
        minigameId,
        gritEarned,
        prev.week,
        prev.day
      );

      return {
        ...prev,
        player: result.player,
        ranking: prev.ranking.map(p => p.id === result.player.id ? result.player : p)
      };
    });
  }, []);

  const saveGame = useCallback(() => {
    return gameManager.saveGame(
      state.player,
      state.ranking,
      state.day,
      state.week
    );
  }, [state.player, state.ranking, state.day, state.week]);

  const isSeasonOver = useCallback(() => {
    return state.week > SEASON_LENGTH;
  }, [state.week]);

  // Auto-save effect
  useEffect(() => {
    const settings = gameManager.getSettings();
    if (settings.autoSaveEnabled && isInitialized.current) {
      const timer = setInterval(() => {
        saveGame();
      }, 60000); // Auto-save every minute

      return () => clearInterval(timer);
    }
  }, [saveGame]);

  // Mark as initialized after first render
  useEffect(() => {
    isInitialized.current = true;
  }, []);

  return {
    ...state,
    updatePlayer,
    updateRanking,
    addMessage,
    addSystemMessage,
    advanceDay,
    completeMinigame,
    saveGame,
    isSeasonOver,
    setState
  };
}
