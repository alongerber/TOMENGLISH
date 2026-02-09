import { motion, AnimatePresence } from 'framer-motion';
import { MascotImage } from './MascotImage';

interface TutorialOverlayProps {
  show: boolean;
  title: string;
  steps: string[];
  emoji: string;
  onStart: () => void;
}

const TUTORIAL_STORAGE_PREFIX = 'tom-english-tutorial-';

export function hasSeenTutorial(moduleId: string): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_PREFIX + moduleId) === '1';
  } catch {
    return false;
  }
}

export function markTutorialSeen(moduleId: string): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_PREFIX + moduleId, '1');
  } catch {
    // ignore
  }
}

export function TutorialOverlay({ show, title, steps, emoji, onStart }: TutorialOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="card-3d p-8 max-w-md w-full text-center"
          >
            {/* Mascot */}
            <motion.div
              className="flex justify-center -mt-16 mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MascotImage state="idle" size="lg" />
            </motion.div>

            <div className="text-3xl mb-2">{emoji}</div>
            <h2 className="text-xl font-extrabold mb-4">{title}</h2>

            {/* Steps */}
            <div className="text-right space-y-3 mb-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-start gap-3 bg-blue-50 rounded-xl p-3"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-700 leading-relaxed">{step}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97, y: 3 }}
              onClick={onStart}
              className="btn-3d btn-3d-primary w-full text-lg animate-pulse-btn"
            >
              יאללה, מתחילים! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
