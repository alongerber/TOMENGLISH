import type { WordCategory } from '../data/wordBank';

export interface WordPerformance {
  word: string;
  attempts: number;
  correct: number;
  avgResponseTimeMs: number;
  lastSeen: number;
  streak: number;
}

export interface CategoryProgress {
  category: WordCategory;
  totalAttempts: number;
  totalCorrect: number;
  bossUnlocked: boolean;
  bossCompleted: boolean;
  stars: number; // 0-3
}

export interface AdaptiveState {
  wordPerformance: Record<string, WordPerformance>;
  categoryProgress: Record<WordCategory, CategoryProgress>;
  consecutiveErrors: number;
  easyMode: boolean;
  totalScore: number;
  combo: number;
  maxCombo: number;
  mockTestCompleted: boolean;
  mockTestScore: number | null;
}

const STORAGE_KEY = 'tom-english-adaptive';

export function getInitialAdaptiveState(): AdaptiveState {
  return {
    wordPerformance: {},
    categoryProgress: {
      'magic-e': { category: 'magic-e', totalAttempts: 0, totalCorrect: 0, bossUnlocked: false, bossCompleted: false, stars: 0 },
      'clothing': { category: 'clothing', totalAttempts: 0, totalCorrect: 0, bossUnlocked: false, bossCompleted: false, stars: 0 },
      'numbers': { category: 'numbers', totalAttempts: 0, totalCorrect: 0, bossUnlocked: false, bossCompleted: false, stars: 0 },
      'house': { category: 'house', totalAttempts: 0, totalCorrect: 0, bossUnlocked: false, bossCompleted: false, stars: 0 },
    },
    consecutiveErrors: 0,
    easyMode: false,
    totalScore: 0,
    combo: 0,
    maxCombo: 0,
    mockTestCompleted: false,
    mockTestScore: null,
  };
}

export function loadAdaptiveState(): AdaptiveState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...getInitialAdaptiveState(), ...JSON.parse(data) };
    }
  } catch {
    // ignore
  }
  return getInitialAdaptiveState();
}

export function saveAdaptiveState(state: AdaptiveState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function recordAnswer(
  state: AdaptiveState,
  word: string,
  category: WordCategory,
  correct: boolean,
  responseTimeMs: number
): AdaptiveState {
  const newState = { ...state };

  // Update word performance
  const perf = newState.wordPerformance[word] || {
    word,
    attempts: 0,
    correct: 0,
    avgResponseTimeMs: 0,
    lastSeen: 0,
    streak: 0,
  };

  perf.attempts += 1;
  if (correct) {
    perf.correct += 1;
    perf.streak += 1;
  } else {
    perf.streak = 0;
  }
  perf.avgResponseTimeMs = (perf.avgResponseTimeMs * (perf.attempts - 1) + responseTimeMs) / perf.attempts;
  perf.lastSeen = Date.now();
  newState.wordPerformance = { ...newState.wordPerformance, [word]: perf };

  // Update category progress
  const cat = { ...newState.categoryProgress[category] };
  cat.totalAttempts += 1;
  if (correct) {
    cat.totalCorrect += 1;
  }
  // Unlock boss after 10 correct answers in category
  if (cat.totalCorrect >= 10 && !cat.bossUnlocked) {
    cat.bossUnlocked = true;
  }
  newState.categoryProgress = { ...newState.categoryProgress, [category]: cat };

  // Update combo and score
  if (correct) {
    newState.combo += 1;
    newState.maxCombo = Math.max(newState.maxCombo, newState.combo);
    const comboMultiplier = Math.min(newState.combo, 5);
    newState.totalScore += 10 * comboMultiplier;
    newState.consecutiveErrors = 0;
  } else {
    newState.combo = 0;
    newState.consecutiveErrors += 1;
  }

  // Easy mode trigger
  if (newState.consecutiveErrors >= 3 && !newState.easyMode) {
    newState.easyMode = true;
  }
  if (correct && newState.combo >= 3) {
    newState.easyMode = false;
    newState.consecutiveErrors = 0;
  }

  saveAdaptiveState(newState);
  return newState;
}

/** Get words sorted by weakness (weakest first) */
export function getWeakWords(state: AdaptiveState, words: string[]): string[] {
  return [...words].sort((a, b) => {
    const perfA = state.wordPerformance[a];
    const perfB = state.wordPerformance[b];
    if (!perfA && !perfB) return 0;
    if (!perfA) return -1; // unseen words first
    if (!perfB) return 1;
    const rateA = perfA.correct / perfA.attempts;
    const rateB = perfB.correct / perfB.attempts;
    return rateA - rateB; // lower success rate first
  });
}

/** Pick words with bias toward weak ones */
export function pickAdaptiveWords(
  state: AdaptiveState,
  allWords: string[],
  count: number
): string[] {
  const sorted = getWeakWords(state, allWords);
  const result: string[] = [];
  const used = new Set<string>();

  // 60% from weak words (first half), 40% random
  const weakCount = Math.ceil(count * 0.6);
  const weakPool = sorted.slice(0, Math.ceil(sorted.length / 2));
  const strongPool = sorted.slice(Math.ceil(sorted.length / 2));

  for (let i = 0; i < weakCount && weakPool.length > 0; i++) {
    const idx = Math.floor(Math.random() * weakPool.length);
    const word = weakPool[idx];
    if (!used.has(word)) {
      result.push(word);
      used.add(word);
    }
    weakPool.splice(idx, 1);
  }

  const remaining = count - result.length;
  const combinedPool = [...strongPool, ...weakPool].filter(w => !used.has(w));
  for (let i = 0; i < remaining && combinedPool.length > 0; i++) {
    const idx = Math.floor(Math.random() * combinedPool.length);
    result.push(combinedPool[idx]);
    combinedPool.splice(idx, 1);
  }

  return result;
}

export function getSuccessRate(state: AdaptiveState, word: string): number {
  const perf = state.wordPerformance[word];
  if (!perf || perf.attempts === 0) return 0;
  return perf.correct / perf.attempts;
}

export function getCategorySuccessRate(state: AdaptiveState, category: WordCategory): number {
  const cat = state.categoryProgress[category];
  if (cat.totalAttempts === 0) return 0;
  return cat.totalCorrect / cat.totalAttempts;
}

export function isBossUnlocked(state: AdaptiveState, category: WordCategory): boolean {
  return state.categoryProgress[category].bossUnlocked;
}

export function completeBoss(state: AdaptiveState, category: WordCategory, stars: number): AdaptiveState {
  const newState = { ...state };
  const cat = { ...newState.categoryProgress[category] };
  cat.bossCompleted = true;
  cat.stars = Math.max(cat.stars, stars);
  newState.categoryProgress = { ...newState.categoryProgress, [category]: cat };
  newState.totalScore += stars * 50;
  saveAdaptiveState(newState);
  return newState;
}

export function allBossesCompleted(state: AdaptiveState): boolean {
  return Object.values(state.categoryProgress).every(c => c.bossCompleted);
}
