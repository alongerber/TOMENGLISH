import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORIES } from '../data/wordBank';
import type { WordCategory } from '../data/wordBank';
import { allBossesCompleted } from '../engine/adaptive';
import { MascotImage } from '../components/ui/MascotImage';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

const MODULES: { id: string; category: WordCategory; title: string; subtitle: string; emoji: string; icon: string; iconFile: string; path: string }[] = [
  { id: 'magic-e', category: 'magic-e', title: 'מעבדת', subtitle: 'Magic E', emoji: '✨', icon: '🪄', iconFile: 'icon-magice.png', path: '/magic-e' },
  { id: 'sentences', category: 'clothing', title: 'בונה', subtitle: 'משפטים', emoji: '🧩', icon: '🧱', iconFile: 'icon-sentences.png', path: '/sentences' },
  { id: 'prices', category: 'numbers', title: 'תג', subtitle: 'מחיר', emoji: '💰', icon: '🏷️', iconFile: 'icon-price.png', path: '/prices' },
  { id: 'vocabulary', category: 'house', title: 'אוצר מילים', subtitle: 'חזותי', emoji: '🎯', icon: '🔍', iconFile: 'icon-vocab.png', path: '/vocabulary' },
];

const MODULE_COLORS: Record<string, { bg: string; border: string; shadow: string }> = {
  'magic-e': { bg: 'linear-gradient(145deg, #7c6cf0 0%, #9b8fff 50%, #c4b5fd 100%)', border: '#6C5CE7', shadow: 'rgba(108, 92, 231, 0.35)' },
  'clothing': { bg: 'linear-gradient(145deg, #00c9a7 0%, #38d9a9 50%, #69f0ae 100%)', border: '#00b894', shadow: 'rgba(0, 184, 148, 0.35)' },
  'numbers': { bg: 'linear-gradient(145deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)', border: '#d97706', shadow: 'rgba(245, 158, 11, 0.35)' },
  'house': { bg: 'linear-gradient(145deg, #e17055 0%, #f08a6e 50%, #fab1a0 100%)', border: '#d35400', shadow: 'rgba(225, 112, 85, 0.35)' },
};

function useIconProbe(filename: string): boolean {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = `/assets/${filename}`;
  }, [filename]);
  return exists;
}

function ModuleIcon({ mod }: { mod: typeof MODULES[number] }) {
  const hasIcon = useIconProbe(mod.iconFile);
  if (hasIcon) {
    return <img src={`/assets/${mod.iconFile}`} alt={mod.title} className="w-12 h-12 object-contain drop-shadow-md" />;
  }
  return <span className="text-4xl drop-shadow-md">{mod.icon}</span>;
}

export function Home() {
  const navigate = useNavigate();
  const { playerName, adaptive, soundEnabled, quietMode, toggleSound, toggleQuietMode, resetProgress } = useGameStore();
  const animatedScore = useAnimatedNumber(adaptive.totalScore);

  const mockTestAvailable = allBossesCompleted(adaptive);

  return (
    <div className="game-background min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-4">

        {/* Settings row */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-white/70 shadow-sm flex items-center justify-center text-lg hover:bg-white transition-all"
              aria-label={soundEnabled ? 'כבה סאונד' : 'הפעל סאונד'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={toggleQuietMode}
              className="w-10 h-10 rounded-full bg-white/70 shadow-sm flex items-center justify-center text-lg hover:bg-white transition-all"
              aria-label={quietMode ? 'הפעל אנימציות' : 'מצב שקט'}
            >
              {quietMode ? '🌙' : '✨'}
            </button>
          </div>
          <button
            onClick={() => {
              if (confirm('בטוח שרוצה לאפס את כל ההתקדמות?')) resetProgress();
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            איפוס
          </button>
        </div>

        {/* Hero: Mascot + greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="card-3d p-5 mb-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, #2B7DE9 0%, #5b9ef5 100%)', borderColor: '#1d5fbd', borderBottomColor: '#174aa3' }}
        >
          <motion.div
            className="shrink-0"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MascotImage state="idle" size="lg" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white leading-tight mb-1">
              היי {playerName}! 👋
            </h1>
            <p className="text-white/70 text-sm font-bold">
              מסע הקסם באנגלית
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/90 text-sm font-bold">⭐ {animatedScore}</span>
              {adaptive.combo > 1 && (
                <span className="text-amber-300 text-sm font-bold animate-pop-in">🔥 x{adaptive.combo}</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress stars */}
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className={`text-2xl transition-all ${adaptive.totalScore >= i * 100 ? 'drop-shadow-md' : 'grayscale opacity-30'}`}>
              ⭐
            </span>
          ))}
        </div>

        {/* 2x2 MODULE GRID */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {MODULES.map((mod, idx) => {
            const cat = adaptive.categoryProgress[mod.category];
            const colors = MODULE_COLORS[mod.category];
            const progress = cat.totalAttempts > 0 ? cat.totalCorrect / Math.max(cat.totalAttempts, 1) : 0;

            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96, y: 2 }}
                onClick={() => navigate(mod.path)}
                className="module-card"
                style={{
                  background: colors.bg,
                  borderColor: colors.border,
                  borderBottomColor: colors.border,
                  boxShadow: `0 6px 0 ${colors.border}88, 0 10px 24px ${colors.shadow}`,
                }}
              >
                <div className="mb-2">
                  <ModuleIcon mod={mod} />
                </div>

                <h3 className="font-black text-base text-white drop-shadow-sm">{mod.title}</h3>
                <h3 className="font-black text-base text-white drop-shadow-sm mb-2">{mod.subtitle}</h3>

                {cat.totalAttempts > 0 && (
                  <div className="h-2 rounded-full bg-white/30 overflow-hidden mx-2">
                    <div
                      className="h-full rounded-full bg-white/80 transition-all duration-500"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}

                {cat.bossCompleted && (
                  <div className="text-sm mt-2">{'⭐'.repeat(cat.stars)}</div>
                )}

                {cat.bossUnlocked && !cat.bossCompleted && (
                  <span className="absolute -top-2 -left-2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow-lg animate-bounce-subtle">
                    👾 BOSS!
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* BOSS LEVELS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-4"
        >
          <h2 className="text-base font-extrabold mb-3 text-gray-600">
            👾 שלבי בוס
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {MODULES.map((mod, idx) => {
              const cat = adaptive.categoryProgress[mod.category];
              const unlocked = cat.bossUnlocked;
              const catData = CATEGORIES[mod.category];

              return (
                <motion.button
                  key={`boss-${mod.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.08 }}
                  whileHover={unlocked ? { scale: 1.08 } : {}}
                  whileTap={unlocked ? { scale: 0.92 } : {}}
                  onClick={() => unlocked && navigate(`/boss/${mod.category}`)}
                  disabled={!unlocked}
                  className={`card-3d p-3 text-center ${
                    !unlocked ? 'opacity-40 cursor-not-allowed' : ''
                  } ${cat.bossCompleted ? 'ring-3 ring-amber-400' : ''}`}
                >
                  <div
                    className="w-10 h-10 mx-auto mb-1 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: unlocked
                        ? `linear-gradient(135deg, ${catData.color}, ${catData.lightColor})`
                        : '#e0e0e0',
                      boxShadow: unlocked ? `0 3px 0 ${catData.color}88` : 'none',
                    }}
                  >
                    {cat.bossCompleted ? '🏆' : unlocked ? '👾' : '🔒'}
                  </div>
                  <div className="text-[10px] font-bold text-gray-600 leading-tight">{mod.title} {mod.subtitle}</div>
                  {cat.bossCompleted && (
                    <div className="text-[10px] mt-0.5">{'⭐'.repeat(cat.stars)}</div>
                  )}
                  {!unlocked && (
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      עוד {Math.max(0, 10 - cat.totalCorrect)}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* MOCK TEST */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={mockTestAvailable ? { scale: 1.02 } : {}}
          whileTap={mockTestAvailable ? { scale: 0.98 } : {}}
          onClick={() => mockTestAvailable && navigate('/mock-test')}
          disabled={!mockTestAvailable}
          className={`card-3d w-full p-4 text-center mb-4 ${
            mockTestAvailable ? '' : 'opacity-40 cursor-not-allowed'
          }`}
          style={mockTestAvailable ? {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderColor: '#5a67d8',
            borderBottomColor: '#4c51bf',
            color: 'white',
          } : {}}
        >
          <div className="text-2xl mb-1">📝</div>
          <div className="text-lg font-extrabold">מבחן דמה</div>
          <div className={`text-sm ${mockTestAvailable ? 'text-white/70' : 'text-gray-400'}`}>
            {mockTestAvailable ? 'מוכנים למבחן!' : 'צריך להשלים את כל שלבי הבוס'}
          </div>
          {adaptive.mockTestCompleted && (
            <div className="mt-1 text-base font-bold">ציון: {adaptive.mockTestScore}%</div>
          )}
        </motion.button>

        {/* AI Coach */}
        <AICoachStrip module="vocabulary" />

      </div>
    </div>
  );
}
