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
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div
            className={`px-10 py-8 rounded-3xl text-center ${
              correct ? 'feedback-correct' : 'feedback-wrong'
            }`}
            style={{
              boxShadow: correct
                ? '0 8px 0 #009874, 0 12px 40px rgba(0, 184, 148, 0.3)'
                : '0 8px 0 #b52828, 0 12px 40px rgba(214, 48, 49, 0.3)',
            }}
          >
            <motion.div
              className="text-6xl mb-3"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {correct ? '🎉' : '😅'}
            </motion.div>
            <div className="text-2xl font-extrabold">
              {message || (correct ? 'מעולה!' : 'נסה שוב!')}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
