import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInitialAdaptiveState,
  recordAnswer,
  getWeakWords,
  pickAdaptiveWords,
  getSuccessRate,
  getCategorySuccessRate,
  isBossUnlocked,
  completeBoss,
  allBossesCompleted,
} from '../engine/adaptive';
import type { AdaptiveState } from '../engine/adaptive';

describe('Adaptive Engine', () => {
  let state: AdaptiveState;

  beforeEach(() => {
    state = getInitialAdaptiveState();
  });

  it('should initialize with empty state', () => {
    expect(state.totalScore).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.consecutiveErrors).toBe(0);
    expect(state.easyMode).toBe(false);
  });

  it('should record correct answers and increase score', () => {
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    expect(state.totalScore).toBe(10);
    expect(state.combo).toBe(1);
    expect(state.wordPerformance['bake'].correct).toBe(1);
    expect(state.wordPerformance['bake'].attempts).toBe(1);
  });

  it('should increase combo multiplier', () => {
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'game', 'magic-e', true, 500);
    state = recordAnswer(state, 'home', 'magic-e', true, 500);
    // 10 + 20 + 30 = 60
    expect(state.totalScore).toBe(60);
    expect(state.combo).toBe(3);
  });

  it('should reset combo on wrong answer', () => {
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'game', 'magic-e', true, 500);
    state = recordAnswer(state, 'home', 'magic-e', false, 500);
    expect(state.combo).toBe(0);
  });

  it('should track consecutive errors and trigger easy mode', () => {
    state = recordAnswer(state, 'bake', 'magic-e', false, 500);
    state = recordAnswer(state, 'game', 'magic-e', false, 500);
    expect(state.easyMode).toBe(false);
    state = recordAnswer(state, 'home', 'magic-e', false, 500);
    expect(state.easyMode).toBe(true);
    expect(state.consecutiveErrors).toBe(3);
  });

  it('should exit easy mode after 3 correct in a row', () => {
    // Trigger easy mode
    state = recordAnswer(state, 'bake', 'magic-e', false, 500);
    state = recordAnswer(state, 'game', 'magic-e', false, 500);
    state = recordAnswer(state, 'home', 'magic-e', false, 500);
    expect(state.easyMode).toBe(true);

    // 3 correct in a row
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'game', 'magic-e', true, 500);
    state = recordAnswer(state, 'home', 'magic-e', true, 500);
    expect(state.easyMode).toBe(false);
  });

  it('should unlock boss after 10 correct answers in category', () => {
    for (let i = 0; i < 10; i++) {
      state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    }
    expect(isBossUnlocked(state, 'magic-e')).toBe(true);
    expect(isBossUnlocked(state, 'clothing')).toBe(false);
  });

  it('should complete boss and record stars', () => {
    state = completeBoss(state, 'magic-e', 3);
    expect(state.categoryProgress['magic-e'].bossCompleted).toBe(true);
    expect(state.categoryProgress['magic-e'].stars).toBe(3);
  });

  it('should detect all bosses completed', () => {
    expect(allBossesCompleted(state)).toBe(false);
    state = completeBoss(state, 'magic-e', 2);
    state = completeBoss(state, 'clothing', 2);
    state = completeBoss(state, 'numbers', 2);
    state = completeBoss(state, 'house', 2);
    expect(allBossesCompleted(state)).toBe(true);
  });

  it('should calculate success rate', () => {
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'bake', 'magic-e', false, 500);
    expect(getSuccessRate(state, 'bake')).toBeCloseTo(2 / 3);
  });

  it('should calculate category success rate', () => {
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'game', 'magic-e', false, 500);
    expect(getCategorySuccessRate(state, 'magic-e')).toBe(0.5);
  });

  it('should sort weak words first', () => {
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'bake', 'magic-e', true, 500);
    state = recordAnswer(state, 'game', 'magic-e', false, 500);
    state = recordAnswer(state, 'game', 'magic-e', false, 500);

    const sorted = getWeakWords(state, ['bake', 'game', 'home']);
    // 'home' unseen = first, 'game' weak = second, 'bake' strong = last
    expect(sorted[0]).toBe('home');
    expect(sorted[1]).toBe('game');
    expect(sorted[2]).toBe('bake');
  });

  it('should pick adaptive words', () => {
    const words = pickAdaptiveWords(state, ['bake', 'game', 'home', 'nose', 'rule'], 3);
    expect(words.length).toBe(3);
    // All should be from the pool
    for (const w of words) {
      expect(['bake', 'game', 'home', 'nose', 'rule']).toContain(w);
    }
  });
});
