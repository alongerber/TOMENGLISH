import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotImage } from './MascotImage';
import type { MascotState } from './MascotImage';
import type { HintTrigger, ModuleType } from '../../services/localHints';
import { getLocalHint } from '../../services/localHints';
import { getCoachHint } from '../../services/claudeCoach';

interface AICoachStripProps {
  module: ModuleType;
  currentWord?: string;
  childAnswer?: string;
  isCorrect?: boolean | null;
  attemptCount?: number;
  streak?: number;
  gameComplete?: boolean;
}

export function AICoachStrip({
  module,
  currentWord = '',
  childAnswer,
  isCorrect,
  attemptCount = 0,
  streak = 0,
  gameComplete = false,
}: AICoachStripProps) {
  const [message, setMessage] = useState('');
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [moreHint, setMoreHint] = useState('');
  const [moreLoading, setMoreLoading] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTriggerRef = useRef<string>('');
  const idleSentRef = useRef(false);

  const showMessageFn = useCallback((text: string, mascot: MascotState = 'idle') => {
    setMessage(text);
    setMascotState(mascot);
    setIsActive(true);
    setShowMore(false);
    setMoreHint('');
    setTimeout(() => setIsActive(false), 3000);
  }, []);

  // Determine trigger and show message
  useEffect(() => {
    let trigger: HintTrigger | null = null;
    let mascot: MascotState = 'idle';

    if (gameComplete) {
      trigger = 'complete';
      mascot = 'celebrate';
    } else if (streak >= 3) {
      trigger = 'streak';
      mascot = 'celebrate';
    } else if (isCorrect === false) {
      if (attemptCount >= 3) {
        trigger = 'wrong_3';
        mascot = 'encourage';
      } else if (attemptCount >= 2) {
        trigger = 'wrong_2';
        mascot = 'encourage';
      } else {
        trigger = 'wrong_1';
        mascot = 'encourage';
      }
    } else if (isCorrect === true) {
      return;
    }

    if (trigger) {
      const key = `${trigger}-${attemptCount}-${currentWord}-${streak}`;
      if (key === lastTriggerRef.current) return;
      lastTriggerRef.current = key;

      const hint = getLocalHint(module, trigger);
      showMessageFn(hint, mascot);
    }
  }, [isCorrect, attemptCount, streak, gameComplete, module, currentWord, showMessageFn]);

  // Start message on mount
  useEffect(() => {
    const hint = getLocalHint(module, 'start');
    showMessageFn(hint, 'idle');
  }, [module, showMessageFn]);

  // Idle timer: 15 seconds
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleSentRef.current = false;

    idleTimerRef.current = setTimeout(() => {
      if (!idleSentRef.current) {
        idleSentRef.current = true;
        const hint = getLocalHint(module, 'idle');
        showMessageFn(hint, 'idle');
      }
    }, 15000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isCorrect, attemptCount, currentWord, module, showMessageFn]);

  const handleMoreHint = async () => {
    if (moreLoading) return;
    setMoreLoading(true);
    try {
      const result = await getCoachHint({
        taskType: module,
        word: currentWord,
        childChoice: childAnswer,
        recentErrors: [],
        attemptCount,
      });
      setMoreHint(result.hint);
      setShowMore(true);
    } finally {
      setMoreLoading(false);
    }
  };

  return (
    <div className="relative my-4">
      {/* Mascot peeks from the right side */}
      <motion.div
        className="absolute -top-5 right-2 z-10"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MascotImage state={mascotState} size="sm" />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`speech-bubble-coach ${isActive ? 'ring-2 ring-blue-200' : ''}`}
        >
          {/* Bubble tail pointing up-right to mascot */}
          <div className="absolute -top-[7px] right-8 w-3.5 h-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/80 border-l-2 border-t-2 border-blue-100/60 rotate-45" />

          {/* Message */}
          <p className="text-sm leading-relaxed font-bold text-gray-700">{message}</p>

          <AnimatePresence>
            {showMore && moreHint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-indigo-600 mt-1.5 font-bold"
              >
                💡 {moreHint}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Hint button — compact */}
          <motion.button
            onClick={handleMoreHint}
            disabled={moreLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 text-xs font-bold text-blue-500 hover:text-blue-700 bg-white/70 px-3 py-1.5 rounded-lg border border-blue-200/50 disabled:opacity-50 transition-colors"
          >
            {moreLoading ? '⏳' : '💡 רמז חכם'}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
