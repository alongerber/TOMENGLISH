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
        <>
          {/* Screen color flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-40 pointer-events-none ${correct ? 'flash-correct' : 'flash-wrong'}`}
          />

          {/* Central feedback card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div
              className={`px-12 py-10 rounded-3xl text-center ${
                correct ? 'feedback-correct' : 'feedback-wrong'
              }`}
              style={{
                boxShadow: correct
                  ? '0 8px 0 #009874, 0 16px 60px rgba(0, 184, 148, 0.4)'
                  : '0 8px 0 #b52828, 0 16px 60px rgba(214, 48, 49, 0.4)',
              }}
            >
              <motion.div
                className="text-7xl mb-3"
                animate={{ scale: [1, 1.4, 1], rotate: correct ? [0, 15, -15, 0] : [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                {correct ? '🎉' : '😅'}
              </motion.div>
              <div className="text-2xl font-extrabold">
                {message || (correct ? 'מעולה!' : 'נסה שוב!')}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
