import type { AdaptiveState } from './adaptive';

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_correct', title: 'צעד ראשון!', emoji: '🌟', description: 'תשובה נכונה ראשונה' },
  { id: 'combo_3', title: 'קומבו 3!', emoji: '🔥', description: '3 תשובות נכונות ברצף' },
  { id: 'combo_5', title: 'על אש!', emoji: '💥', description: '5 תשובות נכונות ברצף' },
  { id: 'combo_10', title: 'בלתי ניתן לעצירה!', emoji: '🚀', description: '10 תשובות נכונות ברצף' },
  { id: 'score_100', title: '100 נקודות!', emoji: '💯', description: 'הגעת ל-100 נקודות' },
  { id: 'score_250', title: 'כוכב עולה!', emoji: '⭐', description: 'הגעת ל-250 נקודות' },
  { id: 'score_500', title: 'אלוף!', emoji: '🏆', description: 'הגעת ל-500 נקודות' },
  { id: 'first_boss', title: 'מנצח בוס!', emoji: '👾', description: 'ניצחת בוס ראשון' },
  { id: 'all_bosses', title: 'שליט הבוסים!', emoji: '👑', description: 'ניצחת את כל הבוסים' },
  { id: 'mock_test_pass', title: 'מוכן למבחן!', emoji: '📝', description: 'עברת מבחן דמה עם 70%+' },
  { id: 'mock_test_ace', title: 'מושלם!', emoji: '🌈', description: '90%+ במבחן דמה' },
  { id: 'ten_words', title: '10 מילים!', emoji: '📚', description: 'למדת 10 מילים שונות' },
];

const STORAGE_KEY = 'tom-english-achievements';

export function loadUnlockedAchievements(): Set<string> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return new Set(JSON.parse(data));
  } catch {
    // ignore
  }
  return new Set();
}

export function saveUnlockedAchievements(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

/** Check state and return any newly unlocked achievements */
export function checkAchievements(state: AdaptiveState, unlocked: Set<string>): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  const check = (id: string, condition: boolean) => {
    if (!unlocked.has(id) && condition) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) newlyUnlocked.push(ach);
    }
  };

  const totalCorrect = Object.values(state.categoryProgress).reduce((sum, c) => sum + c.totalCorrect, 0);
  const uniqueWords = Object.keys(state.wordPerformance).filter(w => state.wordPerformance[w].correct > 0).length;
  const anyBoss = Object.values(state.categoryProgress).some(c => c.bossCompleted);
  const allBosses = Object.values(state.categoryProgress).every(c => c.bossCompleted);

  check('first_correct', totalCorrect >= 1);
  check('combo_3', state.maxCombo >= 3);
  check('combo_5', state.maxCombo >= 5);
  check('combo_10', state.maxCombo >= 10);
  check('score_100', state.totalScore >= 100);
  check('score_250', state.totalScore >= 250);
  check('score_500', state.totalScore >= 500);
  check('first_boss', anyBoss);
  check('all_bosses', allBosses);
  check('mock_test_pass', state.mockTestCompleted && (state.mockTestScore ?? 0) >= 70);
  check('mock_test_ace', state.mockTestCompleted && (state.mockTestScore ?? 0) >= 90);
  check('ten_words', uniqueWords >= 10);

  return newlyUnlocked;
}
