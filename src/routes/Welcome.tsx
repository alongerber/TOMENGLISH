import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function Welcome() {
  const { playerName, setPlayerName } = useGameStore();
  const [name, setName] = useState(playerName);
  const navigate = useNavigate();

  const handleStart = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-premium p-8 max-w-md w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-6xl mb-4"
        >
          📚
        </motion.div>

        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-l from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          !בואו נלמד אנגלית
        </h1>

        <p className="text-gray-500 mb-8 text-sm">
          משחקים, לומדים, ומצליחים במבחן ✨
        </p>

        <div className="mb-6">
          <label className="block text-right text-sm font-medium text-gray-600 mb-2">
            ?מה השם שלך
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="...הכנס את השם שלך"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-lg text-center transition-colors"
            autoFocus
            dir="rtl"
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className="btn-game btn-game-primary w-full text-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🚀 יאללה!
        </button>
      </motion.div>
    </div>
  );
}
