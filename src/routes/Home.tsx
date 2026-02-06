import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORIES } from '../data/wordBank';
import type { WordCategory } from '../data/wordBank';
import { allBossesCompleted } from '../engine/adaptive';

const MODULES: { id: string; category: WordCategory; title: string; emoji: string; path: string; description: string }[] = [
  { id: 'magic-e', category: 'magic-e', title: 'מעבדת Magic E', emoji: '✨', path: '/magic-e', description: 'הקסם של האות e' },
  { id: 'sentences', category: 'clothing', title: 'בונה משפטים', emoji: '🧩', path: '/sentences', description: 'בגדים במשפטים' },
  { id: 'prices', category: 'numbers', title: 'תג מחיר', emoji: '💰', path: '/prices', description: 'מספרים ומחירים' },
  { id: 'vocabulary', category: 'house', title: 'אוצר מילים', emoji: '🎯', path: '/vocabulary', description: 'תמונה ↔ מילה' },
];

export function Home() {
  const navigate = useNavigate();
  const { playerName, adaptive, soundEnabled, quietMode, toggleSound, toggleQuietMode, resetProgress } = useGameStore();

  const mockTestAvailable = allBossesCompleted(adaptive);

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              היי {playerName}! 👋
            </h1>
            <p className="text-gray-500 text-sm">⭐ {adaptive.totalScore} נקודות</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
              aria-label={soundEnabled ? 'כבה סאונד' : 'הפעל סאונד'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={toggleQuietMode}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
              aria-label={quietMode ? 'הפעל אנימציות' : 'מצב שקט'}
            >
              {quietMode ? '🌙' : '✨'}
            </button>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid gap-4 mb-8">
          {MODULES.map((mod, idx) => {
            const cat = adaptive.categoryProgress[mod.category];
            const progress = cat.totalAttempts > 0 ? cat.totalCorrect / Math.max(cat.totalAttempts, 1) : 0;

            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(mod.path)}
                className="card-premium p-5 text-right flex items-center gap-4 w-full"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: `${CATEGORIES[mod.category].color}15` }}
                >
                  {mod.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg">{mod.title}</h2>
                  <p className="text-sm text-gray-500">{mod.description}</p>
                  {cat.totalAttempts > 0 && (
                    <div className="mt-2">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${progress * 100}%`,
                            background: CATEGORIES[mod.category].color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  {cat.bossCompleted && (
                    <span className="text-xl">{'⭐'.repeat(cat.stars)}</span>
                  )}
                  {cat.bossUnlocked && !cat.bossCompleted && (
                    <span className="text-xs font-bold text-amber-500">👾 BOSS</span>
                  )}
                  <span className="text-gray-300 text-xl">←</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Boss Levels Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            👾 שלבי בוס
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MODULES.map((mod) => {
              const cat = adaptive.categoryProgress[mod.category];
              const unlocked = cat.bossUnlocked;
              return (
                <motion.button
                  key={`boss-${mod.id}`}
                  whileHover={unlocked ? { scale: 1.03 } : {}}
                  whileTap={unlocked ? { scale: 0.97 } : {}}
                  onClick={() => unlocked && navigate(`/boss/${mod.category}`)}
                  disabled={!unlocked}
                  className={`card-premium p-4 text-center transition-all ${
                    unlocked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  } ${cat.bossCompleted ? 'ring-2 ring-amber-400' : ''}`}
                >
                  <div className="text-2xl mb-1">{cat.bossCompleted ? '🏆' : unlocked ? '👾' : '🔒'}</div>
                  <div className="text-sm font-bold">{mod.title}</div>
                  {cat.bossCompleted && <div className="text-xs text-amber-500 mt-1">{'⭐'.repeat(cat.stars)}</div>}
                  {!unlocked && <div className="text-xs text-gray-400 mt-1">עוד {Math.max(0, 10 - cat.totalCorrect)} תשובות</div>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Mock Test */}
        <motion.button
          whileHover={mockTestAvailable ? { scale: 1.02 } : {}}
          whileTap={mockTestAvailable ? { scale: 0.98 } : {}}
          onClick={() => mockTestAvailable && navigate('/mock-test')}
          disabled={!mockTestAvailable}
          className={`card-premium p-6 w-full text-center mb-8 ${
            mockTestAvailable
              ? 'bg-gradient-to-l from-indigo-500 to-purple-600 text-white cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <div className="text-3xl mb-2">📝</div>
          <div className="text-xl font-bold">מבחן דמה</div>
          <div className={`text-sm mt-1 ${mockTestAvailable ? 'text-indigo-100' : 'text-gray-500'}`}>
            {mockTestAvailable ? 'כל הבוסים הושלמו — מוכנים למבחן!' : 'צריך להשלים את כל שלבי הבוס'}
          </div>
          {adaptive.mockTestCompleted && (
            <div className="mt-2 text-lg font-bold">
              ציון אחרון: {adaptive.mockTestScore}%
            </div>
          )}
        </motion.button>

        {/* Reset */}
        <div className="text-center">
          <button
            onClick={() => {
              if (confirm('בטוח שרוצה לאפס את כל ההתקדמות?')) {
                resetProgress();
              }
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            איפוס התקדמות
          </button>
        </div>
      </div>
    </div>
  );
}
