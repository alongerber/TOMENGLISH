import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCoachHint } from '../services/claudeCoach';
import { getLocalHint, getAllHintsForModule } from '../services/localHints';
import type { ModuleType, HintTrigger } from '../services/localHints';

describe('AI Coach - Local Hints', () => {
  const modules: ModuleType[] = ['magicE', 'sentenceBuilder', 'priceTag', 'vocabulary', 'boss', 'mockTest'];
  const triggers: HintTrigger[] = ['start', 'wrong_1', 'wrong_2', 'wrong_3', 'streak', 'complete', 'idle'];

  it('should return a hint for every module × trigger combination', () => {
    for (const module of modules) {
      for (const trigger of triggers) {
        const hint = getLocalHint(module, trigger);
        expect(hint).toBeTruthy();
        expect(hint.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have at least 5 hints per trigger per module', () => {
    for (const module of modules) {
      const allHints = getAllHintsForModule(module);
      for (const trigger of triggers) {
        expect(allHints[trigger].length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('total hint count should be >= 140 (6 modules × 7 triggers × ~3+ each)', () => {
    let total = 0;
    for (const module of modules) {
      const allHints = getAllHintsForModule(module);
      for (const trigger of triggers) {
        total += allHints[trigger].length;
      }
    }
    expect(total).toBeGreaterThanOrEqual(140);
  });

  it('hints should be in Hebrew (contain Hebrew characters)', () => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    for (const module of modules) {
      for (const trigger of triggers) {
        const hint = getLocalHint(module, trigger);
        expect(hebrewRegex.test(hint)).toBe(true);
      }
    }
  });
});

describe('AI Coach - Claude API fallback', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return fallback hint when no API key is set', async () => {
    // import.meta.env.VITE_CLAUDE_API_KEY is not set in test environment
    const result = await getCoachHint({
      taskType: 'magicE',
      word: 'bake',
      attemptCount: 1,
    });

    expect(result).toBeDefined();
    expect(result.hint).toBeTruthy();
    expect(result.hint.length).toBeGreaterThan(0);
    expect(result.emoji).toBeTruthy();
  });

  it('should return fallback for all task types', async () => {
    const taskTypes = ['magicE', 'sentenceBuilder', 'priceTag', 'vocabulary', 'boss', 'mockTest'];

    for (const taskType of taskTypes) {
      const result = await getCoachHint({
        taskType,
        word: 'test',
        attemptCount: 1,
      });
      expect(result.hint).toBeTruthy();
    }
  });

  it('should handle different attempt counts', async () => {
    for (const attemptCount of [1, 2, 3, 5]) {
      const result = await getCoachHint({
        taskType: 'magicE',
        word: 'bake',
        attemptCount,
      });
      expect(result.hint).toBeTruthy();
    }
  });
});

describe('AI Coach - System prompt validation', () => {
  it('coach response should contain a hint string and emoji', async () => {
    const result = await getCoachHint({
      taskType: 'magicE',
      word: 'game',
      childChoice: 'bake',
      attemptCount: 2,
      recentErrors: ['nose', 'bake'],
    });

    expect(typeof result.hint).toBe('string');
    expect(typeof result.emoji).toBe('string');
    expect(result.hint.length).toBeGreaterThan(0);
  });
});
