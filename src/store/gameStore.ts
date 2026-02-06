import { create } from 'zustand';
import type { WordCategory } from '../data/wordBank';
import type { AdaptiveState } from '../engine/adaptive';
import { loadAdaptiveState, saveAdaptiveState, recordAnswer, completeBoss, getInitialAdaptiveState } from '../engine/adaptive';

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

export const useGameStore = create<GameState>((set) => ({
  playerName: loadPlayerName(),
  setPlayerName: (name: string) => {
    savePlayerName(name);
    set({ playerName: name });
  },

  adaptive: loadAdaptiveState(),
  recordAnswer: (word, category, correct, responseTimeMs) => {
    set((state) => ({
      adaptive: recordAnswer(state.adaptive, word, category, correct, responseTimeMs),
    }));
  },
  completeBoss: (category, stars) => {
    set((state) => ({
      adaptive: completeBoss(state.adaptive, category, stars),
    }));
  },
  completeMockTest: (score) => {
    set((state) => {
      const newAdaptive = {
        ...state.adaptive,
        mockTestCompleted: true,
        mockTestScore: score,
      };
      saveAdaptiveState(newAdaptive);
      return { adaptive: newAdaptive };
    });
  },
  resetProgress: () => {
    const fresh = getInitialAdaptiveState();
    saveAdaptiveState(fresh);
    set({ adaptive: fresh });
  },

  soundEnabled: true,
  quietMode: false,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleQuietMode: () => set((s) => ({ quietMode: !s.quietMode })),

  coachEnabled: !!import.meta.env.VITE_CLAUDE_API_KEY,
  setCoachEnabled: (v) => set({ coachEnabled: v }),
}));
