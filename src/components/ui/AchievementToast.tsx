import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../../engine/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

export function AchievementToast({ achievement, onDone }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onAnimationComplete={(def) => {
            if (def === 'exit') return;
            setTimeout(onDone, 2500);
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div
            className="px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #FFD93D 0%, #F6A623 100%)',
              border: '3px solid #C27D0A',
              borderBottom: '5px solid #A06008',
              boxShadow: '0 6px 0 #A06008, 0 10px 30px rgba(243, 156, 18, 0.4)',
            }}
          >
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
            >
              {achievement.emoji}
            </motion.span>
            <div>
              <div className="text-base font-black text-amber-900">{achievement.title}</div>
              <div className="text-xs font-bold text-amber-800/70">{achievement.description}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
