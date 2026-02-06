import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORIES } from '../data/wordBank';
import type { WordCategory } from '../data/wordBank';
import { allBossesCompleted } from '../engine/adaptive';
import { MascotImage } from '../components/ui/MascotImage';
import { AICoachStrip } from '../components/ui/AICoachStrip';

const MODULES: { id: string; category: WordCategory; title: string; subtitle: string; emoji: string; icon: string; path: string }[] = [
  { id: 'magic-e', category: 'magic-e', title: 'מעבדת', subtitle: 'Magic E', emoji: '✨', icon: '🪄', path: '/magic-e' },
  { id: 'sentences', category: 'clothing', title: 'בונה', subtitle: 'משפטים', emoji: '🧩', icon: '🧱', path: '/sentences' },
  { id: 'prices', category: 'numbers', title: 'תג', subtitle: 'מחיר', emoji: '💰', icon: '🏷️', path: '/prices' },
  { id: 'vocabulary', category: 'house', title: 'אוצר מילים', subtitle: 'חזותי', emoji: '🎯', icon: '🔍', path: '/vocabulary' },
];

// Sample words to show on each card
const CARD_EXAMPLES: Record<string, string> = {
  'magic-e': 'bake 🪄 game',
  'sentences': 'The shirt is...',
  'prices': '$50 dollar',
  'vocabulary': '🥾 boots 🤠',
};

// Confetti pieces
function Confetti() {
  const pieces = ['🎊', '🎉', '✨', '⭐', '🌟', '💫'];
  const positions = [
    { top: '15%', left: '5%', delay: 0, size: '1.2rem' },
    { top: '25%', right: '8%', delay: 0.3, size: '0.9rem' },
    { top: '70%', left: '3%', delay: 0.6, size: '1rem' },
    { top: '75%', right: '5%', delay: 0.9, size: '1.1rem' },
    { top: '60%', left: '15%', delay: 1.2, size: '0.8rem' },
    { top: '65%', right: '12%', delay: 0.4, size: '1rem' },
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none select-none z-0"
          style={{ ...pos, fontSize: pos.size }}
          animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, delay: pos.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {pieces[i % pieces.length]}
        </motion.span>
      ))}
    </>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { playerName, adaptive, soundEnabled, quietMode, toggleSound, toggleQuietMode, resetProgress } = useGameStore();

  const mockTestAvailable = allBossesCompleted(adaptive);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#2B7DE9' }}>
      <Confetti />

      {/* ── TOP SECTION: Blue area with mascot + title ── */}
      <div className="relative z-10 pt-4 px-4">
        {/* Settings row */}
        <div className="flex justify-between items-center max-w-4xl mx-auto mb-2">
          <div className="flex gap-2">
            <button
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg hover:bg-white/30 transition-all"
              aria-label={soundEnabled ? 'כבה סאונד' : 'הפעל סאונד'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={toggleQuietMode}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg hover:bg-white/30 transition-all"
              aria-label={quietMode ? 'הפעל אנימציות' : 'מצב שקט'}
            >
              {quietMode ? '🌙' : '✨'}
            </button>
          </div>
          <button
            onClick={() => {
              if (confirm('בטוח שרוצה לאפס את כל ההתקדמות?')) resetProgress();
            }}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            איפוס
          </button>
        </div>

        {/* Mascot + Title row */}
        <div className="max-w-4xl mx-auto flex items-center gap-4 mb-4">
          {/* Large mascot — breaks out of grid */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="shrink-0"
          >
            <div className="animate-float-rotate">
              <MascotImage state="idle" size="xl" />
            </div>
          </motion.div>

          {/* Title area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1"
          >
            <h1 className="title-magical text-white leading-tight mb-2">
              מסע הקסם<br />באנגלית
            </h1>
            <p className="text-white/70 text-base">
              היי {playerName}! 👋
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── WHITE WAVE SECTION ── */}
      <div className="relative z-10">
        {/* Curved wave divider */}
        <svg viewBox="0 0 1440 120" className="w-full block -mb-1" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="white"
          />
        </svg>

        {/* White content area */}
        <div className="bg-white px-4 pb-8 -mt-px">
          <div className="max-w-4xl mx-auto">

            {/* ── MODULE CARDS — Horizontal row ── */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mt-4 px-1 snap-x snap-mandatory scrollbar-hide">
              {MODULES.map((mod, idx) => {
                const cat = adaptive.categoryProgress[mod.category];
                const catData = CATEGORIES[mod.category];
                const progress = cat.totalAttempts > 0 ? cat.totalCorrect / Math.max(cat.totalAttempts, 1) : 0;

                return (
                  <motion.button
                    key={mod.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95, y: 2 }}
                    onClick={() => navigate(mod.path)}
                    className="card-3d snap-center shrink-0 w-[160px] p-4 text-center"
                    style={{
                      background: `linear-gradient(145deg, ${catData.color}22, ${catData.color}44)`,
                      borderColor: catData.color,
                      borderBottomColor: catData.color,
                    }}
                  >
                    {/* 3D Icon */}
                    <div
                      className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${catData.color}, ${catData.lightColor})`,
                        boxShadow: `0 4px 0 ${catData.color}88, 0 6px 12px ${catData.color}33`,
                      }}
                    >
                      <span className="drop-shadow-md filter">{mod.icon}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-sm mb-0.5 text-gray-800">{mod.title}</h3>
                    <h3 className="font-extrabold text-sm mb-2 text-gray-800">{mod.subtitle}</h3>

                    {/* Example chip */}
                    <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-bold text-gray-600 inline-block" dir="ltr">
                      {CARD_EXAMPLES[mod.category]}
                    </div>

                    {/* Star progress */}
                    {cat.bossCompleted && (
                      <div className="text-sm mt-2">{'⭐'.repeat(cat.stars)}</div>
                    )}

                    {/* Progress mini bar */}
                    {cat.totalAttempts > 0 && (
                      <div className="mt-2 h-2 rounded-full bg-white/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress * 100}%`, background: catData.color }}
                        />
                      </div>
                    )}

                    {/* Boss badge */}
                    {cat.bossUnlocked && !cat.bossCompleted && (
                      <span className="absolute -top-2 -left-2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow-lg animate-bounce-subtle">
                        👾 BOSS!
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* ── SCORE + PROGRESS ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center my-6"
            >
              <p className="text-gray-500 font-bold mb-3">
                ⭐ נקודות: {adaptive.totalScore}
              </p>
              <div className="max-w-xs mx-auto">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min((adaptive.totalScore / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className={`text-2xl ${adaptive.totalScore >= i * 100 ? '' : 'grayscale opacity-30'}`}>
                    ⭐
                  </span>
                ))}
              </div>
            </motion.div>

            {/* ── BOSS LEVELS ROW ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-6"
            >
              <h2 className="text-lg font-extrabold mb-3 text-gray-700">
                👾 שלבי בוס
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {MODULES.map((mod, idx) => {
                  const cat = adaptive.categoryProgress[mod.category];
                  const unlocked = cat.bossUnlocked;
                  const catData = CATEGORIES[mod.category];

                  return (
                    <motion.button
                      key={`boss-${mod.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + idx * 0.08 }}
                      whileHover={unlocked ? { scale: 1.08 } : {}}
                      whileTap={unlocked ? { scale: 0.92 } : {}}
                      onClick={() => unlocked && navigate(`/boss/${mod.category}`)}
                      disabled={!unlocked}
                      className={`card-3d snap-center shrink-0 w-[120px] p-3 text-center ${
                        !unlocked ? 'opacity-40 cursor-not-allowed' : ''
                      } ${cat.bossCompleted ? 'ring-3 ring-amber-400' : ''}`}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: unlocked
                            ? `linear-gradient(135deg, ${catData.color}, ${catData.lightColor})`
                            : '#e0e0e0',
                          boxShadow: unlocked ? `0 3px 0 ${catData.color}88` : 'none',
                        }}
                      >
                        {cat.bossCompleted ? '🏆' : unlocked ? '👾' : '🔒'}
                      </div>
                      <div className="text-xs font-bold text-gray-700">{mod.title} {mod.subtitle}</div>
                      {cat.bossCompleted && (
                        <div className="text-xs mt-1">{'⭐'.repeat(cat.stars)}</div>
                      )}
                      {!unlocked && (
                        <div className="text-[10px] text-gray-400 mt-1">
                          עוד {Math.max(0, 10 - cat.totalCorrect)}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── MOCK TEST ── */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={mockTestAvailable ? { scale: 1.02 } : {}}
              whileTap={mockTestAvailable ? { scale: 0.98 } : {}}
              onClick={() => mockTestAvailable && navigate('/mock-test')}
              disabled={!mockTestAvailable}
              className={`card-3d w-full p-5 text-center mb-6 ${
                mockTestAvailable ? '' : 'opacity-40 cursor-not-allowed'
              }`}
              style={mockTestAvailable ? {
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderColor: '#5a67d8',
                borderBottomColor: '#4c51bf',
                color: 'white',
              } : {}}
            >
              <div className="text-3xl mb-1">📝</div>
              <div className="text-lg font-extrabold">מבחן דמה</div>
              <div className={`text-sm ${mockTestAvailable ? 'text-white/70' : 'text-gray-400'}`}>
                {mockTestAvailable ? 'מוכנים למבחן!' : 'צריך להשלים את כל שלבי הבוס'}
              </div>
              {adaptive.mockTestCompleted && (
                <div className="mt-1 text-base font-bold">ציון: {adaptive.mockTestScore}%</div>
              )}
            </motion.button>

            {/* ── AI COACH — Golden hint button ── */}
            <AICoachStrip module="vocabulary" />

          </div>
        </div>
      </div>
    </div>
  );
}
