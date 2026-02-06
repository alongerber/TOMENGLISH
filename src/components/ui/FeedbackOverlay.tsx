import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackOverlayProps {
  show: boolean;
  correct: boolean;
  message?: string;
}

export function FeedbackOverlay({ show, correct, message }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div
            className={`px-8 py-6 rounded-2xl text-4xl font-bold shadow-2xl ${
              correct
                ? 'bg-green-50 text-green-600 border-2 border-green-200'
                : 'bg-red-50 text-red-500 border-2 border-red-200'
            }`}
          >
            <div className="text-5xl mb-2">{correct ? '🎉' : '😅'}</div>
            <div className="text-xl">{message || (correct ? 'מעולה!' : 'נסה שוב!')}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
