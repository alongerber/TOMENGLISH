import { create } from 'zustand';
import type { WordCategory } from '../data/wordBank';
import type { AdaptiveState } from '../engine/adaptive';
import { loadAdaptiveState, saveAdaptiveState, recordAnswer as computeAnswer, completeBoss as computeBoss, getInitialAdaptiveState } from '../engine/adaptive';
import type { Achievement } from '../engine/achievements';
import { loadUnlockedAchievements, saveUnlockedAchievements, checkAchievements } from '../engine/achievements';

interface GameState {
  // Player
  playerName: string;
  setPlayerName: (name: string) => void;

  // Adaptive state
  adaptive: AdaptiveState;
  recordAnswer: (word: string, category: WordCategory, correct: boolean, responseTimeMs: number) => void;
  completeBoss: (category: WordCategory, stars: number) => void;
  completeMockTest: (score: number) => void;
  resetProgress: () => void;

  // Achievements
  unlockedAchievements: Set<string>;
  pendingAchievement: Achievement | null;
  dismissAchievement: () => void;

  // UI state
  soundEnabled: boolean;
  quietMode: boolean;
  toggleSound: () => void;
  toggleQuietMode: () => void;

  // Coach
  coachEnabled: boolean;
  setCoachEnabled: (v: boolean) => void;
}

const loadPlayerName = (): string => {
  try {
    return localStorage.getItem('tom-english-name') || '';
  } catch {
    return '';
  }
};

const savePlayerName = (name: string) => {
  try {
    localStorage.setItem('tom-english-name', name);
  } catch {
    // ignore
  }
};

function checkAndQueueAchievements(
  newAdaptive: AdaptiveState,
  currentUnlocked: Set<string>,
  currentPending: Achievement | null,
): { unlockedAchievements: Set<string>; pendingAchievement: Achievement | null } {
  const newlyUnlocked = checkAchievements(newAdaptive, currentUnlocked);
  if (newlyUnlocked.length === 0) {
    return { unlockedAchievements: currentUnlocked, pendingAchievement: currentPending };
  }
  const updated = new Set([...currentUnlocked, ...newlyUnlocked.map(a => a.id)]);
  saveUnlockedAchievements(updated);
  return {
    unlockedAchievements: updated,
    pendingAchievement: currentPending || newlyUnlocked[0],
  };
}

export const useGameStore = create<GameState>((set) => ({
  playerName: loadPlayerName(),
  setPlayerName: (name: string) => {
    savePlayerName(name);
    set({ playerName: name });
  },

  adaptive: loadAdaptiveState(),
  recordAnswer: (word, category, correct, responseTimeMs) => {
    set((state) => {
      const newAdaptive = computeAnswer(state.adaptive, word, category, correct, responseTimeMs);
      const ach = checkAndQueueAchievements(newAdaptive, state.unlockedAchievements, state.pendingAchievement);
      return { adaptive: newAdaptive, ...ach };
    });
  },
  completeBoss: (category, stars) => {
    set((state) => {
      const newAdaptive = computeBoss(state.adaptive, category, stars);
      const ach = checkAndQueueAchievements(newAdaptive, state.unlockedAchievements, state.pendingAchievement);
      return { adaptive: newAdaptive, ...ach };
    });
  },
  completeMockTest: (score) => {
    set((state) => {
      const newAdaptive = {
        ...state.adaptive,
        mockTestCompleted: true,
        mockTestScore: score,
      };
      saveAdaptiveState(newAdaptive);
      const ach = checkAndQueueAchievements(newAdaptive, state.unlockedAchievements, state.pendingAchievement);
      return { adaptive: newAdaptive, ...ach };
    });
  },
  resetProgress: () => {
    const fresh = getInitialAdaptiveState();
    saveAdaptiveState(fresh);
    set({ adaptive: fresh });
  },

  // Achievements
  unlockedAchievements: loadUnlockedAchievements(),
  pendingAchievement: null,
  dismissAchievement: () => set({ pendingAchievement: null }),

  soundEnabled: true,
  quietMode: false,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleQuietMode: () => set((s) => ({ quietMode: !s.quietMode })),

  coachEnabled: !!import.meta.env.VITE_CLAUDE_API_KEY,
  setCoachEnabled: (v) => set({ coachEnabled: v }),
}));
