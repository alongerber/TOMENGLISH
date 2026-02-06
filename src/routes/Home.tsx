import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORIES } from '../data/wordBank';
import type { WordCategory } from '../data/wordBank';
import { allBossesCompleted } from '../engine/adaptive';
import { MascotImage } from '../components/ui/MascotImage';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { getLocalHint } from '../services/localHints';

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
  const startupHint = getLocalHint('vocabulary', 'start');

  return (
    <div className="app-background min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Greeting Area with Mascot */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="animate-bounce-subtle">
              <MascotImage state="idle" size="lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                היי {playerName}! 👋
              </h1>
              <p className="text-gray-500 text-sm">⭐ {adaptive.totalScore} נקודות</p>
            </div>
          </div>

          {/* Settings: Sound + Quiet Mode */}
          <div className="flex gap-2">
            <button
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 flex items-center justify-center text-lg hover:bg-white hover:shadow-md transition-all"
              aria-label={soundEnabled ? 'כבה סאונד' : 'הפעל סאונד'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={toggleQuietMode}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 flex items-center justify-center text-lg hover:bg-white hover:shadow-md transition-all"
              aria-label={quietMode ? 'הפעל אנימציות' : 'מצב שקט'}
            >
              {quietMode ? '🌙' : '✨'}
            </button>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center text-xl font-extrabold mb-6 bg-gradient-to-l from-amber-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
        >
          ✨ מסע הקסם באנגלית ✨
        </motion.h2>

        {/* Module Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {MODULES.map((mod, idx) => {
            const cat = adaptive.categoryProgress[mod.category];
            const progress = cat.totalAttempts > 0 ? cat.totalCorrect / Math.max(cat.totalAttempts, 1) : 0;
            const catData = CATEGORIES[mod.category];

            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(mod.path)}
                className={`${catData.cardClass} card-premium relative p-5 text-center rounded-3xl overflow-hidden w-full`}
              >
                {/* 3D-style Icon Area with Gradient */}
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${catData.color}, ${catData.lightColor})`,
                  }}
                >
                  <span className="drop-shadow-md">{mod.emoji}</span>
                </div>

                {/* Module Name */}
                <h3 className="font-bold text-base mb-1">{mod.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{mod.description}</p>

                {/* Star Progress */}
                {cat.bossCompleted && (
                  <div className="text-lg mb-1">{'⭐'.repeat(cat.stars)}</div>
                )}
                {cat.totalAttempts > 0 && (
                  <div className="mt-1 px-2">
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progress * 100}%`,
                          background: catData.color,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Boss indicator */}
                {cat.bossUnlocked && !cat.bossCompleted && (
                  <span className="absolute top-2 left-2 text-xs font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                    👾 BOSS
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Boss Levels Section - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 bg-gradient-to-l from-red-500 to-amber-500 bg-clip-text text-transparent">
            👾 שלבי בוס
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MODULES.map((mod, idx) => {
              const cat = adaptive.categoryProgress[mod.category];
              const unlocked = cat.bossUnlocked;
              const catData = CATEGORIES[mod.category];

              return (
                <motion.button
                  key={`boss-${mod.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  whileHover={unlocked ? { scale: 1.03 } : {}}
                  whileTap={unlocked ? { scale: 0.97 } : {}}
                  onClick={() => unlocked && navigate(`/boss/${mod.category}`)}
                  disabled={!unlocked}
                  className={`card-premium p-4 text-center rounded-2xl transition-all ${
                    unlocked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  } ${cat.bossCompleted ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-100' : ''}`}
                >
                  <div
                    className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: unlocked
                        ? `linear-gradient(135deg, ${catData.color}22, ${catData.lightColor}44)`
                        : '#f3f4f6',
                    }}
                  >
                    {cat.bossCompleted ? '🏆' : unlocked ? '👾' : '🔒'}
                  </div>
                  <div className="text-sm font-bold">{mod.title}</div>
                  {cat.bossCompleted && (
                    <div className="text-xs text-amber-500 mt-1">{'⭐'.repeat(cat.stars)}</div>
                  )}
                  {!unlocked && (
                    <div className="text-xs text-gray-400 mt-1">
                      עוד {Math.max(0, 10 - cat.totalCorrect)} תשובות
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Mock Test - Premium Gradient */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          whileHover={mockTestAvailable ? { scale: 1.02 } : {}}
          whileTap={mockTestAvailable ? { scale: 0.98 } : {}}
          onClick={() => mockTestAvailable && navigate('/mock-test')}
          disabled={!mockTestAvailable}
          className={`card-premium p-6 w-full text-center rounded-2xl mb-8 ${
            mockTestAvailable
              ? 'bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 text-white cursor-pointer shadow-xl shadow-purple-200'
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
        <div className="text-center mb-6">
          <button
            onClick={() => {
              if (confirm('בטוח שרוצה לאפס את כל ההתקדמות?')) {
                resetProgress();
              }
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            איפוס התקדמות
          </button>
        </div>

        {/* AI Coach Strip */}
        <AICoachStrip module="vocabulary" />
      </div>
    </div>
  );
}
