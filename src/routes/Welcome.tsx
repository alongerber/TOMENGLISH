import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { MascotImage } from '../components/ui/MascotImage';

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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #1a3a7a 0%, #2B7DE9 40%, #5b9ef5 100%)' }}
    >
      {/* Floating decorations */}
      <motion.span
        className="absolute text-4xl pointer-events-none select-none"
        style={{ top: '10%', left: '8%' }}
        animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >⭐</motion.span>
      <motion.span
        className="absolute text-3xl pointer-events-none select-none"
        style={{ top: '15%', right: '10%' }}
        animate={{ y: [0, -8, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >✨</motion.span>
      <motion.span
        className="absolute text-5xl pointer-events-none select-none opacity-30"
        style={{ bottom: '20%', left: '5%' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >🌟</motion.span>
      <motion.span
        className="absolute text-3xl pointer-events-none select-none opacity-40"
        style={{ bottom: '30%', right: '8%' }}
        animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >💫</motion.span>

      {/* CSS clouds */}
      <div className="absolute top-[12%] left-[15%] w-[120px] h-[36px] bg-white/20 rounded-[30px] pointer-events-none"
        style={{ boxShadow: '35px -12px 0 6px rgba(255,255,255,0.15), -18px -6px 0 10px rgba(255,255,255,0.12)' }} />
      <div className="absolute top-[8%] right-[20%] w-[90px] h-[28px] bg-white/15 rounded-[25px] pointer-events-none"
        style={{ boxShadow: '25px -10px 0 5px rgba(255,255,255,0.1), -12px -5px 0 8px rgba(255,255,255,0.08)' }} />

      {/* Main content card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 18 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Mascot — large, floating above the card */}
        <motion.div
          className="flex justify-center -mb-8 relative z-20"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MascotImage state="idle" size="xl" />
        </motion.div>

        {/* Card */}
        <div className="card-3d p-8 pt-12 text-center" style={{ background: 'white' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="title-magical mb-2"
            style={{ color: '#2B7DE9' }}
          >
            מסע הקסם<br/>באנגלית
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 mb-8 text-base font-bold"
          >
            משחקים, לומדים, ומצליחים במבחן! ✨
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder="איך קוראים לך? 😊"
              className="w-full px-6 py-4 rounded-2xl text-xl text-center font-bold transition-all focus:outline-none"
              style={{
                background: '#f0f4ff',
                border: '3px solid #e0e8ff',
                borderBottom: '5px solid #c8d6ff',
              }}
              autoFocus
              dir="rtl"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={name.trim() ? { scale: 1.03 } : {}}
            whileTap={name.trim() ? { scale: 0.95, y: 4 } : {}}
            onClick={handleStart}
            disabled={!name.trim()}
            className="btn-3d btn-3d-primary w-full text-xl disabled:opacity-40 disabled:cursor-not-allowed"
            style={!name.trim() ? { boxShadow: 'none', background: '#e0e0e0', color: '#aaa' } : {}}
          >
            🚀 יאללה, מתחילים!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
