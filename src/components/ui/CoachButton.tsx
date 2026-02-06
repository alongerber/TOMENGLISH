import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCoachHint } from '../../services/claudeCoach';

interface CoachButtonProps {
  taskType: string;
  word: string;
  childChoice?: string;
  recentErrors?: string[];
}

export function CoachButton({ taskType, word, childChoice, recentErrors = [] }: CoachButtonProps) {
  const [hint, setHint] = useState<{ hint: string; emoji: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleClick = async () => {
    if (hint) {
      setShow(!show);
      return;
    }
    setLoading(true);
    try {
      const result = await getCoachHint({ taskType, word, childChoice, recentErrors });
      setHint(result);
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-game btn-game-secondary text-sm flex items-center gap-2"
        aria-label="רמז חכם"
      >
        {loading ? '⏳' : '💡'}
        <span>רמז</span>
      </button>

      <AnimatePresence>
        {show && hint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 min-w-[200px] bg-amber-50 border-2 border-amber-200 rounded-xl p-3 shadow-lg z-10"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{hint.emoji}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{hint.hint}</p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="absolute top-1 left-1 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
