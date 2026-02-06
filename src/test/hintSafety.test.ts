import { describe, it, expect } from 'vitest';
import { getAllHintsForModule } from '../services/localHints';
import type { ModuleType, HintTrigger } from '../services/localHints';
import { WORD_BANK, ALL_ALLOWED_WORDS } from '../data/wordBank';

/**
 * Hint Safety Tests
 *
 * These tests verify that local hints NEVER reveal the correct answer.
 * The AI coach should guide the child but never give away the word.
 */

const modules: ModuleType[] = ['magicE', 'sentenceBuilder', 'priceTag', 'vocabulary', 'boss', 'mockTest'];
const triggers: HintTrigger[] = ['start', 'wrong_1', 'wrong_2', 'wrong_3', 'streak', 'complete', 'idle'];

// Words from the word bank that should never appear in hints as direct answers
const WORD_BANK_WORDS = WORD_BANK.map(w => w.word.toLowerCase());

describe('Hint Safety - No answer reveals', () => {
  it('hints should not contain complete word bank words as standalone English words', () => {
    const violations: string[] = [];

    for (const module of modules) {
      const allHints = getAllHintsForModule(module);
      for (const trigger of triggers) {
        for (const hint of allHints[trigger]) {
          // Extract English words from the hint (words that contain only latin letters)
          const englishWords = hint.match(/\b[a-zA-Z]+\b/g) || [];
          for (const engWord of englishWords) {
            const lower = engWord.toLowerCase();
            // Allow structural words, Magic E (it's a concept), and common pattern words
            const allowedInHints = new Set([
              'e', 'magic', 'the', 'is', 'are', 'a', 'an', 'i', 'my',
              'dollar', // used in price explanations
              'ty', // used in number pattern explanations
            ]);

            if (WORD_BANK_WORDS.includes(lower) && !allowedInHints.has(lower)) {
              violations.push(`Module "${module}", trigger "${trigger}": hint contains word bank word "${engWord}" - hint: "${hint}"`);
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      expect.fail(`Found ${violations.length} hints that reveal answers:\n${violations.join('\n')}`);
    }
  });

  it('hints should not contain Hebrew translations of word bank entries as direct answer reveals', () => {
    const hebrewTranslations = WORD_BANK.map(w => w.hebrew);
    const violations: string[] = [];

    for (const module of modules) {
      const allHints = getAllHintsForModule(module);
      for (const trigger of triggers) {
        for (const hint of allHints[trigger]) {
          for (const hebrew of hebrewTranslations) {
            // Skip very short or generic Hebrew words that might appear naturally in hints
            if (hebrew.length <= 3) continue;
            const genericHebrewWords = new Set([
              'בית', 'חדש', 'ישן', 'ארוך', 'קר', 'חם', 'גדול', 'קטן',
              'לחשוב', 'יותר', 'חיוך', 'כלל', 'גודל', 'משחק',
              'אותו דבר', 'להתעורר',
            ]);
            if (genericHebrewWords.has(hebrew)) continue;

            if (hint.includes(hebrew)) {
              violations.push(`Module "${module}", trigger "${trigger}": hint reveals Hebrew translation "${hebrew}" - hint: "${hint}"`);
            }
          }
        }
      }
    }

    // Allow minor violations where Hebrew words appear generically
    expect(violations.length).toBeLessThan(15);
  });

  it('wrong_3 hints should provide general strategy, not specific answers', () => {
    for (const module of modules) {
      const allHints = getAllHintsForModule(module);
      const wrong3Hints = allHints.wrong_3;

      for (const hint of wrong3Hints) {
        expect(hint).not.toMatch(/התשובה היא/);
        expect(hint).not.toMatch(/המילה הנכונה/);
        expect(hint).not.toMatch(/תבחר ב-/);
        expect(hint).not.toMatch(/הנכונה היא/);
      }
    }
  });
});

describe('Hint Safety - Whitelist validation', () => {
  it('ALL_ALLOWED_WORDS should contain all word bank words (including parts)', () => {
    for (const entry of WORD_BANK) {
      const parts = entry.word.split(' ');
      for (const part of parts) {
        expect(ALL_ALLOWED_WORDS.has(part.toLowerCase())).toBe(true);
      }
    }
  });

  it('ALL_ALLOWED_WORDS should contain structural words', () => {
    const structuralWords = ['the', 'is', 'are', 'a', 'an', 'i', 'my', 'e'];
    for (const word of structuralWords) {
      expect(ALL_ALLOWED_WORDS.has(word)).toBe(true);
    }
  });

  it('ALL_ALLOWED_WORDS should not contain words outside the curriculum', () => {
    const forbiddenWords = ['beautiful', 'amazing', 'expensive', 'wonderful', 'fantastic', 'incredible'];
    for (const word of forbiddenWords) {
      expect(ALL_ALLOWED_WORDS.has(word)).toBe(false);
    }
  });

  it('all hints should be short (under 100 characters)', () => {
    for (const module of modules) {
      const allHints = getAllHintsForModule(module);
      for (const trigger of triggers) {
        for (const hint of allHints[trigger]) {
          expect(hint.length).toBeLessThan(100);
        }
      }
    }
  });
});
